import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import * as THREE from "three";
// Camera Controls
export function OrbitControls() {
    const { camera, gl, invalidate } = useThree();
    const { selectedModel, wireframe, isDraggingStraw } = useThreeStore();
    const controls = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const idleTimeoutRef = useRef(null);
    useEffect(() => {
        controls.current = new ThreeOrbitControls(camera, gl.domElement);
        // Set initial camera position
        camera.position.set(0, 0.6, 1.5);
        // Disable panning
        controls.current.enablePan = false;
        // Automatic update
        controls.current.update();
        return () => {
            if (controls.current) {
                controls.current.dispose();
            }
        };
    }, [camera, gl]);
    // Handle activity detection
    const resetIdleTimer = () => {
        lastActivityRef.current = Date.now();
        // If auto-rotation is on, turn it off when user interacts
        if (controls.current && controls.current.autoRotate) {
            controls.current.autoRotate = false;
        }
        // Clear any timer
        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
        }
        // Set idle timer for 1 second
        idleTimeoutRef.current = setTimeout(() => {
            if (controls.current) {
                controls.current.autoRotate = true;
            }
        }, 1000);
    };
    useEffect(() => {
        if (!controls.current)
            return;
        controls.current.reset();
        controls.current.enableDamping = true;
        controls.current.dampingFactor = 0.1;
        controls.current.rotateSpeed = 0.8;
        controls.current.autoRotateSpeed = 0.5;
        //Degree limits
        controls.current.minPolarAngle = (Math.PI * 35) / 180;
        controls.current.maxPolarAngle = (Math.PI * (180 - 100)) / 180;
        if (selectedModel) {
            // Zoom limits
            controls.current.minDistance = 0.2;
            controls.current.maxDistance = 0.3;
            camera.position.setLength(1);
            // Set rotation targets
            const modelTargets = {
                bottle: new THREE.Vector3(0, 0.12, 0.2),
                can: new THREE.Vector3(-0.07, 0.10, -0.025),
                cup: new THREE.Vector3(0.1, 0.1, 0),
            };
            const target = selectedModel === "bottle"
                ? modelTargets.bottle
                : selectedModel === "can"
                    ? modelTargets.can
                    : modelTargets.cup;
            controls.current.target.copy(target);
        }
        else {
            // Home view
            controls.current.minDistance = 0.6;
            controls.current.maxDistance = 1.2;
            // Reset camera position to default
            camera.position.set(0, 0.6, 1.5);
            // Set rotation target to origin
            controls.current.target.set(0, 0, 0);
            // Enable auto rotation at start
            controls.current.autoRotate = true;
        }
        // Apply changes
        controls.current.update();
        const domElement = gl.domElement;
        // Mouse events
        domElement.addEventListener("mousedown", resetIdleTimer);
        domElement.addEventListener("wheel", resetIdleTimer);
        // Touch events
        domElement.addEventListener("touchstart", resetIdleTimer);
        return () => {
            // Remove event listeners
            domElement.removeEventListener("mousedown", resetIdleTimer);
            domElement.removeEventListener("wheel", resetIdleTimer);
            domElement.removeEventListener("touchstart", resetIdleTimer);
            // Clear idle timer
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
        };
    }, [camera, gl, selectedModel, wireframe]);
    // Disable controls when dragging straw
    useEffect(() => {
        if (!controls.current)
            return;
        controls.current.enableRotate = !isDraggingStraw;
        controls.current.enableZoom = !isDraggingStraw;
        if (isDraggingStraw && controls.current.autoRotate) {
            controls.current.autoRotate = false;
        }
        controls.current.update();
    }, [isDraggingStraw]);
    // Update controls on each frame
    useFrame(() => {
        if (controls.current) {
            controls.current.update();
        }
    });
    return null;
}
