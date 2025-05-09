import { createServer } from "http";
import { storage } from "./storage.js";
import { insertNoteSchema } from "../shared/schema.js";
import { log } from "./vite.js";
/**
 * Routes for the note API
 */
export async function registerRoutes(app) {
    // Get random note
    app.get("/api/notes/random", async (req, res) => {
        try {
            const note = await storage.getRandomNote();
            if (!note) {
                return res.status(404).json({
                    error: "No notes available"
                });
            }
            res.json(note);
        }
        catch (error) {
            log(`Error getting random note: ${error}`, "routes");
            res.status(500).json({
                error: "Failed to get random note"
            });
        }
    });
    // Create new note
    app.post("/api/notes", async (req, res) => {
        try {
            // Validate input with Zod schema
            const validatedData = insertNoteSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({
                    error: "Invalid note data",
                    details: validatedData.error.format()
                });
            }
            // Create the note
            const newNote = await storage.createNote(validatedData.data);
            res.status(201).json(newNote);
        }
        catch (error) {
            log(`Error creating note: ${error}`, "routes");
            res.status(500).json({
                error: "Failed to create note"
            });
        }
    });
    // Delete a note after viewing
    app.delete("/api/notes/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({
                    error: "Invalid note ID"
                });
            }
            const success = await storage.deleteNote(id);
            if (!success) {
                return res.status(404).json({
                    error: "Note not found"
                });
            }
            res.json({ success: true });
        }
        catch (error) {
            log(`Error deleting note: ${error}`, "routes");
            res.status(500).json({
                error: "Failed to delete note"
            });
        }
    });
    // Get all notes (for debugging)
    app.get("/api/notes", async (req, res) => {
        try {
            const notes = await storage.getAllNotes();
            res.json(notes);
        }
        catch (error) {
            log(`Error getting all notes: ${error}`, "routes");
            res.status(500).json({
                error: "Failed to get notes"
            });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
