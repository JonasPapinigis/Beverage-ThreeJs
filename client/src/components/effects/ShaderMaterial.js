import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
export function useShaderMaterial({ color = '#ffffff', map } = {}) {
    const [material] = useState(() => {
        // Create shader uniforms
        const uniforms = {
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            map: { value: map || new THREE.Texture() }
        };
        // Vertex shader with subtle movement
        const vertexShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        
        // Add subtle vertex movement based on time - creates a gentle wave effect
        vec3 newPosition = position;
        newPosition.y += sin(position.x * 2.0 + time * 2.0) * 0.02;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
        // Fragment shader with lighting effects
        const fragmentShader = `
      uniform float time;
      uniform vec3 color;
      uniform sampler2D map;

      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        // Basic lighting - calculate the dot product of normal and light direction
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(0.0, dot(vNormal, lightDir));
        
        // Get the texture color
        vec4 texColor = texture2D(map, vUv);
        
        // Add a subtle pulsing glow effect based on time
        float glow = 0.8 + 0.2 * sin(time * 2.0);
        
        // Apply color tint and lighting
        vec3 finalColor = color * texColor.rgb * (diffuse * 0.6 + 0.4) * glow;
        
        // Add rim lighting effect along the edges
        float rimFactor = 1.0 - max(0.0, dot(normalize(vNormal), normalize(-vPosition)));
        rimFactor = pow(rimFactor, 3.0) * 0.3;
        
        finalColor += vec3(1.0, 1.0, 1.0) * rimFactor;
        
        gl_FragColor = vec4(finalColor, texColor.a);
      }
    `;
        // Create the shader material
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
        });
    });
    // Update shader time uniform on each frame
    useFrame((_, delta) => {
        material.uniforms.time.value += delta;
    });
    // Update texture when map changes
    useEffect(() => {
        if (map) {
            material.uniforms.map.value = map;
        }
    }, [map, material]);
    // Update color when it changes
    useEffect(() => {
        material.uniforms.color.value = new THREE.Color(color);
    }, [color, material]);
    return material;
}
export function ShaderObject({ color = '#ffffff', position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) {
    const material = useShaderMaterial({ color });
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    return (_jsxs("mesh", { position: new THREE.Vector3(...position), rotation: new THREE.Euler(...rotation), scale: new THREE.Vector3(...scale), children: [_jsx("primitive", { object: geometry, attach: "geometry" }), _jsx("primitive", { object: material, attach: "material" })] }));
}
