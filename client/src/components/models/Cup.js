import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import { SkeletonUtils } from "three-stdlib";
import { WiggleBone } from "wiggle";
export function Cup() {
    const { selectedModel, wireframe, materialSettings, setIsDraggingStraw } = useThreeStore();
    const groupRef = useRef(null);
    const strawRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState(null);
    // Use refs instead of state for performance-dependant values
    const boneRotationRef = useRef({ x: 0, y: 0, z: 0 });
    const physicsBones = useRef([]);
    const manualBones = useRef([]);
    // Load the paper cup GLTF model
    const { scene } = useGLTF("/models/paper-cup.gltf");
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    // Extract nodes and materials from the cloned scene
    const { nodes, materials } = useGraph(clone);
    // Load MtnDew-label.jpg texture
    const mtnDewLabelTexture = useTexture("/textures/MtnDew-label.jpg");
    // Configure texture
    mtnDewLabelTexture.wrapS = mtnDewLabelTexture.wrapT = THREE.RepeatWrapping;
    mtnDewLabelTexture.repeat.set(1, 1);
    mtnDewLabelTexture.flipY = false;
    // Create wireframe material (pure white, unlit)
    const wireframeMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
        });
    }, []);
    // Create custom materials based on settings
    const labelMaterial = useMemo(() => {
        if (wireframe && selectedModel === "cup")
            return wireframeMaterial;
        const settings = materialSettings.CupLabel;
        return new THREE.MeshStandardMaterial({
            map: mtnDewLabelTexture,
            roughness: settings.roughness,
            metalness: settings.metalness,
            color: new THREE.Color(settings.color),
        });
    }, [
        mtnDewLabelTexture,
        selectedModel,
        wireframe,
        materialSettings.CupLabel,
        wireframeMaterial,
    ]);
    const paperMaterial = useMemo(() => {
        if (wireframe && selectedModel === "cup")
            return wireframeMaterial;
        const settings = materialSettings.CupPaper;
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
        });
    }, [selectedModel, wireframe, materialSettings.CupPaper, wireframeMaterial]);
    const plasticMaterial = useMemo(() => {
        if (wireframe && selectedModel === "cup")
            return wireframeMaterial;
        const settings = materialSettings.CupLid;
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
        });
    }, [selectedModel, wireframe, materialSettings.CupLid, wireframeMaterial]);
    const strawMaterial = useMemo(() => {
        if (wireframe && selectedModel === "cup")
            return wireframeMaterial;
        const settings = materialSettings.CupStraw;
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(settings.color),
            roughness: settings.roughness,
            metalness: settings.metalness,
        });
    }, [selectedModel, wireframe, materialSettings.CupStraw, wireframeMaterial]);
    // Setup wiggle bones for the straw using skeleton information
    useEffect(() => {
        if (!nodes.Straw)
            return;
        console.log("Setting up wiggle bones for straw...");
        // Get the skeleton bones directly from the skinned mesh
        // This guarantees proper ordering from root to tip
        const skinnedMesh = nodes.Straw;
        const allBones = skinnedMesh.skeleton.bones;
        // Use the last 4 bones for manual control (tip of the straw)
        const tipBones = allBones.slice(-4);
        manualBones.current = tipBones;
        // Use the other bones for physics (excluding the first 3 base bones for stability)
        const physicsBonesArray = allBones.slice(3, -4);
        // Create wiggle bones with damping for the physics portion
        const newPhysicsBones = [];
        physicsBonesArray.forEach((bone, index) => {
            try {
                // Calculate normalized position along the physics chain
                const normalizedPos = index / physicsBonesArray.length;
                // Balanced parameters - less velocity but more precision
                // Higher up bones move more than lower bones
                const velocity = 0.02 + normalizedPos * 0.08;
                // Lower maxStretch values create stiffer, more controlled movement
                // and help reduce oscillation and "coiling" problems
                const maxStretch = 0.01 + normalizedPos * 0.03;
                // Create the wiggle bone with carefully tuned parameters
                const wiggleBone = new WiggleBone(bone, {
                    velocity: velocity,
                    maxStretch: maxStretch,
                });
                newPhysicsBones.push(wiggleBone);
            }
            catch (error) {
                console.error(`Failed to create wiggle bone for ${bone.name}:`, error);
            }
        });
        // Store the physics bones in the ref for fast access during animation
        physicsBones.current = newPhysicsBones;
        console.log(`Created ${newPhysicsBones.length} wiggle bones for straw physics`);
    }, [nodes.Straw]);
    // Calculate straw hinge bend (30 degree angle as specified in requirements)
    const hingeBend = useMemo(() => {
        return new THREE.Euler(THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(10));
    }, []);
    // Handle straw animation and physics effects with direct refs
    useFrame((state, delta) => {
        if (!strawRef.current)
            return;
        // Keep consistent scale
        const baseScale = 0.011;
        strawRef.current.scale.set(baseScale, baseScale, baseScale);
        // Only process when cup is selected and not in wireframe mode
        if (selectedModel === "cup" &&
            physicsBones.current.length > 0 &&
            !wireframe) {
            // Use a smaller, fixed delta for more stable physics
            const wiggleDelta = Math.min(delta, 0.02) * 0.5; // Clamped for stability
            if (isDragging) {
                // Directly manipulate the tip bones using our stored values
                manualBones.current.forEach((bone, index) => {
                    const factor = 1 - index * 0.25; // 1.0, 0.75, 0.5, 0.25
                    // Apply rotations from the ref (no React state)
                    bone.rotation.x = boneRotationRef.current.x * factor;
                    bone.rotation.z = boneRotationRef.current.z * factor;
                });
                // Apply physics to middle section bones with damping
                physicsBones.current.forEach((bone) => {
                    // Add manual damping for more controlled movement
                    try {
                        // Using the ref directly improves performance greatly
                        bone.update(wiggleDelta);
                    }
                    catch (error) {
                        console.warn("Error updating wiggle bone:", error);
                    }
                });
            }
            else {
                // Normal physics simulation when not dragging
                // Occasionally add subtle random movements (much less frequently)
                if (Math.random() < 0.005) {
                    // Select a random bone for movement
                    const randomIndex = Math.floor(Math.random() * physicsBones.current.length);
                    const targetBone = physicsBones.current[randomIndex];
                    if (targetBone && targetBone.target) {
                        // Very subtle movement
                        const impulse = 0.0005 + Math.random() * 0.001;
                        // Apply directly in the animation frame - no setTimeout
                        targetBone.target.position.y +=
                            impulse * (Math.random() > 0.5 ? 1 : -1);
                        targetBone.target.position.x +=
                            impulse * (Math.random() > 0.5 ? 1 : -1) * 0.3;
                    }
                }
                // Apply physics to all bones
                physicsBones.current.forEach((bone) => {
                    try {
                        bone.update(wiggleDelta);
                    }
                    catch (error) {
                        console.warn("Error updating wiggle bone:", error);
                    }
                });
            }
        }
    });
    // Cleanup wiggle bones on unmount
    useEffect(() => {
        return () => {
            // Clean up all physics bones when component unmounts
            physicsBones.current.forEach((bone) => {
                try {
                    bone.dispose();
                }
                catch (error) {
                    console.warn("Error disposing wiggle bone:", error);
                }
            });
            // Clear the arrays
            physicsBones.current = [];
            manualBones.current = [];
        };
    }, []);
    // Apply gentle initial movement when cup is selected
    useEffect(() => {
        if (selectedModel === "cup" && physicsBones.current.length > 0) {
            // Create a single gentle wave effect through the straw
            // Use a small timeout to let the scene stabilize
            const timer = setTimeout(() => {
                // Apply a sequential gentle wave motion up the straw
                physicsBones.current.forEach((bone, index) => {
                    if (!bone.target)
                        return;
                    // Stagger the timing for a wave effect
                    setTimeout(() => {
                        try {
                            // Gentler impulse that decreases with height
                            const impulse = 0.001 + 0.001 * (1 - index / physicsBones.current.length);
                            // Apply a very gentle sideways nudge
                            bone.target.position.x += impulse;
                            bone.target.position.y += impulse * 0.5;
                        }
                        catch (error) {
                            console.warn("Error applying initial movement:", error);
                        }
                    }, index * 30); // Staggered timing creates wave-like motion
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedModel]);
    // Handle mouse movement for straw dragging - using refs for performance
    useEffect(() => {
        // Handle mouse move for dragging the straw
        const handleMouseMove = (event) => {
            // Only process if we're actively dragging
            if (isDragging && dragStartPosition && selectedModel === "cup") {
                // Calculate drag distance from the start position
                const deltaX = (event.clientX - dragStartPosition.x) * 0.005;
                const deltaY = (event.clientY - dragStartPosition.y) * 0.005;
                // Update bone rotation ref directly - no state updates during animation
                boneRotationRef.current = {
                    x: THREE.MathUtils.clamp(deltaY, -0.5, 0.5),
                    y: 0,
                    z: THREE.MathUtils.clamp(deltaX, -0.5, 0.5),
                };
            }
        };
        // End dragging when mouse is released (backup to the onPointerUp)
        const handleMouseUp = () => {
            if (isDragging) {
                // Update local state
                setIsDragging(false);
                document.body.style.cursor = hovered ? "grab" : "auto";
                // Update global state to re-enable camera controls
                setIsDraggingStraw(false);
            }
        };
        // Add event listeners
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseleave", handleMouseUp);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseleave", handleMouseUp);
        };
    }, [
        isDragging,
        dragStartPosition,
        selectedModel,
        hovered,
        setIsDraggingStraw,
    ]);
    return (_jsxs("group", { ref: groupRef, scale: [0.5, 0.5, 0.5], rotation: [0, Math.PI / 4, 0], children: [_jsxs("group", { ref: strawRef, name: "Hinge", position: [-0.015, 0.12, 0], rotation: hingeBend, scale: 0.011, onPointerOver: () => {
                    setHovered(true);
                    document.body.style.cursor = "grab";
                }, onPointerOut: () => {
                    setHovered(false);
                    document.body.style.cursor = "auto";
                }, onPointerDown: (e) => {
                    if (selectedModel === "cup") {
                        e.stopPropagation();
                        // Update local state
                        setIsDragging(true);
                        setDragStartPosition({ x: e.clientX, y: e.clientY });
                        document.body.style.cursor = "grabbing";
                        // Update global state to disable camera controls
                        setIsDraggingStraw(true);
                    }
                }, onPointerUp: () => {
                    if (isDragging) {
                        // Update local state
                        setIsDragging(false);
                        document.body.style.cursor = hovered ? "grab" : "auto";
                        // Update global state to re-enable camera controls
                        setIsDraggingStraw(false);
                    }
                }, children: [_jsx("primitive", { object: nodes.Bone }), nodes.Straw && (_jsx("skinnedMesh", { name: "Straw", geometry: nodes.Straw.geometry, material: strawMaterial, skeleton: nodes.Straw.skeleton, castShadow: true, receiveShadow: true }))] }), nodes.Plane && (_jsx("mesh", { name: "Plane", geometry: nodes.Plane.geometry, material: paperMaterial, rotation: [Math.PI / 2, 0, 0], scale: [0.047, 1, 0.088], castShadow: true, receiveShadow: true })), _jsxs("group", { name: "Cup", position: [-0.001, 0.089, 0], scale: [0.044, 0.004, 0.044], children: [nodes.Cylinder && (_jsx("mesh", { name: "Cylinder", geometry: nodes.Cylinder.geometry, material: labelMaterial, castShadow: true, receiveShadow: true })), nodes.Cylinder_1 && (_jsx("mesh", { name: "Cylinder_1", geometry: nodes.Cylinder_1.geometry, material: paperMaterial, castShadow: true, receiveShadow: true }))] }), nodes.New_cover && (_jsx("mesh", { name: "New_cover", geometry: nodes.New_cover.geometry, material: labelMaterial, position: [-0.001, 0.089, 0], scale: [0.044, 0.004, 0.044], castShadow: true, receiveShadow: true })), nodes.Cover && (_jsx("mesh", { name: "Cover", geometry: nodes.Cover.geometry, material: plasticMaterial, position: [-0.001, 0.089, 0], rotation: [0, -1.124, 0], scale: 0.005, castShadow: true, receiveShadow: true }))] }));
}
// Preload the model to avoid loading delays
useGLTF.preload("/models/paper-cup.gltf");
