"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * Wave Grid Background — PERFORMANCE-OPTIMIZED
 *
 * Key optimizations vs original:
 *  1. Grid 20×20 instead of 40×40  (400 vs 1600 instances = 75% fewer draw calls)
 *  2. NO shadows (castShadow/receiveShadow/shadowMap all disabled)
 *  3. NO post-processing (EffectComposer, vignette, RGB-shift removed entirely)
 *  4. MeshLambertMaterial instead of MeshPhongMaterial (cheaper lighting model)
 *  5. Pixel ratio capped at 1.0 (renders at native resolution, not 2x retina)
 *  6. Antialias disabled (saves a full-screen MSAA resolve per frame)
 *  7. Trail buffer capped at 32 entries instead of 128
 *  8. IntersectionObserver: animation loop STOPS when off-screen
 *  9. Single directional light, no fill light
 * 10. powerPreference: "low-power" hint to GPU
 */

const MAX_TRAIL = 32;

function overrideVertexShader(vertexShader: string): string {
  return vertexShader
    .replace(
      "#include <common>",
      /* glsl */ `#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      vec2 hash2( vec2 p ) {
        p = vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) );
        return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`
    )
    .replace(
      "#include <begin_vertex>",
      /* glsl */ `#include <begin_vertex>

      vHeight = 0.0;

      if ( position.y > 0.0 ) {
        vec2 jitter  = hash2( aOffset ) * uJitter;
        vec2 worldXZ = aOffset + jitter;
        float waveHeight  = 0.0;
        float totalWeight = 0.0;

        for ( int i = 0; i < uTrailCount; i++ ) {
          vec4 td = texture2D( uTrailTexture, vec2( ( float(i) + 0.5 ) / 32.0, 0.5 ) );
          float dist      = length( worldXZ - td.rg );
          float wavefront = uWaveSpeed * td.b;
          float relDist   = dist - wavefront;

          float window = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
          float fade   = exp( -td.b / uFadeTime );
          float atten  = 1.0 / ( 1.0 + dist * 0.1 );
          float weight = fade * window * atten * td.a;

          waveHeight  += weight * cos( uWaveFreq * relDist );
          totalWeight += weight;
        }

        waveHeight /= max( totalWeight, 1.0 );

        float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
        transformed.y += displacement;
        vHeight = displacement;
      }`
    );
}

export interface WaveGridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  gridSize?: number;
  colorBase?: string;
  colorHigh?: string;
  waveAmplitude?: number;
  waveSpeed?: number;
  waveFrequency?: number;
  waveWidth?: number;
  waveMaxHeight?: number;
  waveJitter?: number;
  autoAnimate?: boolean;
}

