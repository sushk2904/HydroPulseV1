import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import uvicorn

if __name__ == "__main__":
    print(f"Starting HydroPulse AI backend from {root_dir} on port 8000...")
    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, app_dir=str(root_dir), reload=False)
