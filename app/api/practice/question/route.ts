import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const words = await prisma.vocabWord.findMany({
    include: {
      sentences: true,
      progress: { where: { userId } },
    },
  })

  const wordsWithSentences = words.filter((w) => w.sentences.length > 0)

  if (wordsWithSentences.length === 0) {
    return NextResponse.json({ error: "Belum ada soal tersedia." }, { status: 404 })
  }

  // Weighted random selection: score 0 → weight 6, score 5 → weight 1
  // Lower score = higher chance of appearing
  const weights = wordsWithSentences.map((w) => {
    const score = w.progress[0]?.score ?? 0
    return 6 - score
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let rand = Math.random() * totalWeight
  let selected = wordsWithSentences[0]

  for (let i = 0; i < wordsWithSentences.length; i++) {
    rand -= weights[i]
    if (rand <= 0) {
      selected = wordsWithSentences[i]
      break
    }
  }

  const sentence = selected.sentences[Math.floor(Math.random() * selected.sentences.length)]

  return NextResponse.json({
    wordId: selected.id,
    sentenceId: sentence.id,
    // sentence text uses [[word]] to mark the target word
    sentence: sentence.text,
    englishWord: selected.englishWord,
    indonesianMeaning: selected.indonesianMeaning,
    score: selected.progress[0]?.score ?? 0,
  })
}
