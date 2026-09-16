import React, { useState } from 'react';
import { HardDriveDownload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export default function LocalImportBanner({ bookCount, onImport, onDismiss }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await onImport();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-sky-200 dark:border-sky-900 bg-[#89CFF0]/15 dark:bg-sky-500/10 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-zinc-800 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
            <HardDriveDownload className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-black dark:text-zinc-100">
              Bu tarayıcıda kayıtlı {bookCount} kitap bulundu
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-zinc-400">
              Hesabına aktarırsan her cihazdan rafına ulaşabilirsin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            disabled={isImporting}
            className="cursor-pointer"
          >
            Şimdi Değil
          </Button>
          <Button
            variant="babyblue"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
            className="gap-1.5 cursor-pointer"
          >
            {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Hesabıma Aktar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
