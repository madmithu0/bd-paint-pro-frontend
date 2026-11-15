import React from 'react';
import { Languages } from 'lucide-react';
import { useStore } from '../store';

export default function LanguageToggle() {
  const { language, setLanguage } = useStore();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition"
    >
      <Languages size={14} className="text-blue-600" />
      <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
    </button>
  );
}
