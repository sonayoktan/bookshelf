import React, { useState, useEffect, useRef } from 'react';
import { Target, Pencil, PartyPopper } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

const MAX_TARGET_BOOKS = 1000;
const MONTHS_IN_YEAR = 12;

export default function ReadingGoalCard({ year, readCount, targetBooks, onSaveTarget, onGoalReached }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTarget, setDraftTarget] = useState('');
  const wasReachedRef = useRef(null);

  const hasGoal = Boolean(targetBooks);
  const isReached = hasGoal && readCount >= targetBooks;
  const progressPercent = hasGoal ? Math.min(100, Math.round((readCount / targetBooks) * 100)) : 0;
  const remainingBooks = hasGoal ? Math.max(0, targetBooks - readCount) : 0;
  const remainingMonths = MONTHS_IN_YEAR - new Date().getMonth();
  const booksPerMonth = Math.ceil(remainingBooks / remainingMonths);

  // Celebrate only when the goal becomes reached, not when the page loads with it already reached
  useEffect(() => {
    if (!hasGoal) {
      wasReachedRef.current = null;
      return;
    }
    if (wasReachedRef.current === false && isReached) {
      onGoalReached?.();
    }
    wasReachedRef.current = isReached;
  }, [hasGoal, isReached, onGoalReached]);

  const startEditing = () => {
    setDraftTarget(targetBooks ? String(targetBooks) : '');
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedTarget = Number.parseInt(draftTarget, 10);
    if (!parsedTarget || parsedTarget < 1 || parsedTarget > MAX_TARGET_BOOKS) return;
    onSaveTarget(parsedTarget);
    setIsEditing(false);
  };

  const showForm = isEditing || !hasGoal;

  return (
    <Card className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#89CFF0]/30 dark:bg-[#89CFF0]/20 text-sky-800 dark:text-sky-300 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-base font-serif font-bold text-black dark:text-zinc-100">
            {year} Okuma Hedefi
          </h2>
        </div>
        {hasGoal && !isEditing && (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={startEditing}
            title="Hedefi düzenle"
            aria-label="Hedefi düzenle"
            className="cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center gap-3">
          <label htmlFor="reading-goal-target" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Bu yıl kaç kitap okumak istiyorsun?
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="reading-goal-target"
              type="number"
              min={1}
              max={MAX_TARGET_BOOKS}
              value={draftTarget}
              onChange={(e) => setDraftTarget(e.target.value)}
              placeholder="Örn: 24"
              className="w-28"
              autoFocus={isEditing}
            />
            <Button type="submit" variant="babyblue" size="sm" className="h-9 cursor-pointer">
              {hasGoal ? 'Kaydet' : 'Hedef Belirle'}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-9 cursor-pointer"
              >
                İptal
              </Button>
            )}
          </div>
          {!hasGoal && readCount > 0 && (
            <p className="text-xs font-medium text-gray-600 dark:text-zinc-400">
              Bu yıl şimdiden {readCount} kitap okudun.
            </p>
          )}
        </form>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="flex items-baseline justify-between">
            <div className="font-mono font-bold text-black dark:text-zinc-100">
              <span className="text-3xl">{readCount}</span>
              <span className="text-sm text-gray-500 dark:text-zinc-400 font-normal"> / {targetBooks} kitap</span>
            </div>
            <span className="text-sm font-bold font-mono text-[#b8406a] dark:text-[#f472b6]">
              %{progressPercent}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={targetBooks}
            aria-valuenow={readCount}
            className="h-3 w-full rounded-full bg-pink-100 dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#89CFF0] to-[#f472b6] transition-[width] duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs font-medium text-gray-700 dark:text-zinc-400 flex items-center gap-1.5">
            {isReached ? (
              <>
                <PartyPopper className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-black dark:text-zinc-200">Hedefine ulaştın, tebrikler!</span>
              </>
            ) : (
              <span>
                Hedefe <span className="font-bold text-black dark:text-zinc-200">{remainingBooks} kitap</span> kaldı
                {' '}· ayda yaklaşık {booksPerMonth} kitap
              </span>
            )}
          </p>
        </div>
      )}
    </Card>
  );
}
