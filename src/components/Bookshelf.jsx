import React, { useRef, useState, useEffect, useCallback } from 'react';
import BookSpine from './BookSpine';
import TimelineView from './TimelineView';
import { Layers, BookOpen, Calendar, Plus, ChevronLeft, ChevronRight, MoveHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { playPageFlipSound } from '../lib/soundUtils';

export default function Bookshelf({
  books,
  onSelectBook,
  viewMode,
  setViewMode,
  onOpenAddModal,
  isLoading = false,
  isShelfEmpty = false,
  onLoadSampleBooks
}) {
  const shelfRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if shelf has overflow to show / hide scroll arrows
  const updateScrollButtons = useCallback(() => {
    if (shelfRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = shelfRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const shelf = shelfRef.current;
    if (!shelf) return;

    shelf.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      shelf.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [books, viewMode, updateScrollButtons]);

  // Global mouse up listener to prevent stuck drag state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        setIsDragging(false);
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 100);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Smooth mouse wheel conversion (vertical wheel -> horizontal shelf scroll)
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;

    const handleWheel = (e) => {
      // If user is doing native horizontal trackpad gesture, let it handle naturally
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      if (e.deltaY !== 0) {
        const maxScrollLeft = shelf.scrollWidth - shelf.clientWidth;
        if (maxScrollLeft <= 0) return;

        const canScrollL = shelf.scrollLeft > 0 && e.deltaY < 0;
        const canScrollR = shelf.scrollLeft < maxScrollLeft - 1 && e.deltaY > 0;

        if (canScrollL || canScrollR) {
          e.preventDefault();
          shelf.scrollLeft += e.deltaY * 1.2;
        }
      }
    };

    shelf.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      shelf.removeEventListener('wheel', handleWheel);
    };
  }, [viewMode, books.length]);

  // Drag handlers for mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !shelfRef.current) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - shelfRef.current.offsetLeft;
    scrollLeftRef.current = shelfRef.current.scrollLeft;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current || !shelfRef.current) return;
    const x = e.pageX - shelfRef.current.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true;
    }
    shelfRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    if (isDownRef.current) {
      isDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    }
  };

  // Prevent opening book modal if the user was dragging the shelf
  const handleSelectBook = (book) => {
    if (hasMovedRef.current) return;
    onSelectBook(book);
  };

  const scrollByAmount = (amount) => {
    if (shelfRef.current) {
      shelfRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Controls Bar above shelf */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-pink-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
          <span className="font-bold text-black dark:text-zinc-100">Görünüm:</span>
          <div className="flex items-center bg-white/90 dark:bg-zinc-800/90 border border-pink-200 dark:border-zinc-700 rounded-xl p-0.5 shadow-xs">
            <Button
              variant={viewMode === 'spine' ? 'tabActive' : 'tabInactive'}
              size="sm"
              onClick={() => setViewMode('spine')}
              className="gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kitap Sırtı</span>
            </Button>
            <Button
              variant={viewMode === 'cover' ? 'tabActive' : 'tabInactive'}
              size="sm"
              onClick={() => setViewMode('cover')}
              className="gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kapak</span>
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'tabActive' : 'tabInactive'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300" />
              <span>Zaman Çizelgesi</span>
            </Button>
          </div>
        </div>

        <Badge variant="outline">
          {books.length} adet kitap listeleniyor
        </Badge>
      </div>

      {/* View Mode Content */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
          <span>Rafın hazırlanıyor...</span>
        </div>
      ) : isShelfEmpty ? (
        <Card className="py-20 px-4 text-center flex flex-col items-center justify-center border border-dashed border-pink-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#89CFF0]/25 dark:bg-[#89CFF0]/20 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-zinc-950 dark:text-zinc-100 mb-1">
            Rafın seni bekliyor
          </h3>
          <p className="text-sm text-gray-700 dark:text-zinc-400 max-w-sm mb-6 font-medium">
            Okuduğun, okumakta olduğun ya da okumak istediğin ilk kitabı ekleyerek kendi kütüphaneni oluşturmaya başla.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="babyblue"
              onClick={onOpenAddModal}
              className="gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Kitabını Ekle</span>
            </Button>
            {onLoadSampleBooks && (
              <Button
                variant="outline"
                onClick={onLoadSampleBooks}
                className="gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Örnek Kitaplarla Başla</span>
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === 'timeline' ? (
        <TimelineView
          books={books}
          onSelectBook={onSelectBook}
          onOpenAddModal={onOpenAddModal}
        />
      ) : books.length === 0 ? (
        <Card className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-pink-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#89CFF0]/25 dark:bg-[#89CFF0]/20 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-zinc-950 dark:text-zinc-100 mb-1">
            Bu filtrede henüz kitap bulunamadı
          </h3>
          <p className="text-sm text-gray-700 dark:text-zinc-400 max-w-sm mb-6 font-medium">
            Arama terimlerini değiştirebilir veya kitaplığına hemen yeni bir kitap ekleyebilirsin.
          </p>
          <Button
            variant="babyblue"
            onClick={onOpenAddModal}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Kitabı Ekle</span>
          </Button>
        </Card>
      ) : (
        /* Single Continuous Shelf Container */
        <div className="relative group/shelf mt-2">
          {/* Left scroll arrow button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount(-350)}
              aria-label="Sola kaydır"
              className="absolute -left-3 md:-left-4 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 dark:bg-zinc-800/95 hover:bg-[#89CFF0] dark:hover:bg-[#89CFF0] text-gray-800 dark:text-zinc-100 hover:text-black border border-pink-200 dark:border-zinc-700 shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Right scroll arrow button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount(350)}
              aria-label="Sağa kaydır"
              className="absolute -right-3 md:-right-4 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 dark:bg-zinc-800/95 hover:bg-[#89CFF0] dark:hover:bg-[#89CFF0] text-gray-800 dark:text-zinc-100 hover:text-black border border-pink-200 dark:border-zinc-700 shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Books standing on the shelf */}
          <div
            ref={shelfRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className={`flex items-end justify-start gap-4 md:gap-6 px-6 md:px-10 overflow-x-auto no-scrollbar pb-0 min-h-[255px] select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  viewMode={viewMode}
                  onSelect={handleSelectBook}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Wooden Shelf Plank */}
          <div className="shelf-plank w-full rounded-sm" />

          {/* Shelf Cast Shadow */}
          <div className="shelf-shadow w-full pointer-events-none" />

          {/* Shelf footer info & hint */}
          <div className="flex items-center justify-between mt-2.5 px-2 text-xs text-pink-900/70 dark:text-zinc-400 select-none">
            <div className="flex items-center gap-1.5 font-medium">
              <MoveHorizontal className="w-4 h-4 text-[#b8406a] dark:text-[#fef3c7]" />
              <span>Fare ile sağa-sola sürükleyerek veya fare tekerleğiyle kitapları kaydırabilirsiniz</span>
            </div>
            <div className="font-mono text-[11px] font-semibold text-pink-900/60 dark:text-zinc-500">
              RAF #1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
