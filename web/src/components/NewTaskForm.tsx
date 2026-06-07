import { useState } from "react";
import { createTask, type User } from "../api.js";

export function NewTaskForm({
  users,
  onCreated,
}: {
  users: User[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim(), assigneeId ? Number(assigneeId) : null);
    setTitle("");
    setAssigneeId("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        style={{ flex: 1, padding: 8 }}
      />
      <select
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        style={{ padding: 8 }}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={String(user.id)}>
            {user.name}
          </option>
        ))}
      </select>
      <button type="submit" style={{ padding: "8px 16px" }}>
        Add
      </button>
    </form>
  );
}
