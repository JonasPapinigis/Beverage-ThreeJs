import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
// Create the SQLite db
const dbPath = path.join(dataDir, "database.db");
const sqlite = new Database(dbPath);
// Create a Drizzle inst
const db = drizzle(sqlite);
// check if a table exists
function tableExists(tableName) {
    const result = sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    return !!result;
}
// Function to create tables if they don't exist
async function createTablesIfNotExists() {
    console.log("Checking database tables...");
    if (!tableExists("users")) {
        console.log("Creating users table...");
        sqlite.exec(`
      CREATE TABLE "users" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL
      )
    `);
        console.log("Users table created.");
    }
    else {
        console.log("Users table already exists.");
    }
    if (!tableExists("notes")) {
        console.log("Creating notes table...");
        sqlite.exec(`
      CREATE TABLE "notes" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "data" TEXT NOT NULL,
        "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
        console.log("Notes table created.");
    }
    else {
        console.log("Notes table already exists.");
    }
    console.log("Database setup complete.");
}
// Run the migration
export async function runMigrations() {
    try {
        await createTablesIfNotExists();
        console.log("Migration completed successfully.");
    }
    catch (error) {
        console.error("Migration failed:", error);
        throw error;
    }
}
