'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title }: DeleteModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 p-8 sm:p-10 transform transition-all animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 border border-red-100">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                        Remove Bookmark?
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">
                        Are you sure you want to delete <span className="font-bold text-slate-700 italic">"{title}"</span>? This action cannot be undone.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all duration-200"
                        >
                            No, keep it
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:shadow-red-300 transition-all duration-200 active:scale-95"
                        >
                            Yes, delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
