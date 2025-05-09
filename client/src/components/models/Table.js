import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
export function Table({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) {
    const { wireframe } = useThreeStore();
    const groupRef = useRef(null);
    const { scene } = useGLTF("/models/small-table.glb");
    // Setup 
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.clear();
            const tableModel = scene.clone();
            console.log("Table model children:", tableModel.children.map(c => c.name));
            tableModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x8B4513,
                        roughness: 0.8,
                        metalness: 0.1,
                        wireframe: false,
                    });
                    console.log(`Applied wooden material to table part: ${child.name}`);
                }
            });
            tableModel.position.set(position[0], position[1], position[2]);
            tableModel.rotation.set(rotation[0], rotation[1], rotation[2]);
            tableModel.scale.set(scale[0], scale[1], scale[2]);
            // Add to scene
            groupRef.current.add(tableModel);
        }
    }, [scene, position, rotation, scale, wireframe]);
    return _jsx("group", { ref: groupRef });
}
useGLTF.preload("/models/small-table.glb");
