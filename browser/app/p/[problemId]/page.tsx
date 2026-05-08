"use client"

import { ProblemMarkdown } from "@/components/markdown"
import { MonacoEditor } from "@/components/MonacoEditor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { problems } from "@/data/problems"
import { usePyodide } from "@/services/usePyodide"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Editor from "@monaco-editor/react"

type TestResult = {
  name: string
  status: "PASS" | "FAIL"
  expected: string
  actual: string
  duration: number
}

export default function Page() {
  const { problemId } = useParams()
  const problem = useMemo(
    () => problems.find((p) => p.id === problemId),
    [problemId]
  )
  const [code, setCode] = useState(problem?.starterCode ?? "")
  const [results, setResults] = useState<TestResult[]>([])
  const { status, ready, runTests } = usePyodide()

  useEffect(() => {
    const el = document.getElementById("pyodide-status")
    if (!el) return
    el.textContent = status
    el.className =
      "rounded-full border px-3 py-1 text-xs " +
      (ready
        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
        : "border-white/20 bg-white/10 text-slate-200")
  }, [status, ready])

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
    )
  }

  const onRun = async () => {
    const output = await runTests(code, problem.tests)
    setResults(output)
  }

  return (
    <main className="mx-auto w-full max-w-6xl gap-3 px-6 py-10">
      <section className="space-y-6">
        <Card className="border-0 bg-transparent p-0 ring-0">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <p className="mt-2 text-sm text-slate-300">
                {problem.difficulty} · Time limit {problem.timeLimit}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ProblemMarkdown content={problem.description} />
          </CardContent>
        </Card>

        <div className="flex h-[500px] w-full flex-col items-end gap-2">
          <Button onClick={onRun} variant="ghost" disabled={!ready}>
            Run Tests
          </Button>
          {/*<MonacoEditor value={code} onChange={setCode} />*/}
          <div className="h-full w-full overflow-hidden rounded-lg border border-white/10">
            <Editor
              options={{
                fontSize: 16,
                fontFamily: "Geist Mono, monospace",
                padding: { top: 16, bottom: 16 },
              }}
              theme={"vs-dark"}
              className="font-mono"
              language={"python"}
              value={code}
              onChange={(value) => setCode(value!)}
            />
          </div>
        </div>
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsView results={results} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function ResultsView({ results }: { results: TestResult[] }) {
  if (!results.length) {
    return (
      <div className="text-sm text-slate-400">Run tests to see results.</div>
    )
  }
  const passed = results.filter((r) => r.status === "PASS").length
  const failed = results.length - passed
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
                <div className="font-semibold">
                  Case {index + 1}: {res.name}
                </div>
                <Badge
                  variant={res.status === "PASS" ? "default" : "destructive"}
                >
                  {res.status}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-neutral-300">
                Expected: {res.expected} | Got: {res.actual}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
