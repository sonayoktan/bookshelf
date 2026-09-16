import React, { useMemo } from 'react';
import { Quote, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { pickDailyQuote } from '../lib/dailyQuote';

export default function WelcomeCard({ displayName, userId, books = [], onSelectBook }) {
  const dailyQuote = useMemo(() => pickDailyQuote(books, userId), [books, userId]);
  const currentlyReading = books.find((book) => book.status === 'reading');

  return (
    <Card className="p-5 flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-3xl sm:text-4xl font-cursive italic text-[#b8406a] dark:text-[#fef3c7] leading-tight">
          Hoş geldin, {displayName}
        </h2>
        <p className="text-xs font-medium text-gray-700 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          {currentlyReading ? (
            <span>
              Şu an <span className="font-bold text-black dark:text-zinc-200">{currentlyReading.title}</span> okuyorsun.
            </span>
          ) : (
            <span>Rafında {books.length} kitap seni bekliyor.</span>
          )}
        </p>
      </div>

      <div className="flex-1 rounded-xl bg-pink-50/80 dark:bg-zinc-800/70 border border-pink-200/80 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
          <Quote className="w-3.5 h-3.5" />
          <span>Günün Alıntısı</span>
        </div>

        {dailyQuote ? (
          <figure>
            <blockquote className="font-serif italic text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-relaxed line-clamp-4">
              “{dailyQuote.text}”
            </blockquote>
            <figcaption className="mt-2 text-xs">
              <button
                type="button"
                onClick={() => onSelectBook(dailyQuote.book)}
                className="font-semibold text-gray-700 dark:text-zinc-300 hover:text-[#b8406a] dark:hover:text-[#f472b6] underline-offset-2 hover:underline transition-colors cursor-pointer text-left"
              >
                {dailyQuote.book.title}
                {dailyQuote.book.author && <span className="font-medium">, {dailyQuote.book.author}</span>}
              </button>
            </figcaption>
          </figure>
        ) : (
          <p className="text-xs font-medium text-gray-600 dark:text-zinc-400">
            Kitaplarına alıntı ekledikçe burada her gün birini göreceksin.
          </p>
        )}
      </div>
    </Card>
  );
}
