import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import { WireframeCan } from "./WireframeCan.js";
import { WireframeBottle } from "./WireframeBottle.js";
import { WireframeCup } from "./WireframeCup.js";
// Scrollable 3D background for the About page
function Background() {
    const { camera } = useThree();
    // Set up camera position and properties
    useEffect(() => {
        // Make sure camera is properly looking at the center
        camera.lookAt(0, 0, 0);
        // Adjust the near clipping plane to prevent models from being cut off
        camera.near = 0.01; // models close so near cut
        camera.updateProjectionMatrix();
    }, [camera]);
    return (_jsxs(_Fragment, { children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [5, 5, 5], intensity: 0.7 })] }));
}
// Position  models
function AboutModels() {
    const { aboutSection, aboutScrollProgress } = useThreeStore();
    // Each model is only visible in its own section
    const isCanVisible = aboutSection === "can";
    const isBottleVisible = aboutSection === "bottle";
    const isCupVisible = aboutSection === "cup";
    // Logging
    useEffect(() => {
        console.log("Section visibilities:", {
            section: aboutSection,
            canVisible: isCanVisible,
            bottleVisible: isBottleVisible,
            cupVisible: isCupVisible,
        });
    }, [aboutSection, isCanVisible, isBottleVisible, isCupVisible]);
    // Get position for Can model with rotation-aligned path
    const getCanPosition = (progress) => {
        const xPos = -0.7 + progress * 2;
        const yPos = -0.1 + Math.sin(progress * Math.PI) * 0.04;
        const zPos = 9.5 + Math.sin(progress * Math.PI * 2) * 0.3;
        return new THREE.Vector3(xPos, yPos, zPos);
    };
    const getCanRotation = (progress) => {
        const mainRotation = progress * Math.PI * 2;
        const verticalProgress = Math.cos(progress * Math.PI);
        const tiltAmount = verticalProgress * 1;
        return new THREE.Euler(tiltAmount, mainRotation, Math.sin(progress * Math.PI * 2) * 0.0);
    };
    const getBottlePosition = (progress) => {
        const xPos = 0.2 + progress * -0.4;
        const yPos = 0.1 + progress * -0.2;
        const zPos = 9.89 + progress * 0.15;
        return new THREE.Vector3(xPos, yPos, zPos);
    };
    const getBottleRotation = (progress) => {
        const yRotation = progress * Math.PI * 2;
        const xTilt = (progress ^ 2) * -0.7;
        const zTilt = (progress ^ 2) * -0.2;
        return new THREE.Euler(xTilt, yRotation, zTilt);
    };
    const getCupPosition = (progress) => {
        const xPos = -0.09 + progress * 0.21;
        const yPos = -0.1 + progress * 0.19;
        const zPos = 9.9 + (progress * 0.13);
        return new THREE.Vector3(xPos, yPos, zPos);
    };
    const getCupRotation = (progress) => {
        const yRotation = progress * -1;
        const xTilt = progress * 0.7;
        const zTilt = progress * 1.7;
        return new THREE.Euler(xTilt, yRotation, zTilt);
    };
    const getModelScale = (progress) => {
        if (progress < 0.2) {
            return progress * 5;
        }
        else if (progress > 0.8) {
            return (1 - progress) * 5;
        }
        return 1.0;
    };
    // Calculate model properties
    const canPosition = getCanPosition(aboutScrollProgress);
    const bottlePosition = getBottlePosition(aboutScrollProgress);
    const cupPosition = getCupPosition(aboutScrollProgress);
    const canRotation = getCanRotation(aboutScrollProgress);
    const bottleRotation = getBottleRotation(aboutScrollProgress);
    const cupRotation = getCupRotation(aboutScrollProgress);
    const canScale = getModelScale(aboutScrollProgress);
    const bottleScale = getModelScale(aboutScrollProgress);
    const cupScale = getModelScale(aboutScrollProgress);
    return (_jsxs(_Fragment, { children: [isCanVisible && (_jsx("group", { position: canPosition, rotation: canRotation, scale: new THREE.Vector3(3 * canScale, 3 * canScale, 3 * canScale), children: _jsx(WireframeCan, {}) })), isBottleVisible && (_jsx("group", { position: bottlePosition, rotation: bottleRotation, scale: new THREE.Vector3(0.3 * bottleScale, 0.3 * bottleScale, 0.3 * bottleScale), children: _jsx(WireframeBottle, {}) })), isCupVisible && (_jsx("group", { position: cupPosition, rotation: cupRotation, scale: new THREE.Vector3(0.2 * cupScale, 0.2 * cupScale, 0.2 * cupScale), children: _jsx(WireframeCup, {}) }))] }));
}
// Colored background that transitions between sections
function ColoredBackground() {
    const meshRef = useRef(null);
    const { aboutSection, aboutScrollProgress, backgroundColors } = useThreeStore();
    useFrame(() => {
        if (!meshRef.current)
            return;
        let backgroundColor;
        if (aboutSection === "intro") {
            backgroundColor = new THREE.Color(backgroundColors.intro);
        }
        else if (aboutSection === "can") {
            const startColor = new THREE.Color(backgroundColors.intro);
            const endColor = new THREE.Color(backgroundColors.can);
            backgroundColor = startColor.lerp(endColor, aboutScrollProgress);
        }
        else if (aboutSection === "bottle") {
            const startColor = new THREE.Color(backgroundColors.can);
            const endColor = new THREE.Color(backgroundColors.bottle);
            backgroundColor = startColor.lerp(endColor, aboutScrollProgress);
        }
        else if (aboutSection === "cup") {
            const startColor = new THREE.Color(backgroundColors.bottle);
            const endColor = new THREE.Color(backgroundColors.cup);
            backgroundColor = startColor.lerp(endColor, aboutScrollProgress);
        }
        else {
            backgroundColor = new THREE.Color("#000000");
        }
        meshRef.current.material.color =
            backgroundColor;
        // Update scene background color to match
        document.body.style.backgroundColor = backgroundColor.getStyle();
    });
    return (_jsxs("mesh", { ref: meshRef, position: [0, 0, -20], children: [_jsx("planeGeometry", { args: [100, 100] }), _jsx("meshBasicMaterial", { color: "#000000" })] }));
}
export function AboutBackground3D({ config }) {
    return (_jsx("div", { className: "about-3d-background", children: _jsxs(Canvas, { gl: { alpha: true }, camera: {
                fov: 75,
                near: 0.01, // Setting a small near clipping plane to avoid cutting off
                far: 1000,
                position: [0, 0, 10],
            }, style: {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
            }, children: [_jsx(Background, {}), _jsx(ColoredBackground, {}), _jsx(AboutModels, {})] }) }));
}
