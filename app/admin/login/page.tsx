"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })
    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-bold tracking-widest text-white uppercase">
            TROJAN
          </p>
          <p className="text-xs tracking-[0.25em] text-[#B4B4B4] uppercase mt-1">
            Staff Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-[#B4B4B4] mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-[#B4B4B4] mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-colors"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8FF00] text-[#121212] py-2.5 rounded-lg font-semibold text-sm tracking-wide hover:bg-[#b3e600] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
