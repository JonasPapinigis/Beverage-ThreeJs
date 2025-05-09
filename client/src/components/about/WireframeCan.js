import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
export function WireframeCan() {
    const groupRef = useRef(null);
    // Load the can GLTF model
    const { scene } = useGLTF("/models/can.gltf");
    // Setup wireframe model
    useEffect(() => {
        if (groupRef.current) {
            // Clear existing children
            while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0]);
            }
            const canModel = scene.clone();
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffffff),
                wireframe: true,
                transparent: true,
                opacity: 0.9,
            });
            // Apply material 
            canModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Apply wireframe material 
                    child.material = wireframeMaterial;
                }
            });
            // Add the model to group
            groupRef.current.add(canModel);
        }
    }, [scene]);
    return _jsx("group", { ref: groupRef });
}
// Preload the model
useGLTF.preload("/models/can.gltf");
