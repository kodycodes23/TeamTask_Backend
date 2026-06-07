import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Schema. Note: tasks have no owner yet.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    assignee_id INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Lightweight migration for existing local DBs created before assignee support.
const taskColumns = db
  .prepare("PRAGMA table_info(tasks)")
  .all() as Array<{ name: string }>;

const hasAssigneeId = taskColumns.some((column) => column.name === "assignee_id");
if (!hasAssigneeId) {
  db.exec("ALTER TABLE tasks ADD COLUMN assignee_id INTEGER REFERENCES users(id)");
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  status: "open" | "done";
  assignee_id: number | null;
  created_at: string;
}
