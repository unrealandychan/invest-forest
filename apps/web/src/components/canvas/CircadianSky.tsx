import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface CircadianSkyProps {
  timeOfDay: TimeOfDay;
  hasAurora: boolean; // Active during night with milestone streaks or compounding
}

export const CircadianSky: React.FC<CircadianSkyProps> = ({ timeOfDay, hasAurora }) => {
  const starsRef = useRef<THREE.Points>(null);
  const auroraRef = useRef<THREE.Points>(null);

  // 1. Lighting profiles for each time of day
  const lighting = useMemo(() => {
    switch (timeOfDay) {
      case 'dawn':
        return {
          sunPos: [15, 6, -10] as [number, number, number],
          sunColor: '#ffb703',
          sunIntensity: 1.1,
          ambientColor: '#fefae0',
          ambientIntensity: 0.55,
          fogColor: '#4a3b32',
        };
      case 'dusk':
        return {
          sunPos: [-15, 5, 8] as [number, number, number],
          sunColor: '#fb8500',
          sunIntensity: 1.0,
          ambientColor: '#d4a373',
          ambientIntensity: 0.45,
          fogColor: '#2b1a1d',
        };
      case 'night':
        return {
          sunPos: [10, 16, 10] as [number, number, number], // Moon position
          sunColor: '#caf0f8',
          sunIntensity: 0.45,
          ambientColor: '#03071e',
          ambientIntensity: 0.25,
          fogColor: '#03071e',
        };
      case 'day':
      default:
        return {
          sunPos: [12, 20, 10] as [number, number, number],
          sunColor: '#fffbeb',
          sunIntensity: 1.4,
          ambientColor: '#eaf4f4',
          ambientIntensity: 0.65,
          fogColor: '#1b3027',
        };
    }
  }, [timeOfDay]);

  // 2. Stars for night time
  const starCount = 350;
  const [starPositions] = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.1); // upper hemisphere
      const dist = 35 + Math.random() * 10;

      pos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = dist * Math.cos(phi);
      pos[i * 3 + 2] = dist * Math.sin(phi) * Math.sin(theta);
    }
    return [pos];
  }, [starCount]);

  // 3. Aurora Borealis Ribbon Particles (Curtain of waving light)
  const auroraCount = 450;
  const [auroraPositions, auroraColors] = useMemo(() => {
    const pos = new Float32Array(auroraCount * 3);
    const cols = new Float32Array(auroraCount * 3);
    const colorPalette = [
      new THREE.Color('#52b788'), // emerald
      new THREE.Color('#48cae4'), // cyan
      new THREE.Color('#7209b7'), // violet
      new THREE.Color('#f72585'), // magenta
    ];

    for (let i = 0; i < auroraCount; i++) {
      const u = (i / auroraCount) * 2 - 1; // -1 to 1
      const x = u * 24;
      const z = -14 - Math.sin(u * Math.PI * 1.5) * 4;
      const y = 9 + (i % 12) * 0.6;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, [auroraCount]);

  // Animation frame loop for shimmering stars and waving aurora curtain
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (starsRef.current && timeOfDay === 'night') {
      starsRef.current.rotation.y = t * 0.005;
    }

    if (auroraRef.current && hasAurora) {
      const geo = auroraRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < auroraCount; i++) {
        const x = array[i * 3];
        // Sine wave undulation
        array[i * 3 + 1] = 9 + (i % 12) * 0.6 + Math.sin(t * 1.5 + x * 0.25) * 0.8;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      <directionalLight
        position={lighting.sunPos}
        intensity={lighting.sunIntensity}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <hemisphereLight
        args={[
          timeOfDay === 'night' ? '#10172a' : timeOfDay === 'dawn' ? '#ffedd5' : '#cffafe',
          timeOfDay === 'night' ? '#020617' : '#14532d',
          0.35,
        ]}
      />

      {/* Night Sky Stars */}
      {timeOfDay === 'night' && (
        <points ref={starsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={starCount}
              array={starPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color="#ffffff"
            transparent
            opacity={0.85}
          />
        </points>
      )}

      {/* Aurora Borealis Shimmering Curtain (Triggered at Night or During Milestones) */}
      {(hasAurora || timeOfDay === 'night') && (
        <points ref={auroraRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={auroraCount}
              array={auroraPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={auroraCount}
              array={auroraColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.55}
            vertexColors
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </>
  );
};
