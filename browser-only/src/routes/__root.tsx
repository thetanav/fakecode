import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Toaster } from "../components/ui/toaster";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-[0.2em] uppercase">
            PyDoid Judge
          </Link>
          <div id="pyodide-status" className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
            Loading Python...
          </div>
        </div>
      </header>
      <Outlet />
      <Toaster />
    </div>
  );
}
