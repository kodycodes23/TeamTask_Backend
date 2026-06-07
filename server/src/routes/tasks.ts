import { Router } from "express";
import { db, type Task } from "../db.js";

export const tasksRouter = Router();

interface TaskWithAssignee extends Task {
  assignee_name: string | null;
}

const TASK_SELECT = `
  SELECT
    t.id,
    t.title,
    t.status,
    t.assignee_id,
    t.created_at,
    u.name AS assignee_name
  FROM tasks t
  LEFT JOIN users u ON u.id = t.assignee_id
`;

// GET /api/tasks?status=open&search=foo&assigneeId=2|unassigned
tasksRouter.get("/", (req, res) => {
  const { status, search, assigneeId } = req.query;

  let sql = `${TASK_SELECT} WHERE 1 = 1`;
  const params: unknown[] = [];

  if (typeof status === "string" && status) {
    sql += " AND t.status = ?";
    params.push(status);
  }

  if (typeof search === "string" && search) {
    sql += " AND lower(t.title) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (typeof assigneeId === "string" && assigneeId) {
    if (assigneeId === "unassigned") {
      sql += " AND t.assignee_id IS NULL";
    } else {
      const parsedAssigneeId = Number(assigneeId);
      if (!Number.isInteger(parsedAssigneeId) || parsedAssigneeId <= 0) {
        return res
          .status(400)
          .json({ error: "assigneeId must be a positive integer or 'unassigned'" });
      }

      sql += " AND t.assignee_id = ?";
      params.push(parsedAssigneeId);
    }
  }

  sql += " ORDER BY t.created_at DESC, t.id DESC";

  const rows = db.prepare(sql).all(...params) as TaskWithAssignee[];
  res.json(rows);
});

// POST /api/tasks  { title, assigneeId? }
tasksRouter.post("/", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  const rawAssigneeId = req.body?.assigneeId;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  let assigneeId: number | null = null;
  if (rawAssigneeId !== undefined && rawAssigneeId !== null && rawAssigneeId !== "") {
    const parsedAssigneeId = Number(rawAssigneeId);
    if (!Number.isInteger(parsedAssigneeId) || parsedAssigneeId <= 0) {
      return res
        .status(400)
        .json({ error: "assigneeId must be a positive integer" });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(parsedAssigneeId) as { id: number } | undefined;

    if (!existingUser) {
      return res.status(400).json({ error: "assigneeId does not match an existing user" });
    }

    assigneeId = parsedAssigneeId;
  }

  const result = db
    .prepare("INSERT INTO tasks (title, status, assignee_id) VALUES (?, 'open', ?)")
    .run(title, assigneeId);

  const created = db
    .prepare(`${TASK_SELECT} WHERE t.id = ?`)
    .get(result.lastInsertRowid) as TaskWithAssignee;

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
    .prepare(`${TASK_SELECT} WHERE t.id = ?`)
    .get(id) as TaskWithAssignee;

  res.json(updated);
});
