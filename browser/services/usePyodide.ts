import { useEffect, useRef, useState } from "react";

type TestCase = { name: string; input: string; output: string };
type TestResult = {
  name: string;
  status: "PASS" | "FAIL";
  expected: string;
  actual: string;
  duration: number;
};

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/";

export function usePyodide() {
  const pyodideRef = useRef<any>(null);
  const [status, setStatus] = useState("Loading Python...");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (pyodideRef.current) return;
      setStatus("Loading Python runtime...");
      const pyodide = await (window as any).loadPyodide({ indexURL: PYODIDE_URL });
      if (!active) return;
      pyodideRef.current = pyodide;
      setStatus("Python ready");
      setReady(true);
    };

    if (!(window as any).loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.async = true;
      script.onload = load;
      document.body.appendChild(script);
    } else {
      load();
    }

    return () => {
      active = false;
    };
  }, []);

  const runTests = async (code: string, tests: TestCase[]): Promise<TestResult[]> => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return [];
    setStatus("Running tests...");
    setReady(false);
    const results: TestResult[] = [];

    for (const test of tests) {
      const t0 = performance.now();
      let statusValue: TestResult["status"] = "FAIL";
      let actual = "";
      try {
        pyodide.globals.set("__input_data__", test.input);
        pyodide.globals.set("__user_code__", code);
        const runner = `
import sys
import io

sys.stdin = io.StringIO(__input_data__)
_stdout = io.StringIO()
sys.stdout = _stdout

globals_dict = {}
exec(__user_code__, globals_dict)

sys.stdout = sys.__stdout__
result = _stdout.getvalue().strip()
`;
        await pyodide.runPythonAsync(runner);
        actual = pyodide.globals.get("result");
        const expected = test.output.trim();
        statusValue = actual === expected ? "PASS" : "FAIL";
      } catch (err) {
        actual = String(err);
        statusValue = "FAIL";
      }
      const t1 = performance.now();
      results.push({
        name: test.name,
        status: statusValue,
        expected: test.output.trim(),
        actual,
        duration: Math.round(t1 - t0),
      });
    }

    setStatus("Python ready");
    setReady(true);
    return results;
  };

  return { status, ready, runTests };
}
