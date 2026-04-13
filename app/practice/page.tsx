"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"

interface Question {
  wordId: string
  sentenceId: string
  sentence: string
  englishWord: string
  indonesianMeaning: string
  score: number
}

// Renders sentence text, turning [[word]] into bold + underlined span
function SentenceDisplay({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/)
  return (
    <p className="text-xl leading-relaxed text-gray-800">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-bold underline decoration-blue-500 decoration-2">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full border-2 ${
            i < score ? "bg-blue-500 border-blue-500" : "border-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function PracticePage() {
  const { data: session } = useSession()
  const [question, setQuestion] = useState<Question | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Holds an in-flight prefetch Promise so fetchQuestion can consume it
  // instead of firing a second network request.
  const prefetchRef = useRef<Promise<Question | null> | null>(null)

  const fetchQuestion = useCallback(async () => {
    // Grab and clear whatever prefetch is pending
    const prefetch = prefetchRef.current
    prefetchRef.current = null

    if (prefetch) {
      const next = await prefetch
      if (next) {
        // All updates in one synchronous block → single React render, no loading flash
        setQuestion(next)
        setRevealed(false)
        setError("")
        setLoading(false)
        return
      }
      // Prefetch failed — fall through to a fresh fetch below
    }

    setLoading(true)
    setRevealed(false)
    setError("")

    const res = await fetch("/api/practice/question")
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Gagal memuat soal.")
      setLoading(false)
      return
    }

    const data: Question = await res.json()
    setQuestion(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  function handleReveal() {
    setRevealed(true)
    // Start prefetching the next question while the user reads the answer.
    // By the time they tap Sudah/Belum Hafal the fetch will already be resolved.
    prefetchRef.current = fetch("/api/practice/question")
      .then((res) => (res.ok ? (res.json() as Promise<Question>) : null))
      .catch(() => null)
  }

  function handleAnswer(correct: boolean) {
    if (!question) return

    // Fire-and-forget — saving progress doesn't block the UI
    fetch("/api/practice/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: question.wordId, correct }),
    }).catch(() => {})

    // Prefetch is already resolved by now → next question appears instantly
    fetchQuestion()
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-700">Vocab SMA</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {loading && (
            <div className="text-center text-gray-400 text-sm">Memuat soal...</div>
          )}

          {!loading && error && (
            <div className="text-center">
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchQuestion}
                className="text-sm text-blue-600 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && question && (
            <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              {/* Score dots */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Progress kata ini
                </span>
                <ScoreDots score={question.score} />
              </div>

              {/* Instruction */}
              <p className="text-sm text-gray-500">
                Apa arti kata yang <span className="font-bold underline">digarisbawahi</span> dalam Bahasa Indonesia?
              </p>

              {/* Sentence */}
              <div className="bg-blue-50 rounded-xl px-6 py-5">
                <SentenceDisplay text={question.sentence} />
              </div>

              {/* Reveal or Answer buttons */}
              {!revealed ? (
                <button
                  onClick={handleReveal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition"
                >
                  Lihat Jawaban
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Answer reveal */}
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Artinya</p>
                    <p className="text-2xl font-bold text-blue-700">{question.indonesianMeaning}</p>
                  </div>

                  {/* Self-assessment buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl py-3 transition"
                    >
                      Belum Hafal
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl py-3 transition"
                    >
                      Sudah Hafal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
