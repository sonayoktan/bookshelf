import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Sparkles, BookOpen, Star, Loader2, Globe } from 'lucide-react';
import { GENRES } from '../data/initialBooks';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ensureLatinAuthor } from '../lib/transliterate';

const SPINE_COLORS = [
  { name: 'Kehribar', value: '#d97706' },
  { name: 'Zümrüt', value: '#059669' },
  { name: 'Koyu Lacivert', value: '#1e1b4b' },
  { name: 'Kızıl Kiremit', value: '#dc2626' },
  { name: 'Antrasit', value: '#27272a' },
  { name: 'Deri Kahve', value: '#78350f' },
  { name: 'Gece Mavisi', value: '#0284c7' },
  { name: 'Mürdüm', value: '#701a75' }
];

export default function AddBookModal({ isOpen, onClose, onAddBook }) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [genre, setGenre] = useState('Edebiyat');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState('read');
  const [pages, setPages] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [readDate, setReadDate] = useState('Bugün');
  const [review, setReview] = useState('');
  const [quote, setQuote] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [spineColor, setSpineColor] = useState(SPINE_COLORS[0].value);

  if (!isOpen) return null;

  // Search Books using Google Books with automatic Open Library fallback
  const handleBooksSearch = async (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError('');
    let results = [];

    // Source 1: Google Books API
    try {
      const gRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.items && gData.items.length > 0) {
          results = gData.items.map((item) => {
            const info = item.volumeInfo || {};
            let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
            if (thumb) thumb = thumb.replace('http://', 'https://');

            let matchedGenre = 'Edebiyat';
            if (info.categories && info.categories.length > 0) {
              const rawCat = info.categories[0];
              const match = GENRES.find(g => rawCat.toLowerCase().includes(g.toLowerCase()));
              if (match) matchedGenre = match;
            }

            return {
              id: item.id || `gb-${Math.random()}`,
              title: info.title || 'Başlıksız Kitap',
              author: ensureLatinAuthor(info.authors ? info.authors.join(', ') : 'Bilinmeyen Yazar'),
              coverUrl: thumb || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
              pages: info.pageCount ? info.pageCount.toString() : '',
              year: info.publishedDate ? info.publishedDate.split('-')[0] : '',
              genre: matchedGenre,
              source: 'Google Books'
            };
          });
        }
      }
    } catch (err) {
      console.warn("Google Books request error, attempting Open Library:", err);
    }

    // Source 2: Open Library API (Runs if Google Books has quota limit or zero results)
    if (results.length === 0) {
      try {
        const olRes = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`
        );
        if (olRes.ok) {
          const olData = await olRes.json();
          if (olData.docs && olData.docs.length > 0) {
            results = olData.docs.map((doc, idx) => {
              let thumb = '';
              if (doc.cover_i) {
                thumb = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
              } else if (doc.isbn && doc.isbn.length > 0) {
                thumb = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
              }

              let matchedGenre = 'Edebiyat';
              if (doc.subject && Array.isArray(doc.subject)) {
                const match = GENRES.find(g =>
                  doc.subject.some(s => s.toLowerCase().includes(g.toLowerCase()))
                );
                if (match) matchedGenre = match;
              }

              return {
                id: doc.key || `ol-${idx}`,
                title: doc.title || 'Başlıksız Kitap',
                author: ensureLatinAuthor(doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Bilinmeyen Yazar'),
                coverUrl: thumb || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
                pages: (doc.number_of_pages_median || doc.number_of_pages || '').toString(),
                year: (doc.first_publish_year || doc.publish_year?.[0] || '').toString(),
                genre: matchedGenre,
                source: 'Open Library'
              };
            });
          }
        }
      } catch (err) {
        console.error("Open Library request error:", err);
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectBookResult = (item) => {
    setTitle(item.title || '');
    setAuthor(ensureLatinAuthor(item.author || 'Bilinmeyen Yazar'));
    setCoverUrl(item.coverUrl || '');
    if (item.pages) setPages(item.pages.toString());
    if (item.year) setYear(item.year.toString());
    if (item.genre) setGenre(item.genre);

    // Switch to form review tab to finalize details
    setActiveTab('manual');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      author: ensureLatinAuthor(author.trim() || 'Bilinmeyen Yazar'),
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
      genre,
      rating: Number(rating),
      status,
      pages: Number(pages) || 200,
      year: year || new Date().getFullYear().toString(),
      readDate: status === 'read' ? readDate : (status === 'reading' ? 'Şu an okunuyor' : 'İstek Listesi'),
      favorite,
      spineColor,
      review: review.trim(),
      quotes: quote.trim() ? [quote.trim()] : []
    };

    onAddBook(newBook);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setGenre('Edebiyat');
    setRating(5);
    setStatus('read');
    setPages('');
    setYear(new Date().getFullYear().toString());
    setReview('');
    setQuote('');
    setFavorite(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
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
          className="relative w-full max-w-2xl bg-white border border-pink-200 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 text-black"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-pink-200 bg-pink-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#89CFF0]/25 text-sky-800 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-black font-serif">
                Kitaplığına Yeni Kitap Ekle
              </h2>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-pink-200 bg-pink-50/40 px-6 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'search'
                  ? 'border-[#89CFF0] text-sky-800'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>İnternetten Kitap Ara (Otomatik Kapak)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'manual'
                  ? 'border-[#89CFF0] text-sky-800'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Detaylar & Notlar {title ? `(${title.slice(0, 15)}...)` : ''}</span>
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {/* TAB 1: Search */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                <form onSubmit={handleBooksSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Kitap veya yazar adı yazın (örn: Suç ve Ceza, 1984)..."
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="babyblue"
                    disabled={isSearching || !searchQuery.trim()}
                    className="gap-1.5"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Ara'
                    )}
                  </Button>
                </form>

                {/* Status Notice */}
                {isSearching && (
                  <div className="py-8 text-center text-xs text-gray-600 flex items-center justify-center gap-2 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    <span>Kitap ve kapak resmi aranıyor...</span>
                  </div>
                )}

                {/* Results List */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="text-xs font-semibold text-gray-700 px-1 flex items-center justify-between">
                      <span>Bulunan Sonuçlar ({searchResults.length})</span>
                      <span className="text-[11px] text-gray-500">Eklemek istediğiniz kitabın üstüne tıklayın</span>
                    </div>

                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectBookResult(item)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 hover:bg-pink-100/70 border border-pink-200/90 hover:border-sky-300 cursor-pointer transition group shadow-xs"
                      >
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-xs border border-pink-200 shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-lg bg-pink-100 flex items-center justify-center text-gray-500 shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-black group-hover:text-sky-800 truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-700 font-medium truncate mt-0.5">
                            {item.author}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                            {item.year && <span>{item.year}</span>}
                            {item.pages && <span>• {item.pages} sayfa</span>}
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 text-gray-500">
                              {item.source}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="babyblue"
                          size="sm"
                        >
                          Seç & Ekle
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Not Found State */}
                {!isSearching && searchResults.length === 0 && searchQuery && (
                  <div className="py-8 text-center text-gray-600 text-xs font-medium">
                    <p className="font-bold text-black text-sm mb-1">Sonuç bulunamadı</p>
                    <p className="text-gray-500">
                      Farklı bir kelime deneyebilir veya üstteki <strong>"Detaylar & Notlar"</strong> sekmesine tıklayarak bilgileri elle girebilirsin.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Manual Details & Review Form */}
            {activeTab === 'manual' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black">
                      Kitap Adı *
                    </label>
                    <Input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Suç ve Ceza"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black">
                      Yazar
                    </label>
                    <Input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Örn: Fyodor Dostoyevski"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Genre */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black">
                      Tür / Kategori
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full h-9 bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-sm text-black focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 shadow-xs"
                    >
                      {GENRES.filter(g => g !== 'Tümü').map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black">
                      Durum
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-9 bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-sm text-black focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 shadow-xs"
                    >
                      <option value="read">Okundu</option>
                      <option value="reading">Şu an Okuyorum</option>
                      <option value="want_to_read">İstek Listesi</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-black">
                      Puan (1-5)
                    </label>
                    <div className="flex items-center gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setRating(s)}
                          className="hover:scale-125 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              rating >= s ? 'fill-amber-400 text-amber-500' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-1">
                        {rating}.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cover URL & Pages */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-xs font-bold text-black">
                      Kapak Resmi URL'si
                    </label>
                    <Input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-black">
                      Sayfa
                    </label>
                    <Input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="350"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-black">
                      Yıl
                    </label>
                    <Input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="1984"
                    />
                  </div>
                </div>

                {/* Spine Color Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black">
                    Kitap Sırtı Rengi (Raf Görünümü İçin)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {SPINE_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setSpineColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          spineColor === c.value ? 'border-sky-500 scale-110 shadow-md ring-2 ring-sky-300' : 'border-transparent hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Review & Thoughts */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    Kitap Hakkındaki Fikirlerin & İncelemen
                  </label>
                  <textarea
                    rows={3}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Bu kitabı okurken aklında kalanlar, sana hissettirdikleri..."
                    className="w-full bg-white border border-pink-200 rounded-xl p-3 text-sm text-black focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/30 leading-relaxed resize-none shadow-xs"
                  />
                </div>

                {/* Quote */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    Altını Çizdiğin Alıntı (Opsiyonel)
                  </label>
                  <Input
                    type="text"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Kitaptan unutulmaz bir cümle..."
                  />
                </div>

                {/* Favorite Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={favorite}
                    onChange={(e) => setFavorite(e.target.checked)}
                    className="w-4 h-4 rounded border-pink-300 text-sky-500 focus:ring-sky-400 bg-white"
                  />
                  <span className="text-xs font-semibold text-black flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Bu kitabı favorilerime (başyapıtlarıma) ekle
                  </span>
                </label>

                {/* Actions: Baby blue with gray text */}
                <div className="pt-4 border-t border-pink-200 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="babyblue"
                  >
                    Rafa Ekle
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
