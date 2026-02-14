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
    ArrowUpRight,
    Pin,
    Tag as TagIcon
} from 'lucide-react'

import DeleteModal from '@/ui/deleteModal'

interface Bookmark {
    id: string
    title: string
    url: string
    description?: string
    image_url?: string
    tags?: string[]
    is_pinned: boolean
    created_at: string
}

interface BookmarkListProps {
    userId: string
}

export default function BookmarkList({ userId }: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, bookmarkId: string, title: string }>({
        isOpen: false,
        bookmarkId: '',
        title: ''
    })

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
                        const newBookmark = payload.new as Bookmark;
                        setBookmarks((current) => {
                            const updated = [newBookmark, ...current];
                            // Re-sort to keep pinned items at top
                            return updated.sort((a, b) => {
                                if (a.is_pinned === b.is_pinned) {
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                }
                                return a.is_pinned ? -1 : 1;
                            });
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((b) => b.id !== payload.old.id)
                        );
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedBookmark = payload.new as Bookmark;
                        setBookmarks((current) => {
                            const updated = current.map((b) =>
                                b.id === updatedBookmark.id ? updatedBookmark : b
                            );
                            return updated.sort((a, b) => {
                                if (a.is_pinned === b.is_pinned) {
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                }
                                return a.is_pinned ? -1 : 1;
                            });
                        });
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
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error
            setBookmarks(data || [])
        } catch (error: any) {
            console.error('Error fetching bookmarks:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDeleteModal({ isOpen: true, bookmarkId: id, title })
    }

    const confirmDelete = async () => {
        const id = deleteModal.bookmarkId
        try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id)
            if (error) throw error
        } catch (error: any) {
            console.error('Error deleting bookmark:', error.message)
        }
    }

    const togglePin = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const { error } = await supabase
                .from('bookmarks')
                .update({ is_pinned: !currentStatus })
                .eq('id', id)
            if (error) throw error
        } catch (error: any) {
            console.error('Error pinning bookmark:', error.message)
        }
    }

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-50 animate-pulse">
                        <div className="flex gap-6">
                            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-6 bg-slate-100 rounded-lg w-1/3"></div>
                                <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-lg w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search titles, URLs or #tags..."
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
                        {searchTerm ? 'No matches' : 'Empty Archive'}
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">
                        {searchTerm ? "Try searching for a different keyword or tag." : "Your visual digital library starts here."}
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
                            className={`group bg-white p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col sm:flex-row gap-6 overflow-hidden relative ${bookmark.is_pinned
                                ? 'border-primary-200 shadow-[0_20px_50px_rgba(14,165,233,0.08)] bg-primary-50/10'
                                : 'border-slate-100 hover:border-primary-100 hover:shadow-[0_20px_50px_rgba(14,165,233,0.05)]'
                                }`}
                        >
                            {/* Thumbnail */}
                            <div className="w-full sm:w-40 h-28 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-100 relative group-hover:border-primary-200 transition-colors">
                                {bookmark.image_url ? (
                                    <img src={bookmark.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <Globe className="w-10 h-10" />
                                    </div>
                                )}
                                {bookmark.is_pinned && (
                                    <div className="absolute top-2 left-2 bg-primary-500 text-white p-1.5 rounded-lg shadow-lg">
                                        <Pin className="w-3 h-3 fill-current" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors leading-tight">
                                        {bookmark.title}
                                    </h3>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 flex-shrink-0" />
                                </div>

                                {bookmark.description && (
                                    <p className="text-slate-500 text-sm line-clamp-1 mb-3 font-medium">
                                        {bookmark.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">
                                            {bookmark.url.replace(/^https?:\/\//, '').split('/')[0]}
                                        </span>
                                    </div>

                                    {bookmark.tags && bookmark.tags.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            {bookmark.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                    <TagIcon className="w-2 h-2" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:self-center">
                                <button
                                    onClick={(e) => togglePin(bookmark.id, bookmark.is_pinned, e)}
                                    className={`p-3 rounded-2xl transition-all duration-300 ${bookmark.is_pinned
                                        ? 'bg-primary-500 text-white scale-100 shadow-lg shadow-primary-200'
                                        : 'bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-500 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                                        }`}
                                    title={bookmark.is_pinned ? "Unpin" : "Pin to top"}
                                >
                                    <Pin className={`w-4 h-4 ${bookmark.is_pinned ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(bookmark.id, bookmark.title, e)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Decorative background element on hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </a>
                    ))}
                </div>
            )}

            <DeleteModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title={deleteModal.title}
            />
        </div>
    )
}
