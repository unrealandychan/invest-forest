import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { calculateTreeMetrics, Holding, WeatherCondition } from '@invest-forest/core';

interface ProceduralTreeProps {
  holding: Holding;
  position: [number, number, number];
  isSelected: boolean;
  weather: WeatherCondition;
  onClick: () => void;
}

export const ProceduralTree: React.FC<ProceduralTreeProps> = ({
  holding,
  position,
  isSelected,
  weather,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const foliageRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Animated growth scale
  const currentScaleRef = useRef(0.2); // Start as sprout and grow smoothly
  const targetScaleRef = useRef(1.0);
  const pulseRef = useRef(0);

  const metrics = calculateTreeMetrics(holding);
  const { height, trunkRadius, foliageRadius, species, fruitCount, growthRings } = metrics;

  // Whenever valuation or shares change, trigger a visible growth pulse
  const valuation = holding.shares * holding.currentPrice;
  useEffect(() => {
    pulseRef.current = 1.0; // Trigger growth pulse
  }, [valuation, holding.shares]);

  // Frame animation: wind sway, growth scale lerp, and growth pulse
  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();

      // Smooth animated growth emergence (lerp towards full scale)
      currentScaleRef.current = THREE.MathUtils.lerp(
        currentScaleRef.current,
        targetScaleRef.current,
        Math.min(1.0, delta * 3.5)
      );

      // Growth pulse decay
      if (pulseRef.current > 0) {
        pulseRef.current = Math.max(0, pulseRef.current - delta * 2.0);
      }

      const activeScale = currentScaleRef.current * (1.0 + pulseRef.current * 0.15);
      const hoverBonus = isSelected ? 1.08 : hovered ? 1.04 : 1.0;
      groupRef.current.scale.set(
        activeScale * hoverBonus,
        activeScale * hoverBonus,
        activeScale * hoverBonus
      );

      // Gentle wind sway in breeze or storm
      const swaySpeed = weather === 'winter_snow' || weather === 'rain' ? 2.5 : 1.2;
      const swayAmount = weather === 'breeze' ? 0.05 : weather === 'rain' ? 0.08 : 0.03;
      groupRef.current.rotation.z = Math.sin(t * swaySpeed + position[0]) * swayAmount;
    }

    if (foliageRef.current) {
      const t = state.clock.getElapsedTime();
      foliageRef.current.rotation.y = Math.sin(t * 0.5 + position[2]) * 0.05;
    }
  });

  const effectiveFoliageColor = weather === 'winter_snow' ? '#a3b18a' : species.foliageColor;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Ground Root Mound & Selection Aura */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[trunkRadius * 1.5, trunkRadius * 2.8, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#f4e04d' : pulseRef.current > 0 ? '#52b788' : hovered ? '#a8d5ba' : '#34251f'}
          transparent
          opacity={isSelected || hovered || pulseRef.current > 0 ? 0.85 : 0.4}
        />
      </mesh>

      {/* Trunk with Bark Material */}
      <mesh position={[0, height * 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[trunkRadius * 0.75, trunkRadius * 1.15, height * 0.9, 8]}
        />
        <meshStandardMaterial
          color={species.trunkColor}
          roughness={0.85}
          flatShading
        />
      </mesh>

      {/* Tiered Low-Poly Foliage Canopy */}
      <group ref={foliageRef}>
        {holding.assetClass === 'bond' ? (
          // Cascading Willow
          <group position={[0, height * 0.8, 0]}>
            <mesh castShadow position={[0, 0.2, 0]}>
              <coneGeometry args={[foliageRadius * 1.1, height * 0.75, 7]} />
              <meshStandardMaterial color={effectiveFoliageColor} roughness={0.7} flatShading />
            </mesh>
            <mesh castShadow position={[0, -0.3, 0]}>
              <cylinderGeometry args={[foliageRadius * 0.9, foliageRadius * 1.2, height * 0.5, 7]} />
              <meshStandardMaterial color={effectiveFoliageColor} roughness={0.7} flatShading />
            </mesh>
          </group>
        ) : (
          // Tiered Conical Canopies (Ancient Oak, Apple, Sprout)
          <group position={[0, height * 0.85, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <coneGeometry args={[foliageRadius, height * 0.65, 8]} />
              <meshStandardMaterial color={effectiveFoliageColor} roughness={0.7} flatShading />
            </mesh>
            <mesh castShadow position={[0, height * 0.35, 0]}>
              <coneGeometry args={[foliageRadius * 0.8, height * 0.55, 7]} />
              <meshStandardMaterial color={effectiveFoliageColor} roughness={0.7} flatShading />
            </mesh>
            <mesh castShadow position={[0, height * 0.65, 0]}>
              <coneGeometry args={[foliageRadius * 0.55, height * 0.45, 6]} />
              <meshStandardMaterial color={effectiveFoliageColor} roughness={0.7} flatShading />
            </mesh>
          </group>
        )}

        {/* Fruit / Harvest Blossoms for Dividend Trees */}
        {fruitCount > 0 && (
          <group position={[0, height * 0.85, 0]}>
            {Array.from({ length: Math.min(fruitCount, 14) }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const r = foliageRadius * 0.78;
              const fx = Math.cos(angle) * r;
              const fz = Math.sin(angle) * r;
              const fy = ((i % 3) - 1) * 0.25;
              return (
                <mesh key={i} position={[fx, fy, fz]} castShadow>
                  <sphereGeometry args={[0.12, 6, 6]} />
                  <meshStandardMaterial
                    color={species.fruitColor || '#e63946'}
                    roughness={0.3}
                    emissive={species.fruitColor || '#e63946'}
                    emissiveIntensity={0.25}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* Interactive Floating Tooltip */}
      {(hovered || isSelected) && (
        <Html position={[0, height + 1.2, 0]} center distanceFactor={12}>
          <div className="bg-forest-950/90 border border-forest-500/50 backdrop-blur-md px-3 py-2 rounded-xl text-center shadow-2xl pointer-events-none select-none whitespace-nowrap min-w-[130px] animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-bold text-sprout uppercase tracking-wider flex items-center justify-center gap-1">
              <span>{holding.symbol}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-forest-800 text-slate-300">
                {species.commonName}
              </span>
            </div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              ${valuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {growthRings} {growthRings === 1 ? 'Year Ring' : 'Year Rings'} • {(height).toFixed(1)}m Canopy
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
