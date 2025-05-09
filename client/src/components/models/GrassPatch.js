import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
export function GrassPatch({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) {
    const { wireframe } = useThreeStore();
    const groupRef = useRef(null);
    // Load the model
    const { scene } = useGLTF("/models/grass-patch.glb");
    // Setup and position 
    useEffect(() => {
        if (groupRef.current) {
            // Clear children
            groupRef.current.clear();
            // Clone the model
            const grassPatchModel = scene.clone();
            console.log("Grass Patch model children:", grassPatchModel.children.map(c => c.name));
            // Apply materials and shadows
            grassPatchModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Enable shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.name.toLowerCase().includes('ground') || child.name.toLowerCase().includes('dirt')) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x6B4226, // dirt color
                            roughness: 1.0,
                            metalness: 0,
                            wireframe: false,
                        });
                        console.log(`Applied dirt material to ground part: ${child.name}`);
                    }
                    // For grass 
                    else {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x66AA44, // green 
                            roughness: 0.8,
                            metalness: 0,
                            wireframe: false,
                        });
                        console.log(`Applied grass blade material to: ${child.name}`);
                    }
                }
            });
            // Set position, rotation, and scale
            grassPatchModel.position.set(position[0], position[1], position[2]);
            grassPatchModel.rotation.set(rotation[0], rotation[1], rotation[2]);
            grassPatchModel.scale.set(scale[0], scale[1], scale[2]);
            // Add to scene
            groupRef.current.add(grassPatchModel);
        }
    }, [scene, position, rotation, scale, wireframe]);
    return _jsx("group", { ref: groupRef });
}
// Preload the model
useGLTF.preload("/models/grass-patch.glb");
