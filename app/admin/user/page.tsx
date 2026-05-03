import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminUserPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      progress: {
        select: { score: true },
      },
    },
  })

  const SCORES = [0, 1, 2, 3, 4, 5]

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <header className="bg-white shadow-sm px-6 py-4">
        <Link href="/" className="text-lg font-bold text-blue-700">Vocab SMA</Link>
      </header>

      <main className="flex-1 px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">User List</h2>

        <div className="space-y-4">
          {users.map((user) => {
            const total = user.progress.length
            const scoreMap: Record<number, number> = {}
            for (const p of user.progress) {
              scoreMap[p.score] = (scoreMap[p.score] ?? 0) + 1
            }

            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <p className="font-semibold text-gray-800">{user.email}</p>
                  <p className="text-sm text-gray-400">
                    Last sign in:{" "}
                    {user.lastSignIn
                      ? user.lastSignIn.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
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
            )
          })}

          {users.length === 0 && (
            <p className="text-center text-gray-400 py-20">No users yet.</p>
          )}
        </div>
      </main>
    </div>
  )
}
