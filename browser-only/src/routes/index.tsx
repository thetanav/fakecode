import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { problems } from "../data/problems";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (problems.length > 0) {
      navigate({ to: "/problems/$problemId", params: { problemId: problems[0].id } });
    }
  }, [navigate]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
        <h1 className="text-2xl font-semibold">Select a problem</h1>
        <p className="mt-3 text-sm text-slate-300">
          Choose from the problem list to start coding.
        </p>
      </div>
    </main>
  );
}
