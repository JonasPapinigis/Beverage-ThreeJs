import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { WireframeCan } from './WireframeCan.js';
import { WireframeBottle } from './WireframeBottle.js';
import { WireframeCup } from './WireframeCup.js';
export function WireframeDisplay({ section }) {
    // Select appropriate wireframe model
    const renderWireframeModel = () => {
        switch (section) {
            case 'can':
                return _jsx(WireframeCan, {});
            case 'bottle':
                return _jsx(WireframeBottle, {});
            case 'cup':
                return _jsx(WireframeCup, {});
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "wireframe-display", children: _jsxs(Canvas, { camera: { position: [0, 0, 3], fov: 45 }, style: { width: '100%', height: '100%' }, children: [_jsx("ambientLight", { intensity: 1 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 0.5 }), _jsxs(Suspense, { fallback: null, children: [renderWireframeModel(), _jsx(OrbitControls, { enablePan: false, autoRotate: true, autoRotateSpeed: 1, enableZoom: true, minDistance: 2, maxDistance: 5 })] })] }) }));
}
