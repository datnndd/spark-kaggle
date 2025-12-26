import { useState } from 'react';

/**
 * Navbar component with navigation (no dark mode toggle)
 */
export default function Navbar({ currentPage, setCurrentPage }) {
    const navLinks = [
        { id: 'about', label: 'About Models' },
        { id: 'prediction', label: 'Prediction' },
    ];

    return (
        <nav className="bg-surface-light dark:bg-[#162035] border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="material-icons-round text-white text-2xl">traffic</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">TrafficSafe</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Accident Risk Prediction</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => setCurrentPage(link.id)}
                            className={`transition-colors ${currentPage === link.id
                                    ? 'text-primary dark:text-primary border-b-2 border-primary pb-0.5'
                                    : 'text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
                <div className="text-right text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Powered by</span>
                    <span className="font-bold text-emerald-500 ml-1">Spark ML</span>
                </div>
            </div>
        </nav>
    );
}
