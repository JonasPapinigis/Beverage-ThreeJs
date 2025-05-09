import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Vector3 } from "three";
import { apiRequest } from "../queryClient.js";
export const useGame = create()(subscribeWithSelector((set, get) => ({
    phase: "ready",
    selectedModel: null,
    hoveredModel: null,
    wireframeEnabled: false,
    animationEnabled: false,
    currentPage: "home",
    isNoteModalOpen: false,
    isCreateNoteMode: false,
    isViewNoteMode: false,
    currentNote: null,
    sessionNoteIds: [],
    hasViewedNote: false,
    hasCreatedNote: false,
    start: () => {
        set((state) => {
            // Only transition from ready to playing
            if (state.phase === "ready") {
                return { phase: "playing" };
            }
            return {};
        });
    },
    restart: () => {
        set(() => ({ phase: "ready" }));
    },
    end: () => {
        set((state) => {
            // Only transition from playing to ended
            if (state.phase === "playing") {
                return { phase: "ended" };
            }
            return {};
        });
    },
    // Model selection actions
    selectModel: (model) => set({ selectedModel: model }),
    setHoveredModel: (model) => set({ hoveredModel: model }),
    // Display settings actions
    toggleWireframe: () => set((state) => ({
        wireframeEnabled: !state.wireframeEnabled
    })),
    toggleAnimation: () => set((state) => ({
        animationEnabled: !state.animationEnabled
    })),
    setPage: (page) => set({ currentPage: page }),
    openNoteModal: () => set({ isNoteModalOpen: true }),
    closeNoteModal: () => set({
        isNoteModalOpen: false,
        isCreateNoteMode: false,
        isViewNoteMode: false
    }),
    setCreateNoteMode: (enabled) => set({
        isCreateNoteMode: enabled,
        isViewNoteMode: !enabled
    }),
    setViewNoteMode: (enabled) => set({
        isViewNoteMode: enabled,
        isCreateNoteMode: !enabled
    }),
    setCurrentNote: (note) => set({ currentNote: note }),
    // API integrations for note system
    createNote: async (imageData) => {
        try {
            const response = await apiRequest({
                url: "/api/notes",
                method: "POST",
                body: { data: imageData }
            });
            const note = response;
            console.log("Created note:", note);
            // Add note ID to session tracking
            const { addSessionNoteId } = get();
            addSessionNoteId(note.id);
            set({
                isNoteModalOpen: false,
                isCreateNoteMode: false,
                currentNote: null,
                hasCreatedNote: true
            });
        }
        catch (error) {
            console.error("Failed to create note:", error);
        }
    },
    getRandomNote: async () => {
        try {
            const { sessionNoteIds, hasViewedNote } = get();
            if (hasViewedNote) {
                console.log("User has already viewed a note in this session");
                return null;
            }
            let attempts = 0;
            const maxAttempts = 5;
            while (attempts < maxAttempts) {
                const response = await apiRequest({
                    url: "/api/notes/random",
                    method: "GET"
                });
                if (response) {
                    const note = response;
                    if (!sessionNoteIds.includes(note.id)) {
                        set({ currentNote: note, hasViewedNote: true });
                        try {
                            await apiRequest({
                                url: `/api/notes/${note.id}`,
                                method: "DELETE",
                                body: {}
                            });
                            console.log("Automatically deleted note after viewing:", note.id);
                        }
                        catch (deleteError) {
                            console.error("Failed to automatically delete note:", deleteError);
                        }
                        return note;
                    }
                    else {
                        console.log("Skipping note created in this session:", note.id);
                        attempts++;
                        if (attempts >= maxAttempts) {
                            return null;
                        }
                    }
                }
                else {
                    return null;
                }
            }
            return null;
        }
        catch (error) {
            console.error("Failed to get random note:", error);
            return null;
        }
    },
    consumeCurrentNote: async () => {
        const { currentNote } = get();
        if (!currentNote)
            return;
        try {
            await apiRequest({
                url: `/api/notes/${currentNote.id}`,
                method: "DELETE",
                body: {}
            });
            console.log("Consumed note:", currentNote.id);
            // Reset the note system
            set({
                isNoteModalOpen: false,
                isViewNoteMode: false,
                currentNote: null
            });
        }
        catch (error) {
            console.error("Failed to consume note:", error);
        }
    },
    // Add note ID to session tracking
    addSessionNoteId: (id) => {
        set((state) => ({
            sessionNoteIds: [...state.sessionNoteIds, id]
        }));
    },
})));
// Model position data
export const modelPositions = {
    cocacola: new Vector3(-2, 0, 0),
    mtndew: new Vector3(0, 0, 0),
    papercup: new Vector3(2, 0, 0),
};
