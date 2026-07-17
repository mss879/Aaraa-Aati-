"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Ring3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // Procedural Studio Environment Map for Realistic Gold & Diamond Reflections
    const createEnvMap = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Linear studio sky-ground gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "#ffffff");      // White soft lightbox ceiling
        grad.addColorStop(0.38, "#c8c8c8");   // Medium studio bounce
        grad.addColorStop(0.48, "#1a1a1c");   // Sharp dark horizon (creates reflection contrast)
        grad.addColorStop(0.52, "#08080a");   // True horizon separator
        grad.addColorStop(0.68, "#2c2a26");   // Warm golden floor bounce
        grad.addColorStop(1, "#0F2748");      // Dark floor
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add soft vertical lightboxes to reflect as highlights on metal
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillRect(120, 0, 70, canvas.height);
        ctx.fillRect(450, 0, 100, canvas.height);
        ctx.fillRect(780, 0, 80, canvas.height);

        ctx.fillStyle = "rgba(255, 220, 180, 0.25)"; // Warm fill highlight
        ctx.fillRect(300, 0, 50, canvas.height);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    };

    const envMap = createEnvMap();
    scene.environment = envMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Bright main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    // Dynamic color accents for diamond fire highlights
    const fireLight1 = new THREE.PointLight(0x00ffff, 5.0, 5); // Cyan fire sparkle
    fireLight1.position.set(1.5, 2.0, 1);
    scene.add(fireLight1);

    const fireLight2 = new THREE.PointLight(0xff00ff, 5.0, 5); // Magenta fire sparkle
    fireLight2.position.set(-1.5, 2.0, 1);
    scene.add(fireLight2);

    const fireLight3 = new THREE.PointLight(0xffdf80, 4.0, 4); // Warm gold fire sparkle
    fireLight3.position.set(0, 1.0, 2);
    scene.add(fireLight3);

    // Create Ring Group
    const ringGroup = new THREE.Group();

    // Materials
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xecd078, // Solid 18K Gold color
      roughness: 0.05,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMap: envMap,
    });

    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.0,
      transmission: 0.98, // Glass refraction
      ior: 2.417,         // Diamond refractive index
      thickness: 0.55,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      flatShading: true,  // Critical for diamond cuts
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMap: envMap,
    });

    // 1. Ring Band (Delicate Torus in vertical XY plane)
    const bandGeometry = new THREE.TorusGeometry(1.5, 0.11, 32, 90);
    const band = new THREE.Mesh(bandGeometry, goldMaterial);
    band.rotation.x = 0; // Standing vertically so setting connects perfectly at Y = 1.5
    ringGroup.add(band);

    // 2. 6-Prong Tiffany Crown Basket (Clasps the center diamond)
    const prongGeometry = new THREE.CylinderGeometry(0.03, 0.02, 0.52, 8);
    const prongDistance = 0.28;
    const prongCount = 6;
    
    // Position 6 elegant gold prongs around the center diamond
    for (let i = 0; i < prongCount; i++) {
      const angle = (i / prongCount) * Math.PI * 2;
      const prong = new THREE.Mesh(prongGeometry, goldMaterial);
      
      // Position prongs around setting Y = 1.5
      prong.position.set(
        Math.cos(angle) * prongDistance,
        1.5 + 0.16,
        Math.sin(angle) * prongDistance
      );
      
      // Angle prongs slightly outwards to cup the diamond base
      prong.rotation.z = -Math.cos(angle) * 0.16;
      prong.rotation.x = Math.sin(angle) * 0.16;
      ringGroup.add(prong);
    }

    // Support under-bezel collar wire
    const collarGeometry = new THREE.TorusGeometry(0.25, 0.025, 8, 24);
    const collar = new THREE.Mesh(collarGeometry, goldMaterial);
    collar.position.set(0, 1.5 + 0.12, 0);
    collar.rotation.x = Math.PI / 2;
    ringGroup.add(collar);

    // Solid seat collar directly embedded on the band hoop
    const baseSeatGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.1, 16);
    const baseSeat = new THREE.Mesh(baseSeatGeometry, goldMaterial);
    baseSeat.position.set(0, 1.5 + 0.02, 0);
    ringGroup.add(baseSeat);

    // 3. Centerpiece Diamond (Round Brilliant Cut: Crown + Pavilion)
    const centerGem = new THREE.Group();
    centerGem.position.set(0, 1.5 + 0.26, 0);

    const crownGeometry = new THREE.CylinderGeometry(0.22, 0.35, 0.14, 16, 1);
    const crown = new THREE.Mesh(crownGeometry, diamondMaterial);
    crown.position.y = 0.07;
    centerGem.add(crown);

    const pavilionGeometry = new THREE.ConeGeometry(0.35, 0.38, 16, 1);
    const pavilion = new THREE.Mesh(pavilionGeometry, diamondMaterial);
    pavilion.position.y = -0.19;
    pavilion.rotation.x = Math.PI; // point down
    centerGem.add(pavilion);

    ringGroup.add(centerGem);

    // 4. Pave Diamond Band (12 accent gems embedded along the upper curve of the band)
    const paveCount = 12;
    const paveSpreadAngle = Math.PI / 2.5; // Spread gems over top ~72 degrees on left and right
    
    // Geometries for pave stones
    const paveGemGeometry = new THREE.IcosahedronGeometry(0.065, 1);
    const paveCollarGeometry = new THREE.CylinderGeometry(0.075, 0.065, 0.04, 8);

    for (let i = 0; i < paveCount; i++) {
      // Interpolate angle over the upper half of the ring (ignoring the exact top center where the main diamond is)
      const t = (i / (paveCount - 1)) * 2 - 1; // from -1 to 1
      if (Math.abs(t) < 0.15) continue; // Skip the exact top center to avoid overlap with the main crown seat

      const angle = t * paveSpreadAngle + Math.PI / 2; // Offset to sit on the top curve

      // Local position of the metal band surface
      const radius = 1.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const paveGroup = new THREE.Group();
      paveGroup.position.set(x, y, 0);
      
      // Orient the pave set outward, perpendicular to the ring circumference
      paveGroup.rotation.z = angle - Math.PI / 2;

      // Small gold bezel cup
      const bezel = new THREE.Mesh(paveCollarGeometry, goldMaterial);
      bezel.position.y = 0.02;
      paveGroup.add(bezel);

      // Sparkly pave diamond gem
      const paveGem = new THREE.Mesh(paveGemGeometry, diamondMaterial);
      paveGem.position.y = 0.045;
      paveGroup.add(paveGem);

      ringGroup.add(paveGroup);
    }

    // Add complete ring group to scene
    scene.add(ringGroup);

    // Frame scale adjustment
    ringGroup.scale.set(1.2, 1.2, 1.2);

    // Drag and Touch interaction tracking
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Default resting tilt on X
    const defaultTiltX = -Math.PI / 4.5;
    
    // Current target rotations
    let targetRotY = 0;
    let targetRotX = defaultTiltX;

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      // Update target rotations based on drag delta
      targetRotY += deltaX * 0.007;
      targetRotX += deltaY * 0.007;

      // Clamp X rotation to keep the ring showcase looking elegant
      targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 6, targetRotX));

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile dragging
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      isDragging = true;
      previousMousePosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || event.touches.length === 0) return;
      const deltaX = event.touches[0].clientX - previousMousePosition.x;
      const deltaY = event.touches[0].clientY - previousMousePosition.y;
      
      targetRotY += deltaX * 0.007;
      targetRotX += deltaY * 0.007;
      targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 6, targetRotX));

      previousMousePosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    // Attach listeners directly to the container for local engagement
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // If user isn't dragging, continue default slow spin & reset tilt to resting angle
      if (!isDragging) {
        targetRotY += 0.0035; // Slow ambient spin
        targetRotX += (defaultTiltX - targetRotX) * 0.045; // Smoothly return to default tilt
      }

      // Smoothly interpolate group rotation towards target values (inertial dampening)
      ringGroup.rotation.x += (targetRotX - ringGroup.rotation.x) * 0.1;
      ringGroup.rotation.y += (targetRotY - ringGroup.rotation.y) * 0.1;
      ringGroup.rotation.z += (Math.cos(time * 0.12) * 0.03 - ringGroup.rotation.z) * 0.1;

      // Orbit color point lights to create animated diamond fire sparkles
      fireLight1.position.x = 1.5 * Math.cos(time * 1.6);
      fireLight1.position.z = 1.5 * Math.sin(time * 1.6);

      fireLight2.position.x = -1.5 * Math.cos(time * 1.9);
      fireLight2.position.z = -1.5 * Math.sin(time * 1.9);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      
      window.removeEventListener("resize", handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      bandGeometry.dispose();
      prongGeometry.dispose();
      collarGeometry.dispose();
      baseSeatGeometry.dispose();
      crownGeometry.dispose();
      pavilionGeometry.dispose();
      paveGemGeometry.dispose();
      paveCollarGeometry.dispose();
      
      goldMaterial.dispose();
      diamondMaterial.dispose();
      envMap.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    />
  );
}
