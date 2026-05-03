import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AppHeader from "@/components/AppHeader"

export const dynamic = "force-dynamic"

export default async function StatsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: {
        select: { score: true, updatedAt: true },
      },
    },
  })

  if (!user) redirect("/login")

  const total = user.progress.length
  const lastActive = user.progress.reduce<Date | null>(
    (max, p) => (max === null || p.updatedAt > max ? p.updatedAt : max),
    null
  )
  const scoreMap: Record<number, number> = {}
  for (const p of user.progress) {
    scoreMap[p.score] = (scoreMap[p.score] ?? 0) + 1
  }

  const SCORES = [0, 1, 2, 3, 4, 5]

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">My Stats</h2>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <p className="font-semibold text-gray-800">{user.email}</p>
              <p className="text-sm text-gray-400">
                Last active:{" "}
                {lastActive
                  ? lastActive.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
                  : "Never"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total answered</p>
                <p className="text-2xl font-bold text-blue-600">{total}</p>
              </div>

              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Words by score</p>
                <div className="flex gap-2 flex-wrap">
                  {SCORES.map((s) => (
                    <div key={s} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">{s}</div>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                          scoreMap[s]
                            ? s <= 1
                              ? "bg-red-100 text-red-700"
                              : s <= 3
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {scoreMap[s] ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
