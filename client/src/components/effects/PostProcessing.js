import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useGame } from '../../lib/stores/useGame.js';
export function PostProcessing() {
    const { selectedModel } = useGame();
    const vignetteIntensity = selectedModel ? 0.6 : 0.4;
    return (_jsxs(EffectComposer, { multisampling: 0, children: [_jsx(Bloom, { intensity: 0.3, luminanceThreshold: 0.7, luminanceSmoothing: 0.9 }), _jsx(Vignette, { offset: 0.3, darkness: vignetteIntensity, eskil: false })] }));
}
