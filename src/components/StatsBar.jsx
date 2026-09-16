import React from 'react';
import { BookOpen, Star, CheckCircle2, Flame, Layers } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export default function StatsBar({ books, selectedGenre = 'Tümü' }) {
  const readBooks = books.filter(b => b.status === 'read');
  const readingBooks = books.filter(b => b.status === 'reading');
  
  const avgRating = readBooks.length > 0 
    ? (readBooks.reduce((acc, b) => acc + (b.rating || 0), 0) / readBooks.length).toFixed(1)
    : '0.0';

  const totalPages = readBooks.reduce((acc, b) => acc + (b.pages || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2">
      {/* Category indicator for statistics */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-700" />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            {selectedGenre === 'Tümü' ? 'Genel Okuma İstatistikleri' : `"${selectedGenre}" Türü İstatistikleri`}
          </span>
        </div>
        <Badge variant="outline">
          {books.length} Kitap
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Okunan Kitap */}
        <Card className="p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold font-mono text-black">
              {readBooks.length}
            </div>
            <div className="text-xs font-semibold text-gray-700">
              Okunan Kitap
            </div>
          </div>
        </Card>

        {/* Ortalama Puan */}
        <Card className="p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold font-mono text-black">
              {avgRating} <span className="text-xs text-gray-500 font-normal">/ 5</span>
            </div>
            <div className="text-xs font-semibold text-gray-700">
              Ortalama Puan
            </div>
          </div>
        </Card>

        {/* Toplam Sayfa */}
        <Card className="p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold font-mono text-black">
              {totalPages.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-gray-700">
              Toplam Sayfa
            </div>
          </div>
        </Card>

        {/* Şu An Okunuyor */}
        <Card className="p-3.5 flex items-center gap-3 transition-transform hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-[#89CFF0]/30 text-sky-800 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold font-mono text-black">
              {readingBooks.length} <span className="text-xs text-gray-500 font-normal">aktif</span>
            </div>
            <div className="text-xs font-semibold text-gray-700">
              Şu An Okunuyor
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
