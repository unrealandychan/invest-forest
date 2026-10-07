import React, { useMemo } from 'react';
import { WeatherCondition } from '@invest-forest/core';

interface GroundTerrainProps {
  weather: WeatherCondition;
  cashBalance: number;
  totalValue?: number;
  dcaStreak?: number;
}

export const GroundTerrain: React.FC<GroundTerrainProps> = ({
  weather,
  cashBalance,
  totalValue = 10000,
  dcaStreak = 3,
}) => {
  // Ground colors shift based on weather
  const getGroundColor = () => {
    switch (weather) {
      case 'winter_snow':
        return '#d8e2dc'; // Frosty snow blanket
      case 'rain':
        return '#2d4739'; // Wet damp fertile soil
      case 'breeze':
        return '#406343'; // Golden autumn-tinged meadow
      case 'sunny':
      default:
        return '#3a5a40'; // Lush vibrant meadow
    }
  };

  const getSubsoilColor = () => {
    return weather === 'winter_snow' ? '#8d99ae' : '#34251f';
  };

  // Meadow radius dynamically scales with net worth
  const meadowRadius = Math.min(11.5, Math.max(8.0, 8.0 + Math.log10(1 + Math.max(0, totalValue) / 1000) * 1.2));

  // Generate wildflower clusters for disciplined DCA streaks
  const wildflowers = useMemo(() => {
    const flowers: { x: number; z: number; color: string }[] = [];
    const count = Math.min(24, Math.max(4, dcaStreak * 3));
    const colors = ['#f4e04d', '#f72585', '#4cc9f0', '#7209b7', '#f39c12'];

    for (let i = 0; i < count; i++) {
      const angle = (i * 2.39996) + 0.8;
      const dist = 3.5 + ((i * 1.7) % (meadowRadius - 4.2));
      flowers.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        color: colors[i % colors.length],
      });
    }
    return flowers;
  }, [dcaStreak, meadowRadius]);

  return (
    <group position={[0, 0, 0]}>
      {/* Upper Grassy Meadow Island */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[meadowRadius, meadowRadius + 0.5, 0.4, 32]} />
        <meshStandardMaterial color={getGroundColor()} roughness={0.9} flatShading />
      </mesh>

      {/* Earth / Subsoil Base Layer */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[meadowRadius + 0.5, meadowRadius - 0.8, 0.8, 32]} />
        <meshStandardMaterial color={getSubsoilColor()} roughness={0.95} flatShading />
      </mesh>

      {/* The Liquid Cash Stream (River width scales with cash balance) */}
      {cashBalance > 0 && (
        <group position={[0, 0.12, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow>
            <planeGeometry args={[Math.min(3.2, 1.2 + Math.log10(1 + cashBalance / 500) * 0.4), meadowRadius * 2, 16, 16]} />
            <meshStandardMaterial
              color={weather === 'winter_snow' ? '#bde0fe' : '#0077b6'}
              metalness={0.65}
              roughness={0.15}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>
      )}

      {/* Wildflowers cultivated by disciplined DCA Streaks */}
      {wildflowers.map((f, i) => (
        <mesh key={i} position={[f.x, 0.12, f.z]} castShadow>
          <sphereGeometry args={[0.09, 5, 5]} />
          <meshStandardMaterial
            color={weather === 'winter_snow' ? '#ffffff' : f.color}
            emissive={f.color}
            emissiveIntensity={weather === 'winter_snow' ? 0 : 0.3}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Decorative Low-Poly Meadow Rocks */}
      <mesh position={[-meadowRadius * 0.5, 0.1, meadowRadius * 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#6c757d" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[meadowRadius * 0.45, 0.1, -meadowRadius * 0.4]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#5c677d" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[-meadowRadius * 0.3, 0.08, -meadowRadius * 0.6]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#495057" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
};
