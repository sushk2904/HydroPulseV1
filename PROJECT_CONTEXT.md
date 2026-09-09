# HydroPulse: Project Architecture & Context

## 1. Project Overview
HydroPulse is an edge-deployable, AI-driven disaster response and dynamic routing system built for the Smart India Hackathon. 

## 2. Directory Structure Strategy
We recently merged multiple repositories into this single root folder. 
* `/` (Root): Contains the main landing page and hero animations (Vite/Tailwind).
* `/HydroPulse-Map-Simulation`: Contains the 3D DEM map UI, the simulation dashboard, and the ST-GAT-GRU routing logic.
* `/HydroPulse-Map-Simulation/Hydrop-data`: Contains our scraped data, synthetic JSON simulations, and the 115 KB AI model weights.

## 3. Version Control & Git State (ACTION REQUIRED)
This project is currently messy. Because folders were combined, there are multiple overlapping `.git` repositories initialized inside these subdirectories. 
**Goal:** We need to completely wipe all existing `.git` tracking across all folders, initialize a single fresh Git repository at the root, and connect it to this remote URL: https://github.com/sushk2904/HydroPulseV1

## 4. Dependency Management (ACTION REQUIRED)
Currently, there are multiple redundant `node_modules` folders and separate `package.json` files competing with each other. We need to restructure this into a proper NPM Workspace (Monorepo) or safely merge the frontend dependencies so they can run smoothly as one unified application without configuration collisions.