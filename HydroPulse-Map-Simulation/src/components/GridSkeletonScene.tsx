import React, { useLayoutEffect, useMemo, useRef, useEffect, useState, useCallback, memo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';

// Default Mumbai Coordinate Reference System Constants
export const MUMBAI_CENTER = {
  lon: 72.89931655,
  lat: 19.14514835,
};
export const MUMBAI_SCALE = 590.459067; // Maps ~0.3387 deg latitude span to 200 units WebGL area
export const SCENE_SIZE = 240;

export function projectCoords(lon: number, lat: number): [number, number] {
  let x = (lon - MUMBAI_CENTER.lon) * MUMBAI_SCALE;
  let z = -(lat - MUMBAI_CENTER.lat) * MUMBAI_SCALE;
  // Bounded smoothly to metropolitan grid coverage
  x = Math.max(-65, Math.min(65, x));
  z = Math.max(-75, Math.min(82, z));
  return [x, z];
}

export interface HydropDrainageNode {
  id: string;
  x: number;
  z: number;
  lon: number;
  lat: number;
  elev: number;
  ground_y: number;
  flood_threshold: number; // in mm/hr rain intensity
}

interface HydropBoundaryData {
  mumbai_boundary: number[][][];
  aoi_5km: number[][][];
  raw_bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number };
}

interface ElevationData {
  grid: number[][];
  min_elev: number;
  max_elev: number;
}

interface BuildingData {
  x: number;
  z: number;
  ground_y: number;
  height: number;
  width: number;
  depth: number;
}

/**
 * COMPONENT 1: HYDROP-DATA OFFICIAL MUMBAI BOUNDARY
 * Renders the exact MultiPolygon boundaries from `hydrop-data/urban-flood-data/data/boundaries/mumbai_boundary.geojson`
 * as a glowing neon cyan line perimeter and holographic containment wall.
 */
