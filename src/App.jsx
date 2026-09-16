import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_BOOKS } from './data/initialBooks';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import Bookshelf from './components/Bookshelf';
import BookModal from './components/BookModal';
import AddBookModal from './components/AddBookModal';
import AuthModal from './components/AuthModal';
import LocalImportBanner from './components/LocalImportBanner';

import { getSearchScore } from './lib/searchUtils';
import { playPageFlipSound } from './lib/soundUtils';
import { isAuthEnabled } from './lib/supabase';
import { fetchBooks, insertBooks, updateBook, deleteBook } from './lib/booksApi';
import { useAuth } from './hooks/useAuth';

// Books were stored only in the browser before accounts existed
const LEGACY_STORAGE_KEY = 'bookshelf_reading_diary_data';
const LEGACY_IMPORT_DISMISSED_KEY = 'bookshelf_legacy_import_dismissed';
const NOTICE_DURATION_MS = 4000;

function readLegacyLocalBooks() {
  try {
    if (localStorage.getItem(LEGACY_IMPORT_DISMISSED_KEY)) return [];
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // The old app saved the untouched sample shelf for every visitor; only real edits are worth importing
    if (!Array.isArray(parsed) || JSON.stringify(parsed) === JSON.stringify(INITIAL_BOOKS)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to read legacy books from localStorage", e);
    return [];
  }
}

export default function App() {
  const { user, isAuthLoading, signOut } = useAuth();
  const userId = user?.id ?? null;

  // null = the signed-in user's books are not loaded yet
  const [userBooks, setUserBooks] = useState(null);
  const [legacyLocalBooks, setLegacyLocalBooks] = useState(readLegacyLocalBooks);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'sign_in', reason: '' });
  const [notice, setNotice] = useState('');

  // Guests see the sample shelf; signed-in users see their own
  const books = userId ? (userBooks ?? []) : INITIAL_BOOKS;
  const canEdit = Boolean(userId);
  const isShelfLoading = isAuthLoading || (Boolean(userId) && userBooks === null);

  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Default view mode is now 'spine' (Kitap Sırtı)
  const [viewMode, setViewMode] = useState('spine');

  // Dark / Light mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('bookshelf_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('bookshelf_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('bookshelf_theme', 'light');
      }
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Load the shelf whenever the signed-in user changes
  useEffect(() => {
    let isCancelled = false;
    setUserBooks(null);
    setSelectedBook(null);
    if (!userId) return;

    fetchBooks(userId)
      .then((loadedBooks) => {
        if (!isCancelled) setUserBooks(loadedBooks);
      })
      .catch((e) => {
        console.error("Failed to load books", e);
        if (!isCancelled) setNotice('Kitapların yüklenemedi. Sayfayı yenileyip tekrar dene.');
      });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const reloadUserBooks = useCallback(async () => {
    if (!userId) return;
    setUserBooks(await fetchBooks(userId));
  }, [userId]);

  // Runs a database write after the optimistic local update; reloads the shelf if it fails
  const syncWithDatabase = async (operation) => {
    try {
      await operation();
      return true;
    } catch (e) {
      console.error("Failed to sync books", e);
      setNotice('Değişiklik kaydedilemedi, rafın yeniden yüklendi.');
      reloadUserBooks().catch((reloadError) => console.error("Failed to reload books", reloadError));
      return false;
    }
  };

  const openAuthModal = (mode = 'sign_in', reason = '') => {
    setAuthModal({ isOpen: true, mode, reason });
  };

  // Called when a guest tries to change the sample shelf
  const requireAuth = () => {
    setSelectedBook(null);
    setIsAddModalOpen(false);
    if (!isAuthEnabled) {
      setNotice('Bu raf bir örnek, şu an düzenlenemez.');
      return;
    }
    openAuthModal('sign_up', 'Bu raf bir örnek. Kendi kitaplarını eklemek ve düzenlemek için kayıt ol ya da giriş yap.');
  };

  const handleOpenAddModal = () => {
    if (!canEdit) {
      requireAuth();
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setSelectedBook(null);
  };

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
    setUserBooks(prev => [newBook, ...(prev ?? [])]);
    if (newBook.status === 'read') {
      triggerConfetti();
    }
    syncWithDatabase(() => insertBooks(userId, [newBook]));
  };

  // Update existing book
  const handleUpdateBook = (updatedBook) => {
    setUserBooks(prev => (prev ?? []).map(b => b.id === updatedBook.id ? updatedBook : b));
    if (selectedBook && selectedBook.id === updatedBook.id) {
      setSelectedBook(updatedBook);
    }
    syncWithDatabase(() => updateBook(userId, updatedBook));
  };

  // Delete book
  const handleDeleteBook = (bookId) => {
    setUserBooks(prev => (prev ?? []).filter(b => b.id !== bookId));
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook(null);
    }
    syncWithDatabase(() => deleteBook(userId, bookId));
  };

  // Copies the sample books onto the signed-in user's shelf
  const handleLoadSampleBooks = () => {
    syncWithDatabase(async () => {
      await insertBooks(userId, INITIAL_BOOKS);
      await reloadUserBooks();
    });
  };

  // Moves books saved in this browser (before accounts existed) into the user's account
  const handleImportLegacyBooks = async () => {
    const isImported = await syncWithDatabase(async () => {
      await insertBooks(userId, legacyLocalBooks);
      await reloadUserBooks();
    });
    if (!isImported) return;

    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear legacy books from localStorage", e);
    }
    setLegacyLocalBooks([]);
    setNotice('Kitapların hesabına aktarıldı.');
  };

  const handleDismissLegacyBooks = () => {
    try {
      localStorage.setItem(LEGACY_IMPORT_DISMISSED_KEY, 'true');
    } catch (e) {
      console.error("Failed to save legacy import preference", e);
    }
    setLegacyLocalBooks([]);
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
    if (!canEdit) {
      requireAuth();
      return;
    }
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            syncWithDatabase(async () => {
              await insertBooks(userId, parsed, { overwrite: true });
              await reloadUserBooks();
            }).then((isImported) => {
              if (isImported) alert("Kitaplık başarıyla içeri aktarıldı!");
            });
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
    <div className="min-h-screen flex flex-col bg-[#fce7f3] dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 selection:bg-[#89CFF0] selection:text-gray-800 transition-colors duration-300">
      
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
        onOpenAddModal={handleOpenAddModal}
        totalBooks={books.length}
        onExport={handleExport}
        onImport={handleImport}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAuthEnabled={isAuthEnabled}
        user={user}
        onOpenAuth={() => openAuthModal('sign_in')}
        onSignOut={handleSignOut}
      />

      {/* Main Bookshelf - directly below genres, defaults to spine view */}
      <main className="flex-1 pb-4">
        {canEdit && userBooks !== null && legacyLocalBooks.length > 0 && (
          <LocalImportBanner
            bookCount={legacyLocalBooks.length}
            onImport={handleImportLegacyBooks}
            onDismiss={handleDismissLegacyBooks}
          />
        )}
        <Bookshelf
          books={filteredBooks}
          onSelectBook={handleSelectBook}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenAddModal={handleOpenAddModal}
          isLoading={isShelfLoading}
          isShelfEmpty={canEdit && userBooks?.length === 0}
          onLoadSampleBooks={handleLoadSampleBooks}
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
          books={filteredBooks}
          onSelectBook={handleSelectBook}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
          canEdit={canEdit}
          onRequireAuth={requireAuth}
        />
      )}

      {/* Add New Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddBook}
      />

      {/* Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        reason={authModal.reason}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Short-lived status message */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-[calc(100%-2rem)] px-4 py-2.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 text-xs font-semibold shadow-xl"
        >
          {notice}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-pink-200/80 dark:border-zinc-800 py-6 px-4 text-center text-xs text-gray-700 dark:text-zinc-400 bg-pink-100/60 dark:bg-zinc-900/60 transition-colors">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="font-semibold text-black dark:text-zinc-200">Shelf of Books · Kişisel Okuma Günlüğü</span>
          <span>•</span>
          <button
            onClick={handleExport}
            className="text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white underline underline-offset-2 font-medium cursor-pointer"
          >
            Kitaplığı Yedekle (JSON)
          </button>
          <span>•</span>
          <label
            onClick={(e) => {
              if (!canEdit) {
                e.preventDefault();
                requireAuth();
              }
            }}
            className="text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white underline underline-offset-2 font-medium cursor-pointer"
          >
            Yedekten Yükle
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          {canEdit && (
            <>
              <span>•</span>
              <button
                onClick={handleLoadSampleBooks}
                className="text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white underline underline-offset-2 font-medium cursor-pointer"
              >
                Örnek Kitapları Ekle
              </button>
            </>
          )}
        </div>
      </footer>

    </div>
  );
}
