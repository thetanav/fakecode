import { useEffect, useRef } from "react"

const MONACO_URL = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs"

type MonacoEditorProps = {
  value: string
  onChange: (value: string) => void
}

export function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (!(window as any).require) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src =
            "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"
          script.async = true
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      if (cancelled) return
      ;(window as any).require.config({ paths: { vs: MONACO_URL } })
      ;(window as any).require(["vs/editor/editor.main"], () => {
        if (cancelled || !containerRef.current) return
        editorRef.current = (window as any).monaco.editor.create(
          containerRef.current,
          {
            value,
            language: "python",
            theme: "vs-dark",
            fontFamily: "IBM Plex Mono",
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }
        )
        editorRef.current.onDidChangeModelContent(() => {
          onChange(editorRef.current.getValue())
        })
      })
    }

    init()

    return () => {
      cancelled = true
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value)
    }
  }, [value])

  return (
    <div
      className="h-[600px] w-full overflow-hidden rounded-md border border-white/10"
      ref={containerRef}
    />
  )
}