const HydropBoundary = memo(function HydropBoundary({
  boundaryData,
  boundaryMatRef,
  boundaryGroupRef,
}: {
  boundaryData: HydropBoundaryData | null;
  boundaryMatRef: React.RefObject<THREE.LineBasicMaterial | null>;
  boundaryGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const { lineGeometries, topRailGeometries, wallGeometries, beaconPositions } = useMemo(() => {
    if (!boundaryData) return { lineGeometries: [], topRailGeometries: [], wallGeometries: [], beaconPositions: [] };

    const lines: THREE.BufferGeometry[] = [];
    const topRails: THREE.BufferGeometry[] = [];
    const walls: THREE.BufferGeometry[] = [];
    const beacons: THREE.Vector3[] = [];

    const wallH = 6.0; // Imposing 6-unit holographic tactical containment fence

    // 1. Mumbai MultiPolygon Boundary Rings
    boundaryData.mumbai_boundary.forEach((ring, ringIdx) => {
      if (ring.length < 3) return;

      // Base terrain elevation contour
      const pts3d = ring.map((pt) => {
        const x = pt[0];
        const y = (pt.length >= 3 ? pt[1] : 0) + 0.8;
        const z = pt.length >= 3 ? pt[2] : pt[1];
        return new THREE.Vector3(x, y, z);
      });
      lines.push(new THREE.BufferGeometry().setFromPoints(pts3d));

      // Upper glowing laser containment rail
      const topPts3d = ring.map((pt) => {
        const x = pt[0];
        const y = (pt.length >= 3 ? pt[1] : 0) + 0.8 + wallH;
        const z = pt.length >= 3 ? pt[2] : pt[1];
        return new THREE.Vector3(x, y, z);
      });
      topRails.push(new THREE.BufferGeometry().setFromPoints(topPts3d));

      // Holographic boundary fence wall with terrain height variation
      const wallVerts: number[] = [];
      const N = pts3d.length;
      for (let i = 0; i < N; i++) {
        const p1 = pts3d[i];
        const p2 = pts3d[(i + 1) % N];
        const yBottom1 = Math.max(0, p1.y - 1.2);
        const yBottom2 = Math.max(0, p2.y - 1.2);
        const yTop1 = p1.y + wallH;
        const yTop2 = p2.y + wallH;

        wallVerts.push(
          p1.x, yBottom1, p1.z,
          p2.x, yBottom2, p2.z,
          p2.x, yTop2, p2.z,

          p1.x, yBottom1, p1.z,
          p2.x, yTop2, p2.z,
          p1.x, yTop1, p1.z
        );

        // Place tactical perimeter pylons every 70 points on the main island perimeter
        if (ringIdx === 1 && i % 70 === 0) {
          beacons.push(new THREE.Vector3(p1.x, p1.y, p1.z));
        }
      }

      const wallGeom = new THREE.BufferGeometry();
      wallGeom.setAttribute('position', new THREE.Float32BufferAttribute(wallVerts, 3));
      wallGeom.computeVertexNormals();
      walls.push(wallGeom);
    });

    return { lineGeometries: lines, topRailGeometries: topRails, wallGeometries: walls, beaconPositions: beacons };
  }, [boundaryData]);

  if (!boundaryData) return null;

  return (
    <group ref={boundaryGroupRef} visible={true}>
      {/* 1. Ground Level Mumbai Coastline Boundary (Vibrant Luminous Neon Cyan) */}
      {lineGeometries.map((geom, idx) => (
        <primitive
          key={`bound-line-${idx}`}
          object={new THREE.LineLoop(
            geom,
            boundaryMatRef?.current || new THREE.LineBasicMaterial({ color: '#00D9FF', transparent: true, opacity: 0.98 })
          )}
        />
      ))}

      {/* 2. Upper Laser Rail Along Top of Containment Wall */}
      {topRailGeometries.map((geom, idx) => (
        <primitive
          key={`bound-top-rail-${idx}`}
          object={new THREE.LineLoop(
            geom,
            new THREE.LineBasicMaterial({ color: '#AFECFF', transparent: true, opacity: 0.75 })
          )}
        />
      ))}

      {/* 3. Translucent Holographic Containment Wall Mesh */}
      {wallGeometries.map((geom, idx) => (
        <mesh key={`bound-wall-${idx}`} geometry={geom}>
          <meshBasicMaterial
            color="#00D9FF"
            transparent={true}
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 4. Tactical Perimeter Laser Pylons / Beacons along shoreline */}
      {beaconPositions.map((pos, idx) => (
        <group key={`pylon-${idx}`} position={[pos.x, pos.y, pos.z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.2, 0.35, 8, 8]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshBasicMaterial color="#AFECFF" />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <ringGeometry args={[0.8, 1.4, 16]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/**
 * COMPONENT 2: TACTICAL CITY GRID IN WHITE OR CYAN
 * "The color of the grid city must be white or cyan"
 * 1. 5,500 real pipe and street network grid lines from `hydrop_grid_network.json` rendered in White & Cyan.
 * 2. 10,113 buildings with pure White rooflines and luminous Cyan facades.
 */
const HydropCityGrid = memo(function HydropCityGrid({
  buildings,
  pipes,
  gridMeshRef,
  gridLinesGroupRef,
}: {
  buildings: BuildingData[] | null;
  pipes: number[][] | null;
  gridMeshRef: React.RefObject<THREE.InstancedMesh | null>;
  gridLinesGroupRef: React.RefObject<THREE.Group | null>;
}) {
  // 1. Instanced Black Building Bodies (Monolithic Occlusion Mesh)
  useLayoutEffect(() => {
    if (!gridMeshRef.current || !buildings || buildings.length === 0) return;

    const count = buildings.length;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const bld = buildings[i];
      dummy.position.set(bld.x, bld.ground_y + bld.height / 2, bld.z);
      dummy.scale.set(bld.width, bld.height, bld.depth);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();

      gridMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    gridMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, gridMeshRef]);

  // 2. Crisp Building Border Lines Only (12 Wireframe Edges Per Building in White & Cyan)
  const buildingBorderGeometry = useMemo(() => {
    if (!buildings || buildings.length === 0) return null;

    const count = buildings.length;
    // 12 edges * 2 vertices * 3 coords = 72 floats per building
    const positions = new Float32Array(count * 72);
    const colors = new Float32Array(count * 72);

    let posIdx = 0;
    let colIdx = 0;

    for (let i = 0; i < count; i++) {
      const bld = buildings[i];
      const hw = bld.width / 2;
      const hd = bld.depth / 2;
      const x0 = bld.x - hw;
      const x1 = bld.x + hw;
      const y0 = bld.ground_y;
      const y1 = bld.ground_y + bld.height;
      const z0 = bld.z - hd;
      const z1 = bld.z + hd;

      // Color scheme: White for tall landmarks, Cyan for standard urban density
      let r = 0.0, g = 0.85, b = 1.0; // Cyber Cyan (#00D9FF)
      if (bld.height > 16) {
        r = 1.0; g = 1.0; b = 1.0; // Pure White (#FFFFFF)
      } else if (bld.height > 9) {
        r = 0.68; g = 0.92; b = 1.0; // Ice Cyan-White (#AFECFF)
      }

      const addSeg = (
        ax: number, ay: number, az: number,
        bx: number, by: number, bz: number,
        isRoof = false
      ) => {
        positions[posIdx++] = ax;
        positions[posIdx++] = ay;
        positions[posIdx++] = az;
        positions[posIdx++] = bx;
        positions[posIdx++] = by;
        positions[posIdx++] = bz;

        // Rooflines glow brighter pure white
        const curR = isRoof ? Math.min(1.0, r + 0.25) : r;
        const curG = isRoof ? Math.min(1.0, g + 0.25) : g;
        const curB = isRoof ? Math.min(1.0, b + 0.25) : b;

        colors[colIdx++] = curR;
        colors[colIdx++] = curG;
        colors[colIdx++] = curB;
        colors[colIdx++] = curR;
        colors[colIdx++] = curG;
        colors[colIdx++] = curB;
      };

      // Top Roof Edges (4)
      addSeg(x0, y1, z0, x1, y1, z0, true);
      addSeg(x1, y1, z0, x1, y1, z1, true);
      addSeg(x1, y1, z1, x0, y1, z1, true);
      addSeg(x0, y1, z1, x0, y1, z0, true);

      // Vertical Corner Edges (4)
      addSeg(x0, y0, z0, x0, y1, z0);
      addSeg(x1, y0, z0, x1, y1, z0);
      addSeg(x1, y0, z1, x1, y1, z1);
      addSeg(x0, y0, z1, x0, y1, z1);

      // Bottom Ground Edges (4)
      addSeg(x0, y0, z0, x1, y0, z0);
      addSeg(x1, y0, z0, x1, y0, z1);
      addSeg(x1, y0, z1, x0, y0, z1);
      addSeg(x0, y0, z1, x0, y0, z0);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [buildings]);

  // 3. Real Hydrop Network Grid Lines (Luminous Cyan Conduits)
  const pipeGeometry = useMemo(() => {
    if (!pipes || pipes.length === 0) return null;
    const verts: number[] = [];
    for (let i = 0; i < pipes.length; i++) {
      const p = pipes[i];
      if (p.length >= 6) {
        // [x0, y0, z0, x1, y1, z1] - exact 3D points
        verts.push(p[0], (p[1] || 0) + 0.45, p[2], p[3], (p[4] || 0) + 0.45, p[5]);
      } else if (p.length >= 4) {
        // [x0, z0, x1, z1] fallback
        verts.push(p[0], 0.45, p[1], p[2], 0.45, p[3]);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geom;
  }, [pipes]);

  if (!buildings) return null;

  return (
    <group ref={gridLinesGroupRef} visible={true}>
      {/* 1. Black Solid Building Mesh (Blocks terrain & distant geometry behind it) */}
      <instancedMesh
        ref={gridMeshRef}
        args={[undefined, undefined, buildings.length]}
      >
        <boxGeometry args={[0.99, 0.99, 0.99]} />
        <meshBasicMaterial
          color="#020406"
          depthWrite={true}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </instancedMesh>

      {/* 2. Building Border Lines Only (Crisp White and Cyan Outlines) */}
      {buildingBorderGeometry && (
        <lineSegments geometry={buildingBorderGeometry}>
          <lineBasicMaterial
            vertexColors={true}
            transparent={true}
            opacity={0.88}
            depthTest={true}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* 3. Real Hydrop Drainage Network Conduits (Luminous Cyan Street Lines) */}
      {pipeGeometry && (
        <lineSegments geometry={pipeGeometry}>
          <lineBasicMaterial
            color="#00D9FF"
            transparent={true}
            opacity={0.72}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* 4. Strategic Secondary Grid Lines in Soft White */}
      {pipeGeometry && (
        <lineSegments geometry={pipeGeometry} position={[0, 0.1, 0]}>
          <lineBasicMaterial
            color="#FFFFFF"
            transparent={true}
            opacity={0.28}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
});

/**
 * COMPONENT 3: HYDROP DRAINAGE SURGE NODES (Yellow -> Red When Full)
 * 2,398 real drainage storm junctions from `hydrop_grid_network.json`
 * Yellow under normal conditions, transitioning to Glowing Neon Red (#FF2A4D) as storm surge fills them.
 */
const HydropDrainageNodes = memo(function HydropDrainageNodes({
  nodes,
  stormIntensity,
  nodesMeshRef,
  nodesGroupRef,
  externalSurgeFeed,
}: {
  nodes: HydropDrainageNode[] | null;
  stormIntensity: number;
  nodesMeshRef: React.RefObject<THREE.InstancedMesh | null>;
  nodesGroupRef: React.RefObject<THREE.Group | null>;
  externalSurgeFeed?: Record<string, { isFull: boolean; waterDepth?: number }>;
}) {
  const COLOR_YELLOW = useMemo(() => new THREE.Color('#FFD700'), []);
  const COLOR_AMBER = useMemo(() => new THREE.Color('#FF8C00'), []);
  const COLOR_RED = useMemo(() => new THREE.Color('#FF2A4D'), []);

  useLayoutEffect(() => {
    if (!nodesMeshRef.current || !nodes || nodes.length === 0) return;

    const count = nodes.length;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const node = nodes[i];
      let isFull = false;
      let isWarning = false;

      // Real model feed override from FastAPI / ML inference
      if (externalSurgeFeed && externalSurgeFeed[node.id]) {
        isFull = externalSurgeFeed[node.id].isFull;
      } else {
        // High-precision threshold check against rain intensity
        if (stormIntensity >= node.flood_threshold) {
          isFull = true;
        } else if (stormIntensity >= node.flood_threshold * 0.75) {
          isWarning = true;
        }
      }

      // Elevation position
      dummy.position.set(node.x, (node.ground_y || 0) + 1.2, node.z);

      // Slightly enlarge overflowing/hazardous nodes for instant tactical recognition
      const s = isFull ? 1.4 : isWarning ? 1.15 : 0.85;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      nodesMeshRef.current.setMatrixAt(i, dummy.matrix);

      // Color mapping: Yellow -> Red when full
      if (isFull) {
        nodesMeshRef.current.setColorAt(i, COLOR_RED);
      } else if (isWarning) {
        nodesMeshRef.current.setColorAt(i, COLOR_AMBER);
      } else {
        nodesMeshRef.current.setColorAt(i, COLOR_YELLOW);
      }
    }

    nodesMeshRef.current.instanceMatrix.needsUpdate = true;
    if (nodesMeshRef.current.instanceColor) {
      nodesMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodes, stormIntensity, externalSurgeFeed, COLOR_YELLOW, COLOR_AMBER, COLOR_RED, nodesMeshRef]);

  if (!nodes) return null;

  return (
    <group ref={nodesGroupRef} visible={true}>
      <instancedMesh
        ref={nodesMeshRef}
        args={[undefined, undefined, nodes.length]}
      >
        <sphereGeometry args={[0.85, 10, 10]} />
        <meshBasicMaterial transparent opacity={0.95} />
      </instancedMesh>
    </group>
  );
});

/**
 * COMPONENT 4: SAFE EVACUATION ROUTE VECTOR (VIBRANT GLOWING GREEN LINE)
 * Dynamically projects real Mumbai topological road corridors computed by ST-GNN AI model.
 */
const HolographicRouteVector = memo(function HolographicRouteVector({
  routeGroupRef,
  activeRoute,
  routeActive,
}: {
  routeGroupRef: React.RefObject<THREE.Group | null>;
  activeRoute?: any;
  routeActive?: boolean;
}) {
  // Real Mumbai flood-aware safe route projected from model coordinates
  const { waypoints, blockedWaypoints, originPos, destPos, hazardPos } = useMemo(() => {
    if (activeRoute?.safeRoute?.coordinates && activeRoute.safeRoute.coordinates.length > 1) {
      const coords: [number, number][] = activeRoute.safeRoute.coordinates;
      const step = Math.max(1, Math.floor(coords.length / 32));
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < coords.length; i += step) {
        const [lat, lng] = coords[i];
        const [x, z] = projectCoords(lng, lat);
        pts.push(new THREE.Vector3(x, 4.2, z));
      }
      const [lastLat, lastLng] = coords[coords.length - 1];
      const [lastX, lastZ] = projectCoords(lastLng, lastLat);
      pts.push(new THREE.Vector3(lastX, 4.2, lastZ));

      const [origLat, origLng] = [activeRoute.origin.lat, activeRoute.origin.lng];
      const [origX, origZ] = projectCoords(origLng, origLat);
      const [destLat, destLng] = [activeRoute.destination.lat, activeRoute.destination.lng];
      const [dX, dZ] = projectCoords(destLng, destLat);

      const blockedPts: THREE.Vector3[] = [];
      if (activeRoute.hazardRoute?.coordinates && activeRoute.hazardRoute.coordinates.length > 1) {
        const hCoords = activeRoute.hazardRoute.coordinates;
        const hStep = Math.max(1, Math.floor(hCoords.length / 16));
        for (let i = 0; i < hCoords.length; i += hStep) {
          const [lat, lng] = hCoords[i];
          const [x, z] = projectCoords(lng, lat);
          blockedPts.push(new THREE.Vector3(x, 2.5, z));
        }
      }

      return {
        waypoints: pts,
        blockedWaypoints: blockedPts.length > 1 ? blockedPts : [
          new THREE.Vector3(origX, 2.5, origZ),
          new THREE.Vector3((origX + dX) / 2 + 5, 1.8, (origZ + dZ) / 2 + 8),
          new THREE.Vector3(dX, 2.5, dZ),
        ],
        originPos: new THREE.Vector3(origX, 3.0, origZ),
        destPos: new THREE.Vector3(dX, 3.0, dZ),
        hazardPos: new THREE.Vector3((origX + dX) / 2 + 5, 1.8, (origZ + dZ) / 2 + 8),
      };
    }

    // Default fallback corridor (Bandra -> SEEPZ)
    return {
      waypoints: [
        new THREE.Vector3(-38.5, 2.8, 53.2),  // Origin [A]: Bandra West
        new THREE.Vector3(-28.0, 3.2, 48.5),  // Kalanagar Flyover
        new THREE.Vector3(-26.2, 3.6, 33.8),  // Santacruz Airport Highway
        new THREE.Vector3(-24.4, 4.2, 25.5),  // Vile Parle Elevated Ridge
        new THREE.Vector3(-17.9, 4.8, 16.0),  // Andheri East Flyover Spur
        new THREE.Vector3(-13.8, 5.4, 6.0),   // Jogeshwari Link Corridor
        new THREE.Vector3(-8.5, 5.8, -5.8),   // Target [B]: SEEPZ
      ],
      blockedWaypoints: [
        new THREE.Vector3(-38.5, 2.8, 53.2),
        new THREE.Vector3(-26.0, 2.2, 49.0),
        new THREE.Vector3(-15.0, 1.4, 44.5),
      ],
      originPos: new THREE.Vector3(-38.5, 2.8, 53.2),
      destPos: new THREE.Vector3(-8.5, 5.8, -5.8),
      hazardPos: new THREE.Vector3(-15.0, 1.4, 44.5),
    };
  }, [activeRoute]);

  const { greenTubeGeom, greenHaloGeom, blockedTubeGeom } = useMemo(() => {
    if (waypoints.length < 2) return { greenTubeGeom: null, greenHaloGeom: null, blockedTubeGeom: null };

    const greenCurve = new THREE.CatmullRomCurve3(waypoints);
    const gTube = new THREE.TubeGeometry(greenCurve, Math.min(96, waypoints.length * 4), 0.75, 8, false);
    const gHalo = new THREE.TubeGeometry(greenCurve, Math.min(96, waypoints.length * 4), 1.6, 8, false);

    let rTube = null;
    if (blockedWaypoints.length >= 2) {
      const redCurve = new THREE.CatmullRomCurve3(blockedWaypoints);
      rTube = new THREE.TubeGeometry(redCurve, Math.min(48, blockedWaypoints.length * 4), 0.55, 8, false);
    }

    return { greenTubeGeom: gTube, greenHaloGeom: gHalo, blockedTubeGeom: rTube };
  }, [waypoints, blockedWaypoints]);

  return (
    <group ref={routeGroupRef} visible={Boolean(routeActive)}>
      {/* 1. Safe Flood-Aware Path: Core VIBRANT GLOWING NEON GREEN TUBE (#00FF66) */}
      {greenTubeGeom && (
        <mesh geometry={greenTubeGeom}>
          <meshBasicMaterial color="#00FF66" transparent opacity={0.96} depthTest={false} depthWrite={false} />
        </mesh>
      )}

      {/* 2. Safe Flood-Aware Path: Outer Glowing Neon Halo */}
      {greenHaloGeom && (
        <mesh geometry={greenHaloGeom}>
          <meshBasicMaterial color="#00FF66" transparent opacity={0.28} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3. Blocked Corridors Inundated by Flood Surge (Flashing Crimson Red) */}
      {blockedTubeGeom && (
        <mesh geometry={blockedTubeGeom}>
          <meshBasicMaterial color="#FF2A4D" transparent opacity={0.78} depthTest={false} depthWrite={false} />
        </mesh>
      )}

      {/* Origin Pin [A] (Glowing Neon Cyan Reticle & Beacon) */}
      <group position={[originPos.x, originPos.y, originPos.z]}>
        <mesh position={[0, 7.0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 14, 8]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <ringGeometry args={[1.5, 2.8, 16]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[1.0, 12, 12]} />
          <meshBasicMaterial color="#00D9FF" />
        </mesh>
      </group>

      {/* Target Pin [B] (Glowing Neon Green Reticle & Beacon) */}
      <group position={[destPos.x, destPos.y, destPos.z]}>
        <mesh position={[0, 7.0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 14, 8]} />
          <meshBasicMaterial color="#00FF66" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <ringGeometry args={[1.5, 2.8, 16]} />
          <meshBasicMaterial color="#00FF66" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[1.0, 12, 12]} />
          <meshBasicMaterial color="#00FF66" />
        </mesh>
      </group>
    </group>
  );
});

/**
 * COMPONENT 5: MASTER CAMERA CONTROLLER & TELEMETRY SYNC
 */
function MasterCameraController({
  routeActive,
  activeRoute,
  controlsRef,
  onTelemetryUpdate,
  onDiveComplete,
  isLoading,
}: {
  routeActive: boolean;
  activeRoute?: any;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  onTelemetryUpdate?: (progress: number) => void;
  onDiveComplete?: () => void;
  isLoading: boolean;
}) {
  const { camera } = useThree();

  // Notify telemetry and complete dive state as soon as assets are ready
  useEffect(() => {
    if (!isLoading) {
      if (onTelemetryUpdate) {
        onTelemetryUpdate(1.0);
      }
      if (onDiveComplete) {
        onDiveComplete();
      }
    }
  }, [isLoading, onTelemetryUpdate, onDiveComplete]);

  // Smooth camera refocus when user calculates or alters dynamic route
  useEffect(() => {
    if (routeActive && !isLoading) {
      const startPos = camera.position.clone();
      let endTarget = new THREE.Vector3(-22, 4, 24);
      let targetPos = new THREE.Vector3(-24, 75, 86);

      if (activeRoute?.origin && activeRoute?.destination) {
        const [ox, oz] = projectCoords(activeRoute.origin.lng, activeRoute.origin.lat);
        const [dx, dz] = projectCoords(activeRoute.destination.lng, activeRoute.destination.lat);
        const midX = (ox + dx) / 2;
        const midZ = (oz + dz) / 2;
        const span = Math.hypot(dx - ox, dz - oz);
        const camHeight = Math.max(55, Math.min(130, span * 0.95));
        endTarget = new THREE.Vector3(midX, 4, midZ);
        targetPos = new THREE.Vector3(midX, camHeight, midZ + camHeight * 0.75);
      }

      const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

      const animObj = { t: 0 };
      gsap.to(animObj, {
        t: 1,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.lerpVectors(startPos, targetPos, animObj.t);
          if (controlsRef.current) {
            controlsRef.current.target.lerpVectors(startTarget, endTarget, animObj.t);
            controlsRef.current.update();
          }
        },
      });
    }
  }, [routeActive, activeRoute, isLoading, camera, controlsRef]);

  return null;
}

export interface GridSkeletonSceneProps {
  targetProgressRef?: React.MutableRefObject<number>;
  currentProgressRef?: React.MutableRefObject<number>;
  isAutoPlayingRef?: React.MutableRefObject<boolean>;
  onTelemetryUpdate?: (progress: number) => void;
  stormIntensity?: number;
  routeActive?: boolean;
  activeRoute?: any;
  className?: string;
  externalControlsRef?: React.RefObject<OrbitControlsImpl | null>;
  surgeModelFeed?: Record<string, { isFull: boolean; waterDepth?: number }>;
  hasDived?: boolean;
  onDiveComplete?: () => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export const GridSkeletonScene = memo(function GridSkeletonScene({
  onTelemetryUpdate,
  stormIntensity = 75,
  routeActive = false,
  activeRoute,
  className = '',
  externalControlsRef,
  surgeModelFeed,
  onDiveComplete,
  onLoadingStateChange,
}: GridSkeletonSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Scene Refs
  const boundaryGroupRef = useRef<THREE.Group>(null);
  const boundaryMatRef = useRef<THREE.LineBasicMaterial>(null);
  const gridMeshRef = useRef<THREE.InstancedMesh>(null);
  const gridLinesGroupRef = useRef<THREE.Group>(null);
  const nodesMeshRef = useRef<THREE.InstancedMesh>(null);
  const nodesGroupRef = useRef<THREE.Group>(null);
  const routeGroupRef = useRef<THREE.Group>(null);
  const internalControlsRef = useRef<OrbitControlsImpl>(null);
  const controlsRef = (externalControlsRef || internalControlsRef) as React.RefObject<OrbitControlsImpl>;

  // Real Datasets State
  const [boundaryData, setBoundaryData] = useState<HydropBoundaryData | null>(null);
  const [gridNodes, setGridNodes] = useState<HydropDrainageNode[] | null>(null);
  const [gridPipes, setGridPipes] = useState<number[][] | null>(null);
  const [buildings, setBuildings] = useState<BuildingData[] | null>(null);
  const [elevationData, setElevationData] = useState<ElevationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Concurrently fetch all 4 core topological datasets
    Promise.all([
      fetch('/data/hydrop_boundary.json').then((r) => r.json()),
      fetch('/data/hydrop_grid_network.json').then((r) => r.json()),
      fetch('/data/mumbai_buildings.json').then((r) => r.json()),
      fetch('/data/mumbai_elevation.json').then((r) => r.json()),
    ])
      .then(([boundary, grid, blds, elev]) => {
        if (!isMounted) return;
        setBoundaryData(boundary);
        if (grid) {
          setGridNodes(grid.nodes || null);
          setGridPipes(grid.pipes || null);
        }
        if (Array.isArray(blds)) {
          const formattedBlds: BuildingData[] = blds.map((item: number[]) => ({
            x: item[0],
            z: item[1],
            ground_y: item[2],
            height: item[3],
            width: item[4],
            depth: item[5],
          }));
          setBuildings(formattedBlds);
        }
        setElevationData(elev);
        setIsLoading(false);
        if (onLoadingStateChange) {
          onLoadingStateChange(false);
        }
      })
      .catch((err) => {
        console.error('Error loading 3D datasets:', err);
        if (isMounted) {
          setIsLoading(false);
          if (onLoadingStateChange) {
            onLoadingStateChange(false);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onLoadingStateChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#050505] ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        className="w-full h-full"
        dpr={[1, 1.5]}
        camera={{
          position: [135, 145, 135],
          fov: 42,
          near: 0.5,
          far: 3500,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <color attach="background" args={['#05070a']} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enabled={!isLoading}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={20}
          maxDistance={500}
          enableDamping={true}
          dampingFactor={0.05}
        />

        {/* 1. Official Hydrop-Data Mumbai Boundary Wall */}
        <HydropBoundary
          boundaryData={boundaryData}
          boundaryMatRef={boundaryMatRef}
          boundaryGroupRef={boundaryGroupRef}
        />

        {/* 2. Tactical City Grid in White and Cyan */}
        <HydropCityGrid
          buildings={buildings}
          pipes={gridPipes}
          gridMeshRef={gridMeshRef}
          gridLinesGroupRef={gridLinesGroupRef}
        />

        {/* 3. Hydrop Drainage Surge Nodes (Yellow -> Red When Full) */}
        <HydropDrainageNodes
          nodes={gridNodes}
          stormIntensity={stormIntensity}
          nodesMeshRef={nodesMeshRef}
          nodesGroupRef={nodesGroupRef}
          externalSurgeFeed={surgeModelFeed}
        />

        {/* 4. Safe Route Vector (Glowing Neon Green Line) */}
        <HolographicRouteVector
          routeGroupRef={routeGroupRef}
          activeRoute={activeRoute}
          routeActive={routeActive}
        />

        {/* 5. Master Camera Controller */}
        <MasterCameraController
          routeActive={routeActive}
          activeRoute={activeRoute}
          controlsRef={controlsRef}
          onTelemetryUpdate={onTelemetryUpdate}
          onDiveComplete={onDiveComplete}
          isLoading={isLoading}
        />
      </Canvas>
    </div>
  );
});

export default GridSkeletonScene;
