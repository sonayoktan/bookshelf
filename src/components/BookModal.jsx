import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Heart,
  CheckCircle2,
  Clock,
  Bookmark,
  Calendar,
  BookOpen,
  Trash2,
  Edit3,
  Quote,
  Plus,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

export default function BookModal({
  book,
  books = [],
  onSelectBook,
  onClose,
  onUpdateBook,
  onDeleteBook,
  canEdit = true,
  onRequireAuth
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState({ ...book });
  const [newQuote, setNewQuote] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setEditedBook({ ...book });
    setIsEditing(false);
  }, [book]);

  const currentIndex = useMemo(() => {
    if (!books || books.length === 0 || !book) return -1;
    return books.findIndex(b => b.id === book.id);
  }, [books, book?.id]);

  const hasMultipleBooks = books && books.length > 1;

  const handlePrevBook = useCallback(() => {
    if (!books || books.length <= 1 || !onSelectBook || !book) return;
    const currentIdx = books.findIndex(b => b.id === book.id);
    if (currentIdx === -1) return;
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : books.length - 1;
    onSelectBook(books[prevIdx]);
  }, [books, book?.id, onSelectBook]);

  const handleNextBook = useCallback(() => {
    if (!books || books.length <= 1 || !onSelectBook || !book) return;
    const currentIdx = books.findIndex(b => b.id === book.id);
    if (currentIdx === -1) return;
    const nextIdx = currentIdx < books.length - 1 ? currentIdx + 1 : 0;
    onSelectBook(books[nextIdx]);
  }, [books, book?.id, onSelectBook]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (isInput) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevBook();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextBook();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevBook, handleNextBook]);

  if (!book) return null;

  // Guests can browse the demo shelf, but any change asks them to sign in first
  const ensureCanEdit = () => {
    if (canEdit) return true;
    onRequireAuth?.();
    return false;
  };

  const handleSave = () => {
    if (!ensureCanEdit()) return;
    onUpdateBook(editedBook);
    setIsEditing(false);
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!ensureCanEdit()) return;
    if (!newQuote.trim()) return;
    const updatedQuotes = [...(editedBook.quotes || []), newQuote.trim()];
    const updated = { ...editedBook, quotes: updatedQuotes };
    setEditedBook(updated);
    onUpdateBook(updated);
    setNewQuote('');
  };

  const handleRemoveQuote = (indexToRemove) => {
    if (!ensureCanEdit()) return;
    const updatedQuotes = (editedBook.quotes || []).filter((_, i) => i !== indexToRemove);
    const updated = { ...editedBook, quotes: updatedQuotes };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const toggleFavorite = () => {
    if (!ensureCanEdit()) return;
    const updated = { ...editedBook, favorite: !editedBook.favorite };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const handleRatingChange = (newRating) => {
    if (!ensureCanEdit()) return;
    const updated = { ...editedBook, rating: newRating };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const handleStatusChange = (newStatus) => {
    if (!ensureCanEdit()) return;
    const updated = { ...editedBook, status: newStatus };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Floating Previous Book Button */}
        {hasMultipleBooks && (
          <button
            type="button"
            onClick={handlePrevBook}
            title="Önceki Kitap (Sol Ok ←)"
            aria-label="Önceki Kitap"
            className="fixed left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-black shadow-2xl border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Floating Next Book Button */}
        {hasMultipleBooks && (
          <button
            type="button"
            onClick={handleNextBook}
            title="Sonraki Kitap (Sağ Ok →)"
            aria-label="Sonraki Kitap"
            className="fixed right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-black shadow-2xl border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 text-black dark:text-zinc-100"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-pink-200 dark:border-zinc-800 bg-pink-50/80 dark:bg-zinc-850/80">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {editedBook.genre || "Genel"}
              </Badge>
              {editedBook.year && (
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-mono font-medium">
                  {editedBook.year}
                </span>
              )}
              {hasMultipleBooks && currentIndex !== -1 && (
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-mono font-medium ml-1">
                  ({currentIndex + 1} / {books.length})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasMultipleBooks && (
                <div className="flex items-center gap-1 mr-1 border-r border-pink-200 dark:border-zinc-700 pr-2">
                  <Button
                    variant="outline"
                    size="iconSm"
                    onClick={handlePrevBook}
                    title="Önceki Kitap (← Sol Ok)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="iconSm"
                    onClick={handleNextBook}
                    title="Sonraki Kitap (→ Sağ Ok)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                variant={editedBook.favorite ? 'babyblue' : 'outline'}
                size="iconSm"
                onClick={toggleFavorite}
                title="Favorilere ekle/çıkar"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    editedBook.favorite
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-rose-500'
                  }`}
                />
              </Button>

              <Button
                variant={isEditing ? 'babyblue' : 'outline'}
                size="iconSm"
                onClick={() => ensureCanEdit() && setIsEditing(!isEditing)}
                title="Düzenleme modu"
              >
                <Edit3 className="w-4 h-4" />
              </Button>

              <Button
                variant="destructive"
                size="iconSm"
                onClick={() => {
                  if (!ensureCanEdit()) return;
                  if (window.confirm(`"${book.title}" kitabını silmek istediğinden emin misin?`)) {
                    onDeleteBook(book.id);
                    onClose();
                  }
                }}
                title="Kitabı sil"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="iconSm"
                onClick={onClose}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[78vh] overflow-y-auto">
            
            {/* Left Column: Book Presentation & Meta */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-5">
              {/* Book Cover Card */}
              <div className="relative group w-48 mx-auto md:w-full max-w-[210px] rounded-xl shadow-xl overflow-hidden bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700">
                <img
                  src={editedBook.coverUrl}
                  alt={editedBook.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white font-mono">
                  <span>{editedBook.pages ? `${editedBook.pages} sayfa` : ''}</span>
                  <span className="capitalize">{editedBook.status === 'read' ? 'Okundu' : editedBook.status === 'reading' ? 'Okunuyor' : 'İstek'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="w-full space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wider">
                  Okuma Durumu
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-pink-50/70 dark:bg-zinc-800/70 rounded-xl border border-pink-200 dark:border-zinc-700 text-xs text-center">
                  <Button
                    variant={editedBook.status === 'read' ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => handleStatusChange('read')}
                    className={editedBook.status === 'read' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold' : ''}
                  >
                    Okundu
                  </Button>
                  <Button
                    variant={editedBook.status === 'reading' ? 'tabActive' : 'ghost'}
                    size="sm"
                    onClick={() => handleStatusChange('reading')}
                  >
                    Okunuyor
                  </Button>
                  <Button
                    variant={editedBook.status === 'want_to_read' ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => handleStatusChange('want_to_read')}
                    className={editedBook.status === 'want_to_read' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold' : ''}
                  >
                    İstek
                  </Button>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="w-full space-y-2 text-xs text-gray-700 dark:text-zinc-300 border-t border-pink-200 dark:border-zinc-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-zinc-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Okunma Tarihi:
                  </span>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editedBook.readDate || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, readDate: e.target.value })}
                      placeholder="Örn: Mayıs 2024"
                      className="w-32 h-7 text-right px-2"
                    />
                  ) : (
                    <span className="text-black dark:text-zinc-100 font-semibold">{editedBook.readDate || 'Belirtilmedi'}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-zinc-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5" /> Sayfa Sayısı:
                  </span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedBook.pages || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, pages: parseInt(e.target.value) || 0 })}
                      className="w-20 h-7 text-right px-2"
                    />
                  ) : (
                    <span className="text-black dark:text-zinc-100 font-semibold">{editedBook.pages || '-'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Title, Rating, Review & Quotes */}
            <div className="md:col-span-8 flex flex-col justify-between gap-6">
              <div>
                {/* Title & Author */}
                {isEditing ? (
                  <div className="space-y-2 mb-4">
                    <Input
                      type="text"
                      value={editedBook.title}
                      onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                      className="text-xl font-bold font-serif h-11"
                      placeholder="Kitap Adı"
                    />
                    <Input
                      type="text"
                      value={editedBook.author}
                      onChange={(e) => setEditedBook({ ...editedBook, author: e.target.value })}
                      className="text-sm h-9"
                      placeholder="Yazar"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-black dark:text-zinc-100">
                      {editedBook.title}
                    </h2>
                    <p className="text-base text-gray-700 dark:text-zinc-400 font-medium mt-1">
                      {editedBook.author}
                    </p>
                  </div>
                )}

                {/* Rating Bar */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/70 dark:bg-zinc-800/70 border border-pink-200 dark:border-zinc-700 mb-6">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Puanım:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = (hoverRating || editedBook.rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRatingChange(starVal)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-gray-300 dark:text-zinc-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 ml-1">
                    {editedBook.rating} / 5
                  </span>
                </div>

                {/* Review & Thoughts Section */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-black dark:text-zinc-100 uppercase tracking-wider">
                      Fikirlerim & Değerlendirmem
                    </h4>
                  </div>
                  
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editedBook.review || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, review: e.target.value })}
                      placeholder="Bu kitap hakkında ne düşündün? Seni en çok ne etkiledi?"
                      className="w-full bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 rounded-xl p-3 text-sm text-black dark:text-zinc-100 focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 leading-relaxed resize-none shadow-xs"
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-zinc-800/50 border border-pink-200 dark:border-zinc-700 text-sm text-black dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium shadow-xs">
                      {editedBook.review ? (
                        editedBook.review
                      ) : (
                        <span className="text-gray-500 dark:text-zinc-400 italic">
                          Bu kitap hakkında henüz bir inceleme veya düşünce yazılmadı. Düzenle butonuna basarak ekleyebilirsin.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quotes Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-black dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Altını Çizdiğim Alıntılar
                  </h4>

                  {editedBook.quotes && editedBook.quotes.length > 0 ? (
                    <div className="space-y-2">
                      {editedBook.quotes.map((q, idx) => (
                        <div
                          key={idx}
                          className="relative pl-4 pr-7 py-2.5 rounded-xl bg-pink-50/60 dark:bg-zinc-800/60 border-l-2 border-[#89CFF0] border-t border-r border-b border-pink-200 dark:border-zinc-700 text-xs italic text-gray-800 dark:text-zinc-200 group shadow-xs"
                        >
                          "{q}"
                          <button
                            onClick={() => handleRemoveQuote(idx)}
                            className="absolute top-2 right-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Alıntıyı sil"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 italic">
                      Henüz favori bir alıntı eklenmedi.
                    </p>
                  )}

                  {/* Add quote input */}
                  <form onSubmit={handleAddQuote} className="flex gap-2 pt-1">
                    <Input
                      type="text"
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      placeholder="Yeni bir alıntı ekle..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      variant="babyblue"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" /> Ekle
                    </Button>
                  </form>
                </div>
              </div>

              {/* Save Button if Editing */}
              {isEditing && (
                <div className="pt-4 border-t border-pink-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    variant="babyblue"
                    onClick={handleSave}
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Değişiklikleri Kaydet
                  </Button>
                </div>
              )}

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
