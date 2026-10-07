import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { HarvestMemorial } from '@invest-forest/core';

interface HarvestStumpProps {
  memorial: HarvestMemorial;
  position: [number, number, number];
}

export const HarvestStump: React.FC<HarvestStumpProps> = ({ memorial, position }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Root Base Mound */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.95, 0.15, 16]} />
        <meshStandardMaterial color="#362a23" roughness={0.9} />
      </mesh>

      {/* Mossy Tree Stump Trunk */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.45, 12]} />
        <meshStandardMaterial color="#4a3728" roughness={0.85} flatShading />
      </mesh>

      {/* Top Cross-Section Face with Annual Rings */}
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.54, 16]} />
        <meshStandardMaterial color="#d4a373" roughness={0.7} />
      </mesh>

      {/* Moss Patches on the Stump */}
      <mesh position={[0.25, 0.35, 0.3]} castShadow>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#52b788" roughness={0.9} />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.2]} castShadow>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color="#40916c" roughness={0.9} />
      </mesh>

      {/* Baby Regenerating Sapling sprouting from the root */}
      <group position={[0.45, 0.1, 0.2]}>
        {/* Tiny sapling stem */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.35, 6]} />
          <meshStandardMaterial color="#74c69d" roughness={0.8} />
        </mesh>
        {/* Tiny sapling leaves */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <coneGeometry args={[0.18, 0.25, 6]} />
          <meshStandardMaterial color="#52b788" roughness={0.6} />
        </mesh>
      </group>

      {/* Interactive Tooltip on Hover */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center distanceFactor={12}>
          <div className="bg-forest-950/95 border border-amber-600/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl text-center select-none pointer-events-none whitespace-nowrap min-w-[160px] animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>🪵 Memorial Harvest Stump</span>
            </div>
            <div className="text-xs font-black text-white mt-0.5">
              {memorial.symbol} • ${memorial.harvestedAmount.toLocaleString()} Harvested
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {memorial.reason} • {memorial.yearsInSoil.toFixed(1)} yrs in soil
            </div>
            <div className="text-[9px] text-sprout mt-1 italic max-w-xs">
              &ldquo;The timber fulfilled its duty to nourish your real life.&rdquo;
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
