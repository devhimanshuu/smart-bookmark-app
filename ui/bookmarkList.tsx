'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Trash2,
    ExternalLink,
    Clock,
    Globe,
    Search,
    Inbox,
    ArrowUpRight
} from 'lucide-react'

interface Bookmark {
    id: string
    title: string
    url: string
    created_at: string
}

interface BookmarkListProps {
    userId: string
}

export default function BookmarkList({ userId }: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBookmarks()

        const channel = supabase
            .channel('bookmarks-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((current) => [payload.new as Bookmark, ...current])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        )
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
                            )
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const fetchBookmarks = async () => {
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBookmarks(data || [])
        } catch (error: any) {
            console.error('Error fetching bookmarks:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id)
            if (error) throw error
        } catch (error: any) {
            console.error('Error deleting bookmark:', error.message)
        }
    }

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-50 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-3 w-2/3">
                                <div className="h-6 bg-slate-100 rounded-lg w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-lg w-1/2"></div>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/50 outline-none transition-all text-slate-600 font-medium"
                />
            </div>

            {filteredBookmarks.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Inbox className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                        {searchTerm ? 'No results found' : 'Empty Archive'}
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto">
                        {searchTerm ? "We couldn't find anything matching your search." : "Your digital library is waiting for its first entry."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredBookmarks.map((bookmark) => (
                        <a
                            key={bookmark.id}
                            href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-primary-200 hover:shadow-[0_20px_50px_rgba(14,165,233,0.1)] transition-all duration-500 flex items-center justify-between overflow-hidden relative"
                        >
                            <div className="flex-1 min-w-0 pr-6 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                                        {bookmark.title}
                                    </h3>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[200px]">
                                            {bookmark.url.replace(/^https?:\/\//, '')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                                            {new Date(bookmark.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-3">
                                <button
                                    onClick={(e) => handleDelete(bookmark.id, e)}
                                    className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                    title="Delete bookmark"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="hidden sm:flex p-4 bg-primary-50 text-primary-600 rounded-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 delay-75">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Decorative background element on hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
