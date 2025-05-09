import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
export function NoteCanvas({ onSave }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    // Initialise context
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            // Set canvas to fill container
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                setContext(ctx);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && context) {
                // Save current drawing
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvasRef.current.width;
                tempCanvas.height = canvasRef.current.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                    tempCtx.drawImage(canvasRef.current, 0, 0);
                }
                // Resize canvas
                canvasRef.current.width = canvasRef.current.offsetWidth;
                canvasRef.current.height = canvasRef.current.offsetHeight;
                context.strokeStyle = "#000000";
                context.lineWidth = 3;
                context.lineCap = "round";
                context.lineJoin = "round";
                // Restore background
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // Restore previous drawing
                context.drawImage(tempCanvas, 0, 0);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [context]);
    // Event handlers for drawing
    const startDrawing = (e) => {
        if (!context)
            return;
        setIsDrawing(true);
        // Get position
        let clientX, clientY;
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const rect = canvasRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        // Start a new path
        context.beginPath();
        context.moveTo(x, y);
        setLastPosition({ x, y });
    };
    const draw = (e) => {
        if (!isDrawing || !context)
            return;
        // Prevent scrolling on touch devices
        if ("touches" in e) {
            e.preventDefault();
        }
        // Get position
        let clientX, clientY;
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const rect = canvasRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        // Continue path
        context.lineTo(x, y);
        context.stroke();
        setLastPosition({ x, y });
    };
    const stopDrawing = () => {
        if (!isDrawing || !context)
            return;
        context.closePath();
        setIsDrawing(false);
    };
    // Clear canvas
    const clearCanvas = () => {
        if (!context || !canvasRef.current)
            return;
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    // Save the canvas data
    const saveDrawing = () => {
        if (!canvasRef.current)
            return;
        // Convert to monochrome by processing the image data
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx)
            return;
        // Set same dimensions
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        // Draw original image to temp canvas
        tempCtx.drawImage(canvasRef.current, 0, 0);
        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        // Convert to black and white
        for (let i = 0; i < data.length; i += 4) {
            // thresholding - if pixel is more dark than light, make it black
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const color = avg < 200 ? 0 : 255; // threshold
            data[i] = color;
            data[i + 1] = color;
            data[i + 2] = color;
            // Keep alpha same
        }
        tempCtx.putImageData(imageData, 0, 0);
        // Get base64 rep.
        const base64Image = tempCanvas.toDataURL("image/png");
        onSave(base64Image);
    };
    return (_jsxs("div", { className: "note-drawing", children: [_jsx("div", { className: "note-canvas-container", children: _jsx("canvas", { ref: canvasRef, className: "note-canvas", onMouseDown: startDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onMouseLeave: stopDrawing, onTouchStart: startDrawing, onTouchMove: draw, onTouchEnd: stopDrawing }) }), _jsxs("div", { className: "note-actions", children: [_jsx("button", { className: "note-button note-cancel-button", onClick: clearCanvas, children: "Clear" }), _jsx("button", { className: "note-button note-submit-button", onClick: saveDrawing, children: "Submit Note" })] })] }));
}
