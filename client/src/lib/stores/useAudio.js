import { create } from "zustand";
// Create audio elements outside the store for better reliability
const canOpenSound = new Audio('/sounds/Can-opening.wav');
canOpenSound.volume = 0.7;
const canCrushSound = new Audio('/sounds/Can-scrunch.wav');
canCrushSound.volume = 0.7;
const forestSound = new Audio('/sounds/ambient-forest.wav');
forestSound.volume = 0.3;
forestSound.loop = true;
// preload the sounds
try {
    canOpenSound.load();
    canCrushSound.load();
    forestSound.load();
}
catch (e) {
    console.log("Error preloading audio:", e);
}
export const useAudio = create((set, get) => ({
    isMuted: false,
    isAmbientPlaying: false,
    toggleMute: () => {
        const { isMuted } = get();
        const newMutedState = !isMuted;
        set({ isMuted: newMutedState });
        canOpenSound.muted = newMutedState;
        canCrushSound.muted = newMutedState;
        forestSound.muted = newMutedState;
        console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
    },
    playCanOpen: () => {
        const { isMuted } = get();
        if (isMuted) {
            console.log("Can open sound skipped (muted)");
            return;
        }
        canOpenSound.currentTime = 0;
        canOpenSound.play().catch(error => {
            console.log("Can open sound play prevented:", error);
        });
    },
    playCanCrush: () => {
        const { isMuted } = get();
        if (isMuted) {
            console.log("Can crush sound skipped (muted)");
            return;
        }
        // Reset and play the sound
        canCrushSound.currentTime = 0;
        canCrushSound.play().catch(error => {
            console.log("Can crush sound play prevented:", error);
        });
    },
    startAmbientSound: () => {
        const { isMuted } = get();
        // Only update state if ambient sound is actually playing
        forestSound.muted = isMuted;
        // Play the background forest sound
        forestSound.play()
            .then(() => {
            set({ isAmbientPlaying: true });
            console.log("Ambient forest sound playing");
        })
            .catch(error => {
            console.log("Ambient sound play prevented:", error);
        });
    },
    stopAmbientSound: () => {
        // Stop ambient sound
        forestSound.pause();
        forestSound.currentTime = 0;
        set({ isAmbientPlaying: false });
        console.log("Ambient forest sound stopped");
    }
}));
