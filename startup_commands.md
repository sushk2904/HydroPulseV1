# HydroPulse — Startup Commands & Deployment Guide

This guide details the exact commands, prerequisites, and directory paths needed to start the **FastAPI ST-GNN AI Model Backend** and the **Vite React UI Dashboard**.

---

## 📋 Overview of Services

| Service | Working Directory | Port / URL | Purpose |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend** | `c:\Users\susha\Downloads\HydroPulse\HydroPulse-Map-Simulation` | `http://127.0.0.1:8000` | ST-GAT-GRU model inference, live node flood predictions & dynamic routing penalties |
| **Integrated UI (Landing + Sim)** | `c:\Users\susha\Downloads\HydroPulse` (Root) | `http://localhost:3000` | Full experience with Scrollytelling, Cyber Boot Transition & Tactical Simulation |
| **Direct Simulation UI** | `c:\Users\susha\Downloads\HydroPulse\HydroPulse-Map-Simulation` | `http://localhost:5173` | Standalone Tactical Map & Command Deck |

---

## ⚡ Quick Start: 2-Terminal Setup (Recommended)

### Terminal 1: FastAPI Model Backend (Python)

Your virtual environment is already created and fully configured in `c:\Users\susha\Downloads\HydroPulse\.venv`.

Open **PowerShell**:

```powershell
# 1. Navigate to the simulation folder
cd "c:\Users\susha\Downloads\HydroPulse\HydroPulse-Map-Simulation"

# 2. Launch the inference server using the root .venv Python:
..\.venv\Scripts\python.exe -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

*(Alternatively, if you prefer activating the environment first):*
```powershell
cd "c:\Users\susha\Downloads\HydroPulse"
.\.venv\Scripts\Activate.ps1
cd "HydroPulse-Map-Simulation"
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Verification**:
> - Open [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health) — returns `{"status":"healthy","model_loaded":true}`.
> - Open [http://127.0.0.1:8000/api/model/status](http://127.0.0.1:8000/api/model/status) — shows 36,862 topology nodes and model metadata.
> - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### Terminal 2: Frontend Web UI (Node.js)

Open a **second PowerShell terminal**:

#### Option A: Full Integrated Experience (Landing Page + Command Deck)

```powershell
# 1. Navigate to project root
cd "c:\Users\susha\Downloads\HydroPulse"

# 2. Install dependencies (if first time)
npm install

# 3. Start the dev server
npm run dev
```
> Server will open at `http://localhost:3000`. Click **"Launch 3D Simulation"** to trigger the cyber-glow boot transition into the simulation deck!

#### Option B: Standalone Map Simulation Only

```powershell
# 1. Navigate to the simulation sub-project
cd "c:\Users\susha\Downloads\HydroPulse\HydroPulse-Map-Simulation"

# 2. Install dependencies (if first time)
npm install

# 3. Start the dev server
npm run dev
```
> Server will open at `http://localhost:5173`.

---

## 🔧 Architecture & Proxy Details

- **Vite Proxy**: Both `vite.config.ts` files automatically forward `/api/*` HTTP requests to `http://127.0.0.1:8000`.
- **Model Checkpoints**:
  - Model weights: `HydroPulse-Map-Simulation\Hydrop-data\models\best_mumbai_stgnn.pt`
  - Demo storm tensor: `HydroPulse-Map-Simulation\Hydrop-data\demos\demo_storm.pt`
  - Synthetic network: `HydroPulse-Map-Simulation\public\data\mumbai_synthetic.inp`
- **Graceful Fallback**: If the FastAPI backend is offline, the frontend automatically falls back to OSRM road geometric routing with zero crashes.

---

## 🚨 Troubleshooting

1. **PowerShell script execution policy error** (`cannot be loaded because running scripts is disabled`):
   Run once in PowerShell:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
2. **Port 8000 already in use**:
   Find and terminate the process:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
   ```
3. **ModuleNotFoundError: 'server'**:
   Ensure your current working directory is `c:\Users\susha\Downloads\HydroPulse\HydroPulse-Map-Simulation` before running `python -m uvicorn server.main:app`.
