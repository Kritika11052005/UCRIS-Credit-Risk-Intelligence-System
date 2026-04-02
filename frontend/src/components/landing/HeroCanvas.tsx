"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to show through CSS parent
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // PARTICLES / POINTS
    const particleCount = 800;
    const maxDistance = 35; // connection distance

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    const colorPrimary = new THREE.Color("#F97316"); // 30%
    const colorSecondary = new THREE.Color("#FBBF24"); // 20%
    const colorMuted = new THREE.Color("#525252"); // 50%

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 800; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400; // z

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      velocities.push(velocity);

      // Color selection (30% orange, 20% amber, 50% gray)
      const rand = Math.random();
      let colorTarget;
      if (rand < 0.3) {
        colorTarget = colorPrimary;
      } else if (rand < 0.5) {
        colorTarget = colorSecondary;
      } else {
        colorTarget = colorMuted;
      }

      colors[i * 3] = colorTarget.r;
      colors[i * 3 + 1] = colorTarget.g;
      colors[i * 3 + 2] = colorTarget.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Dynamic point sizes shader for custom variations
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // LINES (Network)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.15,
      linewidth: 1, // WebGL usually limits this to 1 anyway
    });

    // Create a large buffer for lines
    const maxLineCount = particleCount * particleCount / 2;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLineCount * 6);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    // We only draw a fraction of this buffer
    lineGeometry.setDrawRange(0, 0);

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // MOUSE INTERACTION
    const mouse = new THREE.Vector2(-9999, -9999);
    const targetMouse = new THREE.Vector2(-9999, -9999);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates
      const mx = (event.clientX / window.innerWidth) * 2 - 1;
      const my = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
      raycaster.ray.intersectPlane(plane, targetMouse as any);
    };
    window.addEventListener("mousemove", onMouseMove);

    // RESIZE
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let isActive = true;

    // Handle visibility change to stop rendering when tab inactive
    const handleVisibilityChange = () => {
      isActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (isActive) {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        
        mouse.lerp(targetMouse, 0.05); // Smooth mouse pos

        let vertexPos = 0;
        let lineIdx = 0;
        const lineAttr = lines.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < particleCount; i++) {
          // Update position
          positions[i * 3] += velocities[i].x;
          positions[i * 3 + 1] += velocities[i].y;
          positions[i * 3 + 2] += velocities[i].z;

          // Boundary checks
          if (positions[i * 3] > 400 || positions[i * 3] < -400) velocities[i].x *= -1;
          if (positions[i * 3 + 1] > 400 || positions[i * 3 + 1] < -400) velocities[i].y *= -1;
          if (positions[i * 3 + 2] > 200 || positions[i * 3 + 2] < -200) velocities[i].z *= -1;

          // Mouse repulsion
          const dx = mouse.x - positions[i * 3];
          const dy = mouse.y - positions[i * 3 + 1];
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          if (distToMouse < 60) {
            const force = (60 - distToMouse) / 60;
            positions[i * 3] -= (dx / distToMouse) * force * 1.5;
            positions[i * 3 + 1] -= (dy / distToMouse) * force * 1.5;
          }

          // Proximity connections
          for (let j = i + 1; j < particleCount; j++) {
            const distX = positions[i * 3] - positions[j * 3];
            const distY = positions[i * 3 + 1] - positions[j * 3 + 1];
            const distZ = positions[i * 3 + 2] - positions[j * 3 + 2];
            const distSq = distX * distX + distY * distY + distZ * distZ;

            if (distSq < maxDistance * maxDistance) {
              lineAttr.array[lineIdx++] = positions[i * 3];
              lineAttr.array[lineIdx++] = positions[i * 3 + 1];
              lineAttr.array[lineIdx++] = positions[i * 3 + 2];
              lineAttr.array[lineIdx++] = positions[j * 3];
              lineAttr.array[lineIdx++] = positions[j * 3 + 1];
              lineAttr.array[lineIdx++] = positions[j * 3 + 2];
            }
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        
        lineAttr.needsUpdate = true;
        lines.geometry.setDrawRange(0, lineIdx / 3);

        // Gentle camera parallax
        camera.position.x += (mouse.x * 0.1 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 0.1 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto bg-base" />;
}
