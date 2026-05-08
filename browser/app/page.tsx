"use client"

import { problems } from "@/data/problems"
import Link from "next/link"

export default function IndexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
        <h1 className="text-2xl font-semibold">Select a problem</h1>
        <p className="mt-3 text-sm text-slate-300">
          Choose from the problem list to start coding.
        </p>

        <ul>
          {problems.map((pb) => (
            <li key={pb.id}>
              <Link href={`/p/${pb.id}`}>{pb.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
