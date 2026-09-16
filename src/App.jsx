import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_BOOKS } from './data/initialBooks';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import Bookshelf from './components/Bookshelf';
import BookModal from './components/BookModal';
import AddBookModal from './components/AddBookModal';

import { getSearchScore } from './lib/searchUtils';
import { playPageFlipSound } from './lib/soundUtils';

const STORAGE_KEY = 'bookshelf_reading_diary_data';

export default function App() {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch (e) {
      console.error("Failed to load books from localStorage", e);
      return INITIAL_BOOKS;
    }
  });

  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Default view mode is now 'spine' (Kitap Sırtı)
  const [viewMode, setViewMode] = useState('spine');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error("Failed to save books to localStorage", e);
    }
  }, [books]);

  // Trigger celebration confetti with babyblue and cheerful accents
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#89CFF0', '#72bbf0', '#f472b6', '#ec4899', '#38bdf8']
    });
  };

  // Add new book
  const handleAddBook = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
    if (newBook.status === 'read') {
      triggerConfetti();
    }
  };

  // Update existing book
  const handleUpdateBook = (updatedBook) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    if (selectedBook && selectedBook.id === updatedBook.id) {
      setSelectedBook(updatedBook);
    }
  };

  // Delete book
  const handleDeleteBook = (bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook(null);
    }
  };

  // Select book with page flip sound effect
  const handleSelectBook = (book) => {
    if (book) {
      playPageFlipSound();
    }
    setSelectedBook(book);
  };

  // Export books as JSON file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bookshelf_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import books from JSON file
  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setBooks(parsed);
            alert("Kitaplık başarıyla içeri aktarıldı!");
          } else {
            alert("Geçersiz dosya formatı. Kitap listesi içeren bir JSON dosyası seçin.");
          }
        } catch (err) {
          alert("Dosya okunurken bir hata oluştu.");
        }
      };
    }
  };

  // Filtered books for Bookshelf display with prioritized search ordering
  const filteredBooks = useMemo(() => {
    const list = books.filter(book => {
      // Genre filter
      if (selectedGenre !== 'Tümü' && book.genre !== selectedGenre) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && book.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const score = getSearchScore(book, searchQuery);
        if (score >= 999) return false;
      }
      return true;
    });

    // When searching, sort books by priority:
    // 1) Titles starting with query
    // 2) Titles containing query
    // 3) Authors starting with query
    // 4) Authors containing query
    // 5) Other matches
    if (searchQuery.trim()) {
      return [...list].sort((a, b) => {
        const scoreA = getSearchScore(a, searchQuery);
        const scoreB = getSearchScore(b, searchQuery);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return (a.title || '').localeCompare(b.title || '', 'tr-TR');
      });
    }

    return list;
  }, [books, selectedGenre, statusFilter, searchQuery]);

  // Books filtered by genre for stats bar (adapts dynamically when genre changes)
  const genreBooks = useMemo(() => {
    if (selectedGenre === 'Tümü') {
      return books;
    }
    return books.filter(b => b.genre === selectedGenre);
  }, [books, selectedGenre]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fce7f3] text-zinc-900 selection:bg-[#89CFF0] selection:text-gray-800">
      
      {/* Top Navigation & Genre Selection */}
      <Navbar
        books={books}
        onSelectBook={handleSelectBook}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        totalBooks={books.length}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Bookshelf - directly below genres, defaults to spine view */}
      <main className="flex-1 pb-4">
        <Bookshelf
          books={filteredBooks}
          onSelectBook={handleSelectBook}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Stats Summary Bar - located underneath the bookshelf, filtered by selected genre */}
      <section className="pb-12">
        <StatsBar books={genreBooks} selectedGenre={selectedGenre} />
      </section>

      {/* Book Detail & Edit Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {/* Add New Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddBook}
      />

      {/* Footer */}
      <footer className="border-t border-pink-200/80 py-6 px-4 text-center text-xs text-gray-700 bg-pink-100/60">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="font-semibold text-black">Shelf of Books · Kişisel Okuma Günlüğü</span>
          <span>•</span>
          <button
            onClick={handleExport}
            className="text-gray-700 hover:text-black underline underline-offset-2 font-medium"
          >
            Kitaplığı Yedekle (JSON)
          </button>
          <span>•</span>
          <label className="text-gray-700 hover:text-black underline underline-offset-2 font-medium cursor-pointer">
            Yedekten Yükle
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <span>•</span>
          <button
            onClick={() => {
              if (window.confirm("Tüm kitaplığı varsayılan haline döndürmek istiyor musunuz?")) {
                setBooks(INITIAL_BOOKS);
                localStorage.removeItem(STORAGE_KEY);
              }
            }}
            className="text-gray-700 hover:text-black underline underline-offset-2 font-medium"
          >
            Varsayılan Kitapları Geri Yükle
          </button>
        </div>
      </footer>

    </div>
  );
}
