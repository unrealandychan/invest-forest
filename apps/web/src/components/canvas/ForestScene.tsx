import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Holding, WeatherCondition } from '@invest-forest/core';
import { ProceduralTree } from './ProceduralTree';
import { GroundTerrain } from './GroundTerrain';
import { WeatherSystem } from './WeatherSystem';

interface ForestSceneProps {
  holdings: Holding[];
  cashBalance: number;
  weather: WeatherCondition;
  selectedHolding: Holding | null;
  onSelectHolding: (holding: Holding | null) => void;
  totalValue?: number;
  dcaStreak?: number;
}

export const ForestScene: React.FC<ForestSceneProps> = ({
  holdings,
  cashBalance,
  weather,
  selectedHolding,
  onSelectHolding,
  totalValue,
  dcaStreak,
}) => {
  // Compute positions for trees in an organic spiral around the island
  const treePositions = useMemo(() => {
    return holdings.map((_, index) => {
      if (holdings.length === 1) return [0, 0, 0] as [number, number, number];

      // Golden ratio spiral distribution
      const phi = index * 2.39996; // Golden angle in radians
      const radius = 1.8 + Math.sqrt(index + 1) * 1.5;
      const clampedRadius = Math.min(radius, 6.2);
      const x = Math.cos(phi) * clampedRadius;
      const z = Math.sin(phi) * clampedRadius;
      return [x, 0, z] as [number, number, number];
    });
  }, [holdings]);

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        dpr={[1, 1.75]} // Clamped DPR for smooth 60fps on retina and mobile devices
        camera={{ position: [0, 9, 15], fov: 42 }}
        onPointerDown={(e) => {
          // If user clicks on empty canvas space, deselect
          if (e.target === e.currentTarget) {
            onSelectHolding(null);
          }
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <WeatherSystem weather={weather} />

        <group>
          <GroundTerrain
            weather={weather}
            cashBalance={cashBalance}
            totalValue={totalValue}
            dcaStreak={dcaStreak}
          />

          {holdings.map((h, i) => (
            <ProceduralTree
              key={h.symbol}
              holding={h}
              position={treePositions[i]}
              isSelected={selectedHolding?.symbol === h.symbol}
              weather={weather}
              onClick={() => onSelectHolding(h)}
            />
          ))}

          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.5}
            scale={18}
            blur={1.5}
            far={4}
          />
        </group>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05} // Prevent camera from going under ground
          minPolarAngle={Math.PI / 8}
        />
      </Canvas>
    </div>
  );
};
