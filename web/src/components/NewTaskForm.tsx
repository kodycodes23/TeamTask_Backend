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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createTask(trimmedTitle, assigneeId ? Number(assigneeId) : null);
      setTitle("");
      setAssigneeId("");
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        disabled={isSubmitting}
        style={{ flex: 1, padding: 8 }}
      />
      <select
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        disabled={isSubmitting}
        style={{ padding: 8 }}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={String(user.id)}>
            {user.name}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting || !title.trim()} style={{ padding: "8px 16px" }}>
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
