import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import { cn } from "../../lib/utils.js";
// Function to display toast notification for animations
function showToast(message, color = "rgba(0, 0, 0, 0.2)") {
    // Create a visual effect for the action
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = color;
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.opacity = '0';
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.color = 'white';
    messageEl.style.fontSize = '2rem';
    messageEl.style.fontWeight = 'bold';
    messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageEl.style.padding = '1rem 2rem';
    messageEl.style.borderRadius = '8px';
    container.appendChild(messageEl);
    document.body.appendChild(container);
    // Animate the effect
    gsap.to(container, {
        opacity: 1,
        duration: 0.5,
        onComplete: () => {
            gsap.to(container, {
                opacity: 0,
                duration: 0.5,
                delay: 1.5,
                onComplete: () => {
                    document.body.removeChild(container);
                }
            });
        }
    });
}
// Component for material selection dropdown
function MaterialSelector({ selectedMaterial, setSelectedMaterial, selectedModel }) {
    // Define different material options based on selected model
    const getMaterialOptions = () => {
        switch (selectedModel) {
            case "bottle":
                return [
                    { value: "BottleGlass", label: "Glass" },
                    { value: "BottleLabel", label: "Label" },
                    { value: "BottleCap", label: "Bottle Cap" },
                ];
            case "can":
                return [
                    { value: "CanMetal", label: "Metal" },
                    { value: "CanLabel", label: "Label" },
                ];
            case "cup":
                return [
                    { value: "CupStraw", label: "Straw" },
                    { value: "CupLid", label: "Lid" },
                    { value: "CupLabel", label: "Label" },
                    { value: "CupPaper", label: "Paper" },
                ];
            default:
                return [];
        }
    };
    const materialOptions = getMaterialOptions();
    return (_jsxs("div", { className: "material-selector", children: [_jsx("label", { className: "material-label", children: "Part:" }), _jsxs("select", { className: "material-dropdown", value: selectedMaterial || "", onChange: (e) => setSelectedMaterial(e.target.value || null), children: [_jsx("option", { value: "", children: "Select Part" }), materialOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }));
}
// Slider component for adjusting material properties
function MaterialSlider({ label, value, min = 0, max = 1, step = 0.01, onChange, }) {
    const formattedValue = Number(value).toFixed(2);
    return (_jsxs("div", { className: "material-slider", children: [_jsxs("div", { className: "slider-header", children: [_jsx("label", { className: "slider-label", children: label }), _jsx("span", { className: "slider-value", children: formattedValue })] }), _jsx("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (e) => onChange(parseFloat(e.target.value)), className: "slider-input" })] }));
}
// Color picker component for material colors
function ColorPicker({ color, onChange, }) {
    return (_jsxs("div", { className: "color-picker", children: [_jsx("label", { className: "color-label", children: "Color:" }), _jsxs("div", { className: "color-input-container", children: [_jsx("input", { type: "color", value: color, onChange: (e) => onChange(e.target.value), className: "color-input" }), _jsx("span", { className: "color-value", children: color })] })] }));
}
export function ControlPanel() {
    const { wireframe, setWireframe, isAnimating, toggleAnimation, selectedModel, canAnimations, toggleCanAnimation, materialSettings, updateMaterialSetting, selectedMaterial, setSelectedMaterial } = useThreeStore();
    const controlsRef = useRef(null);
    // Material panels are always shown
    const [showMaterialControls] = useState(true);
    // Animate in
    useEffect(() => {
        if (controlsRef.current) {
            gsap.fromTo(controlsRef.current, { y: 50, opacity: 0 }, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                delay: 0.5,
                ease: "power2.out"
            });
        }
        // Clean up animation
        return () => {
            if (controlsRef.current) {
                gsap.killTweensOf(controlsRef.current);
            }
        };
    }, []);
    // Set the first material as default if nothing is selected
    useEffect(() => {
        if (selectedModel && !selectedMaterial) {
            // Select the appropriate first material based on the model
            if (selectedModel === "bottle") {
                setSelectedMaterial("BottleGlass");
            }
            else if (selectedModel === "can") {
                setSelectedMaterial("CanMetal");
            }
            else if (selectedModel === "cup") {
                setSelectedMaterial("CupPaper");
            }
        }
    }, [selectedModel, selectedMaterial, setSelectedMaterial]);
    // Handle updating material properties
    const handleUpdateMaterial = (property, value) => {
        if (selectedMaterial) {
            updateMaterialSetting(selectedMaterial, property, value);
        }
    };
    // Render material controls for the selected material
    const renderMaterialControls = () => {
        if (!selectedMaterial)
            return null;
        const material = materialSettings[selectedMaterial];
        return (_jsxs("div", { className: "material-controls", children: [_jsx(ColorPicker, { color: material.color, onChange: (color) => handleUpdateMaterial('color', color) }), _jsx(MaterialSlider, { label: "Roughness", value: material.roughness, onChange: (value) => handleUpdateMaterial('roughness', value) }), _jsx(MaterialSlider, { label: "Metalness", value: material.metalness, onChange: (value) => handleUpdateMaterial('metalness', value) }), material.transmission !== undefined && (_jsx(MaterialSlider, { label: "Transmission", value: material.transmission, onChange: (value) => handleUpdateMaterial('transmission', value) })), material.ior !== undefined && (_jsx(MaterialSlider, { label: "IOR", value: material.ior, min: 1, max: 2.5, onChange: (value) => handleUpdateMaterial('ior', value) })), material.reflectivity !== undefined && (_jsx(MaterialSlider, { label: "Reflectivity", value: material.reflectivity, onChange: (value) => handleUpdateMaterial('reflectivity', value) })), material.thickness !== undefined && (_jsx(MaterialSlider, { label: "Thickness", value: material.thickness, min: 0, max: 5, step: 0.1, onChange: (value) => handleUpdateMaterial('thickness', value) })), material.envMapIntensity !== undefined && (_jsx(MaterialSlider, { label: "Env Map Intensity", value: material.envMapIntensity, min: 0, max: 3, step: 0.1, onChange: (value) => handleUpdateMaterial('envMapIntensity', value) })), material.clearcoat !== undefined && (_jsx(MaterialSlider, { label: "Clearcoat", value: material.clearcoat, onChange: (value) => handleUpdateMaterial('clearcoat', value) })), material.clearcoatRoughness !== undefined && (_jsx(MaterialSlider, { label: "Clearcoat Roughness", value: material.clearcoatRoughness, onChange: (value) => handleUpdateMaterial('clearcoatRoughness', value) }))] }));
    };
    // Render different controls based on the selected model
    const renderControls = () => {
        // Default wireframe button for all models
        const wireframeButton = (_jsx("button", { className: cn("control-button", wireframe && "active"), onClick: () => setWireframe(!wireframe), children: wireframe ? "Hide Wireframe" : "Show Wireframe" }));
        // Material button for all models - not used anymore since we always show materials
        const materialButton = (_jsx("button", { className: cn("control-button", showMaterialControls && "active"), children: "Materials" }));
        // If showing the can
        if (selectedModel === "can") {
            return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "control-buttons", children: [wireframeButton, _jsx("button", { className: cn("control-button", canAnimations.openCan && "active"), onClick: () => {
                                    toggleCanAnimation('openCan');
                                }, children: "Open Can" }), _jsx("button", { className: cn("control-button", canAnimations.crushCan && "active"), onClick: () => {
                                    toggleCanAnimation('crushCan');
                                }, children: "Crush Can" })] }), _jsxs("div", { className: "material-panel", children: [_jsx(MaterialSelector, { selectedMaterial: selectedMaterial, setSelectedMaterial: setSelectedMaterial, selectedModel: selectedModel }), renderMaterialControls()] })] }));
        }
        // Specific controls for bottle
        if (selectedModel === "bottle") {
            return (_jsxs(_Fragment, { children: [_jsx("div", { className: "control-buttons", children: wireframeButton }), _jsxs("div", { className: "material-panel", children: [_jsx(MaterialSelector, { selectedMaterial: selectedMaterial, setSelectedMaterial: setSelectedMaterial, selectedModel: selectedModel }), renderMaterialControls()] })] }));
        }
        // Cup controls - no animation button, only wireframe and materials
        if (selectedModel === "cup") {
            return (_jsxs(_Fragment, { children: [_jsx("div", { className: "control-buttons", children: wireframeButton }), _jsxs("div", { className: "material-panel", children: [_jsx(MaterialSelector, { selectedMaterial: selectedMaterial, setSelectedMaterial: setSelectedMaterial, selectedModel: selectedModel }), renderMaterialControls()] })] }));
        }
        // Default fallback
        return (_jsxs(_Fragment, { children: [_jsx("div", { className: "control-buttons", children: wireframeButton }), showMaterialControls && (_jsxs("div", { className: "material-panel", children: [_jsx(MaterialSelector, { selectedMaterial: selectedMaterial, setSelectedMaterial: setSelectedMaterial, selectedModel: selectedModel }), renderMaterialControls()] }))] }));
    };
    return (_jsx("div", { className: "controls-panel", ref: controlsRef, style: { opacity: 0 }, children: renderControls() }));
}
