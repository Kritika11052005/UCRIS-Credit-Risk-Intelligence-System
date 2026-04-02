"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function AuthCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Shapes
    const shapes: { mesh: THREE.Mesh, vel: THREE.Vector3, rotSpeed: THREE.Vector3 }[] = [];
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xf97316, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4 
    });

    const addShape = (geometry: THREE.BufferGeometry, count: number) => {
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random scale (0.3 to 1.2)
        const scale = Math.random() * 0.9 + 0.3;
        mesh.scale.set(scale, scale, scale);
        
        // Random position
        mesh.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20 - 5
        );
        
        // Random rotation
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        
        scene.add(mesh);
        
        // Velocity and rotation speed
        shapes.push({
          mesh,
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04),
          rotSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02)
        });
      }
    };

    addShape(new THREE.IcosahedronGeometry(1), 12);
    addShape(new THREE.OctahedronGeometry(1), 8);
    addShape(new THREE.TetrahedronGeometry(1), 6);

    // Interaction
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animationFrameId: number;
    let isActive = true;

    const handleVisibilityChange = () => {
      isActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      if (isActive) {
        mouse.lerp(targetMouse, 0.05);

        shapes.forEach(shape => {
          // Move
          shape.mesh.position.add(shape.vel);
          
          // Rotate
          shape.mesh.rotation.x += shape.rotSpeed.x;
          shape.mesh.rotation.y += shape.rotSpeed.y;
          shape.mesh.rotation.z += shape.rotSpeed.z;

          // Boundaries generic bounce
          if (shape.mesh.position.x > 25 || shape.mesh.position.x < -25) shape.vel.x *= -1;
          if (shape.mesh.position.y > 20 || shape.mesh.position.y < -20) shape.vel.y *= -1;
          if (shape.mesh.position.z > 10 || shape.mesh.position.z < -20) shape.vel.z *= -1;
        });

        // Mouse Parallax for camera
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
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
      
      material.dispose();
      // geometries are shared internal to Three.js but ideally would dispose them
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
