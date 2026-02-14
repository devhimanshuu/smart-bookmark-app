'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Link as LinkIcon, Type, Sparkles } from 'lucide-react'

interface AddBookmarkProps {
    userId: string
}

export default function AddBookmark({ userId }: AddBookmarkProps) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !url.trim()) return

        setLoading(true)

        try {
            const { error } = await supabase.from('bookmarks').insert([
                {
                    user_id: userId,
                    title: title.trim(),
                    url: url.trim(),
                },
            ])

            if (error) throw error
            setTitle('')
            setUrl('')
        } catch (error: any) {
            console.error('Error:', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden sticky top-28">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <Plus className="w-5 h-5 text-primary-600" />
                        </div>
                        Quick Add
                    </h2>
                    <Sparkles className="w-5 h-5 text-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <Type className="w-3 h-3" />
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Awesome Article"
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <LinkIcon className="w-3 h-3" />
                            Reference URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !title || !url}
                        className="group w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-primary-200 disabled:shadow-none flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                        <span className="relative z-10">
                            {loading ? 'Processing...' : 'Securely Save'}
                        </span>
                        {!loading && <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500 relative z-10" />}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </form>
            </div>
        </div>
    )
}
