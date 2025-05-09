import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";
// Define the lowest points of beverage containers 
const BOTTLE_BOTTOM_Y = 0;
const CAN_BOTTOM_Y = 0;
const CUP_BOTTOM_Y = 0;
const LOWEST_POINT = Math.min(BOTTLE_BOTTOM_Y, CAN_BOTTOM_Y, CUP_BOTTOM_Y);
// Calculate table position based on the lowest point of beverages
const TABLE_HEIGHT = 0.02;
const TABLE_Y_POSITION = LOWEST_POINT - TABLE_HEIGHT;
export const useThreeStore = create()(subscribeWithSelector((set) => ({
    selectedModel: null,
    setSelectedModel: (model) => set({ selectedModel: model }),
    resetSelection: () => set({
        selectedModel: null,
        wireframe: false,
        isAnimating: false,
        canAnimations: { openCan: false, crushCan: false },
        selectedMaterial: null,
    }),
    hoveredModel: null,
    setHoveredModel: (model) => set({ hoveredModel: model }),
    isDraggingStraw: false,
    setIsDraggingStraw: (isDragging) => set({ isDraggingStraw: isDragging }),
    wireframe: false,
    setWireframe: (wireframe) => set({ wireframe }),
    isAnimating: false,
    toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),
    canAnimations: {
        openCan: false,
        crushCan: false,
    },
    toggleCanAnimation: (animation) => set((state) => ({
        canAnimations: {
            ...state.canAnimations,
            [animation]: !state.canAnimations[animation],
        },
    })),
    materialSettings: {
        // Can materials
        CanMetal: {
            color: "#cccccc",
            roughness: 0,
            metalness: 1,
        },
        CanLabel: {
            color: "#ffffff",
            roughness: 0.2,
            metalness: 1,
        },
        // Cup materials
        CupStraw: {
            color: "#ff0000",
            roughness: 0.5,
            metalness: 0.1,
        },
        CupLabel: {
            color: "#ffffff",
            roughness: 0.5,
            metalness: 0.1,
        },
        CupLid: {
            color: "#ffffff",
            roughness: 0,
            metalness: 0,
        },
        CupPaper: {
            color: "#f1f1f1",
            roughness: 0.8,
            metalness: 0.1,
        },
        // Bottle materials
        BottleGlass: {
            color: "#ddf5ff",
            roughness: 0.05,
            metalness: 0,
            transmission: 0.98,
            ior: 1.5,
            reflectivity: 0.3,
            thickness: 0.5,
            envMapIntensity: 1.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.01,
        },
        BottleCap: {
            color: "#ff0000",
            roughness: 0.1,
            metalness: 1,
        },
        BottleLabel: {
            color: "#ffffff",
            roughness: 0.2,
            metalness: 0.7,
        },
    },
    updateMaterialSetting: (materialType, property, value) => set((state) => ({
        materialSettings: {
            ...state.materialSettings,
            [materialType]: {
                ...state.materialSettings[materialType],
                [property]: value,
            },
        },
    })),
    selectedMaterial: null,
    setSelectedMaterial: (material) => set({ selectedMaterial: material }),
    // Camera position
    cameraPosition: new THREE.Vector3(0, 0.5, 0.5),
    setCameraPosition: (position) => set({ cameraPosition: position }),
    // Model positions 
    modelPositions: {
        bottle: new THREE.Vector3(0, 0.107, 0.2),
        can: new THREE.Vector3(-0.07, 0.04, 0),
        cup: new THREE.Vector3(0.1, 0.06, 0),
    },
    // Table controls
    table: {
        position: new THREE.Vector3(-0.17, -0.383, -0.19),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(0.5, 0.5, 0.5),
        setPosition: (position) => set((state) => ({
            table: { ...state.table, position },
        })),
        setRotation: (rotation) => set((state) => ({
            table: { ...state.table, rotation },
        })),
        setScale: (scale) => set((state) => ({
            table: { ...state.table, scale },
        })),
    },
    // Grass Tile controls
    grassTile: {
        position: new THREE.Vector3(0, -0.6, 0),
        rotation: new THREE.Euler(-Math.PI / 1, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        setPosition: (position) => set((state) => ({
            grassTile: { ...state.grassTile, position },
        })),
        setRotation: (rotation) => set((state) => ({
            grassTile: { ...state.grassTile, rotation },
        })),
        setScale: (scale) => set((state) => ({
            grassTile: { ...state.grassTile, scale },
        })),
    },
    // Grass Patch controls
    grassPatch: {
        position: new THREE.Vector3(0, -0.4, 0),
        rotation: new THREE.Euler(0, Math.PI / 4, 0),
        scale: new THREE.Vector3(0.65, 0.65, 0.65),
        setPosition: (position) => set((state) => ({
            grassPatch: { ...state.grassPatch, position },
        })),
        setRotation: (rotation) => set((state) => ({
            grassPatch: { ...state.grassPatch, rotation },
        })),
        setScale: (scale) => set((state) => ({
            grassPatch: { ...state.grassPatch, scale },
        })),
    },
    aboutSection: null,
    aboutScrollProgress: 0,
    backgroundColors: {
        intro: "#000000", // Black
        can: "#101045", // Dark Blue
        bottle: "#450101", // Dark Red
        cup: "#453601", // Dark Orange
        more: "#164520", // Dark Green
        null: "#000000", // Black (default)
    },
    // Wireframe transforms for about page models
    //Deprecated
    wireframeTransforms: {
        can: {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(1, 0, 3),
            scale: new THREE.Vector3(0.001, 0.001, 0.001),
        },
        bottle: {
            position: new THREE.Vector3(-2, 0, 3),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(0.001, 0.001, 0.001),
        },
        cup: {
            position: new THREE.Vector3(3, -0.5, 2),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(0.025, 0.025, 0.025),
        },
    },
    setAboutSection: (section) => set({ aboutSection: section }),
    setAboutScrollProgress: (progress) => set({ aboutScrollProgress: progress }),
})));
