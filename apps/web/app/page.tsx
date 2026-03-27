"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Tenant = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  tenantId: string;
  _count: {
    tasks: number;
  };
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  tenantId?: string,
) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response.json() as Promise<T>;
}

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [status, setStatus] = useState("Bootstrapping demo workspace...");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setBusy(true);
        await apiRequest("/demo/bootstrap", { method: "POST" });
        const tenantList = await apiRequest<Tenant[]>("/tenants");
        setTenants(tenantList);
        if (tenantList[0]) {
          setTenantId(tenantList[0].id);
        }
        setStatus(
          "Demo data ready. Switch workspace to confirm tenant isolation.",
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load demo",
        );
      } finally {
        setBusy(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      if (!tenantId) {
        setProjects([]);
        setProjectId("");
        return;
      }

      try {
        const projectList = await apiRequest<Project[]>(
          "/projects",
          undefined,
          tenantId,
        );
        setProjects(projectList);
        setProjectId((current) => {
          if (projectList.some((project) => project.id === current)) {
            return current;
          }

          return projectList[0]?.id ?? "";
        });
      } catch (projectError) {
        setError(
          projectError instanceof Error
            ? projectError.message
            : "Failed to load projects",
        );
      }
    };

    void loadProjects();
  }, [tenantId]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!tenantId || !projectId) {
        setTasks([]);
        return;
      }

      try {
        const taskList = await apiRequest<Task[]>(
          `/tasks/project/${projectId}`,
          undefined,
          tenantId,
        );
        setTasks(taskList);
      } catch (taskError) {
        setError(
          taskError instanceof Error
            ? taskError.message
            : "Failed to load tasks",
        );
      }
    };

    void loadTasks();
  }, [projectId, tenantId]);

  const handleToggleTask = async (taskId: string) => {
    if (!tenantId) {
      return;
    }

    try {
      const updatedTask = await apiRequest<Task>(
        `/tasks/${taskId}/toggle`,
        { method: "PATCH" },
        tenantId,
      );
      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update task",
      );
    }
  };

  const handleCreateTask = async () => {
    if (!tenantId || !projectId || !newTaskTitle.trim()) {
      return;
    }

    try {
      const createdTask = await apiRequest<Task>(
        "/tasks",
        {
          method: "POST",
          body: JSON.stringify({ title: newTaskTitle, projectId }),
        },
        tenantId,
      );

      setTasks((current) => [createdTask, ...current]);
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? { ...project, _count: { tasks: project._count.tasks + 1 } }
            : project,
        ),
      );
      setNewTaskTitle("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create task",
      );
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Simple real-world feature</p>
          <h1 className={styles.title}>Tenant-isolated project task tracker</h1>
          <p className={styles.subtitle}>
            Bootstrap demo workspaces, switch tenants, inspect projects, add
            tasks, and toggle completion without leaking data across tenants.
          </p>
        </section>

        <section className={styles.panelRow}>
          <div className={styles.panel}>
            <label className={styles.label} htmlFor="tenant">
              Workspace
            </label>
            <select
              id="tenant"
              className={styles.select}
              value={tenantId}
              onChange={(event) => {
                setTenantId(event.target.value);
                setError("");
              }}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <p className={styles.helper}>
              Every request is scoped by the selected tenant header.
            </p>
          </div>

          <div className={styles.panel}>
            <label className={styles.label} htmlFor="project">
              Project
            </label>
            <select
              id="project"
              className={styles.select}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              disabled={!projects.length}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project._count.tasks})
                </option>
              ))}
            </select>
            <p className={styles.helper}>{status}</p>
          </div>
        </section>

        <section className={styles.board}>
          <div className={styles.boardHeader}>
            <div>
              <p className={styles.sectionLabel}>Current project</p>
              <h2 className={styles.sectionTitle}>
                {activeProject?.name ?? "No project selected"}
              </h2>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{tasks.length}</span>
              <span className={styles.statLabel}>tasks</span>
            </div>
          </div>

          <div className={styles.composer}>
            <input
              className={styles.input}
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Add a task for this project"
            />
            <button
              className={styles.primaryButton}
              onClick={handleCreateTask}
              disabled={busy}
            >
              Add task
            </button>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.taskList}>
            {tasks.map((task) => (
              <button
                key={task.id}
                className={styles.taskCard}
                onClick={() => handleToggleTask(task.id)}
              >
                <span
                  className={
                    task.completed ? styles.taskCheckDone : styles.taskCheckOpen
                  }
                >
                  {task.completed ? "Done" : "Open"}
                </span>
                <span
                  className={
                    task.completed ? styles.taskTitleDone : styles.taskTitle
                  }
                >
                  {task.title}
                </span>
              </button>
            ))}
            {!tasks.length ? (
              <p className={styles.empty}>No tasks yet for this project.</p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
