import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudio } from '../../lib/stores/useAudio.js';
export function Sound() {
    const [showSoundControls, setShowSoundControls] = useState(true);
    const { isMuted, toggleMute, startAmbientSound, stopAmbientSound, isAmbientPlaying } = useAudio();
    const location = useLocation();
    // Control ambient sound based on route
    useEffect(() => {
        const isHomePage = location.pathname === '/';
        if (isHomePage) {
            console.log('Home page detected, starting ambient sound...');
            // Play sound on the homepage
            const playSound = () => {
                startAmbientSound();
                // Remove listeners after first attempt
                document.removeEventListener('click', playSound);
                document.removeEventListener('touchstart', playSound);
                document.removeEventListener('keydown', playSound);
            };
            // Try to play immediately
            startAmbientSound();
            // Also add user interaction listeners to handle browser autoplay restrictions
            document.addEventListener('click', playSound);
            document.addEventListener('touchstart', playSound);
            document.addEventListener('keydown', playSound);
            return () => {
                // Clean up
                document.removeEventListener('click', playSound);
                document.removeEventListener('touchstart', playSound);
                document.removeEventListener('keydown', playSound);
            };
        }
        else {
            // Stop sound on other pages
            console.log('Not on homepage, stopping ambient sound...');
            stopAmbientSound();
        }
    }, [location.pathname, startAmbientSound, stopAmbientSound]);
    // Auto-hide controls after 5 seconds
    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setShowSoundControls(false);
        }, 5000);
        return () => clearTimeout(hideTimer);
    }, []);
    // Handle button click
    const handleSoundButtonClick = () => {
        // Toggle mute state
        toggleMute();
        // Try to start ambient sound if on homepage
        if (location.pathname === '/' && !isAmbientPlaying) {
            startAmbientSound();
        }
        // Show controls again
        setShowSoundControls(true);
    };
    return (_jsx("div", { className: `sound-controls ${showSoundControls ? 'visible' : 'hidden'}`, onMouseEnter: () => setShowSoundControls(true), children: _jsx("button", { className: "sound-toggle-btn", onClick: handleSoundButtonClick, title: isMuted ? "Unmute Sounds" : "Mute Sounds", children: isMuted ? '🔇' : '🔊' }) }));
}
