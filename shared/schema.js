import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const notes = sqliteTable("notes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    data: text("data").notNull(), // Base64 encoded black and white image data
    createdAt: integer("created_at", { mode: "timestamp" })
        .$defaultFn(() => new Date())
        .notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertNoteSchema = createInsertSchema(notes).pick({
    data: true,
});
