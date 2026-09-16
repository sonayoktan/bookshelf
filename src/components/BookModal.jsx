import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  Bookmark,
  Calendar,
  BookOpen,
  Trash2,
  Edit3,
  Quote,
  Plus,
  Save
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

export default function BookModal({ book, onClose, onUpdateBook, onDeleteBook }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState({ ...book });
  const [newQuote, setNewQuote] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setEditedBook({ ...book });
    setIsEditing(false);
  }, [book]);

  if (!book) return null;

  const handleSave = () => {
    onUpdateBook(editedBook);
    setIsEditing(false);
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    const updatedQuotes = [...(editedBook.quotes || []), newQuote.trim()];
    const updated = { ...editedBook, quotes: updatedQuotes };
    setEditedBook(updated);
    onUpdateBook(updated);
    setNewQuote('');
  };

  const handleRemoveQuote = (indexToRemove) => {
    const updatedQuotes = (editedBook.quotes || []).filter((_, i) => i !== indexToRemove);
    const updated = { ...editedBook, quotes: updatedQuotes };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const toggleFavorite = () => {
    const updated = { ...editedBook, favorite: !editedBook.favorite };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const handleRatingChange = (newRating) => {
    const updated = { ...editedBook, rating: newRating };
    setEditedBook(updated);
    onUpdateBook(updated);
  };

  const handleStatusChange = (newStatus) => {
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-3xl bg-white border border-pink-200 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 text-black"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-pink-200 bg-pink-50/80">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {editedBook.genre || "Genel"}
              </Badge>
              {editedBook.year && (
                <span className="text-xs text-gray-600 font-mono font-medium">
                  {editedBook.year}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={editedBook.favorite ? 'babyblue' : 'outline'}
                size="iconSm"
                onClick={toggleFavorite}
                title="Favorilere ekle/çıkar"
              >
                <Sparkles className="w-4 h-4" />
              </Button>

              <Button
                variant={isEditing ? 'babyblue' : 'outline'}
                size="iconSm"
                onClick={() => setIsEditing(!isEditing)}
                title="Düzenleme modu"
              >
                <Edit3 className="w-4 h-4" />
              </Button>

              <Button
                variant="destructive"
                size="iconSm"
                onClick={() => {
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
              <div className="relative group w-48 mx-auto md:w-full max-w-[210px] rounded-xl shadow-xl overflow-hidden bg-white border border-pink-200">
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
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Okuma Durumu
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-pink-50/70 rounded-xl border border-pink-200 text-xs text-center">
                  <Button
                    variant={editedBook.status === 'read' ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => handleStatusChange('read')}
                    className={editedBook.status === 'read' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : ''}
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
                    className={editedBook.status === 'want_to_read' ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' : ''}
                  >
                    İstek
                  </Button>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="w-full space-y-2 text-xs text-gray-700 border-t border-pink-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-700 font-medium">
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
                    <span className="text-black font-semibold">{editedBook.readDate || 'Belirtilmedi'}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-700 font-medium">
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
                    <span className="text-black font-semibold">{editedBook.pages || '-'}</span>
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
                    <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-black">
                      {editedBook.title}
                    </h2>
                    <p className="text-base text-gray-700 font-medium mt-1">
                      {editedBook.author}
                    </p>
                  </div>
                )}

                {/* Rating Bar */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/70 border border-pink-200 mb-6">
                  <span className="text-xs font-bold text-gray-700">Puanım:</span>
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
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-bold text-amber-600 ml-1">
                    {editedBook.rating} / 5
                  </span>
                </div>

                {/* Review & Thoughts Section */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                      Fikirlerim & Değerlendirmem
                    </h4>
                  </div>
                  
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editedBook.review || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, review: e.target.value })}
                      placeholder="Bu kitap hakkında ne düşündün? Seni en çok ne etkiledi?"
                      className="w-full bg-white border border-pink-200 rounded-xl p-3 text-sm text-black focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 leading-relaxed resize-none shadow-xs"
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-200 text-sm text-black leading-relaxed whitespace-pre-line font-medium shadow-xs">
                      {editedBook.review ? (
                        editedBook.review
                      ) : (
                        <span className="text-gray-500 italic">
                          Bu kitap hakkında henüz bir inceleme veya düşünce yazılmadı. Düzenle butonuna basarak ekleyebilirsin.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quotes Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-sky-600" /> Altını Çizdiğim Alıntılar
                  </h4>

                  {editedBook.quotes && editedBook.quotes.length > 0 ? (
                    <div className="space-y-2">
                      {editedBook.quotes.map((q, idx) => (
                        <div
                          key={idx}
                          className="relative pl-4 pr-7 py-2.5 rounded-xl bg-pink-50/60 border-l-2 border-[#89CFF0] border-t border-r border-b border-pink-200 text-xs italic text-gray-800 group shadow-xs"
                        >
                          "{q}"
                          <button
                            onClick={() => handleRemoveQuote(idx)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Alıntıyı sil"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
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
                <div className="pt-4 border-t border-pink-200 flex justify-end gap-3">
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
