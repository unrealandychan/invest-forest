import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Holding, WeatherCondition, HarvestMemorial, Transaction } from '@invest-forest/core';
import { ProceduralTree } from './ProceduralTree';
import { GroundTerrain } from './GroundTerrain';
import { WeatherSystem } from './WeatherSystem';
import { CircadianSky, TimeOfDay } from './CircadianSky';
import { HarvestStump } from './HarvestStump';

interface ForestSceneProps {
  holdings: Holding[];
  transactions?: Transaction[];
  memorials?: HarvestMemorial[];
  cashBalance: number;
  weather: WeatherCondition;
  timeOfDay?: TimeOfDay;
  timeTravelYears?: number;
  selectedHolding: Holding | null;
  onSelectHolding: (holding: Holding | null) => void;
  totalValue?: number;
  dcaStreak?: number;
}

export const ForestScene: React.FC<ForestSceneProps> = ({
  holdings,
  transactions = [],
  memorials = [],
  cashBalance,
  weather,
  timeOfDay = 'day',
  timeTravelYears = 0,
  selectedHolding,
  onSelectHolding,
  totalValue = 10000,
  dcaStreak = 3,
}) => {
  // In Time Travel mode, project meadow and tree scaling forward
  const isTimeTraveling = timeTravelYears > 0;
  const effectiveTotalValue = isTimeTraveling
    ? Math.round(totalValue * Math.pow(1.095, timeTravelYears) + timeTravelYears * 6000)
    : totalValue;
  const effectiveDcaStreak = isTimeTraveling ? dcaStreak + timeTravelYears * 12 : dcaStreak;
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
        <CircadianSky
          timeOfDay={timeOfDay}
          hasAurora={Boolean(dcaStreak && dcaStreak >= 3)}
        />
        <WeatherSystem weather={weather} />

        <group>
          <GroundTerrain
            weather={weather}
            cashBalance={cashBalance}
            totalValue={effectiveTotalValue}
            dcaStreak={effectiveDcaStreak}
          />

          {holdings.map((h, i) => (
            <ProceduralTree
              key={h.symbol}
              holding={h}
              transactions={transactions}
              position={treePositions[i]}
              isSelected={selectedHolding?.symbol === h.symbol}
              weather={weather}
              timeTravelYears={timeTravelYears}
              onClick={() => onSelectHolding(h)}
            />
          ))}

          {/* Render Consecrated Real-Life Harvest Memorial Stumps */}
          {memorials.map((m, idx) => {
            const angle = (idx * 2.1) + 1.2;
            const r = 4.2 + (idx * 1.5) % 3.0;
            const mx = Math.cos(angle) * r;
            const mz = Math.sin(angle) * r;
            return <HarvestStump key={m.id} memorial={m} position={[mx, 0, mz]} />;
          })}

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
