"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export default function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-bold text-blue-700">Vocab SMA</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">{session?.user?.email}</span>
        {pathname === "/practice" && (
          <Link href="/stats" className="text-sm text-gray-500 hover:text-blue-600 transition">
            My Stats
          </Link>
        )}
        {pathname === "/stats" && (
          <Link href="/practice" className="text-sm text-gray-500 hover:text-blue-600 transition">
            Practice
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-red-500 transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
