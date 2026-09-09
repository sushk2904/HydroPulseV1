import os
import sys
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path

class PurePyTorchGATConv(nn.Module):
    """
    Pure PyTorch implementation of GATConv matching PyG GATConv parameter layout.
    in_channels=4, out_channels=32, heads=2 (concat=True => output dim=64)
    """
    def __init__(self, in_channels=4, out_channels=32, heads=2, negative_slope=0.2):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.heads = heads
        self.negative_slope = negative_slope

        self.lin = nn.Linear(in_channels, heads * out_channels, bias=False)
        self.att_src = nn.Parameter(torch.empty(1, heads, out_channels))
        self.att_dst = nn.Parameter(torch.empty(1, heads, out_channels))
        self.bias = nn.Parameter(torch.empty(heads * out_channels))

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        """
        x: [N, in_channels]
        edge_index: [2, E] (row, col)
        """
        N = x.size(0)
        H, C = self.heads, self.out_channels

        # 1. Linear projection: [N, H, C]
        x_lin = self.lin(x).view(N, H, C)

        # 2. Compute attention coefficients
        alpha_src = (x_lin * self.att_src).sum(dim=-1)  # [N, H]
        alpha_dst = (x_lin * self.att_dst).sum(dim=-1)  # [N, H]

        row, col = edge_index[0], edge_index[1]
        
        # Edge attention scores
        edge_alpha = alpha_src[row] + alpha_dst[col]  # [E, H]
        edge_alpha = F.leaky_relu(edge_alpha, self.negative_slope)

        # Numerically stable softmax per head over incoming edges to each target node col
        # For efficiency, we can do sparse scatter_softmax or dense representation for smaller batches
        # PyTorch 2.x native scatter_reduce or segmented softmax:
        exp_alpha = torch.exp(edge_alpha - edge_alpha.max())
        
        # Sum of exp(alpha) per destination node
        sum_exp = torch.zeros(N, H, device=x.device, dtype=x.dtype)
        sum_exp.index_add_(0, col, exp_alpha)
        
        # Softmax normalized weights: [E, H]
        norm_alpha = exp_alpha / (sum_exp[col] + 1e-9)
        
        # 3. Message passing: [E, H, C]
        msg = x_lin[row] * norm_alpha.unsqueeze(-1)
        
        # 4. Aggregation into target node col: [N, H, C]
        out = torch.zeros(N, H, C, device=x.device, dtype=x.dtype)
        out.index_add_(0, col, msg)
        
        # 5. Concatenate heads and add bias: [N, H*C]
        out = out.view(N, H * C) + self.bias
        return out

class STGAT_GRU(nn.Module):
    def __init__(self, dynamic_feats=2, static_feats=2, hidden_dim=64, heads=2, out_feats=2):
        super().__init__()
        in_channels = dynamic_feats + static_feats
        self.gat = PurePyTorchGATConv(in_channels, hidden_dim // heads, heads=heads)
        self.gru_cell = nn.GRUCell(hidden_dim, hidden_dim)
        self.readout = nn.Sequential(
            nn.Linear(hidden_dim + static_feats, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, out_feats),
        )

    def forward(self, x_dynamic: torch.Tensor, x_static: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        """
        x_dynamic: [T, N, 2]
        x_static: [N, 2]
        edge_index: [2, E]
        """
        T, N, _ = x_dynamic.shape
        h = torch.zeros(N, self.gru_cell.hidden_size, device=x_dynamic.device)
        outputs = []

        for t in range(T):
            x_t = torch.cat([x_dynamic[t], x_static], dim=-1)
            z_t = self.gat(x_t, edge_index)
            h = self.gru_cell(z_t, h)
            out = self.readout(torch.cat([h, x_static], dim=-1))
            outputs.append(out)

        return torch.stack(outputs, dim=0)

def load_trained_model(model_path: str, device: str = "cpu") -> STGAT_GRU:
    model = STGAT_GRU()
    state_dict = torch.load(model_path, map_location=device, weights_only=False)
    model.load_state_dict(state_dict, strict=True)
    model.eval()
    return model
