import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
export function Bottle() {
    const { selectedModel, wireframe, materialSettings } = useThreeStore();
    // Reference for the group that will hold our model
    const groupRef = useRef(null);
    // Load the bottle
    const { scene } = useGLTF("/models/bottle.glb");
    // Load textures
    const cocaColaTexture = useTexture("/textures/COCACOLA-LABEL.jpg");
    cocaColaTexture.flipY = false;
    const cocaColaCapTexture = useTexture("/textures/Cocacola-cal_png.png");
    cocaColaCapTexture.flipY = false;
    // Create a wireframe material for wireframe mode
    const wireframeMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
        });
    }, []);
    // Create glass material based on settings
    const glassMaterial = useMemo(() => {
        if (wireframe && selectedModel === "bottle")
            return wireframeMaterial;
        const settings = materialSettings.BottleGlass;
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
            transmission: settings.transmission || 0.98,
            ior: settings.ior || 1.5,
            reflectivity: settings.reflectivity || 0.3,
            thickness: settings.thickness || 0.5,
            envMapIntensity: settings.envMapIntensity || 1.8,
            clearcoat: settings.clearcoat || 1.0,
            clearcoatRoughness: settings.clearcoatRoughness || 0.01,
        });
    }, [
        wireframe,
        selectedModel,
        materialSettings.BottleGlass,
        wireframeMaterial,
    ]);
    // Create cap material 
    const capMaterial = useMemo(() => {
        if (wireframe && selectedModel === "bottle")
            return wireframeMaterial;
        const settings = materialSettings.BottleCap;
        // configure the texture 
        const texture = cocaColaCapTexture;
        texture.needsUpdate = true;
        return new THREE.MeshStandardMaterial({
            map: texture,
            color: new THREE.Color(0xffffff),
            roughness: 0.2,
            metalness: 1,
        });
    }, [
        wireframe,
        selectedModel,
        materialSettings.BottleCap,
        wireframeMaterial,
        cocaColaCapTexture,
    ]);
    // Create label material 
    const labelMaterial = useMemo(() => {
        if (wireframe && selectedModel === "bottle")
            return wireframeMaterial;
        const settings = materialSettings.BottleLabel;
        const texture = cocaColaTexture;
        texture.needsUpdate = true;
        return new THREE.MeshStandardMaterial({
            map: texture,
            // Apply color 
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
        });
    }, [
        wireframe,
        selectedModel,
        materialSettings.BottleLabel,
        wireframeMaterial,
        cocaColaTexture,
    ]);
    const liquidMaterial = useMemo(() => {
        if (wireframe && selectedModel === "bottle")
            return wireframeMaterial;
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#803333"),
            roughness: 0.05,
            metalness: 0,
            transmission: 0.92,
            ior: 1.4,
            thickness: 0.3,
        });
    }, [wireframe, selectedModel, wireframeMaterial]);
    const processedScene = useMemo(() => {
        // Clone scene
        const clonedScene = scene.clone();
        // Logging
        clonedScene.traverse((node) => {
            if (node.type === "Mesh") {
                const mesh = node;
                console.log(`Bottle part: ${node.name}, material: ${mesh.material?.name || "unknown"}`);
            }
        });
        // Apply custom materials 
        clonedScene.traverse((node) => {
            if (node.type === "Mesh") {
                const mesh = node;
                // Apply the appropriate material 
                if (node.name === "Bottle") {
                    mesh.material = glassMaterial;
                }
                else if (node.name === "Liquid") {
                    mesh.material = liquidMaterial;
                }
                else if (node.name.includes("Cap") ||
                    node.name.includes("Cylinder004")) {
                    mesh.material = capMaterial;
                    console.log(`Applied custom cap material to Cap object: ${node.name}`);
                }
                else if (node.name.includes("label")) {
                    mesh.material = labelMaterial;
                    console.log(`Applied custom label material to Label object: ${node.name}`);
                }
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
        return clonedScene;
    }, [scene, glassMaterial, capMaterial, labelMaterial, liquidMaterial]);
    return (_jsx("group", { ref: groupRef, scale: [0.8, 0.8, 0.8], position: [0, 0, 0], rotation: [0, Math.PI / 4, 0], children: _jsx("primitive", { object: processedScene }) }));
}
useGLTF.preload("/models/bottle.glb");
