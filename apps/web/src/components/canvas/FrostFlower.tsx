import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FrostFlowerClusterProps {
  trunkRadius: number;
  count: number;
}

export const FrostFlowerCluster: React.FC<FrostFlowerClusterProps> = ({ trunkRadius, count }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (glowMaterialRef.current) {
      const t = state.clock.getElapsedTime();
      // Shimmering luminescent glow
      glowMaterialRef.current.emissiveIntensity = 0.5 + Math.sin(t * 2.8) * 0.35;
    }
  });

  const flowers = React.useMemo(() => {
    const list: { x: number; z: number; angle: number; scale: number }[] = [];
    const flowerCount = Math.min(12, Math.max(4, count));
    for (let i = 0; i < flowerCount; i++) {
      const angle = (i / flowerCount) * Math.PI * 2 + (i % 2) * 0.2;
      const dist = trunkRadius * 1.55 + ((i % 3) * 0.12);
      list.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        angle,
        scale: 0.8 + (i % 3) * 0.2,
      });
    }
    return list;
  }, [trunkRadius, count]);

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]} scale={f.scale} rotation={[0, f.angle, 0]}>
          {/* Glowing central ice stamen */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial
              ref={i === 0 ? glowMaterialRef : undefined}
              color="#caf0f8"
              emissive="#48cae4"
              emissiveIntensity={0.65}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* 5 Luminescent Petals */}
          {[0, 1, 2, 3, 4].map((petalIdx) => {
            const petalAngle = (petalIdx / 5) * Math.PI * 2;
            const px = Math.cos(petalAngle) * 0.11;
            const pz = Math.sin(petalAngle) * 0.11;
            return (
              <mesh
                key={petalIdx}
                position={[px, 0.08, pz]}
                rotation={[0.3, petalAngle, 0]}
                castShadow
              >
                <coneGeometry args={[0.055, 0.16, 4]} />
                <meshStandardMaterial
                  color="#64dfdf"
                  emissive="#72efdd"
                  emissiveIntensity={0.4}
                  roughness={0.3}
                  transparent
                  opacity={0.85}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};
