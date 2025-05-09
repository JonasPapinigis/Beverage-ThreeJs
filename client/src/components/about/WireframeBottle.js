import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
export function WireframeBottle() {
    const groupRef = useRef(null);
    // Load the bottle GLTF model
    const { scene } = useGLTF("/models/bottle.glb");
    // Setup wireframe model
    useEffect(() => {
        if (groupRef.current) {
            // Clearchildren
            while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0]);
            }
            // Clone model 
            const bottleModel = scene.clone();
            // Define wireframe material 
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffffff),
                wireframe: true,
                transparent: true,
                opacity: 0.9, // Increased opacity 
            });
            // Apply material 
            bottleModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = wireframeMaterial;
                }
            });
            // Add the model to group
            groupRef.current.add(bottleModel);
        }
    }, [scene]);
    return _jsx("group", { ref: groupRef });
}
// Preload the model
useGLTF.preload("/models/bottle.glb");
