import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BookOpen, Star, Clock, Bookmark, CheckCircle2, Layers } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function parseBookDate(book) {
  const dateStr = book.readDate || '';
  const now = new Date();

  if (book.status === 'reading') {
    return { year: 9999, monthNum: 99, monthName: 'Şu An Okunuyor', isCurrent: true };
  }
  if (book.status === 'want_to_read') {
    return { year: -1, monthNum: -1, monthName: 'İstek Listesi', isWishlist: true };
  }
  if (dateStr.toLowerCase().includes('bugün')) {
    return {
      year: now.getFullYear(),
      monthNum: now.getMonth() + 1,
      monthName: TURKISH_MONTHS[now.getMonth()]
    };
  }

  // Find 4 digit year
  const yearMatch = dateStr.match(/\b(19\d\d|20\d\d)\b/) || (book.year ? [book.year, book.year] : null);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;

  // Find Turkish month name
  let monthNum = 0;
  let monthName = 'Belirtilmemiş';
  for (let i = 0; i < TURKISH_MONTHS.length; i++) {
    if (new RegExp(TURKISH_MONTHS[i], 'i').test(dateStr)) {
      monthNum = i + 1;
      monthName = TURKISH_MONTHS[i];
      break;
    }
  }

  return { year, monthNum, monthName };
}

