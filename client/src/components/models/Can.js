import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import { useAudio } from "../../lib/stores/useAudio.js";
export function Can() {
    const { wireframe, materialSettings, canAnimations } = useThreeStore();
    const groupRef = useRef(null);
    const tabRef = useRef(null);
    const openingRef = useRef(null);
    const originalPositions = useRef({});
    const originalRotations = useRef({});
    // Load the Can model 
    const { scene, animations } = useGLTF("/models/can.glb");
    // Load the can label texture
    const canLabelTexture = useTexture("/textures/soda_can_label.jpg");
    // Fix the texture orientation
    canLabelTexture.flipY = false;
    // Setup animations
    const { actions, mixer } = useAnimations(animations, groupRef);
    // Store original positions and rotations
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.traverse((node) => {
                if (node.type === 'Mesh') {
                    if (node.name === 'Tab') {
                        tabRef.current = node;
                        originalPositions.current['Tab'] = node.position.clone();
                        originalRotations.current['Tab'] = node.quaternion.clone();
                    }
                    else if (node.name === 'Opening') {
                        openingRef.current = node;
                        originalPositions.current['Opening'] = node.position.clone();
                        originalRotations.current['Opening'] = node.quaternion.clone();
                    }
                }
            });
            console.log('Stored original positions for Tab and Opening:', originalPositions.current);
        }
    }, []);
    // Configure animations
    useEffect(() => {
        // Logging
        console.log("Can animations:", Object.keys(actions));
        // Configure all animations to run once
        Object.keys(actions).forEach(key => {
            const action = actions[key];
            if (!action)
                return;
            action.setEffectiveTimeScale(1);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
        });
    }, [actions]);
    const { playCanOpen, playCanCrush } = useAudio();
    // Handle OpenCan animation
    useEffect(() => {
        const openingAction = actions.OpeningAction;
        if (!openingAction)
            return;
        if (canAnimations.openCan) {
            console.log("Playing OpeningAction animation");
            // Play the can opening sound
            playCanOpen();
            // Configure for one-time play and hold at end
            openingAction
                .reset()
                .setLoop(THREE.LoopOnce, 1);
            openingAction.clampWhenFinished = true;
            // Play animation
            openingAction.play();
            const onFinished = (e) => {
                if (e.action === openingAction) {
                    console.log("OpeningAction animation finished");
                }
            };
            // event listener
            mixer.addEventListener('finished', onFinished);
            // Clean up
            return () => {
                mixer.removeEventListener('finished', onFinished);
                openingAction.stop();
            };
        }
        else {
            openingAction.stop();
            if (groupRef.current) {
                groupRef.current.traverse((node) => {
                    if (node.type === 'Mesh') {
                        const mesh = node;
                        // Reset Tab and Opening to their original positions
                        if (node.name === 'Tab' || node.name === 'Opening') {
                            if (originalPositions.current[node.name]) {
                                mesh.position.copy(originalPositions.current[node.name]);
                            }
                            if (originalRotations.current[node.name]) {
                                mesh.quaternion.copy(originalRotations.current[node.name]);
                            }
                        }
                    }
                });
            }
        }
    }, [canAnimations.openCan, actions.OpeningAction, mixer, playCanOpen]);
    // Handle Crush Can animation
    useEffect(() => {
        if (!canAnimations.crushCan) {
            Object.keys(actions).forEach(key => {
                if (key === 'Crush' || key === 'CrushKey') {
                    const action = actions[key];
                    if (action)
                        action.stop();
                }
            });
            // Reset meshes 
            if (groupRef.current) {
                // Reset morphs
                groupRef.current.traverse((node) => {
                    if (node.type === 'Mesh') {
                        const mesh = node;
                        if (mesh.morphTargetInfluences) {
                            for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
                                mesh.morphTargetInfluences[i] = 0;
                            }
                        }
                        // Reset Tab and Opening to original positions
                        if (node.name === 'Tab' || node.name === 'Opening') {
                            if (originalPositions.current[node.name]) {
                                mesh.position.copy(originalPositions.current[node.name]);
                            }
                            if (originalRotations.current[node.name]) {
                                mesh.quaternion.copy(originalRotations.current[node.name]);
                            }
                        }
                    }
                });
            }
            return;
        }
        // Start all crush animations
        console.log("Playing Crush can animations");
        // Play the crush sound
        playCanCrush();
        // Play the main crush animation 
        const crushAction = actions.Crush;
        if (crushAction) {
            console.log("Playing Crush animation for group transforms");
            crushAction.reset().setLoop(THREE.LoopOnce, 1);
            crushAction.clampWhenFinished = true;
            crushAction.play();
        }
        // Play the ShapeKey transformatuion for crush
        const crushKeyAction = actions.CrushKey;
        if (crushKeyAction) {
            console.log("Playing CrushKey animation for morph targets");
            crushKeyAction.reset().setLoop(THREE.LoopOnce, 1);
            crushKeyAction.clampWhenFinished = true;
            crushKeyAction.play();
        }
        // Set up a single listener for all animations
        const onAnimationFinished = (e) => {
            console.log(`Animation ${e.action.getClip().name} finished`);
        };
        mixer.addEventListener('finished', onAnimationFinished);
        return () => {
            mixer.removeEventListener('finished', onAnimationFinished);
            // Stop all crush-related animations
            if (crushAction)
                crushAction.stop();
            if (crushKeyAction)
                crushKeyAction.stop();
        };
    }, [canAnimations.crushCan, actions, mixer, playCanCrush]);
    // Create materials
    const wireframeMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
        });
    }, []);
    const labelMaterial = useMemo(() => {
        if (wireframe)
            return wireframeMaterial;
        const settings = materialSettings.CanLabel;
        return new THREE.MeshStandardMaterial({
            roughness: settings.roughness,
            metalness: settings.metalness,
            color: new THREE.Color(settings.color),
            map: canLabelTexture,
        });
    }, [wireframe, materialSettings.CanLabel, wireframeMaterial, canLabelTexture]);
    // Create metal material based on settings
    const metalMaterial = useMemo(() => {
        // Apply wireframe material when in wireframe mode
        if (wireframe)
            return wireframeMaterial;
        const settings = materialSettings.CanMetal;
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
        });
    }, [wireframe, materialSettings.CanMetal, wireframeMaterial]);
    // Process the scene with custom materials
    const processedScene = useMemo(() => {
        if (!scene)
            return null;
        // Clone the scene 
        const clonedScene = scene.clone();
        // Apply custom materials 
        clonedScene.traverse((node) => {
            if (node.type === 'Mesh') {
                const mesh = node;
                // Handle both single materials and material arrays
                if (Array.isArray(mesh.material)) {
                    // For multiple materials, replace each one with appropriate material
                    mesh.material = mesh.material.map(() => {
                        if (node.name === 'Cylinder') {
                            // For cylinder (can body) use our label material with loaded texture
                            return labelMaterial.clone();
                        }
                        else {
                            // For other parts use metal material
                            return metalMaterial.clone();
                        }
                    });
                }
                else {
                    // 
                    const originalMaterial = mesh.material;
                    // Apply material
                    if (node.name === 'Cylinder') {
                        mesh.material = labelMaterial.clone();
                    }
                    else if (['Cylinder_1', 'Tab', 'Opening'].includes(node.name)) {
                        // These are the metallic parts
                        mesh.material = metalMaterial;
                    }
                }
                // Enable shadows
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
        return clonedScene;
    }, [scene, labelMaterial, metalMaterial]);
    if (!processedScene)
        return null;
    return (_jsx("group", { ref: groupRef, scale: [0.8, 0.8, 0.8], rotation: [0, -Math.PI / 6, 0], dispose: null, children: _jsx("primitive", { object: processedScene }) }));
}
// Preload the model for better performance
useGLTF.preload("/models/can.glb");
