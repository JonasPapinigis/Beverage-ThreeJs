import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Bottle } from "./models/Bottle.js";
import { Can } from "./models/Can.js";
import { Cup } from "./models/Cup.js";
import { Table } from "./models/Table.js";
import { GrassTile } from "./models/GrassTile.js";
import { GrassPatch } from "./models/GrassPatch.js";
import { Note } from "./models/Note.js";
import { useThreeStore } from "../lib/stores/useThreeStore.js";
import { useGame } from "../lib/stores/useGame.js";
import { BeverageContainer } from "./BeverageContainer.js";
import { OrbitControls } from "./controls/OrbitControls.js";
import { PostProcessing } from "./effects/PostProcessing.js";
import { MinimalEnvironment } from "./effects/MinimalEnvironment.js";
import * as THREE from "three";
export function Scene({ onLoad } = {}) {
    const { camera } = useThree();
    const { selectedModel, modelPositions, table, grassTile, grassPatch } = useThreeStore();
    const { openNoteModal, setCreateNoteMode, setViewNoteMode, getRandomNote, hasCreatedNote } = useGame();
    // Call onLoad when component mounts
    useEffect(() => {
        if (onLoad) {
            onLoad();
        }
    }, [onLoad]);
    // position the camera correctly when a model is selected
    useEffect(() => {
        if (selectedModel) {
            const position = modelPositions[selectedModel];
            const cameraPosition = new THREE.Vector3(position.x - 0.5, position.y + 0.3, position.z + 0.6);
            // camera to new position
            const duration = 1.5;
            const startPosition = camera.position.clone();
            const startTime = Date.now();
            // Use an IIFE
            const animateCamera = () => {
                const now = Date.now();
                const elapsed = (now - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;
                camera.position.lerpVectors(startPosition, cameraPosition, easeProgress);
                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
                else {
                    // Set target to the center of the model
                    const lookTarget = new THREE.Vector3(position.x, 
                    // Calculate center Y position based on model type
                    position.y + (selectedModel === "bottle" ? 0.15 :
                        selectedModel === "can" ? 0.15 : 0.1), position.z);
                    camera.lookAt(lookTarget);
                }
            };
            animateCamera();
        }
        else {
            // Reset camera when no model
            const duration = 1.0;
            const startPosition = camera.position.clone();
            const endPosition = new THREE.Vector3(0, 0.6, 1.6);
            const startTime = Date.now();
            // Use arrow function
            const resetCamera = () => {
                const now = Date.now();
                const elapsed = (now - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;
                camera.position.lerpVectors(startPosition, endPosition, easeProgress);
                if (progress < 1) {
                    requestAnimationFrame(resetCamera);
                }
                else {
                    camera.lookAt(0, 0, 0);
                }
            };
            resetCamera();
        }
    }, [selectedModel, camera, modelPositions]);
    return (_jsxs(_Fragment, { children: [_jsxs(Suspense, { fallback: null, children: [_jsx(GrassTile, { position: [grassTile.position.x, grassTile.position.y, grassTile.position.z], rotation: [grassTile.rotation.x, grassTile.rotation.y, grassTile.rotation.z], scale: [grassTile.scale.x, grassTile.scale.y, grassTile.scale.z] }), _jsx(GrassPatch, { position: [grassPatch.position.x, grassPatch.position.y, grassPatch.position.z], rotation: [grassPatch.rotation.x, grassPatch.rotation.y, grassPatch.rotation.z], scale: [grassPatch.scale.x, grassPatch.scale.y, grassPatch.scale.z] }), _jsx(Table, { position: [table.position.x, table.position.y, table.position.z], rotation: [table.rotation.x, table.rotation.y, table.rotation.z], scale: [table.scale.x, table.scale.y, table.scale.z] })] }), !selectedModel && (_jsxs(_Fragment, { children: [_jsx(BeverageContainer, { position: modelPositions.bottle, type: "bottle", children: _jsx(Bottle, {}) }), _jsx(BeverageContainer, { position: modelPositions.can, type: "can", children: _jsx(Can, {}) }), _jsx(BeverageContainer, { position: modelPositions.cup, type: "cup", children: _jsx(Cup, {}) })] })), selectedModel === "bottle" && (_jsx(BeverageContainer, { position: modelPositions.bottle, type: "bottle", selected: true, children: _jsx(Bottle, {}) })), selectedModel === "can" && (_jsx(BeverageContainer, { position: modelPositions.can, type: "can", selected: true, children: _jsx(Can, {}) })), selectedModel === "cup" && (_jsx(BeverageContainer, { position: modelPositions.cup, type: "cup", selected: true, children: _jsx(Cup, {}) })), !selectedModel && (_jsx(Note, { position: [-0.13, 0.04, 0.2], rotation: [Math.PI / 2, 0, Math.PI / 10], onClick: async () => {
                    openNoteModal();
                    // get a random note
                    const note = await getRandomNote();
                    if (note) {
                        // If note exists, show it
                        setViewNoteMode(true);
                    }
                    else {
                        // 
                        if (!hasCreatedNote) {
                            setCreateNoteMode(true);
                        }
                        else {
                            // If user has already created a note, show message
                            setViewNoteMode(true); // Show view mode with empty state
                            console.log("User has already created a note in this session");
                        }
                    }
                } })), _jsx(OrbitControls, {}), _jsx(MinimalEnvironment, {}), _jsx(PostProcessing, {})] }));
}
