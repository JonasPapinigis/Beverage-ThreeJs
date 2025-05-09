import { users, notes } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, "database.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);
export class DbStorage {
    async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
    }
    async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
    }
    async createUser(insertUser) {
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
    }
    async getNoteById(id) {
        const result = await db.select().from(notes).where(eq(notes.id, id));
        return result[0];
    }
    async getRandomNote() {
        const allNotes = await db.select().from(notes);
        if (allNotes.length === 0) {
            return undefined;
        }
        // Get a random note
        const randomIndex = Math.floor(Math.random() * allNotes.length);
        return allNotes[randomIndex];
    }
    async createNote(note) {
        const result = await db.insert(notes).values(note).returning();
        return result[0];
    }
    async deleteNote(id) {
        const result = await db.delete(notes).where(eq(notes.id, id)).returning();
        return result.length > 0;
    }
    async getAllNotes() {
        return await db.select().from(notes);
    }
}
export class MemStorage {
    constructor() {
        this.usersMap = new Map();
        this.notesMap = new Map();
        this.currentUserId = 1;
        this.currentNoteId = 1;
    }
    async getUser(id) {
        return this.usersMap.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.usersMap.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = { ...insertUser, id };
        this.usersMap.set(id, user);
        return user;
    }
    async getNoteById(id) {
        return this.notesMap.get(id);
    }
    async getRandomNote() {
        const notes = Array.from(this.notesMap.values());
        if (notes.length === 0) {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * notes.length);
        return notes[randomIndex];
    }
    async createNote(insertNote) {
        const id = this.currentNoteId++;
        const now = new Date();
        const note = {
            ...insertNote,
            id,
            createdAt: now
        };
        this.notesMap.set(id, note);
        return note;
    }
    async deleteNote(id) {
        return this.notesMap.delete(id);
    }
    async getAllNotes() {
        return Array.from(this.notesMap.values());
    }
}
// Export the database storage instance
export const storage = new DbStorage();
