import React, { useLayoutEffect, useMemo, useRef, useEffect, useState, useCallback, memo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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

interface EarthContinentsData {
  points: number[][];
  lines: number[][][];
  mumbai: [number, number, number];
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
 * COMPONENT 1: 3D ROTATING WIRE-MESH NEON EARTH GLOBE (Stage 1 / Initial View)
 * Displays a rotating wireframe globe in glowing neon cyan (#00D9FF) and deep neon blue (#5B7FFF)
 * with glowing coordinate latitude/longitude rings, continent outlines, and a tactical target reticle on Mumbai.
 */
const NeonWireframeGlobe = memo(function NeonWireframeGlobe({
  globeGroupRef,
  globeMatRef,
  globeScaleRef,
  earthData,
  currentProgressRef,
}: {
  globeGroupRef: React.RefObject<THREE.Group | null>;
  globeMatRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  globeScaleRef: React.RefObject<THREE.Group | null>;
  earthData: EarthContinentsData | null;
  currentProgressRef?: React.MutableRefObject<number>;
}) {
  const R = 44; // Radius of globe sphere

  // Rotate globe around Y axis continuously in useFrame, smoothly decelerating as dive locks in
  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      const p = currentProgressRef ? currentProgressRef.current : 0;
      const rotDamp = Math.max(0, 1 - p * 1.5);
      globeGroupRef.current.rotation.y += delta * 0.18 * rotDamp;
    }
  });

  // Latitude and Longitude Meridian Lines
  const { meridianGeometries, continentGeometries } = useMemo(() => {
    const meridians: THREE.BufferGeometry[] = [];

    // Equator and tropics
    const lats = [0, 23.5, -23.5, 45, -45, 66.5, -66.5];
    lats.forEach((lat) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const ringPts: THREE.Vector3[] = [];
      const r = R * Math.sin(phi);
      const y = R * Math.cos(phi);
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      meridians.push(new THREE.BufferGeometry().setFromPoints(ringPts));
    });

    // Longitudinal Great Circles
    for (let j = 0; j < 12; j++) {
      const theta = (j / 12) * Math.PI;
      const longPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const phi = (i / 64) * Math.PI * 2;
        const x = R * Math.sin(phi) * Math.cos(theta);
        const y = R * Math.cos(phi);
        const z = R * Math.sin(phi) * Math.sin(theta);
        longPts.push(new THREE.Vector3(x, y, z));
      }
      meridians.push(new THREE.BufferGeometry().setFromPoints(longPts));
    }

    // Continents from Geo Coordinates
    const contLines: THREE.BufferGeometry[] = [];
    if (earthData && earthData.lines) {
      earthData.lines.forEach((poly) => {
        const pts = poly.map((pt) => new THREE.Vector3(pt[0] * (R + 0.3), pt[1] * (R + 0.3), pt[2] * (R + 0.3)));
        contLines.push(new THREE.BufferGeometry().setFromPoints(pts));
      });
    }

    return { meridianGeometries: meridians, continentGeometries: contLines };
  }, [earthData, R]);

  const mumbaiPos = useMemo(() => {
    if (earthData?.mumbai) {
      return [
        earthData.mumbai[0] * (R + 0.8),
        earthData.mumbai[1] * (R + 0.8),
        earthData.mumbai[2] * (R + 0.8),
      ] as [number, number, number];
    }
    // Default Mumbai sphere coordinates: lat 19.0760, lon 72.8777
    const phi = THREE.MathUtils.degToRad(90 - 19.076);
    const theta = THREE.MathUtils.degToRad(72.8777 + 180);
    return [
      -R * Math.sin(phi) * Math.cos(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(theta),
    ] as [number, number, number];
  }, [earthData, R]);

  return (
    <group ref={globeScaleRef}>
      <group ref={globeGroupRef}>
        {/* 1. Dark Holographic Planetary Core */}
        <mesh>
          <sphereGeometry args={[R - 0.5, 32, 24]} />
          <meshBasicMaterial color="#050910" transparent opacity={0.85} />
        </mesh>

        {/* 2. Neon Cyan Wireframe Sphere Lattice */}
        <mesh>
          <sphereGeometry args={[R, 28, 20]} />
          <meshBasicMaterial
            ref={globeMatRef}
            color="#00D9FF"
            wireframe={true}
            transparent={true}
            opacity={0.55}
          />
        </mesh>

        {/* 3. Deep Neon Blue Geodesic Icosahedron Mesh (Sci-fi augmented reality aesthetic) */}
        <mesh>
          <icosahedronGeometry args={[R + 0.4, 2]} />
          <meshBasicMaterial
            color="#5B7FFF"
            wireframe={true}
            transparent={true}
            opacity={0.35}
          />
        </mesh>

        {/* 4. Glowing Coordinate Meridians & Latitude Rings */}
        {meridianGeometries.map((geom, idx) => (
          <primitive
            key={`meridian-${idx}`}
            object={new THREE.Line(geom, new THREE.LineBasicMaterial({
              color: idx === 0 ? '#00D9FF' : '#5B7FFF',
              transparent: true,
              opacity: idx === 0 ? 0.75 : 0.4,
            }))}
          />
        ))}

        {/* 5. Glowing Continent Outlines on Globe Surface */}
        {continentGeometries.map((geom, idx) => (
          <primitive
            key={`continent-${idx}`}
            object={new THREE.Line(geom, new THREE.LineBasicMaterial({
              color: '#AFECFF',
              transparent: true,
              opacity: 0.85,
            }))}
          />
        ))}

        {/* 6. Tactical Target Reticle Pinpointing Mumbai */}
        <group position={mumbaiPos}>
          {/* Target Reticle Outer Pulsing Ring */}
          <mesh>
            <ringGeometry args={[1.5, 2.3, 24]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner Bullseye Point */}
          <mesh>
            <circleGeometry args={[0.7, 16]} />
            <meshBasicMaterial color="#AFECFF" />
          </mesh>
          {/* Radial Beacon Beam Extruded Outward from Globe */}
          <mesh position={[0, 0, 3]}>
            <cylinderGeometry args={[0.15, 0.4, 6, 8]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.7} />
          </mesh>
        </group>

        {/* 7. Soft Outer Atmospheric Halo */}
        <mesh>
          <sphereGeometry args={[R + 2.0, 32, 24]} />
          <meshBasicMaterial
            color="#00D9FF"
            transparent={true}
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
});

