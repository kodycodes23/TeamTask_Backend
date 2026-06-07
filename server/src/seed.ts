import { db } from "./db.js";

// Wipe and reseed so re-running gives a clean slate.
db.exec("DELETE FROM tasks;");
db.exec("DELETE FROM users;");
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tasks','users');");

const users = [
  { name: "Ada Obi", email: "ada@example.com" },
  { name: "Bayo Tunde", email: "bayo@example.com" },
  { name: "Chioma Eze", email: "chioma@example.com" },
  { name: "Daniel Park", email: "daniel@example.com" },
];

const insertUser = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
for (const u of users) insertUser.run(u.name, u.email);

const tasks = [
  { title: "Set up CI pipeline", status: "open" },
  { title: "Write onboarding docs", status: "done" },
  { title: "Fix flaky login test", status: "open" },
  { title: "Review Q3 roadmap", status: "open" },
  { title: "Upgrade Node to LTS", status: "done" },
  { title: "Plan team offsite", status: "open" },
];

const insertTask = db.prepare("INSERT INTO tasks (title, status) VALUES (?, ?)");
for (const t of tasks) insertTask.run(t.title, t.status);

console.log(`Seeded ${users.length} users and ${tasks.length} tasks.`);
