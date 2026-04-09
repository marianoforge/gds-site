"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type BackofficeLoginFormProps = {
  redirectTo: string;
};

export default function BackofficeLoginForm({ redirectTo }: BackofficeLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/backoffice/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "No se pudo iniciar sesión");
        return;
      }
      router.replace(redirectTo);
    } catch {
      setError("No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <h1 className="mb-2 text-2xl font-bold text-foreground">Backoffice</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Ingresá usuario y clave para gestionar destacadas.
      </p>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-foreground">Usuario</span>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
      </label>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-foreground">Clave</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
      </label>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
