import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useThreeStore } from "../lib/stores/useThreeStore.js";
export function BeverageContainer({ children, position, type, selected = false }) {
    const group = useRef(null);
    const [hovered, setHovered] = useState(false);
    const { selectedModel, setSelectedModel, hoveredModel, setHoveredModel, wireframe, isAnimating } = useThreeStore();
    // Handle hover state
    useEffect(() => {
        if (hovered) {
            setHoveredModel(type);
            document.body.style.cursor = 'pointer';
        }
        else if (hoveredModel === type) {
            setHoveredModel(null);
            document.body.style.cursor = 'auto';
        }
        return () => {
            if (hoveredModel === type) {
                setHoveredModel(null);
                document.body.style.cursor = 'auto';
            }
        };
    }, [hovered, type, hoveredModel, setHoveredModel]);
    // Handle animation
    useFrame((state, delta) => {
        if (group.current && selected && isAnimating) {
            group.current.rotation.y += delta * 0.5;
        }
    });
    // Handle selection
    useEffect(() => {
        if (group.current && selected) {
            // Animate in when selected
            gsap.fromTo(group.current.scale, { x: 0.8, y: 0.8, z: 0.8 }, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)"
            });
        }
    }, [selected]);
    // Handle wireframe mode
    useEffect(() => {
        if (group.current) {
            group.current.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Handle multiple materials (array)
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            if (mat.wireframe !== undefined) {
                                // Only enable wireframe for selected model
                                mat.wireframe = selected ? wireframe : false;
                                // When wireframe is enabled, set color to white for better visibility
                                if (selected && wireframe) {
                                    if (!mat.userData)
                                        mat.userData = {};
                                    if (!mat.userData.originalColor && mat.color) {
                                        mat.userData.originalColor = mat.color.clone();
                                    }
                                    // Always set to white to ensure consistency
                                    mat.color.set(0xFFFFFF);
                                }
                                else if (mat.userData && mat.userData.originalColor) {
                                    // Restore original color
                                    mat.color.copy(mat.userData.originalColor);
                                    delete mat.userData.originalColor;
                                }
                            }
                        });
                    }
                    else {
                        // Single material
                        if (child.material.wireframe !== undefined) {
                            child.material.wireframe = selected ? wireframe : false;
                            // set color to white 
                            if (selected && wireframe) {
                                // Store original color 
                                if (!child.material.userData)
                                    child.material.userData = {};
                                if (!child.material.userData.originalColor && child.material.color) {
                                    child.material.userData.originalColor = child.material.color.clone();
                                }
                                // Always set to white 
                                child.material.color.set(0xFFFFFF);
                            }
                            else if (child.material.userData && child.material.userData.originalColor) {
                                // Restore original color
                                child.material.color.copy(child.material.userData.originalColor);
                                delete child.material.userData.originalColor;
                            }
                        }
                    }
                }
            });
        }
    }, [wireframe, selected]);
    // Simpler highlight effect
    useEffect(() => {
        if (!group.current)
            return;
        if ((hovered || hoveredModel === type) && !selectedModel) {
            // Simple highlight 
            gsap.to(group.current.scale, {
                x: 1.05,
                y: 1.05,
                z: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        }
        else {
            // Reset scale
            gsap.to(group.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [hovered, hoveredModel, type, selectedModel]);
    // Add safe click handler 
    const handleClick = (e) => {
        try {
            e.stopPropagation();
            if (!selectedModel) {
                setSelectedModel(type);
            }
        }
        catch (error) {
            console.error("Error in click handler:", error);
        }
    };
    return (_jsx("group", { ref: group, position: position, onClick: handleClick, onPointerOver: () => setHovered(true), onPointerOut: () => setHovered(false), children: children }));
}