export function WaveGridBackground({
  children,
  className,
  gridSize = 20,       // ← down from 40
  colorBase = "#1e293b",
  colorHigh = "#38bdf8",
  waveAmplitude = 0.4,
  waveSpeed = 6.0,
  waveFrequency = 1.2,
  waveWidth = 3.0,
  waveMaxHeight = 0.4,
  waveJitter = 0.2,
  autoAnimate = true,
}: WaveGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const propsRef = useRef({
    colorBase, colorHigh, waveAmplitude, waveSpeed,
    waveFrequency, waveWidth, waveMaxHeight, waveJitter, autoAnimate,
  });
  useEffect(() => {
    propsRef.current = {
      colorBase, colorHigh, waveAmplitude, waveSpeed,
      waveFrequency, waveWidth, waveMaxHeight, waveJitter, autoAnimate,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const cubeWidth = 0.8;
    const cubeHeight = 3;
    const gap = 0.01;
    const bounds = gridSize * (cubeWidth + gap);

    // ── Sizes (pixel ratio capped at 1 for perf) ──
    const getSize = () => ({
      width: container.clientWidth || 1,
      height: container.clientHeight || 1,
      pixelRatio: 1,   // ← hard cap
    });
    let size = getSize();

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colorBase).multiplyScalar(0.5);

    // ── Camera ──
    const radius = 12;
    const alphaRange = Math.PI * 0.03;
    const betaRange = Math.PI * 0.05;
    const mouse = new THREE.Vector2(0, 0);
    const lerpedMouse = new THREE.Vector2(0, 0);

    const camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 200);
    const positionCamera = (mx: number, my: number) => {
      const alpha = my * alphaRange;
      const beta = mx * betaRange;
      camera.position.set(
        -radius * Math.cos(alpha) * Math.sin(beta),
        radius * Math.cos(alpha) * Math.cos(beta),
        radius * Math.sin(alpha)
      );
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
    };
    positionCamera(0, 0);
    scene.add(camera);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / size.width) * 2 - 1;
      mouse.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Lighting (single light, no shadows) ──
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#ffffff", 3.0);
    keyLight.position.set(-20, 10, 6);
    keyLight.castShadow = false;  // ← no shadow map
    scene.add(keyLight);

    // ── Trail ──
    const trailData = new Float32Array(MAX_TRAIL * 4);
    const trailTexture = new THREE.DataTexture(
      trailData, MAX_TRAIL, 1, THREE.RGBAFormat, THREE.FloatType
    );
    trailTexture.needsUpdate = true;

    const trailUniforms = {
      uTrailTexture: { value: trailTexture },
      uTrailCount: { value: 0 },
      uFadeTime: { value: 2.0 },
      uWaveSpeed: { value: waveSpeed },
      uWaveFreq: { value: waveFrequency },
      uWaveWidth: { value: waveWidth },
      uAmplitude: { value: waveAmplitude },
      uJitter: { value: waveJitter },
      uMaxHeight: { value: waveMaxHeight },
    };
    const colorUniforms = {
      uColorBase: { value: new THREE.Color(colorBase) },
      uColorHigh: { value: new THREE.Color(colorHigh) },
    };

    const trail: { x: number; z: number; age: number; distDelta: number }[] = [];
    let lastPoint: { x: number; z: number } | null = null;
    let timeSinceLastMove = 0;
    let randomPointTimer = 0;
    let placingRandom = true;
    const fadeTime = 2.0;
    const trailSpacing = 0.15;  // ← wider spacing = fewer trail entries

    const rayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
    );
    rayPlane.rotation.x = -Math.PI / 2;
    rayPlane.updateMatrixWorld(true);

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    let rect = canvas.getBoundingClientRect();

    const onPointerMove = (e: PointerEvent) => {
      pointerNDC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObject(rayPlane);
      if (hits.length === 0) return;
      const { x, z } = hits[0].point;

      let distDelta = 0;
      if (lastPoint) {
        const dx = x - lastPoint.x;
        const dz = z - lastPoint.z;
        distDelta = Math.sqrt(dx * dx + dz * dz);
        if (distDelta < trailSpacing) return;
      }
      if (trail.length >= MAX_TRAIL) trail.shift();
      trail.push({ x, z, age: 0, distDelta });
      lastPoint = { x, z };
      timeSinceLastMove = 0;
      placingRandom = false;
      randomPointTimer = 0;
    };
    canvas.addEventListener("pointermove", onPointerMove);

    const addRandomPoint = () => {
      const x = (Math.random() * 0.5 - 0.25) * bounds;
      const z = (Math.random() * 0.5 - 0.25) * bounds;
      const distDelta = 0.8 + Math.random() * 0.2;
      if (trail.length >= MAX_TRAIL) trail.shift();
      trail.push({ x, z, age: 0, distDelta });
    };

    const updateTrail = (delta: number) => {
      const expiry = fadeTime * 4;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += delta;
        if (trail[i].age > expiry) trail.splice(i, 1);
      }

      timeSinceLastMove += delta;
      if (timeSinceLastMove >= 3.0 && !placingRandom && propsRef.current.autoAnimate) {
        placingRandom = true;
        randomPointTimer = 0;
      }
      if (placingRandom && propsRef.current.autoAnimate) {
        randomPointTimer += delta;
        if (randomPointTimer >= 2.0) {    // ← slower random ripple rate
          addRandomPoint();
          randomPointTimer = 0;
        }
      }

      const count = Math.min(trail.length, MAX_TRAIL);
      if (count > 0 || trailUniforms.uTrailCount.value > 0) {
        for (let i = 0; i < count; i++) {
          const ti = i * 4;
          trailData[ti] = trail[i].x;
          trailData[ti + 1] = trail[i].z;
          trailData[ti + 2] = trail[i].age;
          trailData[ti + 3] = trail[i].distDelta;
        }
        trailTexture.needsUpdate = true;
        trailUniforms.uTrailCount.value = count;
      }
    };

    // ── Grid (Lambert instead of Phong, no depth material) ──
    const count = gridSize * gridSize;
    const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth);
    const offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2);
    geometry.setAttribute("aOffset", offsetAttribute);

    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, trailUniforms, colorUniforms);
      shader.vertexShader = overrideVertexShader(shader.vertexShader);
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying float vHeight;
          uniform vec3  uColorBase;
          uniform vec3  uColorHigh;
          uniform float uMaxHeight;`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float t = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
          diffuseColor.rgb = mix( uColorBase, uColorHigh, t );`
        );
    };

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.castShadow = false;     // ← no shadows
    instancedMesh.receiveShadow = false;
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const spacing = cubeWidth + gap;
    const offset = ((gridSize - 1) * spacing) / 2;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const x = i * spacing - offset;
        const z = j * spacing - offset;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
        offsetAttribute.setXY(index, x, z);
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    offsetAttribute.needsUpdate = true;

    // ── Renderer (no antialias, no shadows, no post-processing) ──
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,           // ← no MSAA
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.95;
    renderer.shadowMap.enabled = false;   // ← no shadow map
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(1);

    // ── Resize ──
    const applySize = () => {
      size = getSize();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
      renderer.setPixelRatio(1);
      rect = canvas.getBoundingClientRect();
    };
    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(container);
    window.addEventListener("resize", applySize);

    // ── Visibility-based animation (stops when off-screen) ──
    let isVisible = false;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    // ── Animation loop ──
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if (!isVisible) return;     // ← skip rendering when off-screen

      const delta = clock.getDelta();
      const p = propsRef.current;

      trailUniforms.uWaveSpeed.value = p.waveSpeed;
      trailUniforms.uWaveFreq.value = p.waveFrequency;
      trailUniforms.uWaveWidth.value = p.waveWidth;
      trailUniforms.uAmplitude.value = p.waveAmplitude;
      trailUniforms.uJitter.value = p.waveJitter;
      trailUniforms.uMaxHeight.value = p.waveMaxHeight;
      colorUniforms.uColorBase.value.set(p.colorBase);
      colorUniforms.uColorHigh.value.set(p.colorHigh);

      updateTrail(delta);
      lerpedMouse.x += (mouse.x - lerpedMouse.x) * 0.04;
      lerpedMouse.y += (mouse.y - lerpedMouse.y) * 0.04;
      positionCamera(lerpedMouse.x, lerpedMouse.y);
      renderer.render(scene, camera);   // ← direct render, no composer
    });

    // ── Cleanup ──
    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", applySize);
      canvas.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      geometry.dispose();
      material.dispose();
      rayPlane.geometry.dispose();
      (rayPlane.material as THREE.Material).dispose();
      trailTexture.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {children != null && <div className="absolute inset-0">{children}</div>}
    </div>
  );
}

export default WaveGridBackground;
