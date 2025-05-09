import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import * as THREE from "three";
import { useHover } from "../../hooks/useHover.js";
export function Note({ position = [0.2, 0.01, -0.2], 
// Rotate it to lay flat with a slight angle so it's visible
rotation = [-Math.PI / 2, 0, Math.PI / 24], scale = [0.05, 0.05, 0.002], onClick }) {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    // Setup hover 
    const hovered = useHover({
        ref: meshRef
    });
    return (_jsxs("group", { ref: groupRef, position: new THREE.Vector3(position[0], position[1], position[2]), rotation: new THREE.Euler(rotation[0], rotation[1], rotation[2]), scale: new THREE.Vector3(scale[0], scale[1], scale[2]), children: [_jsxs("mesh", { ref: meshRef, onClick: onClick, castShadow: true, children: [_jsx("boxGeometry", { args: [1, 1, 0.05] }), _jsx("meshStandardMaterial", { color: "#ffffff", roughness: 0.4, metalness: 0.01, emissive: hovered ? "#aaaaff" : "#000000", emissiveIntensity: hovered ? 0.2 : 0 })] }), _jsxs("mesh", { position: [0, 0, 0.03], rotation: [0, 0, 0], children: [_jsx("planeGeometry", { args: [0.9, 0.9] }), _jsx("meshBasicMaterial", { transparent: true, opacity: 0.8, color: "#000000", alphaTest: 0.01, children: _jsx("canvasTexture", { attach: "map", args: [createScribbleTexture()] }) })] })] }));
}
function createScribbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return canvas;
    // Clear background
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Draw some random scribbles
    drawRandomScribble(ctx, canvas.width, canvas.height);
    return canvas;
}
// Draw random scribble 
function drawRandomScribble(ctx, width, height) {
    // Line scribble
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.3);
    ctx.bezierCurveTo(width * 0.4, height * 0.2, width * 0.6, height * 0.4, width * 0.8, height * 0.3);
    ctx.stroke();
    // Another line
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.5);
    ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.7, height * 0.4, width * 0.8, height * 0.5);
    ctx.stroke();
    // Short lines for text imitation
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const y = height * (0.6 + i * 0.1);
        ctx.moveTo(width * 0.2, y);
        ctx.lineTo(width * (0.2 + Math.random() * 0.6), y);
        ctx.stroke();
    }
    // Small squiggle in the corner
    ctx.beginPath();
    ctx.moveTo(width * 0.8, height * 0.8);
    ctx.bezierCurveTo(width * 0.85, height * 0.85, width * 0.8, height * 0.9, width * 0.85, height * 0.85);
    ctx.stroke();
}
