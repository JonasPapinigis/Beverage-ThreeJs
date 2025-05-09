import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
export function WireframeCup() {
    const groupRef = useRef(null);
    // Load the cup GLTF model with armature
    const { scene } = useGLTF("/models/paper-cup.gltf");
    // Setup wireframe model
    useEffect(() => {
        if (groupRef.current) {
            // Clear children
            while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0]);
            }
            // Use SkeletonUtils.clone instead of scene.clone()
            const cupModel = SkeletonUtils.clone(scene);
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffffff),
                wireframe: true,
                transparent: true,
                opacity: 0.9, // Increased opacity for better visibility
            });
            // Find and collect bones for straw
            const bones = [];
            cupModel.traverse((o) => {
                if (o.type === "Bone" ||
                    o.name === "Hinge" ||
                    o.name.includes("Bone")) {
                    bones.push(o);
                }
            });
            const hingeBend = THREE.MathUtils.degToRad(30);
            bones.forEach((bone, idx) => {
                if (bone.name === "Hinge") {
                    bone.rotation.x = hingeBend;
                }
                else {
                    // spread out the bend over the chain:
                    // later bones bend less
                    const t = idx / (bones.length - 1);
                    bone.rotation.x = hingeBend * (1 - t * 0.8);
                }
            });
            // Apply material 
            cupModel.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Apply wireframe material
                    child.material = wireframeMaterial;
                }
            });
            groupRef.current.add(cupModel);
        }
    }, [scene]);
    return _jsx("group", { ref: groupRef });
}
useGLTF.preload("/models/paper-cup.gltf");
