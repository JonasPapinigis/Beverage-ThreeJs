import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { NoteCanvas } from "./NoteCanvas.js";
import { NoteDisplay } from "./NoteDisplay.js";
import { useGame } from "../../lib/stores/useGame.js";
export function NoteManager() {
    const { isNoteModalOpen, isCreateNoteMode, isViewNoteMode, currentNote, closeNoteModal, createNote, consumeCurrentNote, setCreateNoteMode, hasCreatedNote, } = useGame();
    // Handle saving
    const handleSaveNote = (imageData) => {
        createNote(imageData);
    };
    // Handle closing
    const handleConsumeNote = () => {
        closeNoteModal();
    };
    // Handle writing a new note
    const handleWriteNote = () => {
        setCreateNoteMode(true);
    };
    // Hide the header when note is open
    useEffect(() => {
        const header = document.querySelector('.header');
        if (header) {
            if (isNoteModalOpen) {
                header.classList.add('hidden');
            }
            else {
                header.classList.remove('hidden');
            }
        }
        return () => {
            if (header) {
                header.classList.remove('hidden');
            }
        };
    }, [isNoteModalOpen]);
    if (!isNoteModalOpen)
        return null;
    return (_jsx("div", { className: "note-overlay", children: _jsxs("div", { className: "note-modal", children: [isCreateNoteMode && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "note-modal-header", children: [_jsx("h2", { className: "note-modal-title", children: "Leave a Note" }), _jsx("button", { className: "note-close-button", onClick: closeNoteModal, "aria-label": "Close", children: "\u00D7" })] }), _jsx(NoteCanvas, { onSave: handleSaveNote })] })), isViewNoteMode && (_jsx(NoteDisplay, { imageData: currentNote?.data, onClose: closeNoteModal, onConsume: currentNote ? handleConsumeNote : undefined, onWrite: !currentNote && !hasCreatedNote ? handleWriteNote : undefined }))] }) }));
}
