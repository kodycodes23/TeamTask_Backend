import { useCallback, useEffect, useState } from "react";
import { fetchTasks, fetchUsers, setTaskStatus, type Task, type User } from "./api.js";
import { TaskList } from "./components/TaskList.js";
import { NewTaskForm } from "./components/NewTaskForm.js";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const load = useCallback(() => {
    const assigneeId =
      assigneeFilter === ""
        ? undefined
        : assigneeFilter === "unassigned"
          ? "unassigned"
          : Number(assigneeFilter);

    fetchTasks({ status, search, assigneeId }).then(setTasks);
  }, [status, search, assigneeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  async function handleToggle(task: Task) {
    await setTaskStatus(task.id, task.status === "done" ? "open" : "done");
    load();
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif", padding: "0 16px" }}>
      <h1>TeamTasks</h1>

      <NewTaskForm users={users} onCreated={load} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ flex: 1, padding: 8 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8 }}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={String(user.id)}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <TaskList tasks={tasks} onToggle={handleToggle} />
    </div>
  );
}
