import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
export function GrassTile({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) {
    const { wireframe } = useThreeStore();
    const groupRef = useRef(null);
    // Load model
    const { scene } = useGLTF("/models/grass-tile.glb");
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.clear();
            // Clone the model
            const grassModel = scene.clone();
            console.log("Grass Tile model children:", grassModel.children.map(c => c.name));
            grassModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x558833,
                        roughness: 1.0,
                        metalness: 0,
                        wireframe: false,
                    });
                    console.log(`Applied grass material to grass part: ${child.name}`);
                }
            });
            // Set position, rotation, and scale
            grassModel.position.set(position[0], position[1], position[2]);
            grassModel.rotation.set(rotation[0], rotation[1], rotation[2]);
            grassModel.scale.set(scale[0], scale[1], scale[2]);
            // Add to scene
            groupRef.current.add(grassModel);
        }
    }, [scene, position, rotation, scale, wireframe]);
    return _jsx("group", { ref: groupRef });
}
useGLTF.preload("/models/grass-tile.glb");
