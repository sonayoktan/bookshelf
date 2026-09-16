import React from 'react';
import { Star, Bookmark, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

export default function BookSpine({ book, onSelect, viewMode = 'spine' }) {
  // Dynamic height and width calculation based on book properties
  // Page count impacts spine thickness
  const spineWidth = Math.min(62, Math.max(34, Math.floor((book.pages || 250) / 14)));
  const bookHeight = 220 + ((book.id.length * 7) % 35); // subtle natural height variation

  if (viewMode === 'spine') {
    return (
      <motion.div
        layoutId={`book-container-${book.id}`}
        whileHover={{
          y: -22,
          z: 35,
          scale: 1.04,
          boxShadow: "0 25px 35px -5px rgba(0,0,0,0.4), 0 0 20px rgba(137,207,240,0.5)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={() => onSelect(book)}
        style={{
          width: `${spineWidth}px`,
          height: `${bookHeight}px`,
          backgroundColor: book.spineColor || '#27272a'
        }}
        className="relative cursor-pointer rounded-t-sm select-none shrink-0 flex flex-col justify-between py-3 px-1 text-center shadow-lg border-t border-r border-white/20 border-l border-black/40 group origin-bottom transition-colors"
      >
        {/* Ribbon / Bookmark on top if favorite: Baby blue */}
        {book.favorite && (
          <div className="absolute -top-1 left-2 w-3 h-5 bg-[#89CFF0] rounded-b-sm shadow-md z-10" />
        )}

        {/* Top spine detail: Rating / Status */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-4 h-0.5 bg-white/30 rounded-full mb-1" />
          <div className="flex items-center justify-center text-[10px] text-amber-300 font-bold">
            <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
            <span>{book.rating}</span>
          </div>
        </div>

        {/* Middle: Vertical Title */}
        <div className="flex-1 flex items-center justify-center overflow-hidden my-2">
          <span
            className="text-[11px] font-semibold tracking-wide text-zinc-100 [writing-mode:vertical-rl] rotate-180 truncate max-h-[140px]"
            title={book.title}
          >
            {book.title}
          </span>
        </div>

        {/* Bottom spine detail: Author initial or subtle lines */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] text-zinc-200/90 truncate w-full font-mono uppercase font-medium">
            {book.author.split(' ').pop()}
          </span>
          <div className="w-full h-1 bg-black/30 rounded-sm" />
          <div className="w-4 h-0.5 bg-white/20 rounded-full" />
        </div>

        {/* Gloss / 3D lighting reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30 pointer-events-none rounded-t-sm" />
      </motion.div>
    );
  }

  // Cover View (Aesthetic front covers)
  return (
    <motion.div
      layoutId={`book-container-${book.id}`}
      whileHover={{
        y: -18,
        rotateY: -6,
        z: 30,
        scale: 1.05,
        boxShadow: "0 25px 30px -5px rgba(0,0,0,0.3), 0 0 25px rgba(137,207,240,0.4)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => onSelect(book)}
      className="relative cursor-pointer select-none shrink-0 group origin-bottom preserve-3d"
      style={{
        width: "140px",
        height: `${bookHeight}px`
      }}
    >
      {/* Book 3D Spine Depth simulation on the left edge */}
      <div className="absolute top-0 bottom-0 -left-2 w-2.5 bg-zinc-800 rounded-l-sm -skew-y-6 origin-right pointer-events-none brightness-75 border-l border-white/10" />

      {/* Main Front Cover Card */}
      <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-pink-200 shadow-md flex flex-col relative">
        {/* Cover Image */}
        <div className="w-full h-[72%] relative overflow-hidden bg-zinc-100">
          <img
            src={book.coverUrl}
            alt={book.title}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-pink-200', 'to-sky-200');
            }}
          />

          {/* Shading overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />

          {/* Favorite bookmark: Baby blue */}
          {book.favorite && (
            <div className="absolute top-0 right-3 w-3.5 h-6 bg-[#89CFF0] shadow-md flex items-center justify-center text-gray-800 rounded-b-sm">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          )}

          {/* Rating tag */}
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-semibold text-amber-300">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{book.rating}</span>
          </div>

          {/* Status icon tag */}
          <div className="absolute bottom-2 right-2">
            {book.status === 'read' && (
              <span className="p-1 rounded-full bg-emerald-500 text-white block shadow">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            )}
            {book.status === 'reading' && (
              <span className="p-1 rounded-full bg-[#89CFF0] text-gray-800 block shadow animate-pulse">
                <Clock className="w-3 h-3" />
              </span>
            )}
            {book.status === 'want_to_read' && (
              <span className="p-1 rounded-full bg-sky-400 text-white block shadow">
                <Bookmark className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Cover Info Section */}
        <div className="flex-1 p-2 bg-white flex flex-col justify-between border-t border-pink-100">
          <div>
            <h4 className="text-xs font-bold text-zinc-950 truncate leading-snug group-hover:text-sky-700 transition-colors" title={book.title}>
              {book.title}
            </h4>
            <p className="text-[10px] text-gray-700 font-medium truncate mt-0.5" title={book.author}>
              {book.author}
            </p>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-600 font-medium pt-1">
            <Badge variant="pink" className="text-[9px] py-0 px-1.5">
              {book.genre || "Genel"}
            </Badge>
            <span>{book.pages ? `${book.pages}s` : ''}</span>
          </div>
        </div>

        {/* Paper edge line on the right */}
        <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-r from-transparent to-pink-200 pointer-events-none" />
      </div>
    </motion.div>
  );
}
