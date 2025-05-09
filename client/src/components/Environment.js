import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
export function Environment() {
    const { scene, gl } = useThree();
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Set up for HDRI 
        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();
        // Load the actual file
        const rgbeLoader = new RGBELoader();
        rgbeLoader.setDataType(THREE.HalfFloatType);
        rgbeLoader.load('/textures/spruit_sunrise_4k.exr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            // Apply the env map
            scene.environment = envMap;
            scene.background = envMap; // Use the HDR 
            texture.dispose();
            pmremGenerator.dispose();
            setIsLoading(false);
        });
        // Return cleanup function
        return () => {
            if (scene.environment) {
                scene.environment.dispose();
            }
        };
    }, [scene, gl]);
    return null;
}
