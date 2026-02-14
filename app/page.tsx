'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import BookmarkList from '@/ui/bookmarkList'
import AddBookmark from '@/ui/addBookmark'
import {
  LogOut,
  Bookmark,
  ShieldCheck,
  Sparkles,
  Compass,
  LayoutDashboard
} from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) console.error('Error signing in:', error.message)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing ReMarkable...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-xl w-full">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_-12px_rgba(14,165,233,0.4)] transform hover:scale-105 transition-transform duration-500">
                <Bookmark className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
                ReMarkable
              </h1>

              <p className="text-slate-500 text-xl mb-12 max-w-sm mx-auto leading-relaxed">
                Streamline your digital world with effortless bookmarking.
              </p>

              <button
                onClick={handleSignIn}
                className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl hover:shadow-slate-200"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 p-0.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.273 0 3.191 2.69 1.145 6.655l4.121 3.11z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.04 18.013c-1.09.37-2.27.57-3.51.57-2.81 0-5.26-1.55-6.55-3.84L1.87 17.84C3.91 21.84 8.08 24 12.53 24c3.05 0 5.86-1.01 8.08-2.73l-4.57-3.257z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.275c0-.84-.075-1.641-.215-2.4H12.53v4.54h6.16c-.265 1.43-1.07 2.64-2.28 3.45l4.57 3.25c2.67-2.46 4.21-6.08 4.21-10.12z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.98 14.743c-.22-.67-.35-1.38-.35-2.12s.13-1.45.35-2.12l-4.12-3.11C1.29 8.87.89 10.39.89 12c0 1.61.4 3.13.97 4.54l4.12-3.797z"
                    />
                  </svg>
                </div>
                <span>Continue with Google</span>
              </button>

              <div className="mt-12 flex items-center justify-center gap-8 text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Smart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">ReMarkable</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user.email?.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold p-3 rounded-xl transition-all duration-300"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <AddBookmark userId={user.id} />

          </div>

          {/* Main Area */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900 rounded-[2rem] p-6 mb-8 text-white relative overflow-hidden group">
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <Compass className="w-6 h-6 text-primary-400 group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Did you know?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    You can organize your library by giving specific names to your bookmarks.
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <LayoutDashboard className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
            </div>
            <BookmarkList userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}