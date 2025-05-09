import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef } from "react";
import { Scene } from "./components/Scene.js";
import { Environment } from "@react-three/drei";
import { ControlPanel } from "./components/ui/ControlPanel.js";
import { Selection } from "./components/ui/Selection.js";
import { useGame } from "./lib/stores/useGame.js";
import { useThreeStore } from "./lib/stores/useThreeStore.js";
import { Routes, Route, NavLink, useLocation, Link } from "react-router-dom";
import NotFound from "./pages/not-found.js";
import { NoteManager } from "./components/notes/NoteManager.js";
import { AboutBackground3D } from "./components/about/AboutBackground3D.js";
import { Sound } from "./components/ui/Sound.js";
import * as THREE from "three";
function Header() {
    return (_jsx("header", { className: "header", children: _jsxs("div", { className: "header-content", children: [_jsxs(Link, { to: "/", className: "logo-title-container", children: [_jsx("img", { src: "/images/sun-logo.png", alt: "Sun Logo", className: "site-logo" }), _jsx("h1", { className: "site-title", children: "The Picnic" })] }), _jsxs("nav", { className: "main-nav", children: [_jsx(NavLink, { to: "/", className: ({ isActive }) => (isActive ? "active" : ""), children: "Home" }), _jsx(NavLink, { to: "/about", className: ({ isActive }) => (isActive ? "active" : ""), children: "About" }), _jsx(NavLink, { to: "/acknowledgements", className: ({ isActive }) => (isActive ? "active" : ""), children: "Acknowledgements" })] })] }) }));
}
function About() {
    // State for scroll position and section
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection] = useState("intro");
    const [sectionScrollProgress, setSectionScrollProgress] = useState(0);
    const aboutRef = useRef(null);
    const [showBackground3D, setShowBackground3D] = useState(true);
    // References to sections
    const introRef = useRef(null);
    const canRef = useRef(null);
    const bottleRef = useRef(null);
    const cupRef = useRef(null);
    const moreRef = useRef(null);
    // Handle scrolling effects
    useEffect(() => {
        const handleScroll = () => {
            if (!aboutRef.current)
                return;
            // Calculate scroll progress
            const scrollHeight = aboutRef.current.scrollHeight - window.innerHeight;
            const scrollTop = aboutRef.current.scrollTop;
            const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));
            setScrollProgress(progress);
            // Determine current section based on scroll progress
            const introHeight = introRef.current?.offsetHeight || 0;
            const canHeight = canRef.current?.offsetHeight || 0;
            const bottleHeight = bottleRef.current?.offsetHeight || 0;
            const cupHeight = cupRef.current?.offsetHeight || 0;
            let newSection = "intro";
            let sectionProgress = 0;
            if (scrollTop < introHeight) {
                newSection = "intro";
                sectionProgress = scrollTop / introHeight;
            }
            else if (scrollTop < introHeight + canHeight) {
                newSection = "can";
                sectionProgress = (scrollTop - introHeight) / canHeight;
            }
            else if (scrollTop < introHeight + canHeight + bottleHeight) {
                newSection = "bottle";
                sectionProgress = (scrollTop - introHeight - canHeight) / bottleHeight;
            }
            else if (scrollTop <
                introHeight + canHeight + bottleHeight + cupHeight) {
                newSection = "cup";
                sectionProgress =
                    (scrollTop - introHeight - canHeight - bottleHeight) / cupHeight;
            }
            else {
                newSection = "more";
                const moreHeight = moreRef.current?.offsetHeight || 0;
                sectionProgress =
                    (scrollTop - introHeight - canHeight - bottleHeight - cupHeight) /
                        moreHeight;
            }
            setActiveSection(newSection);
            setSectionScrollProgress(Math.min(1, Math.max(0, sectionProgress)));
        };
        const aboutEl = aboutRef.current;
        if (aboutEl) {
            aboutEl.addEventListener("scroll", handleScroll);
            // Initial call to set section
            handleScroll();
        }
        return () => {
            if (aboutEl) {
                aboutEl.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);
    // Update the Three.js store with scroll info
    const { setAboutSection, setAboutScrollProgress, backgroundColors } = useThreeStore();
    useEffect(() => {
        const section = activeSection;
        setAboutSection(section);
        setAboutScrollProgress(sectionScrollProgress);
        // When section changes, we want to apply specific CSS to the main 3D scene
        const mainScene = document.querySelector(".home-page canvas");
        if (mainScene) {
            // Apply rotation based on scroll progress
            const rotation = scrollProgress * 360;
            const scale = 1 - scrollProgress * 0.5; // Zoom out 
            const opacity = 1 - scrollProgress * 0.7; // Fade out 
            mainScene.setAttribute("style", `
        transform: rotate(${-rotation}deg) scale(${scale});
        opacity: ${opacity};
        transition: transform 0.3s ease, opacity 0.3s ease;
      `);
        }
    }, [
        activeSection,
        sectionScrollProgress,
        scrollProgress,
        setAboutSection,
        setAboutScrollProgress,
    ]);
    // Scroll to a specific 
    const scrollToSection = (sectionRef) => {
        if (sectionRef.current && aboutRef.current) {
            aboutRef.current.scrollTo({
                top: sectionRef.current.offsetTop,
                behavior: "smooth",
            });
        }
    };
    // Get background style
    const getBackgroundStyle = () => {
        // transparent backdrop without blur
        return {
            backgroundColor: "transparent",
        };
    };
    // Calculate 3D background parameters 
    const getThreeDBackgroundConfig = () => {
        let sectionColor;
        if (activeSection === "intro") {
            sectionColor = backgroundColors.intro;
        }
        else if (activeSection === "can") {
            // black to blue
            const startColor = new THREE.Color(backgroundColors.intro);
            const endColor = new THREE.Color(backgroundColors.can);
            sectionColor = startColor
                .lerp(endColor, sectionScrollProgress)
                .getStyle();
        }
        else if (activeSection === "bottle") {
            // blue to red
            const startColor = new THREE.Color(backgroundColors.can);
            const endColor = new THREE.Color(backgroundColors.bottle);
            sectionColor = startColor
                .lerp(endColor, sectionScrollProgress)
                .getStyle();
        }
        else if (activeSection === "cup") {
            // red to orange
            const startColor = new THREE.Color(backgroundColors.bottle);
            const endColor = new THREE.Color(backgroundColors.cup);
            sectionColor = startColor
                .lerp(endColor, sectionScrollProgress)
                .getStyle();
        }
        return {
            activeSection,
            sectionProgress: sectionScrollProgress,
            scrollProgress,
            backgroundColor: sectionColor,
        };
    };
    return (_jsxs("div", { className: "about-page-container", children: [showBackground3D && (_jsx(AboutBackground3D, { config: getThreeDBackgroundConfig() })), _jsxs("div", { className: "about-page", ref: aboutRef, style: getBackgroundStyle(), children: [_jsxs("div", { className: "about-navigation", children: [_jsx("button", { className: activeSection === "intro" ? "active" : "", onClick: () => scrollToSection(introRef), children: "Introduction" }), _jsx("button", { className: activeSection === "can" ? "active" : "", onClick: () => scrollToSection(canRef), children: "Can" }), _jsx("button", { className: activeSection === "bottle" ? "active" : "", onClick: () => scrollToSection(bottleRef), children: "Bottle" }), _jsx("button", { className: activeSection === "cup" ? "active" : "", onClick: () => scrollToSection(cupRef), children: "Cup" }), _jsx("button", { className: activeSection === "more" ? "active" : "", onClick: () => scrollToSection(moreRef), children: "More" })] }), _jsx(Link, { to: "/", className: `back-to-home ${scrollProgress > 0.9 ? "centered" : ""}`, children: "Back to Home" }), _jsx("section", { ref: introRef, className: "about-section intro-section", children: _jsxs("div", { className: "about-content", children: [_jsx("h2", { children: "About" }), _jsx("p", { children: "\"The Picnic\" is an advanced interactive 3D web application designed to showcase strong 3D modelling skills in an immersive environment designed to deliver an immersive, social and even nostalgic experience for the user. The project hopes to demonstrate advanced practices in 3D Web Development, Real-time rendering and interactive media." }), _jsx("div", { className: "about-image-grid" }), _jsx("p", { children: "Let us first demonstrate the models this project was based around." })] }) }), _jsx("section", { ref: canRef, className: "about-section model-section can-section", children: _jsxs("div", { className: "about-content", children: [_jsx("h2", { children: "Can" }), _jsx("p", { children: "The aluminum can model employs quad-dominant topology with zero n-gons, resulting in a mesh structure that optimises both rendering performance and animation deformation. The model features two precisely implemented animations: a 30-frame \"Open\" sequence and a 37-frame \"Crush\" sequence, both imported as NLA tracks via the THREE.js GLTFLoader with LoopOnce configuration. Deformation during the crush animation uses two synchronised morph targets (shape keys) applied to the Cylinder mesh with carefully calibrated morphTargetInfluences." }), _jsx("div", { className: "video-container", children: _jsxs("video", { className: "demo-video", controls: true, children: [_jsx("source", { src: "/Images4W3D/material_demo.mp4", type: "video/mp4" }), "Your browser does not support the video tag."] }) }), _jsxs("div", { className: "about-image-grid", children: [_jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Can-schematic.png", alt: "Can Schematic", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Can Reference Dimensions" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 094618.png", alt: "Can Animation", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Can Opening Modelling" })] })] })] }) }), _jsx("section", { ref: bottleRef, className: "about-section model-section bottle-section", children: _jsxs("div", { className: "about-content", children: [_jsx("h2", { children: "Bottle" }), _jsx("p", { children: "This was the first model made out of the collection and went significantly beyond the capabilities of Three.JS. This bespoke model was highly optimised for realistic rendering and was suitable for EEVEE as well as Cycles rendering, as an attempt was made to bake dynamic scene lighting but was seen to create lackluster results." }), _jsx("p", { children: "The cylinder had a vertice count divisible by 10 in order to allow for evenly spaced ridges on the sides of the bottle. The model has been left at a relatively high poly but has been reduced somewhat for the interactive website." }), _jsx("p", { children: "Due to the fact that ThreeJS is not able to calculate refraction outside of the skybox, the translucent liquid component has been left out. We used the video found here (https://www.youtube.com/watch?v=q63VhC3vYI0&t=142s&ab_channel=Genka) to create an adequate glass texture." }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/label_bake.jpg", alt: "Label Bake", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Baked Label Texture (Unused)" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/render.png", alt: "3D Render", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Bottle Model Rendered in Blender" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/coke-bottle.png", alt: "Bottle Render", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Glass Bottle Reference Dimensions" })] })] }) }), _jsx("section", { ref: cupRef, className: "about-section model-section cup-section", children: _jsxs("div", { className: "about-content", children: [_jsx("h2", { children: "Paper Cup" }), _jsx("p", { children: "The paper cup model features a geometrically complex top section constructed with 22,001 vertices forming the lid mesh. The characteristic ridged section was generated using a checker deselect pattern. The straw component implements a 13-bone hierarchical armature hierarchy, with each bone being representative of one of the straw \"joints\" and being moveable in the website. Text elements were constructed as extruded 3D geometry (depth:0.00328m) and boolean-merged with the lid structure, requiring us to result in n-gons in patching due to excessive poly counts in product." }), _jsxs("div", { className: "about-image-grid", children: [_jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/cup-top.jpg", alt: "Cup Top Design", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Cup Lid Reference" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/360_F_44857315_9g3olx5WxmSHzVxMt49rmWydSXBFQcnP.jpg", alt: "Sound Waves", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Paper Cup Reference" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 094101.png", alt: "Cup Model", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Complete Cup Lid Model" })] }), _jsx("div", { className: "about-image-grid", children: _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-03 194304.png", alt: "Audio Implementation", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Cup Lid Ridges via Checker Deselect" })] }) }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/S.png", alt: "Scene Overview", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "3D Word Modelling" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 095613.png", alt: "Label Design", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Straw Armature Hierarchy" })] })] })] }) }), _jsx("section", { ref: moreRef, className: "about-section model-section more-section", children: _jsxs("div", { className: "about-content", children: [_jsx("h2", { children: "Implementation" }), _jsx("p", { children: "The application employs a reactive grid-based layout system that is able to scale with the browser and is able to be run on mobile. The website implores a sleek minimalist design for the UI, using Apple\u2019s San Francisco font as well as gaussian blur within window bodies.The application maintains a consistent 60fps performance through the use of will-change properties and composite-optimised animations." }), _jsx("p", { children: "The material control panel available in the inspection functionality of each model implements custom input elements. This system provides immediate visual feedback with debounced state updates to prevent performance degradation during rapid adjustments." }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 095000.png", alt: "Material Setup", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Material Shader demo" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 094821.png", alt: "Sound System", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Wireframe Inspection View" })] }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 095037.png", alt: "Beverage retains material changes in main screen", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Beverage retains material changes in main screen" })] }), _jsx("p", { children: "The application features an intuitive navigation system with clear visual feedback. Interactive elements utilise visual highlighting/enlargement to guide users' attention to interactive elements, creating an engaging yet accessible experience." }), _jsx("h3", { children: "Note System" }), _jsx("p", { children: "The note system, accessible via the paper object on the picnic table, uses an SQLite database to store HTML5 Canvas drawings. The user may only create and view one note per session, after which it is burned (deleted from the database). A lot of the note functionality is handled through a REST API that provides proper error handling, status codes, and response formats in accordance with REST principles. This feature not only makes the app more social but more accessible and enjoyable by more demographics." }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 094736.png", alt: "Bottle Wireframe", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Note Canvas" })] }), _jsx("h3", { children: "Interactive About page" }), _jsx("p", { children: "The About section implements a sophisticated scroll-based animation system that transforms the 3D environment in response to user interaction. This system demonstrates a deep understanding of vector transformations and ability to compose in 3D scenes. As users scroll through the content, the application tracks scroll position and calculates section visibility percentages. These metrics drive real-time transformations of the 3D environment, creating an immersive experience where content and visuals are perfectly synchronised." }), _jsx("h3", { children: "Visuals" }), _jsx("p", { children: "The custom shaders enhance material properties through techniques like rim lighting, which adds a subtle glow around object edges based on viewing angle. The vertex shader calculates precise normal and view vectors, while the fragment shader implements sophisticated lighting calculations that respond naturally to scene conditions. The application implements a sophisticated post-processing effects pipeline that enhances visual styling beyond standard 3D rendering. The pipeline begins with a standard render pass that captures the scene into a frame buffer. This buffer then becomes the input for a sequence of carefully ordered effects: Ambient Occlusion: Adds subtle shadowing in crevices and where objects meet Bloom: Creates a soft glow around bright areas, enhancing the perceived dynamic range Tone Mapping: Adjusts contrast and brightness for a more cinematic appearance Subtle Film Grain: Adds a slight texture that softens the digital perfection Vignette: Darkens the edges of the frame to draw focus to the central elements" }), _jsx("h3", { children: "Design Paradigm" }), _jsx("p", { children: "The entire application is built upon the foundation of the MVC design pattern. The data model is defined in shared/schema.ts.The storage implementation in server/storage.ts provides a clean abstraction over database operations, implementing both SQLite persistence and in-memory storage options with identical interfaces. The view layer is implemented through React components that render both 2D UI elements and 3D scene content, while obtaining data through props and hooks while delegating business logic to appropriate controller components.The 3D rendering is handled through THREE.js components. The Control layer is distributed among several components, such as React state management through custom hooks in client/src/lib/stores/, API endpoints in server/routes.ts, as well as Event handlers in UI components that translate user actions into application state changes." }), _jsxs("div", { className: "about-image", children: [_jsx("img", { src: "/images/about/Screenshot 2025-05-07 095114.png", alt: "Sound Controls", className: "feature-image" }), _jsx("p", { className: "image-caption", children: "Sound controls interface for accessibility" })] }), _jsx("div", { className: "about-image-grid" })] }) })] })] }));
}
function Acknowledgements() {
    return (_jsxs("div", { className: "acknowledgements-page", children: [_jsx(Link, { to: "/", className: "back-button acknowledgements-back-button", children: "\u2190 Back to Home" }), _jsxs("div", { className: "acknowledgements-content", children: [_jsx("h2", { children: "Model Acknowledgements" }), _jsx("p", { children: "This project uses 3D models from various sources, and we would like to acknowledge the creators who made these assets available." }), _jsx("h3", { children: "Environment Assets" }), _jsxs("ul", { className: "attribution-list", children: [_jsxs("li", { children: [_jsx("strong", { children: "Grass Tile" }), " by Adam Tomkins [CC-BY] via Poly Pizza"] }), _jsxs("li", { children: [_jsx("strong", { children: "Grass Patch" }), " by Danni Bittman [CC-BY] via Poly Pizza"] }), _jsxs("li", { children: [_jsx("strong", { children: "Small Table" }), " by Quaternius"] })] }), _jsx("h3", { children: "Beverage Container Models" }), _jsxs("ul", { className: "attribution-list", children: [_jsxs("li", { children: [_jsx("strong", { children: "Bottle" }), " - Custom modeled for this project"] }), _jsxs("li", { children: [_jsx("strong", { children: "Soda Can" }), " - Custom modeled for this project"] }), _jsxs("li", { children: [_jsx("strong", { children: "Paper Cup" }), " - Custom modeled for this project"] })] }), _jsx("h3", { children: "Textures" }), _jsxs("ul", { className: "attribution-list", children: [_jsxs("li", { children: [_jsx("strong", { children: "HDR Environment Map" }), " - \"Spruit Sunrise\" environment map for lighting and reflections"] }), _jsxs("li", { children: [_jsx("strong", { children: "Label Textures" }), " - Custom created for beverage containers"] }), _jsxs("li", { children: [_jsx("strong", { children: "Glass Texture Tutorial" }), " - Genka's glass tutorial on YouTube (https://www.youtube.com/watch?v=q63VhC3vYI0)"] }), _jsxs("li", { children: [_jsx("strong", { children: "Vector Graphics" }), " - Rasendria Widodo at Vecteezy"] })] }), _jsx("h3", { children: "Audio Assets" }), _jsxs("ul", { className: "attribution-list", children: [_jsxs("li", { children: [_jsx("strong", { children: "Ambient Forest Sounds" }), " - F.M.Audio on Freesound (https://freesound.org/people/F.M.Audio/sounds/572756/)"] }), _jsxs("li", { children: [_jsx("strong", { children: "Can Opening Sound" }), " - rolandasb on Freesound (https://freesound.org/people/rolandasb/sounds/170515/)"] }), _jsxs("li", { children: [_jsx("strong", { children: "Can Crush Sound" }), " - DrinkingWindGames on Freesound (https://freesound.org/people/DrinkingWindGames/sounds/634071/)"] })] }), _jsx("h3", { children: "License Information" }), _jsx("p", { children: "All third-party assets are used in compliance with their respective licenses. Custom assets created for this project are for educational purposes only." })] })] }));
}
function Home() {
    const { selectedModel, resetSelection } = useThreeStore();
    const [isLoading, setIsLoading] = useState(true);
    // Hide header when loading
    useEffect(() => {
        const header = document.querySelector(".header");
        if (header) {
            if (isLoading) {
                header.classList.add("hidden");
            }
            else {
                header.classList.remove("hidden");
            }
        }
        return () => {
            const header = document.querySelector(".header");
            if (header) {
                header.classList.remove("hidden");
            }
        };
    }, [isLoading]);
    return (_jsxs("div", { className: "home-page", children: [isLoading && (_jsx("div", { className: "loading-overlay", children: _jsx("div", { className: "loading-text", children: "Loading..." }) })), _jsxs(Canvas, { shadows: true, dpr: [1, 2], camera: {
                    position: [0, 0.6, 1.6],
                    fov: 45,
                    near: 0.01,
                    far: 1000,
                }, gl: {
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }, children: [_jsx("fog", { attach: "fog", args: ["#f5f5f5", 1, 5] }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 1, castShadow: true, "shadow-mapSize": [2048, 2048] }), _jsxs(Suspense, { fallback: null, children: [_jsx(Scene, { onLoad: () => setIsLoading(false) }), _jsx(Environment, { files: "spruit_sunrise_4k.exr", background: true, blur: 0.04 })] })] }), !isLoading && (_jsx(_Fragment, { children: selectedModel && (_jsxs(_Fragment, { children: [_jsx(Selection, {}), _jsx(ControlPanel, {}), _jsx("button", { className: "back-button", onClick: resetSelection, children: "\u2190 Back to all models" })] })) }))] }));
}
function App() {
    const { setPage } = useGame();
    const location = useLocation();
    // Update page state based on route
    useEffect(() => {
        if (location.pathname === "/") {
            setPage("home");
        }
        else if (location.pathname === "/about") {
            setPage("about");
        }
        else if (location.pathname === "/acknowledgements") {
            setPage("acknowledgements");
        }
    }, [location, setPage]);
    return (_jsxs("div", { className: "app", children: [_jsx(Header, {}), _jsx("main", { className: "main-content", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/acknowledgements", element: _jsx(Acknowledgements, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }), _jsx(NoteManager, {}), _jsx(Sound, {})] }));
}
export default App;
