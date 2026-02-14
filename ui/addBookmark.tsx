'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Link as LinkIcon, Type, Sparkles, Tag, Image as ImageIcon } from 'lucide-react'

interface AddBookmarkProps {
    userId: string
}

export default function AddBookmark({ userId }: AddBookmarkProps) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [tags, setTags] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetchingMetadata, setFetchingMetadata] = useState(false)
    const [metadata, setMetadata] = useState<{ description?: string, image?: string }>({})

    // Auto-fetch metadata when URL looks valid
    useEffect(() => {
        const fetchMeta = async () => {
            if (url.length > 10 && (url.startsWith('http://') || url.startsWith('https://'))) {
                setFetchingMetadata(true)
                try {
                    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
                    const data = await res.json()
                    if (!data.error) {
                        if (!title) setTitle(data.title)
                        setMetadata({ description: data.description, image: data.image })
                    }
                } catch (e) {
                    console.error('Meta fetch failed', e)
                } finally {
                    setFetchingMetadata(false)
                }
            }
        }
        const timer = setTimeout(fetchMeta, 1000)
        return () => clearTimeout(timer)
    }, [url])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !url.trim()) return
        setLoading(true)

        const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')

        try {
            const { error } = await supabase.from('bookmarks').insert([
                {
                    user_id: userId,
                    title: title.trim(),
                    url: url.trim(),
                    description: metadata.description || '',
                    image_url: metadata.image || '',
                    tags: tagList,
                    is_pinned: false
                },
            ])

            if (error) throw error
            setTitle('')
            setUrl('')
            setTags('')
            setMetadata({})
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
                    {fetchingMetadata ? (
                        <div className="animate-spin text-primary-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    ) : (
                        <Sparkles className="w-5 h-5 text-slate-200" />
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <Type className="w-3 h-3" />
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={fetchingMetadata ? "Fetching..." : "e.g. Awesome Article"}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <Tag className="w-3 h-3" />
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="tech, work, design"
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-300"
                            disabled={loading}
                        />
                    </div>

                    {metadata.image && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                            <img src={metadata.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="text-white w-8 h-8" />
                            </div>
                        </div>
                    )}

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
