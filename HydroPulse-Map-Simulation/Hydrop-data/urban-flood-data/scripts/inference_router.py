"""
inference_router.py
===================
End-to-end offline inference + dynamic Dijkstra safe routing.
Loads a pre-trained ST-GAT-GRU flood prediction model, runs a forward
pass on a demo storm event, then computes the safest route through
Mumbai's drainage network, dynamically avoiding AI-predicted floods.
"""

import sys
import heapq
import random
import warnings
from pathlib import Path
from collections import defaultdict, deque

import torch
import torch.nn as nn

# Suppress PyTorch Geometric JIT script deprecation notices
warnings.filterwarnings("ignore", category=FutureWarning)

try:
    from torch_geometric.nn import GATConv
except ImportError as err:
    raise ImportError(
        "torch_geometric is required. Please install it with: pip install torch_geometric"
    ) from err

# Reconfigure stdout for UTF-8 compatibility on Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


# =============================================================================
# PATH CONFIGURATION (Auto-locating model weights & demo storm)
# =============================================================================
_SCRIPT_DIR = Path(__file__).resolve().parent
_POSSIBLE_ROOTS = [
    _SCRIPT_DIR.parent.parent,       # hydropulse-data-main/
    _SCRIPT_DIR.parent,              # urban-flood-data/
    Path.cwd(),                      # current working directory
]

def _find_file(rel_path: str) -> Path:
    for root in _POSSIBLE_ROOTS:
        candidate = root / rel_path
        if candidate.is_file():
            return candidate
    # Default to first expected location
    return _POSSIBLE_ROOTS[0] / rel_path

MODEL_PATH = _find_file("models/best_mumbai_stgnn.pt")
STORM_PATH = _find_file("demos/demo_storm.pt")

