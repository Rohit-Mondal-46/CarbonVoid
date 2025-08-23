import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import earthTexture from "../assets/earth-img.png";

const Earth = () => {
  const ref = useRef();
  const texture = useLoader(TextureLoader, earthTexture);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.5, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissive={new THREE.Color(0x222222)}
        emissiveIntensity={0.5}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  );
};

const Globe = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
      }}
    >
      <Canvas camera={{ position: [0, 0, 9], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} />

        {/* Soft glow shell around the Earth */}
        <mesh>
          <sphereGeometry args={[3.2, 64, 64]} />
          <meshStandardMaterial
            color={0xffffff}
            emissive={0xffffff}
            emissiveIntensity={0.2} // Lower for subtlety
            transparent
            opacity={0.1}
          />
        </mesh>

        <Stars radius={100} depth={50} count={3000} factor={5} fade />

        <Suspense fallback={null}>
          <Earth />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Globe;