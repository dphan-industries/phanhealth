import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import world from "world-atlas/countries-50m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
const topology = world as unknown as Topology;
const countries = (
  feature(
    topology,
    topology.objects.countries as GeometryCollection,
  ) as FeatureCollection<Polygon | MultiPolygon, { name: string }>
).features;
export const destinations = countries
  .map((f) => {
    const polygons =
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates;
    const largest = [...polygons].sort(
      (a, b) => b[0].length - a[0].length,
    )[0][0];
    let x = 0,
      y = 0,
      z = 0;
    for (const [lon, lat] of largest) {
      const a = (lat * Math.PI) / 180,
        b = (lon * Math.PI) / 180;
      x += Math.cos(a) * Math.cos(b);
      y += Math.sin(a);
      z += Math.cos(a) * Math.sin(b);
    }
    return {
      name: f.properties.name,
      lat: (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI,
      lon: (Math.atan2(z, x) * 180) / Math.PI,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
function vector(lat: number, lon: number, r: number) {
  const a = (lat * Math.PI) / 180,
    b = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(a) * Math.cos(b),
    r * Math.sin(a),
    -r * Math.cos(a) * Math.sin(b),
  );
}
export default function EarthGlobe({
  lat,
  lon,
  onPick,
}: {
  lat: number;
  lon: number;
  onPick: (lat: number, lon: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const markerRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pickRef = useRef(onPick);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    pickRef.current = onPick;
  }, [onPick]);
  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setUnavailable(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive Earth. Drag to orbit, scroll to zoom, tap a location. Country search and coordinate fields provide keyboard alternatives.",
    );
    renderer.domElement.setAttribute("role", "img");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1, 3.5);
    cameraRef.current = camera;
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#102e48";
    ctx.fillRect(0, 0, 2048, 1024);
    ctx.fillStyle = "#4c9c91";
    ctx.strokeStyle = "#9bd8cb66";
    ctx.lineWidth = 0.7;
    for (const f of countries) {
      const polys =
        f.geometry.type === "Polygon"
          ? [f.geometry.coordinates]
          : f.geometry.coordinates;
      for (const polygon of polys) {
        ctx.beginPath();
        for (const ring of polygon) {
          let lastX = 0;
          ring.forEach(([lng, latitude], i) => {
            const x = ((lng + 180) / 360) * 2048,
              y = ((90 - latitude) / 180) * 1024;
            if (i === 0 || Math.abs(x - lastX) > 1024) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            lastX = x;
          });
          ctx.closePath();
        }
        ctx.fill("evenodd");
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "#96d4e11c";
    for (let x = 0; x < 2048; x += 2048 / 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 1024 / 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.SphereGeometry(1, 80, 64);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.92,
      metalness: 0.08,
      emissive: "#17415a",
      emissiveIntensity: 0.25,
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    const atmosphereGeo = new THREE.SphereGeometry(1.035, 48, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: "#5cbbe7",
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));
    const markerGeo = new THREE.SphereGeometry(0.019, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: "#fff0bd" });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    scene.add(marker);
    markerRef.current = marker;
    scene.add(new THREE.AmbientLight("#a5d9ec", 2));
    const sun = new THREE.DirectionalLight("#fff1da", 3);
    sun.position.set(-3, 3, 4);
    scene.add(sun);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controlsRef.current = controls;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(container);
    const start = { x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      start.x = e.clientX;
      start.y = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObject(earth)[0];
      if (hit) {
        const point = hit.point.normalize();
        pickRef.current(
          (Math.asin(point.y) * 180) / Math.PI,
          (Math.atan2(-point.z, point.x) * 180) / Math.PI,
        );
      }
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    render();
    return () => {
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, []);
  useEffect(() => {
    cameraRef.current?.position.copy(vector(lat, lon, 3.4));
    markerRef.current?.position.copy(vector(lat, lon, 1.015));
    controlsRef.current?.update();
  }, [lat, lon]);
  return (
    <div className="earth-canvas" ref={host}>
      {unavailable && (
        <div className="globe-fallback">
          <div className="planet" />
          <p>
            3D graphics unavailable. Country search and coordinates still work.
          </p>
        </div>
      )}
    </div>
  );
}
