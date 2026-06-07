import { useState } from "react";
import { createTask } from "../api.js";

export function NewTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim());
    setTitle("");
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
      <button type="submit" style={{ padding: "8px 16px" }}>
        Add
      </button>
    </form>
  );
}
