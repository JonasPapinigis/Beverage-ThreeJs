import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { useThreeStore } from "../../lib/stores/useThreeStore.js";
import { gsap } from "gsap";
// Create a separate component for the floating info panel that doesn't use R3F hooks
export function Selection() {
    const { selectedModel } = useThreeStore();
    const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [visible, setVisible] = useState(false);
    const divRef = useRef(null);
    // Model information
    const modelInfo = {
        bottle: {
            name: "Coca-Cola Bottle",
            description: "The iconic Coca-Cola bottle with the classic red label. A symbol of refreshment recognized worldwide since 1886."
        },
        can: {
            name: "Mountain Dew Can",
            description: "An energizing beverage with bold flavor combined with the classic Mountain Dew citrus kick."
        },
        cup: {
            name: "Paper Cup",
            description: "An environmentally-friendly disposable cup with custom branding, perfect for hot or cold beverages on the go."
        }
    };
    // Get current model info
    const currentModel = selectedModel ? modelInfo[selectedModel] : null;
    // Position the info panel based on screen size
    useEffect(() => {
        if (selectedModel) {
            // Position the panel to the left of the screen
            const positions = {
                bottle: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 },
                can: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 },
                cup: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 }
            };
            setPosition(positions[selectedModel]);
        }
    }, [selectedModel]);
    // Animate in
    useEffect(() => {
        if (selectedModel && divRef.current && !visible) {
            // Fade in the info panel
            gsap.fromTo(divRef.current, { opacity: 0, y: 20 }, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.4,
                ease: "power2.out",
                onComplete: () => setVisible(true)
            });
        }
        // Clean up animation
        return () => {
            if (divRef.current && visible) {
                gsap.killTweensOf(divRef.current);
                setVisible(false);
            }
        };
    }, [selectedModel, visible]);
    if (!selectedModel || !currentModel)
        return null;
    return (_jsxs("div", { ref: divRef, className: "floating-info", style: {
            left: `${position.x}px`,
            top: `${position.y}px`,
            opacity: 0 // Start hidden, will be animated in
        }, children: [_jsx("h2", { children: currentModel.name }), _jsx("p", { children: currentModel.description })] }));
}
