import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { wordId, correct } = await req.json()

  if (!wordId || typeof correct !== "boolean") {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 })
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_wordId: { userId, wordId } },
  })

  const currentScore = existing?.score ?? 0
  const newScore = correct
    ? Math.min(5, currentScore + 1)
    : Math.max(0, currentScore - 1)

  await prisma.userProgress.upsert({
    where: { userId_wordId: { userId, wordId } },
    create: { userId, wordId, score: newScore },
    update: { score: newScore },
  })

  return NextResponse.json({ newScore })
}
