import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { problems } from "../data/problems";
import { MonacoEditor } from "../ui/MonacoEditor";
import { usePyodide } from "../services/usePyodide";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";

type TestResult = {
  name: string;
  status: "PASS" | "FAIL";
  expected: string;
  actual: string;
  duration: number;
};

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

function ProblemPage() {
  const { problemId } = Route.useParams();
  const problem = useMemo(() => problems.find((p) => p.id === problemId), [problemId]);
  const [code, setCode] = useState(problem?.starterCode ?? "");
  const [results, setResults] = useState<TestResult[]>([]);
  const { status, ready, runTests } = usePyodide();

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode);
      setResults([]);
    }
  }, [problemId, problem]);

  useEffect(() => {
    const el = document.getElementById("pyodide-status");
    if (!el) return;
    el.textContent = status;
    el.className =
      "rounded-full border px-3 py-1 text-xs " +
      (ready
        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
        : "border-white/20 bg-white/10 text-slate-200");
  }, [status, ready]);

  if (!problem) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle>Problem not found</CardTitle>
          </CardHeader>
          <CardContent>Choose another problem.</CardContent>
        </Card>
      </main>
    );
  }

  const onRun = async () => {
    const output = await runTests(code, problem.tests);
    setResults(output);
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Problems
        </div>
        <div className="space-y-3">
          {problems.map((item) => (
            <Link
              key={item.id}
              to="/problems/$problemId"
              params={{ problemId: item.id }}
              className={`block rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${
                item.id === problemId
                  ? "border-emerald-400/50 bg-emerald-500/10"
                  : "border-white/10 bg-slate-900/60"
              }`}
            >
              <div className="text-sm font-semibold text-slate-50">{item.title}</div>
              <div className="text-xs text-slate-400">{item.difficulty} · {item.timeLimit}</div>
            </Link>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <p className="mt-2 text-sm text-slate-300">
                {problem.difficulty} · Time limit {problem.timeLimit}
              </p>
            </div>
            <Button onClick={onRun} disabled={!ready} className="rounded-full">
              Run Tests
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatDescription(problem.description) }} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-300">Your Code</CardTitle>
          </CardHeader>
          <CardContent>
            <MonacoEditor value={code} onChange={setCode} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-300">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsView results={results} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ResultsView({ results }: { results: TestResult[] }) {
  if (!results.length) {
    return <div className="text-sm text-slate-400">Run tests to see results.</div>;
  }
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.length - passed;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">{passed} passed</Badge>
        <Badge variant="secondary">{failed} failed</Badge>
        <Badge variant="secondary">{results.length} total</Badge>
      </div>
      <ScrollArea className="h-[260px]">
        <div className="space-y-3 pr-3">
          {results.map((res, index) => (
            <div
              key={res.name}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                res.status === "PASS"
                  ? "border-emerald-400/50 bg-emerald-500/10"
                  : "border-rose-400/40 bg-rose-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">Case {index + 1}: {res.name}</div>
                <Badge variant={res.status === "PASS" ? "default" : "destructive"}>{res.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-slate-300">
                Expected: {res.expected} | Got: {res.actual}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatDescription(text: string) {
  return text
    .split("\n\n")
    .map((para) => `<p>${para.replace(/\n/g, "<br />")}</p>`)
    .join("");
}
