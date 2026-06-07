import { Router } from "express";
import { db, type Task } from "../db.js";

export const tasksRouter = Router();

// GET /api/tasks?status=open&search=foo
tasksRouter.get("/", (req, res) => {
  const { status, search } = req.query;

  let sql = "SELECT id, title, status, created_at FROM tasks WHERE 1 = 1";
  const params: unknown[] = [];

  if (typeof status === "string" && status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (typeof search === "string" && search) {
    sql += " AND lower(title) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  sql += " ORDER BY created_at DESC, id DESC";

  const rows = db.prepare(sql).all(...params) as Task[];
  res.json(rows);
});

// POST /api/tasks  { title }
tasksRouter.post("/", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, status) VALUES (?, 'open')")
    .run(title);

  const created = db
    .prepare("SELECT id, title, status, created_at FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as Task;

  res.status(201).json(created);
});

// PATCH /api/tasks/:id  { status }
tasksRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;

  if (status !== "open" && status !== "done") {
    return res.status(400).json({ error: "status must be 'open' or 'done'" });
  }

  const result = db
    .prepare("UPDATE tasks SET status = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  const updated = db
    .prepare("SELECT id, title, status, created_at FROM tasks WHERE id = ?")
    .get(id) as Task;

  res.json(updated);
});
