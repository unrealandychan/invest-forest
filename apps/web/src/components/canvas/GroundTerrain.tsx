import React, { useMemo } from 'react';
import { WeatherCondition, getBiomeTier } from '@invest-forest/core';

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
  const validTotalValue = isFinite(totalValue) && totalValue >= 0 ? totalValue : 0;
  const validDcaStreak = isFinite(dcaStreak) && dcaStreak >= 0 ? dcaStreak : 0;
  const validCashBalance = isFinite(cashBalance) && cashBalance >= 0 ? cashBalance : 0;

  const biome = getBiomeTier(validTotalValue);

  // Ground colors shift based on weather and biome
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
        return biome.groundBaseColor;
    }
  };

  const getSubsoilColor = () => {
    return weather === 'winter_snow' ? '#8d99ae' : '#34251f';
  };

  // Meadow radius scales with biome tier
  const meadowRadius = Math.max(biome.islandRadius, 8.5 + Math.log10(1 + validTotalValue / 1000) * 1.5);

  // Generate wildflower clusters for disciplined DCA streaks
  const wildflowers = useMemo(() => {
    const flowers: { x: number; z: number; color: string }[] = [];
    const count = Math.min(36, Math.max(6, validDcaStreak * 3));
    const colors = ['#f4e04d', '#f72585', '#4cc9f0', '#7209b7', '#f39c12', '#52b788'];

    for (let i = 0; i < count; i++) {
      const angle = (i * 2.39996) + 0.8;
      const dist = 3.5 + ((i * 1.9) % (meadowRadius - 4.5));
      flowers.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        color: colors[i % colors.length],
      });
    }
    return flowers;
  }, [validDcaStreak, meadowRadius]);

  // Distant Alpine Mountain Peaks for Tier 4 & 5
  const mountainPeaks = useMemo(() => {
    if (!biome.hasMountains) return [];
    return [
      { x: -28, y: 8, z: -30, r: 8, h: 22 },
      { x: 0, y: 11, z: -36, r: 10, h: 28 },
      { x: 26, y: 7, z: -32, r: 7.5, h: 20 },
      { x: -36, y: 6, z: -15, r: 7, h: 18 },
      { x: 34, y: 6, z: -12, r: 7, h: 19 },
    ];
  }, [biome.hasMountains]);

  return (
    <group position={[0, 0, 0]}>
      {/* Upper Grassy Meadow Island */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[meadowRadius, meadowRadius + 0.6, 0.4, 32]} />
        <meshStandardMaterial color={getGroundColor()} roughness={0.9} flatShading />
      </mesh>

      {/* Earth / Subsoil Base Layer */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <cylinderGeometry args={[meadowRadius + 0.6, meadowRadius - 1.2, 0.8, 32]} />
        <meshStandardMaterial color={getSubsoilColor()} roughness={0.95} flatShading />
      </mesh>

      {/* The Liquid Cash Stream */}
      {validCashBalance > 0 && (
        <group position={[0, 0.12, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow>
            <planeGeometry
              args={[
                Math.min(3.8, 1.4 + Math.log10(1 + validCashBalance / 500) * 0.4),
                meadowRadius * 2,
                16,
                16,
              ]}
            />
            <meshStandardMaterial
              color={weather === 'winter_snow' ? '#bde0fe' : biome.id === 'pangaea' ? '#48cae4' : '#0077b6'}
              metalness={0.65}
              roughness={0.15}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>
      )}

      {/* Tier 2+ Wooden Arched Footbridge crossing the Stream */}
      {biome.hasBridge && (
        <group position={[0, 0.25, 0.5]} rotation={[0, 0.4, 0]}>
          {/* Bridge Planks Arch */}
          <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
            <boxGeometry args={[3.2, 0.1, 1.1]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.8} />
          </mesh>
          {/* Bridge Rails */}
          <mesh castShadow position={[0, 0.4, 0.5]}>
            <boxGeometry args={[3.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#4a3728" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.4, -0.5]}>
            <boxGeometry args={[3.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#4a3728" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Tier 3+ Cascading Rocky Waterfall Shelf */}
      {biome.hasWaterfall && (
        <group position={[meadowRadius * 0.65, 0.4, -meadowRadius * 0.4]}>
          {/* Rocky tiered bluff */}
          <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[3.5, 1.4, 3.0]} />
            <meshStandardMaterial color="#475569" roughness={0.85} flatShading />
          </mesh>
          {/* Frothing Waterfall Foam */}
          <mesh position={[0, 0.2, 1.55]} rotation={[-0.4, 0, 0]}>
            <planeGeometry args={[1.8, 1.6]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.85}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Tier 4+ Distant Alpine Mountain Horizon */}
      {mountainPeaks.map((m, idx) => (
        <mesh key={idx} position={[m.x, m.y, m.z]} receiveShadow>
          <coneGeometry args={[m.r, m.h, 6]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#334155' : '#1e293b'}
            roughness={0.9}
            flatShading
          />
        </mesh>
      ))}

      {/* Tier 5 Celestial Glacial Crystals for Pangaea */}
      {biome.id === 'pangaea' && (
        <group position={[-meadowRadius * 0.5, 0.5, -meadowRadius * 0.5]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <octahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color="#64dfdf"
              emissive="#48cae4"
              emissiveIntensity={0.5}
              roughness={0.1}
              transparent
              opacity={0.85}
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
