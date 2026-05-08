import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"

export function ProblemMarkdown({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-6 mb-4 text-2xl font-semibold text-neutral-100">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-5 mb-3 text-xl font-semibold text-neutral-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-2 text-lg font-semibold text-neutral-200">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-sm leading-relaxed text-neutral-300">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 list-disc pl-6 text-sm text-neutral-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 list-decimal pl-6 text-sm text-neutral-300">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ className, children, ...props }) => (
          <code {...props} className={"font-mono " + className}>
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-4 overflow-x-auto rounded-lg border border-neutral-700 bg-neutral-900 p-4 font-mono text-sm">
            {children}
          </pre>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-neutral-300 italic">{children}</em>
        ),
      }}
    >
      {content}
    </Markdown>
  )
}
