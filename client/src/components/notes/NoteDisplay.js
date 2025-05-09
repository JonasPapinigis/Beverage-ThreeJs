import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useGame } from "../../lib/stores/useGame.js";
export function NoteDisplay({ imageData, onClose, onConsume, onWrite }) {
    // Check if we're in empty state
    const isEmpty = !imageData;
    // Has user created note
    const { hasCreatedNote } = useGame();
    return (_jsxs("div", { className: "note-display-wrapper", children: [_jsxs("div", { className: "note-modal-header", children: [_jsx("h2", { className: "note-modal-title", children: isEmpty ? "Message Board" : "Someone Left a Note" }), _jsx("button", { className: "note-close-button", onClick: onClose, "aria-label": "Close", children: "\u00D7" })] }), isEmpty ? (_jsx("div", { className: "note-empty-state", children: hasCreatedNote ? (_jsx("p", { children: "You've already left a note today. Come back tomorrow!" })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: "Looks like there's nothing here. Leave a note?" }), onWrite && (_jsx("button", { className: "note-button note-write-button", onClick: onWrite, children: "Write a Note" }))] })) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "note-display", children: _jsx("img", { src: imageData, alt: "Note", className: "note-image" }) }), _jsx("div", { className: "note-actions", children: onConsume ? (_jsx("button", { className: "note-button note-submit-button", onClick: () => {
                                onConsume();
                                onClose();
                            }, style: { width: '100%' }, children: "Close" })) : (_jsx("button", { className: "note-button note-cancel-button", onClick: onClose, style: { width: '100%' }, children: "Close" })) })] }))] }));
}
