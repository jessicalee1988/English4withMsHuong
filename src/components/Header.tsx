import React from 'react';
import { Home, BookOpen } from 'lucide-react';
interface Props { currentView: 'home' | 'unit'; currentUnitId?: number; onGoHome: () => void; }
export const Header: React.FC<Props> = ({ currentView, onGoHome }) => (
<header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-amber-100 shadow-sm">
<div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-20 flex items-center justify-between gap-3">
<button onClick={onGoHome} className="flex items-center gap-3 min-w-0 text-left" aria-label="Về trang chủ">
<span className="w-14 h-14 rounded-3xl bg-amber-200 flex items-center justify-center text-4xl shadow-md" aria-hidden="true">🐻</span>
<span className="min-w-0"><span className="block text-xl sm:text-2xl font-black text-sky-700 truncate">English 4</span><span className="block text-sm font-bold text-rose-500">Fun Learning ✨</span></span>
</button>
{currentView !== 'home' && <button onClick={onGoHome} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-100 text-sky-800 font-extrabold hover:bg-sky-200"><Home className="w-6 h-6"/> Home</button>}
</div></header>);