/**
 * COMPONENT 2: HYDROP-DATA OFFICIAL MUMBAI BOUNDARY
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
  const { lineGeometries, topRailGeometries, wallGeometries, aoiGeometries, beaconPositions } = useMemo(() => {
    if (!boundaryData) return { lineGeometries: [], topRailGeometries: [], wallGeometries: [], aoiGeometries: [], beaconPositions: [] };

    const lines: THREE.BufferGeometry[] = [];
    const topRails: THREE.BufferGeometry[] = [];
    const walls: THREE.BufferGeometry[] = [];
    const aois: THREE.BufferGeometry[] = [];
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
    <group ref={boundaryGroupRef} visible={false}>
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

      {/* 3. Holographic Containment Forcefield Wall */}
      {wallGeometries.map((geom, idx) => (
        <mesh key={`bound-wall-${idx}`} geometry={geom}>
          <meshBasicMaterial
            color="#00D9FF"
            transparent={true}
            opacity={0.20}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 4. Perimeter Pylons / Tactical Defense Beacons */}
      {beaconPositions.map((pos, idx) => (
        <group key={`pylon-${idx}`} position={[pos.x, pos.y, pos.z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 8, 6]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshBasicMaterial color="#AFECFF" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <ringGeometry args={[1.0, 1.8, 12]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/**
 * COMPONENT 3: TACTICAL CITY GRID IN WHITE OR CYAN
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
        r = 1.0; g = 1.0; b = 1.0; // Crisp White (#FFFFFF)
      } else if (bld.height > 9) {
        r = 0.82; g = 0.96; b = 1.0; // Luminous Ice-White
      } else if (i % 4 === 0) {
        r = 0.20; g = 0.72; b = 0.90; // Secondary Tactical Cyan
      }

      const addSeg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
        positions[posIdx++] = ax;
        positions[posIdx++] = ay;
        positions[posIdx++] = az;
        positions[posIdx++] = bx;
        positions[posIdx++] = by;
        positions[posIdx++] = bz;

        colors[colIdx++] = r;
        colors[colIdx++] = g;
        colors[colIdx++] = b;
        colors[colIdx++] = r;
        colors[colIdx++] = g;
        colors[colIdx++] = b;
      };

      // Top Roof Perimeter Edges (4)
      addSeg(x0, y1, z0, x1, y1, z0);
      addSeg(x1, y1, z0, x1, y1, z1);
      addSeg(x1, y1, z1, x0, y1, z1);
      addSeg(x0, y1, z1, x0, y1, z0);

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
    <group ref={gridLinesGroupRef} visible={false}>
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
          <lineBasicMaterial color="#00D9FF" transparent opacity={0.65} />
        </lineSegments>
      )}
    </group>
  );
});

/**
 * COMPONENT 4: DRAINAGE SURGE NODES (Yellow by Default -> Red When Full / Surge)
 * "and of nodes is yellow. When surge comes, and node is full it shall turn red."
 * "When surge is there it shall adjust as When i connect model to it which will give data to show, it can adjust accordingly, like low rain, or heavy surge."
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
  const COLOR_YELLOW = useMemo(() => new THREE.Color('#FFD700'), []); // Baseline Yellow
  const COLOR_AMBER  = useMemo(() => new THREE.Color('#FFA000'), []); // Warning buffer
  const COLOR_RED    = useMemo(() => new THREE.Color('#FF2A4D'), []); // FULL / SURGE PEAK (Red)

  useLayoutEffect(() => {
    if (!nodesMeshRef.current || !nodes || nodes.length === 0) return;

    const count = nodes.length;
    if (!nodesMeshRef.current.instanceColor) {
      nodesMeshRef.current.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(count * 3),
        3
      );
    }

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const threshold = n.flood_threshold;

      // Check whether node is full based on:
      // 1. External Model Feed (if user connected model)
      // 2. Storm Intensity rainfall (low rain vs heavy surge)
      let isFull = false;
      let isWarning = false;

      if (externalSurgeFeed && externalSurgeFeed[n.id]) {
        isFull = externalSurgeFeed[n.id].isFull;
      } else {
        isFull = stormIntensity >= threshold;
        isWarning = !isFull && stormIntensity >= threshold - 15;
      }

      // Position node cleanly on CartoDEM terrain elevation
      const nodeY = (n.ground_y || 0) + 0.85;
      dummy.position.set(n.x, nodeY, n.z);

      // Expanding scale for full/overflowing nodes
      const nodeScale = isFull ? 1.5 : isWarning ? 1.15 : 0.9;
      dummy.scale.set(nodeScale, nodeScale, nodeScale);
      dummy.rotation.set(0, 0, 0);
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
    <group ref={nodesGroupRef} visible={false}>
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
 * COMPONENT 5: SAFE EVACUATION ROUTE VECTOR (VIBRANT GLOWING GREEN LINE)
 * Dynamically projects real Mumbai topological road corridors computed by ST-GNN AI model.
 */
const HolographicRouteVector = memo(function HolographicRouteVector({
  routeGroupRef,
  hasDived,
  activeRoute,
}: {
  routeGroupRef: React.RefObject<THREE.Group | null>;
  hasDived: boolean;
  activeRoute?: any;
}) {
  // Never render route before dive completes to avoid any space artifacts
  if (!hasDived) return null;

  // Real Mumbai flood-aware safe route projected from model coordinates
  const { waypoints, blockedWaypoints, originPos, destPos, hazardPos } = useMemo(() => {
    if (activeRoute?.safeRoute?.coordinates && activeRoute.safeRoute.coordinates.length > 1) {
      const coords: [number, number][] = activeRoute.safeRoute.coordinates;
      // Subsample coordinates if too dense for smooth 3D Spline
      const step = Math.max(1, Math.floor(coords.length / 32));
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < coords.length; i += step) {
        const [lat, lng] = coords[i];
        const [x, z] = projectCoords(lng, lat);
        pts.push(new THREE.Vector3(x, 4.2, z));
      }
      // Always include final point
      const [lastLat, lastLng] = coords[coords.length - 1];
      const [lastX, lastZ] = projectCoords(lastLng, lastLat);
      pts.push(new THREE.Vector3(lastX, 4.2, lastZ));

      // Origin & Destination 3D Positions
      const [origLat, origLng] = [activeRoute.origin.lat, activeRoute.origin.lng];
      const [origX, origZ] = projectCoords(origLng, origLat);
      const [destLat, destLng] = [activeRoute.destination.lat, activeRoute.destination.lng];
      const [dX, dZ] = projectCoords(destLng, destLat);

      // Blocked hazard path
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
    <group ref={routeGroupRef} visible={false}>
      {/* 1. Safe Flood-Aware Path: Core VIBRANT GLOWING NEON GREEN TUBE (#00FF66) */}
      {greenTubeGeom && (
        <mesh geometry={greenTubeGeom}>
          <meshBasicMaterial color="#00FF66" />
        </mesh>
      )}

      {/* Outer Glowing Neon Green Halo Ribbon */}
      {greenHaloGeom && (
        <mesh geometry={greenHaloGeom}>
          <meshBasicMaterial color="#00FF66" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}

      {/* 2. Blocked Euclidean Shortest Path (Red Impassable Tube Segment) */}
      {blockedTubeGeom && (
        <mesh geometry={blockedTubeGeom}>
          <meshBasicMaterial color="#FF2A4D" transparent opacity={0.85} />
        </mesh>
      )}

      {/* Impassable Surge Hazard Marker on Blocked Route */}
      <group position={[hazardPos.x, hazardPos.y, hazardPos.z]}>
        <mesh position={[0, 0.4, 0]}>
          <ringGeometry args={[1.5, 2.5, 16]} />
          <meshBasicMaterial color="#FF2A4D" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 6.0, 6]} />
          <meshBasicMaterial color="#FF2A4D" transparent opacity={0.85} />
        </mesh>
      </group>

      {/* Origin Pin [A] (Glowing Cyan Beacon & Reticle) */}
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
 * COMPONENT 6: ISRO CARTODEM TERRAIN RELIEF & OCEAN PLANE
 */
const CartoDemTerrainMesh = memo(function CartoDemTerrainMesh({
  terrainGroupRef,
}: {
  elevationData?: ElevationData | null;
  terrainGroupRef: React.RefObject<THREE.Group | null>;
}) {
  return <group ref={terrainGroupRef} visible={false} />;
});

/**
 * COMPONENT 7: MASTER CHOREOGRAPHER & CAMERA DIVE (GSAP 60 FPS)
 * Smoothly & clearly choreographs:
 *  - 0.00 to 0.22: Rotating wire-mesh Earth in orbit -> Mumbai target reticle locked
 *  - 0.22 to 0.68: Continuous orbital swoop & descent:
 *      * Globe gently expands (1.0 -> 1.7x) and dissolves into translucent mist (1.0 -> 0.0 opacity across all materials)
 *      * City boundary, black buildings with white/cyan wireframe borders, and yellow nodes materialize holographically (opacity 0 -> 1)
 *      * Buildings smoothly project vertically from the ground plane to full height (scale.y 0.001 -> 1.0)
 *  - 0.68 to 0.70: Camera gently settles into the tactical isometric hero angle (135, 145, 135)
 *  - 0.70 to 1.00: Flood surge activation (yellow nodes fill and turn red based on rain)
 */
function MasterChoreographer({
  globeGroupRef,
  globeScaleRef,
  globeMatRef,
  boundaryGroupRef,
  gridLinesGroupRef,
  nodesGroupRef,
  terrainGroupRef,
  routeGroupRef,
  routeActive,
  activeRoute,
  controlsRef,
  targetProgressRef,
  currentProgressRef,
  isAutoPlayingRef,
  onTelemetryUpdate,
  hasDived,
  onDiveComplete,
  isInView = true,
}: {
  globeGroupRef: React.RefObject<THREE.Group | null>;
  globeScaleRef: React.RefObject<THREE.Group | null>;
  globeMatRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  boundaryGroupRef: React.RefObject<THREE.Group | null>;
  gridLinesGroupRef: React.RefObject<THREE.Group | null>;
  nodesGroupRef: React.RefObject<THREE.Group | null>;
  terrainGroupRef: React.RefObject<THREE.Group | null>;
  routeGroupRef: React.RefObject<THREE.Group | null>;
  routeActive: boolean;
  activeRoute?: any;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  targetProgressRef: React.MutableRefObject<number>;
  currentProgressRef: React.MutableRefObject<number>;
  isAutoPlayingRef: React.MutableRefObject<boolean>;
  onTelemetryUpdate?: (progress: number) => void;
  hasDived: boolean;
  onDiveComplete?: () => void;
  isInView?: boolean;
}) {
  const { camera } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Automatic cinematic dive from rotating Earth to Mumbai City Grid
  useEffect(() => {
    if (hasDived || !isInView) return;

    // Show rotating Earth wire mesh for 2.2s after scrolling into view, then begin smooth, majestic plunge into Mumbai
    const timer = setTimeout(() => {
      const diveObj = { val: targetProgressRef.current };
      gsap.to(diveObj, {
        val: 0.70,
        duration: 3.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          targetProgressRef.current = diveObj.val;
        },
        onComplete: () => {
          targetProgressRef.current = 0.70;
          currentProgressRef.current = 0.70;
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
          if (onDiveComplete) {
            onDiveComplete();
          }
        },
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [hasDived, isInView, onDiveComplete, targetProgressRef, currentProgressRef, controlsRef]);

  // Immediate toggle response and automatic camera refocus when user calculates a route
  useEffect(() => {
    if (routeGroupRef.current) {
      routeGroupRef.current.visible = routeActive && hasDived && currentProgressRef.current >= 0.28;
    }

    // Automatically transition 3D camera to frame where the route pops up
    if (routeActive && hasDived) {
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
  }, [routeActive, activeRoute, hasDived, routeGroupRef, currentProgressRef, camera, controlsRef]);

  const applyChoreography = useCallback(
    (p: number) => {
      if (tlRef.current) {
        tlRef.current.progress(p);
      }
      camera.lookAt(0, 0, 0);

      // 1. Smooth Globe Dissolve (Full hierarchy opacity fade out from p=0.18 to p=0.45)
      if (globeScaleRef.current) {
        globeScaleRef.current.visible = p < 0.45;
      }
      if (globeGroupRef.current && p < 0.45) {
        const globeFade = Math.max(0, Math.min(1, (0.45 - p) / 0.27));
        globeGroupRef.current.traverse((child) => {
          const mat = (child as any).material;
          if (mat) {
            if (mat.userData.baseOpacity === undefined) {
              mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
            }
            mat.opacity = mat.userData.baseOpacity * globeFade;
            mat.transparent = true;
          }
        });
      }

      // 2. Smooth City Holographic Materialization & Vertical Projection (p=0.20 to p=0.68)
      const isCityVisible = p >= 0.20;
      if (boundaryGroupRef.current) {
        boundaryGroupRef.current.visible = isCityVisible;
      }
      if (gridLinesGroupRef.current) {
        gridLinesGroupRef.current.visible = isCityVisible;
      }
      if (nodesGroupRef.current) {
        nodesGroupRef.current.visible = isCityVisible;
      }

      if (isCityVisible) {
        const cityFactor = Math.max(0, Math.min(1, (p - 0.20) / 0.48));
        const smoothFade = THREE.MathUtils.smoothstep(cityFactor, 0, 1);

        if (boundaryGroupRef.current) {
          boundaryGroupRef.current.traverse((child) => {
            const mat = (child as any).material;
            if (mat) {
              if (mat.userData.baseOpacity === undefined) {
                mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
              }
              mat.opacity = mat.userData.baseOpacity * smoothFade;
              mat.transparent = true;
            }
          });
        }

        if (gridLinesGroupRef.current) {
          gridLinesGroupRef.current.scale.set(1, Math.max(0.001, smoothFade), 1);
          gridLinesGroupRef.current.traverse((child) => {
            const mat = (child as any).material;
            if (mat && mat.type !== 'MeshBasicMaterial') {
              if (mat.userData.baseOpacity === undefined) {
                mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
              }
              mat.opacity = mat.userData.baseOpacity * smoothFade;
              mat.transparent = true;
            }
          });
        }

        if (nodesGroupRef.current) {
          nodesGroupRef.current.scale.set(smoothFade, smoothFade, smoothFade);
        }
      }

      if (terrainGroupRef.current) {
        terrainGroupRef.current.visible = false;
      }

      if (routeGroupRef.current) {
        routeGroupRef.current.visible = routeActive && hasDived && p >= 0.28;
      }

      if (onTelemetryUpdate) {
        onTelemetryUpdate(p);
      }
    },
    [camera, routeActive, hasDived, onTelemetryUpdate]
  );

  useGSAP(
    () => {
      // 1. Orbital View of Rotating Globe (Stage 1)
      const pos0 = { x: 0, y: 38, z: 132 };
      // 2. Midpoint of continuous orbital swoop (Stage 2)
      const pos1 = { x: 68, y: 92, z: 138 };
      // 3. Full City Grid Tactical Hero Angle (Stage 3)
      const pos2 = { x: 135, y: 145, z: 135 };
      // 4. Surge and Routing View (Stage 4)
      const pos3 = { x: 118, y: 118, z: 118 };

      camera.position.set(pos0.x, pos0.y, pos0.z);
      camera.lookAt(0, 0, 0);

      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });

      // Camera Continuous Sweeping Flight Arc (.to chaining prevents GSAP immediateRender conflicts)
      tl.to(
        camera.position,
        { x: pos1.x, y: pos1.y, z: pos1.z, ease: 'power1.in', duration: 0.35 },
        0.0
      );
      tl.to(
        camera.position,
        { x: pos2.x, y: pos2.y, z: pos2.z, ease: 'power1.out', duration: 0.35 },
        0.35
      );
      tl.to(
        camera.position,
        { x: pos3.x, y: pos3.y, z: pos3.z, ease: 'power1.inOut', duration: 0.30 },
        0.70
      );

      // Globe Gentle Expansion (scale 1.0 to 1.7x as camera plunges into Mumbai, avoids lens clipping)
      if (globeScaleRef.current) {
        globeScaleRef.current.scale.set(1, 1, 1);
        tl.to(
          globeScaleRef.current.scale,
          { x: 1.7, y: 1.7, z: 1.7, ease: 'power1.in', duration: 0.40 },
          0.0
        );
      }

      tlRef.current = tl;
      // Initialize immediately on mount to ensure Frame 0 is correctly rendered
      applyChoreography(currentProgressRef.current);

      return () => {
        tl.kill();
      };
    },
    { dependencies: [camera, applyChoreography] }
  );

  useFrame((_, delta) => {
    // Irreversible constraint: once dived to city grid, progress can NEVER go below 0.70!
    if (hasDived) {
      targetProgressRef.current = Math.max(0.70, targetProgressRef.current);
    }

    if (isAutoPlayingRef.current) {
      if (hasDived) {
        // Subtle surge pulsation between 0.70 and 0.95
        targetProgressRef.current = 0.70 + (Math.sin(Date.now() * 0.0008) * 0.5 + 0.5) * 0.25;
      }
    }

    const diff = targetProgressRef.current - currentProgressRef.current;
    if (Math.abs(diff) > 0.0001) {
      currentProgressRef.current += diff * 0.25;
      applyChoreography(currentProgressRef.current);
    }
  });

  return null;
}

export interface GridSkeletonSceneProps {
  targetProgressRef: React.MutableRefObject<number>;
  currentProgressRef: React.MutableRefObject<number>;
  isAutoPlayingRef: React.MutableRefObject<boolean>;
  onTelemetryUpdate?: (progress: number) => void;
  stormIntensity?: number;
  routeActive?: boolean;
  activeRoute?: any;
  className?: string;
  externalControlsRef?: React.RefObject<OrbitControlsImpl | null>;
  surgeModelFeed?: Record<string, { isFull: boolean; waterDepth?: number }>;
  hasDived?: boolean;
  onDiveComplete?: () => void;
}

export const GridSkeletonScene = memo(function GridSkeletonScene({
  targetProgressRef,
  currentProgressRef,
  isAutoPlayingRef,
  onTelemetryUpdate,
  stormIntensity = 75,
  routeActive = false,
  activeRoute,
  className = '',
  externalControlsRef,
  surgeModelFeed,
  hasDived = false,
  onDiveComplete,
}: GridSkeletonSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Scene Refs
  const globeGroupRef = useRef<THREE.Group>(null);
  const globeScaleRef = useRef<THREE.Group>(null);
  const globeMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const boundaryGroupRef = useRef<THREE.Group>(null);
  const boundaryMatRef = useRef<THREE.LineBasicMaterial>(null);

  const gridMeshRef = useRef<THREE.InstancedMesh>(null);
  const gridLinesGroupRef = useRef<THREE.Group>(null);

  const nodesMeshRef = useRef<THREE.InstancedMesh>(null);
  const nodesGroupRef = useRef<THREE.Group>(null);

  const routeGroupRef = useRef<THREE.Group>(null);
  const terrainGroupRef = useRef<THREE.Group>(null);
  const internalControlsRef = useRef<OrbitControlsImpl>(null);
  const controlsRef = (externalControlsRef || internalControlsRef) as React.RefObject<OrbitControlsImpl>;

  // Real Datasets State
  const [earthData, setEarthData] = useState<EarthContinentsData | null>(null);
  const [boundaryData, setBoundaryData] = useState<HydropBoundaryData | null>(null);
  const [gridNodes, setGridNodes] = useState<HydropDrainageNode[] | null>(null);
  const [gridPipes, setGridPipes] = useState<number[][] | null>(null);
  const [buildings, setBuildings] = useState<BuildingData[] | null>(null);
  const [elevationData, setElevationData] = useState<ElevationData | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  // Trigger camera dive only after the 3D frame has scrolled into user's view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Earth Continents & Mumbai Vector on Sphere
    fetch('/data/earth_continents.json')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setEarthData(data);
      })
      .catch(console.error);

    // 2. Hydrop-Data Official Mumbai Boundary & 5km AOI
    fetch('/data/hydrop_boundary.json')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setBoundaryData(data);
      })
      .catch(console.error);

    // 3. Hydrop-Data Real Drainage Network (2,398 Nodes & 5,500 Pipes)
    fetch('/data/hydrop_grid_network.json')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          setGridNodes(data.nodes);
          setGridPipes(data.pipes);
        }
      })
      .catch(console.error);

    // 4. Mumbai Buildings (10,113 structures covering island toe-to-toe)
    fetch('/data/mumbai_buildings.json')
      .then((r) => r.json())
      .then((data: number[][]) => {
        if (isMounted && Array.isArray(data)) {
          const blds: BuildingData[] = data.map((item) => ({
            x: item[0],
            z: item[1],
            ground_y: item[2],
            height: item[3],
            width: item[4],
            depth: item[5],
          }));
          setBuildings(blds);
        }
      })
      .catch(console.error);

    // 5. ISRO CartoDEM Terrain Elevation
    fetch('/data/mumbai_elevation.json')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setElevationData(data);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

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
          position: [0, 35, 125],
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
          enabled={hasDived}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={20}
          maxDistance={500}
          enableDamping={true}
          dampingFactor={0.05}
        />

        {/* 1. STAGE 1: 3D Rotating Wire-Mesh Earth Globe (Neon Colors & Mumbai Reticle) */}
        <NeonWireframeGlobe
          globeGroupRef={globeGroupRef}
          globeScaleRef={globeScaleRef}
          globeMatRef={globeMatRef}
          earthData={earthData}
          currentProgressRef={currentProgressRef}
        />

        {/* 2. ISRO CartoDEM Terrain Surface */}
        <CartoDemTerrainMesh
          elevationData={elevationData}
          terrainGroupRef={terrainGroupRef}
        />

        {/* 3. Official Hydrop-Data Mumbai Boundary Wall */}
        <HydropBoundary
          boundaryData={boundaryData}
          boundaryMatRef={boundaryMatRef}
          boundaryGroupRef={boundaryGroupRef}
        />

        {/* 4. Tactical City Grid in White or Cyan */}
        <HydropCityGrid
          buildings={buildings}
          pipes={gridPipes}
          gridMeshRef={gridMeshRef}
          gridLinesGroupRef={gridLinesGroupRef}
        />

        {/* 5. Hydrop Drainage Surge Nodes (Yellow -> Red When Full) */}
        <HydropDrainageNodes
          nodes={gridNodes}
          stormIntensity={stormIntensity}
          nodesMeshRef={nodesMeshRef}
          nodesGroupRef={nodesGroupRef}
          externalSurgeFeed={surgeModelFeed}
        />

        {/* 6. Safe Route Vector (Glowing Neon Green Line) */}
        <HolographicRouteVector routeGroupRef={routeGroupRef} hasDived={hasDived} activeRoute={activeRoute} />

        {/* 7. Master Camera Choreographer */}
        <MasterChoreographer
          globeGroupRef={globeGroupRef}
          globeScaleRef={globeScaleRef}
          globeMatRef={globeMatRef}
          boundaryGroupRef={boundaryGroupRef}
          gridLinesGroupRef={gridLinesGroupRef}
          nodesGroupRef={nodesGroupRef}
          terrainGroupRef={terrainGroupRef}
          routeGroupRef={routeGroupRef}
          routeActive={routeActive}
          activeRoute={activeRoute}
          controlsRef={controlsRef}
          targetProgressRef={targetProgressRef}
          currentProgressRef={currentProgressRef}
          isAutoPlayingRef={isAutoPlayingRef}
          onTelemetryUpdate={onTelemetryUpdate}
          hasDived={hasDived}
          onDiveComplete={onDiveComplete}
          isInView={isInView}
        />
      </Canvas>
    </div>
  );
});

export default GridSkeletonScene;