# =============================================================================
# FLOOD ROUTING CONSTANTS
# =============================================================================
FLOOD_DEPTH_THRESHOLD = 0.15   # metres — nodes with depth > 0.15m are impassable
BASE_EDGE_WEIGHT      = 1.0    # baseline traversal cost per hop


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — ST-GAT-GRU MODEL ARCHITECTURE SCAFFOLD
# ═══════════════════════════════════════════════════════════════════════════════
class STGAT_GRU(nn.Module):
    """
    Spatio-Temporal Graph Attention Network with GRU temporal aggregation.

    Architecture (engineered to match best_mumbai_stgnn.pt state dict):
        1. Spatial GAT:  GATConv(in_channels=4, out_channels=32, heads=2) -> [N, 64]
           where in_channels = 2 (dynamic: overflow, depth) + 2 (static: elev, area)
        2. Temporal GRU: GRUCell(input_size=64, hidden_size=64) -> [N, 64]
        3. Readout MLP:  Linear(66, 32) -> ReLU -> Linear(32, 2)
           (66 inputs = 64 GRU hidden state + 2 static features)

    Tensors:
        x_dynamic:  [T, N, 2]  (dynamic features across T timesteps)
        x_static:   [N, 2]     (elevation, catchment_area)
        edge_index: [2, E]     (graph connectivity)
    Returns:
        predictions: [T, N, 2] (predicted overflow, predicted water depth)
    """

    def __init__(
        self,
        dynamic_feats: int = 2,
        static_feats: int = 2,
        hidden_dim: int = 64,
        heads: int = 2,
        out_feats: int = 2,
    ):
        super().__init__()
        in_channels = dynamic_feats + static_feats  # 4
        self.gat = GATConv(in_channels, hidden_dim // heads, heads=heads, concat=True)
        self.gru_cell = nn.GRUCell(hidden_dim, hidden_dim)
        self.readout = nn.Sequential(
            nn.Linear(hidden_dim + static_feats, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, out_feats),
        )

    def forward(
        self,
        x_dynamic: torch.Tensor,
        x_static: torch.Tensor,
        edge_index: torch.Tensor,
    ) -> torch.Tensor:
        """
        Forward pass through all temporal steps.

        Args:
            x_dynamic:  [T, N, 2]
            x_static:   [N, 2]
            edge_index: [2, E]
        Returns:
            outputs:    [T, N, 2]
        """
        T, N, _ = x_dynamic.shape
        h = torch.zeros(N, self.gru_cell.hidden_size, device=x_dynamic.device)
        outputs = []

        for t in range(T):
            # 1. Concatenate dynamic and static node features: [N, 4]
            x_t = torch.cat([x_dynamic[t], x_static], dim=-1)

            # 2. Spatial attention message-passing: [N, 64]
            z_t = self.gat(x_t, edge_index)

            # 3. Temporal recurrent update: [N, 64]
            h = self.gru_cell(z_t, h)

            # 4. Readout: concatenate hidden state with static attributes: [N, 66] -> [N, 2]
            out = self.readout(torch.cat([h, x_static], dim=-1))
            outputs.append(out)

        return torch.stack(outputs, dim=0)


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — OFFLINE INFERENCE ENGINE
# ═══════════════════════════════════════════════════════════════════════════════
def run_inference(model_path: Path = MODEL_PATH, storm_path: Path = STORM_PATH):
    """
    Load model weights and demo storm payload, execute offline inference,
    and extract predicted water depths.

    Returns:
        predictions:  Tensor [T, N, 2]
        pred_depths:  Tensor [T, N] (Feature index 1: water depth)
        edge_index:   Tensor [2, E]
    """
    print("-" * 72)
    print("  STEP 1: OFFLINE ST-GAT-GRU INFERENCE")
    print("-" * 72)

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found at {model_path}")
    if not storm_path.exists():
        raise FileNotFoundError(f"Storm payload not found at {storm_path}")

    # 1. Initialize scaffold and load model weights to CPU
    model = STGAT_GRU()
    state_dict = torch.load(model_path, map_location="cpu", weights_only=False)
    model.load_state_dict(state_dict)
    model.eval()
    print(f"[✓] Model initialized & weights loaded from {model_path.name}")
    print(f"    File size: {model_path.stat().st_size / 1024:.1f} KB | Device: CPU")

    # 2. Load demo storm payload
    storm = torch.load(storm_path, map_location="cpu", weights_only=False)
    x_dynamic  = storm["x_dynamic"]    # [T, N, 2]
    x_static   = storm["x_static"]     # [N, 2]
    edge_index = storm["edge_index"]    # [2, E]

    T, N, _ = x_dynamic.shape
    E = edge_index.shape[1]
    print(f"[✓] Loaded demo storm payload: {storm_path.name}")
    print(f"    Timesteps: T={T} | Nodes: N={N:,} | Directed Edges: E={E:,}")

    # 3. Forward pass without tracking gradients
    print("[...] Running forward pass through ST-GAT-GRU...")
    with torch.no_grad():
        predictions = model(x_dynamic, x_static, edge_index)  # [T, N, 2]

    # 4. Extract predicted water depths (Feature index 1)
    pred_depths = predictions[:, :, 1]  # [T, N]
    print(f"[✓] Inference complete! Prediction tensor shape: {predictions.shape}")
    print(f"    Feature 0 (Surface Overflow) range: [{predictions[:, :, 0].min():.4f}, {predictions[:, :, 0].max():.4f}]")
    print(f"    Feature 1 (Water Depth) range:      [{pred_depths.min():.4f}, {pred_depths.max():.4f}]")

    return predictions, pred_depths, edge_index


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — DYNAMIC DIJKSTRA FLOOD-AWARE ROUTING
# ═══════════════════════════════════════════════════════════════════════════════
def build_adjacency(edge_index: torch.Tensor) -> dict[int, list[int]]:
    """Convert PyG edge_index [2, E] into an undirected adjacency graph."""
    adj = defaultdict(list)
    src = edge_index[0].tolist()
    dst = edge_index[1].tolist()
    for u, v in zip(src, dst):
        adj[u].append(v)
        adj[v].append(u)
    return adj


def dijkstra_flood_aware(
    adj: dict[int, list[int]],
    pred_depths_t: torch.Tensor,
    start: int,
    end: int,
    flood_threshold: float = FLOOD_DEPTH_THRESHOLD,
    enforce_flood_check: bool = True,
) -> tuple[list[int] | None, float]:
    """
    Dijkstra's shortest path with dynamic flood-depth edge weighting.

    Cost Model:
        - Base traversal cost per edge = 1.0
        - If destination depth > flood_threshold and enforce_flood_check:
            Edge is impassable (infinite weight / skipped)
        - Otherwise:
            Edge cost = 1.0 + max(0.0, predicted_depth) (depth penalty)

    Returns:
        (path, total_cost) if route exists, else (None, float('inf'))
    """
    # Priority queue stores tuples of: (cumulative_cost, current_node, path_list)
    pq: list[tuple[float, int, list[int]]] = [(0.0, start, [start])]
    visited: set[int] = set()

    while pq:
        cost, u, path = heapq.heappop(pq)

        if u == end:
            return path, cost

        if u in visited:
            continue
        visited.add(u)

        for v in adj.get(u, []):
            if v in visited:
                continue

            v_depth = float(pred_depths_t[v].item())

            # Check if destination node is submerged / impassable
            if enforce_flood_check and v_depth > flood_threshold:
                continue  # impassable edge (cost = inf)

            # Edge cost = base distance + positive water penalty
            depth_penalty = max(0.0, v_depth)
            edge_cost = BASE_EDGE_WEIGHT + depth_penalty
            total_cost = cost + edge_cost

            heapq.heappush(pq, (total_cost, v, path + [v]))

    return None, float("inf")


def find_reachable_candidate(
    adj: dict[int, list[int]],
    start: int,
    min_hops: int = 8,
    max_hops: int = 20,
) -> int | None:
    """Finds a destination node reachable in the physical network between min and max hops."""
    queue = deque([(start, 0)])
    visited = {start: 0}
    candidates = []

    while queue:
        node, dist = queue.popleft()
        if dist >= max_hops:
            continue
        for neighbor in adj.get(node, []):
            if neighbor not in visited:
                visited[neighbor] = dist + 1
                if min_hops <= dist + 1 <= max_hops:
                    candidates.append(neighbor)
                queue.append((neighbor, dist + 1))

    return random.choice(candidates) if candidates else None


def execute_routing_demo(
    pred_depths: torch.Tensor,
    edge_index: torch.Tensor,
    timestep: int = 20,
    start_node: int | None = None,
    end_node: int | None = None,
):
    """
    Demonstrates dynamic safe routing at a specified timestep:
    1. Evaluates flood status across all nodes at timestep T.
    2. Computes the baseline shortest path (dry network).
    3. Computes the AI flood-aware shortest path (safe route).
    4. Simulates a localized flash flood along the path to demonstrate dynamic rerouting.
    """
    print()
    print("-" * 72)
    print("  STEP 2: DYNAMIC DIJKSTRA SAFE ROUTING ENGINE")
    print("-" * 72)

    T, N = pred_depths.shape
    timestep = max(0, min(timestep, T - 1))
    depths_at_t = pred_depths[timestep].clone()

    adj = build_adjacency(edge_index)
    connected_nodes = list(adj.keys())

    # Count nodes currently exceeding flood threshold
    n_flooded = int((depths_at_t > FLOOD_DEPTH_THRESHOLD).sum().item())
    print(f"[i] Scenario Configuration at Timestep t={timestep}:")
    print(f"    Total Nodes: {N:,} | Connected in Graph: {len(connected_nodes):,}")
    print(f"    Flooded Nodes (> {FLOOD_DEPTH_THRESHOLD}m): {n_flooded:,}")

    # Select valid start and destination nodes
    if start_node is None:
        # Start at node with high connectivity
        start_node = 0 if 0 in adj else random.choice(connected_nodes)

    if end_node is None:
        end_node = find_reachable_candidate(adj, start_node, min_hops=8, max_hops=18)
        if end_node is None:
            # Fallback to any neighbor
            end_node = adj[start_node][0]

    print(f"    Source Node:      {start_node}")
    print(f"    Destination Node: {end_node}")

    # -------------------------------------------------------------------------
    # Route 1: Baseline Shortest Path (Standard unweighted Dijkstra)
    # -------------------------------------------------------------------------
    base_path, base_cost = dijkstra_flood_aware(
        adj, depths_at_t, start_node, end_node, enforce_flood_check=False
    )
    print()
    print(f"[1] Baseline Shortest Route (Ignoring Flood Conditions):")
    if base_path:
        print(f"    Hops: {len(base_path) - 1} | Cumulative Cost: {base_cost:.2f}")
        print(f"    Path: {' -> '.join(map(str, base_path[:5]))} ... {' -> '.join(map(str, base_path[-3:]))}")
    else:
        print("    [!] No physical connection between nodes.")
        return

    # -------------------------------------------------------------------------
    # Route 2: AI Dynamic Safe Route (Avoiding Flooded Zones)
    # -------------------------------------------------------------------------
    safe_path, safe_cost = dijkstra_flood_aware(
        adj, depths_at_t, start_node, end_node, enforce_flood_check=True
    )
    print()
    print(f"[2] AI Flood-Aware Safe Route (Threshold = {FLOOD_DEPTH_THRESHOLD}m):")
    if safe_path:
        print(f"    Status: SAFE PASSAGE IDENTIFIED")
        print(f"    Hops: {len(safe_path) - 1} | Total Safe Cost: {safe_cost:.4f}")
        print(f"    Path: {' -> '.join(map(str, safe_path[:5]))} ... {' -> '.join(map(str, safe_path[-3:]))}")
    else:
        print(f"    [✗] Destination {end_node} is completely surrounded by flash floods.")

    # -------------------------------------------------------------------------
    # Route 3: Dynamic Flash Flood Diversion Validation
    # (Simulate a flash flood on an intermediate node of the primary path)
    # -------------------------------------------------------------------------
    if base_path and len(base_path) > 3:
        flood_target = base_path[len(base_path) // 2]
        simulated_depths = depths_at_t.clone()
        simulated_depths[flood_target] = 0.45  # 45cm flash flood (severely impassable)

        print()
        print(f"[3] Active Rerouting Validation (Simulated Flash Flood):")
        print(f"    Injecting 0.45m flash flood at intermediate node {flood_target}...")

        rerouted_path, rerouted_cost = dijkstra_flood_aware(
            adj, simulated_depths, start_node, end_node, enforce_flood_check=True
        )

        if rerouted_path:
            bypassed = flood_target not in rerouted_path
            print(f"    Status: REROUTED AROUND FLOOD (Bypassed Node {flood_target}: {bypassed})")
            print(f"    New Hops: {len(rerouted_path) - 1} (was {len(base_path) - 1}) | Cost: {rerouted_cost:.4f}")
            print(f"    Diverted Path: {' -> '.join(map(str, rerouted_path[:4]))} ... {' -> '.join(map(str, rerouted_path[-3:]))}")
        else:
            print(f"    [!] No bypass available; network disconnected by flood.")

    print("-" * 72)
    return safe_path, safe_cost


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRYPOINT
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print()
    print("=" * 72)
    print("      HYDROPULSE -- ST-GAT-GRU OFFLINE INFERENCE & SAFE ROUTER          ")
    print("=" * 72)

    # 1. Execute offline ST-GNN forward pass
    predictions, pred_depths, edge_index = run_inference()

    # 2. Execute dynamic safe routing test at t=20 with reproducible seed
    random.seed(42)
    execute_routing_demo(pred_depths, edge_index, timestep=20)

    print("\n[SUCCESS] Pipeline executed cleanly. Ready for production deployment.\n")
