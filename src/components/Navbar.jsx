import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Sparkles, Search, Filter, ArrowRight, Quote } from 'lucide-react';
import { GENRES } from '../data/initialBooks';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { getSearchScore, getMatchType, normalizeStr } from '../lib/searchUtils';

function highlightMatch(text, query) {
  if (!text || !query?.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#89CFF0]/45 text-black font-bold px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function Navbar({
  books = [],
  onSelectBook,
  selectedGenre,
  setSelectedGenre,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onOpenAddModal,
  onExport,
  onImport
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live matched expressions with strict prioritization:
  // 1) Titles starting with query
  // 2) Titles containing query
  // 3) Authors starting with query
  // 4) Authors containing query
  // 5) Other matches
  const matchingResults = useMemo(() => {
    if (!searchQuery.trim() || !books) return [];
    const q = searchQuery.trim();

    return books
      .map(book => {
        const score = getSearchScore(book, q);
        if (score >= 999) return null;

        const matchType = getMatchType(book, q);
        let matchSnippet = '';

        if (matchType === 'Alıntı') {
          const matchedQuote = book.quotes?.find(quote =>
            normalizeStr(quote).includes(normalizeStr(q))
          );
          matchSnippet = matchedQuote || '';
        } else if (matchType === 'Not') {
          matchSnippet = book.review || '';
        }

        return {
          book,
          score,
          matchType,
          matchSnippet
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Priority order based on score:
        if (a.score !== b.score) return a.score - b.score;
        return (a.book.title || '').localeCompare(b.book.title || '', 'tr-TR');
      })
      .slice(0, 8); // Top 8 prioritized matches
  }, [books, searchQuery]);

  // Group matches for structured preview
  const titleMatches = useMemo(() => matchingResults.filter(r => r.score <= 3), [matchingResults]);
  const authorMatches = useMemo(() => matchingResults.filter(r => r.score >= 4 && r.score <= 6), [matchingResults]);
  const otherMatches = useMemo(() => matchingResults.filter(r => r.score >= 7), [matchingResults]);

  const handleSelectMatchedBook = (book) => {
    if (onSelectBook) {
      onSelectBook(book);
    }
    setIsDropdownOpen(false);
  };

  const renderResultItem = ({ book, matchType, matchSnippet }) => (
    <div
      key={book.id}
      onClick={() => handleSelectMatchedBook(book)}
      className="p-2.5 hover:bg-pink-50/80 transition flex items-center gap-3 cursor-pointer group"
    >
      {/* Book Thumbnail */}
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-8 h-11 object-cover rounded shadow-xs border border-pink-200 shrink-0"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* Info & Highlights */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="text-xs font-bold text-zinc-950 group-hover:text-sky-700 transition-colors truncate max-w-[200px]">
            {highlightMatch(book.title, searchQuery)}
          </h4>
          <Badge
            variant={matchType === 'Kitap Adı' ? 'babyblue' : 'secondary'}
            className="text-[9px] py-0 px-1.5 h-4"
          >
            {matchType}
          </Badge>
        </div>

        <p className="text-[11px] text-gray-700 font-medium truncate mt-0.5">
          {highlightMatch(book.author, searchQuery)}
        </p>

        {/* Snippet preview if matched in quote or review */}
        {matchSnippet && (
          <div className="flex items-center gap-1 mt-1 text-[10px] italic text-gray-600 truncate bg-pink-100/50 px-1.5 py-0.5 rounded">
            <Quote className="w-2.5 h-2.5 text-sky-600 shrink-0" />
            <span className="truncate">
              "{highlightMatch(matchSnippet, searchQuery)}"
            </span>
          </div>
        )}
      </div>

      {/* Arrow icon */}
      <div className="text-gray-400 group-hover:text-sky-600 transition-colors shrink-0">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-pink-100/90 border-b border-pink-200 shadow-sm px-4 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Top row: Centered Large Handwriting Title & Header Actions */}
        <div className="relative flex items-center justify-between gap-3 pt-1">
          
          {/* Left spacer for perfect balance */}
          <div className="hidden sm:block w-28 shrink-0" />

          {/* Center: Large Handwriting Italic Title with GIFs on Left & Right */}
          <div className="flex-1 sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center gap-2 sm:gap-3 select-none py-0.5">
            <img
              src="/devnature1990.gif"
              alt="Nature Animation"
              className="h-7 sm:h-9 md:h-10 w-auto object-contain shrink-0 drop-shadow-sm pointer-events-none"
            />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal italic font-cursive text-[#b8406a] tracking-wider leading-none drop-shadow-xs whitespace-nowrap">
              Shelf of Books
            </h1>
            <img
              src="/heart.gif"
              alt="Heart Animation"
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0 drop-shadow-sm pointer-events-none"
            />
          </div>

          {/* Right: Kitap Ekle button */}
          <div className="flex items-center justify-end z-10">
            <Button
              variant="babyblue"
              onClick={onOpenAddModal}
              className="gap-2 group shadow-sm"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-pulse drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping pointer-events-none opacity-80" />
              </div>
              <span>Kitap Ekle</span>
            </Button>
          </div>
        </div>

        {/* Bottom row: Search with Prioritized Live Match Dropdown & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          
          {/* Search bar with live autocomplete dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                }
              }}
              placeholder="Kitap adı, yazar, tür veya alıntılarda ara..."
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            )}

            {/* Live Matches Dropdown with Prioritization */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-pink-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-pink-100 flex items-center justify-between bg-pink-50/70 text-xs">
                  <span className="font-bold text-gray-800">
                    Öncelikli Eşleşmeler ({matchingResults.length})
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ESC ile kapat
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-pink-100">
                  {matchingResults.length > 0 ? (
                    <>
                      {/* Section 1: Kitap Adı Eşleşmeleri (Öncelikli) */}
                      {titleMatches.length > 0 && (
                        <div>
                          <div className="px-3 py-1 bg-pink-100/40 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            Kitaplar ({titleMatches.length})
                          </div>
                          {titleMatches.map(renderResultItem)}
                        </div>
                      )}

                      {/* Section 2: Yazar Eşleşmeleri (Peşisıra) */}
                      {authorMatches.length > 0 && (
                        <div>
                          <div className="px-3 py-1 bg-pink-100/40 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            Yazarlar ({authorMatches.length})
                          </div>
                          {authorMatches.map(renderResultItem)}
                        </div>
                      )}

                      {/* Section 3: Diğer Eşleşmeler (Alıntı, Tür, Not) */}
                      {otherMatches.length > 0 && (
                        <div>
                          <div className="px-3 py-1 bg-pink-100/40 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            Diğer Eşleşmeler ({otherMatches.length})
                          </div>
                          {otherMatches.map(renderResultItem)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 px-4 text-center text-xs text-gray-600">
                      <p className="font-semibold text-black">
                        "{searchQuery}" ile eşleşen kitap bulunamadı.
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Farklı bir harf, yazar adı veya alıntı yazmayı deneyin.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of dropdown */}
                <div className="p-2 border-t border-pink-100 bg-pink-50/40 text-center">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline"
                  >
                    Tüm eşleşenleri kitaplık rafında filtrele
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reading Status Filter */}
          <div className="flex items-center gap-1 bg-white/90 border border-pink-200 p-1 rounded-xl self-start sm:self-auto text-xs shadow-xs">
            <Button
              variant={statusFilter === 'all' ? 'tabActive' : 'tabInactive'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tümü
            </Button>
            <Button
              variant={statusFilter === 'read' ? 'babyblue' : 'tabInactive'}
              size="sm"
              onClick={() => setStatusFilter('read')}
              className={statusFilter === 'read' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}
            >
              Okunanlar
            </Button>
            <Button
              variant={statusFilter === 'reading' ? 'tabActive' : 'tabInactive'}
              size="sm"
              onClick={() => setStatusFilter('reading')}
            >
              Okunuyor
            </Button>
            <Button
              variant={statusFilter === 'want_to_read' ? 'babyblue' : 'tabInactive'}
              size="sm"
              onClick={() => setStatusFilter('want_to_read')}
              className={statusFilter === 'want_to_read' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
            >
              İstek Listesi
            </Button>
          </div>
        </div>

        {/* Genre Tags Scrollable Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-zinc-950 font-bold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-zinc-800" /> Türler:
          </span>
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <Button
                key={genre}
                variant={isSelected ? 'genreActive' : 'genreInactive'}
                size="pill"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
