import React, { Suspense } from 'react';
import { OrbitControls, ContactShadows, Environment, Html } from '@react-three/drei';
import { Bottle } from './Bottle';    // ← fixed

export const Experience = () => (
  <>
    <OrbitControls />
    <ambientLight intensity={0.5} />
    <directionalLight
      castShadow
      intensity={1}
      position={[5, 5, 5]}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />

    <Suspense fallback={<Html center>Loading bottle…</Html>}>
      <Bottle position={[0, 0, 0]} scale={1} castShadow receiveShadow />
    </Suspense>

    <ContactShadows position={[0, -1, 0]} opacity={0.3} scale={10} blur={2} />
    <Environment preset="sunset" />
  </>
);