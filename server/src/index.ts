import express from "express";
import cors from "cors";
import { tasksRouter } from "./routes/tasks.js";
import { usersRouter } from "./routes/users.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`TeamTasks API running on http://localhost:${PORT}`);
});
