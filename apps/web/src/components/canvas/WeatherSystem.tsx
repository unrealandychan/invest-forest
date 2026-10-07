import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherCondition } from '@invest-forest/core';

interface WeatherSystemProps {
  weather: WeatherCondition;
}

export const WeatherSystem: React.FC<WeatherSystemProps> = ({ weather }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = weather === 'winter_snow' ? 500 : weather === 'rain' ? 700 : 0;

  const [positions, velocities] = useMemo(() => {
    if (particleCount === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;     // x
      pos[i * 3 + 1] = Math.random() * 12 + 2;      // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = weather === 'winter_snow' ? -0.04 - Math.random() * 0.03 : -0.25 - Math.random() * 0.1;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, [particleCount, weather]);

  useFrame(() => {
    if (!pointsRef.current || particleCount === 0) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      array[i * 3 + 1] += velocities[i * 3 + 1];
      if (weather === 'winter_snow') {
        array[i * 3] += Math.sin(Date.now() * 0.002 + i) * 0.01;
      }
      // Reset particle if it hits the ground
      if (array[i * 3 + 1] < 0) {
        array[i * 3 + 1] = 12;
      }
    }
    posAttr.needsUpdate = true;
  });

  // Lighting configurations
  const ambientIntensity = weather === 'winter_snow' ? 0.4 : weather === 'rain' ? 0.35 : 0.65;
  const sunColor = weather === 'winter_snow' ? '#d8e2dc' : weather === 'rain' ? '#94d2bd' : '#fffae8';
  const sunIntensity = weather === 'winter_snow' ? 0.7 : weather === 'rain' ? 0.5 : 1.4;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#eaf4f4" />
      <directionalLight
        position={[12, 18, 10]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight
        args={[weather === 'winter_snow' ? '#a2d2ff' : '#cfe0c3', '#403d39', 0.4]}
      />

      {particleCount > 0 && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={weather === 'winter_snow' ? 0.12 : 0.06}
            color={weather === 'winter_snow' ? '#ffffff' : '#90e0ef'}
            transparent
            opacity={weather === 'winter_snow' ? 0.85 : 0.65}
          />
        </points>
      )}
    </>
  );
};
