import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
//No env
export function MinimalEnvironment() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#87CEEB');
        scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                object.intensity = 0;
            }
        });
        return () => {
            scene.background = null;
        };
    }, [scene]);
    return (_jsxs(_Fragment, { children: [_jsx("directionalLight", { position: [5, 5, 2], intensity: 1.2, color: "#FDB813", castShadow: true }), _jsx("ambientLight", { intensity: 0.5 })] }));
}
