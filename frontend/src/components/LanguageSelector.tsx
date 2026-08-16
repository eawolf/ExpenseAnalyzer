'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
        aria-label="Select Language"
      >
        <Globe size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg z-50">
          <ul className="py-1">
            {languages.map((lng) => (
              <li key={lng.code}>
                <button
                  onClick={() => changeLanguage(lng.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors ${i18n.resolvedLanguage === lng.code ? 'font-bold text-[var(--primary)]' : 'text-[var(--foreground)]'}`}
                >
                  {lng.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
