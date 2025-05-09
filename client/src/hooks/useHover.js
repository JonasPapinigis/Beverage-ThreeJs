import { useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
export function useHover({ ref, onHover, onHoverChange, distance = 100, }) {
    const [hovered, setHovered] = useState(false);
    const { camera, raycaster, mouse, gl } = useThree();
    // Handle hover state
    const handlePointerMove = useCallback((e) => {
        if (!ref.current)
            return;
        // Update the mouse position
        const canvas = gl.domElement;
        const rect = canvas.getBoundingClientRect();
        const evt = e;
        mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(ref.current, true);
        // Check if the object is being hovered
        const isHovered = intersects.length > 0;
        if (isHovered !== hovered) {
            setHovered(isHovered);
            onHoverChange?.(isHovered);
            onHover?.(isHovered);
            // Update cursor style
            document.body.style.cursor = isHovered ? 'pointer' : 'auto';
        }
    }, [ref, camera, mouse, raycaster, gl, hovered, onHover, onHoverChange]);
    // Set up event listeners
    useEffect(() => {
        if (!ref.current)
            return;
        const canvas = gl.domElement;
        canvas.addEventListener('pointermove', handlePointerMove);
        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            document.body.style.cursor = 'auto';
        };
    }, [ref, gl, handlePointerMove]);
    return hovered;
}
// Simpler hook for raycasting
export function useRaycaster() {
    const { camera, raycaster, mouse, scene } = useThree();
    const [intersectedObject, setIntersectedObject] = useState(null);
    useFrame(() => {
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            setIntersectedObject(intersects[0].object);
        }
        else {
            setIntersectedObject(null);
        }
    });
    return intersectedObject;
}
