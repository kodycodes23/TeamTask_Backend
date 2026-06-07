import type { Task } from "../api.js";

export function TaskList({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return <p style={{ color: "#888" }}>No tasks.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={() => onToggle(task)}
          />
          <span
            style={{
              textDecoration: task.status === "done" ? "line-through" : "none",
              color: task.status === "done" ? "#999" : "#222",
            }}
          >
            {task.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
