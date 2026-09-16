import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { getDisplayName } from '../hooks/useAuth';

export default function UserMenu({ user, onOpenAuth, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={onOpenAuth}
        title="Giriş Yap"
        aria-label="Giriş Yap"
        className="gap-2 px-2.5 lg:px-4 rounded-xl border-pink-200 dark:border-zinc-700 cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden lg:inline">Giriş Yap</span>
      </Button>
    );
  }

  const displayName = getDisplayName(user);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="gap-2 px-1.5 lg:pr-3 rounded-xl border-pink-200 dark:border-zinc-700 cursor-pointer"
      >
        <span className="w-7 h-7 rounded-lg bg-[#f9a8d4] dark:bg-[#b8406a] text-[#831843] dark:text-pink-50 flex items-center justify-center text-xs font-bold uppercase shrink-0">
          {displayName.charAt(0)}
        </span>
        <span className="hidden lg:inline max-w-[110px] truncate">{displayName}</span>
        <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-pink-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-3 border-b border-pink-100 dark:border-zinc-800 bg-pink-50/70 dark:bg-zinc-850/70">
            <p className="text-sm font-bold text-black dark:text-zinc-100 truncate">{displayName}</p>
            <p className="text-[11px] text-gray-600 dark:text-zinc-400 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-pink-50/80 dark:hover:bg-zinc-800/80 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
}