export default function TimelineView({ books = [], onSelectBook, onOpenAddModal }) {
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');

  // Group books chronologically: Year -> Month
  const timelineGroups = useMemo(() => {
    const yearsMap = new Map();

    books.forEach((book) => {
      const { year, monthNum, monthName, isCurrent, isWishlist } = parseBookDate(book);
      let yearKey = year.toString();
      let yearTitle = year.toString();

      if (isCurrent) {
        yearKey = 'CURRENT';
        yearTitle = 'Şu An Okunan Kitaplar';
      } else if (isWishlist) {
        yearKey = 'WISHLIST';
        yearTitle = 'İstek Listesi (Okunacaklar)';
      }

      if (!yearsMap.has(yearKey)) {
        yearsMap.set(yearKey, {
          key: yearKey,
          title: yearTitle,
          yearNumber: year,
          months: new Map()
        });
      }

      const yearGroup = yearsMap.get(yearKey);
      const monthKey = `${yearKey}-${monthNum}`;

      if (!yearGroup.months.has(monthKey)) {
        yearGroup.months.set(monthKey, {
          key: monthKey,
          monthNum,
          monthName,
          books: []
        });
      }

      yearGroup.months.get(monthKey).books.push(book);
    });

    // Convert map to sorted arrays
    return Array.from(yearsMap.values())
      .map((yearGroup) => {
        const sortedMonths = Array.from(yearGroup.months.values()).sort(
          (a, b) => b.monthNum - a.monthNum
        );
        const allBooksInYear = sortedMonths.flatMap((m) => m.books);
        const readBooksInYear = allBooksInYear.filter((b) => b.status === 'read');
        const totalPagesInYear = readBooksInYear.reduce((acc, b) => acc + (b.pages || 0), 0);
        const avgRating = readBooksInYear.length > 0
          ? (readBooksInYear.reduce((acc, b) => acc + (b.rating || 0), 0) / readBooksInYear.length).toFixed(1)
          : null;

        return {
          ...yearGroup,
          months: sortedMonths,
          totalBooks: allBooksInYear.length,
          totalPages: totalPagesInYear,
          avgRating
        };
      })
      .sort((a, b) => {
        // Current reading first, then years descending, wishlist last
        if (a.key === 'CURRENT') return -1;
        if (b.key === 'CURRENT') return 1;
        if (a.key === 'WISHLIST') return 1;
        if (b.key === 'WISHLIST') return -1;
        return b.yearNumber - a.yearNumber;
      });
  }, [books]);

  // Extract distinct years for the filter pills
  const availableYears = useMemo(() => {
    return timelineGroups
      .filter((g) => g.key !== 'CURRENT' && g.key !== 'WISHLIST')
      .map((g) => g.key);
  }, [timelineGroups]);

  const filteredGroups = useMemo(() => {
    if (selectedYearFilter === 'all') return timelineGroups;
    return timelineGroups.filter(
      (g) => g.key === selectedYearFilter || g.key === 'CURRENT'
    );
  }, [timelineGroups, selectedYearFilter]);

  if (books.length === 0) {
    return (
      <Card className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-pink-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/80 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#89CFF0]/25 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-serif font-bold text-zinc-950 dark:text-zinc-100 mb-1">
          Zaman çizelgesinde gösterilecek kitap bulunamadı
        </h3>
        <p className="text-sm text-gray-700 dark:text-zinc-400 max-w-sm mb-6 font-medium">
          Okuduğun kitapların tarihlerini girerek okuma yolculuğunu kronolojik olarak takip edebilirsin.
        </p>
        <Button variant="babyblue" onClick={onOpenAddModal} className="gap-2">
          Kitap Ekle
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Year Filter Pills */}
      {availableYears.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-700 dark:text-zinc-300 font-bold flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" /> Yıl Filtresi:
          </span>
          <Button
            variant={selectedYearFilter === 'all' ? 'babyblue' : 'outline'}
            size="pill"
            onClick={() => setSelectedYearFilter('all')}
          >
            Tüm Yıllar
          </Button>
          {availableYears.map((year) => (
            <Button
              key={year}
              variant={selectedYearFilter === year ? 'babyblue' : 'outline'}
              size="pill"
              onClick={() => setSelectedYearFilter(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      )}

      {/* Timeline Main Container */}
      <div className="relative pl-4 sm:pl-8 border-l-2 border-pink-300/80 dark:border-zinc-700 space-y-12 ml-2 sm:ml-4">
        {filteredGroups.map((yearGroup) => (
          <div key={yearGroup.key} className="relative space-y-6">
            
            {/* Year Node Milestone */}
            <div className="flex items-center gap-3 -ml-[25px] sm:-ml-[41px]">
              <div className="w-9 h-9 rounded-full bg-[#89CFF0] dark:bg-sky-600 border-4 border-pink-100 dark:border-zinc-800 shadow-md flex items-center justify-center text-gray-800 dark:text-zinc-100 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-black dark:text-zinc-100">
                  {yearGroup.title}
                </h3>
                {yearGroup.key !== 'CURRENT' && yearGroup.key !== 'WISHLIST' && (
                  <Badge variant="pink" className="text-xs font-semibold">
                    {yearGroup.totalBooks} Kitap
                    {yearGroup.totalPages > 0 && ` • ${yearGroup.totalPages.toLocaleString()} Sayfa`}
                    {yearGroup.avgRating && ` • Ort. ${yearGroup.avgRating} ★`}
                  </Badge>
                )}
              </div>
            </div>

            {/* Months inside this year */}
            <div className="space-y-8 pl-2 sm:pl-4">
              {yearGroup.months.map((monthGroup) => (
                <div key={monthGroup.key} className="space-y-3">
                  
                  {/* Month title badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#b8406a] dark:bg-[#f472b6]" />
                    <span className="text-sm font-bold font-serif text-[#b8406a] dark:text-[#f472b6] uppercase tracking-wide">
                      {monthGroup.monthName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium font-mono">
                      ({monthGroup.books.length} Kitap)
                    </span>
                  </div>

                  {/* Books Shelf for this month */}
                  <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs border border-pink-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
                    <div className="flex items-end gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1 pt-2">
                      {monthGroup.books.map((book) => (
                        <motion.div
                          key={book.id}
                          whileHover={{ y: -8, scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectBook(book)}
                          className="cursor-pointer select-none shrink-0 group flex flex-col items-center text-center"
                          style={{ width: '130px' }}
                        >
                          {/* Book Cover Card */}
                          <div className="w-[120px] h-[175px] rounded-lg overflow-hidden bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 shadow-md relative group-hover:border-sky-300 transition-colors">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                            {/* Status tag */}
                            <div className="absolute top-1.5 right-1.5">
                              {book.status === 'read' && (
                                <span className="p-1 rounded-full bg-emerald-500 text-white block shadow-xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                </span>
                              )}
                              {book.status === 'reading' && (
                                <span className="p-1 rounded-full bg-[#89CFF0] text-gray-800 block shadow-xs animate-pulse">
                                  <Clock className="w-3 h-3" />
                                </span>
                              )}
                              {book.status === 'want_to_read' && (
                                <span className="p-1 rounded-full bg-sky-400 text-white block shadow-xs">
                                  <Bookmark className="w-3 h-3" />
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs flex items-center gap-1 text-[10px] font-bold text-amber-300">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>{book.rating}</span>
                            </div>
                          </div>

                          {/* Info below cover */}
                          <div className="mt-2 w-full">
                            <h4
                              className="text-xs font-bold text-zinc-950 dark:text-zinc-100 truncate leading-snug group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors"
                              title={book.title}
                            >
                              {book.title}
                            </h4>
                            <p className="text-[10px] text-gray-600 dark:text-zinc-400 font-medium truncate mt-0.5" title={book.author}>
                              {book.author}
                            </p>
                            {book.readDate && (
                              <span className="inline-block text-[9px] text-gray-500 dark:text-zinc-400 font-mono mt-1 px-1.5 py-0.5 rounded bg-pink-100/60 dark:bg-zinc-800">
                                {book.readDate}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Wooden Shelf Plank */}
                    <div className="shelf-plank w-full rounded-sm" />
                    <div className="shelf-shadow w-full pointer-events-none" />
                  </div>

                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
