'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from '@/components/ui/icons';

interface Option {
  id: string;
  name: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  allOption?: { id: string; name: string };
  className?: string;
  buttonClassName?: string;
  searchable?: boolean;
}

export function FilterDropdown({ 
  value, 
  onChange, 
  options, 
  allOption,
  className = '',
  buttonClassName = '',
  searchable = false
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value) || (value === (allOption?.id ?? '') ? allOption : null);
  const displayValue = selectedOption ? selectedOption.name : (allOption ? allOption.name : 'Select...');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setTimeout(() => setSearchQuery(''), 0);
    }
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => opt.name.toLowerCase().includes(lowerQuery));
  }, [options, searchable, searchQuery]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full min-w-[130px] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_6px_rgba(0,0,0,0.3)] rounded-full px-4 py-2 text-[14px] font-medium text-white hover:from-white/15 hover:to-white/10 active:scale-[0.97] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 focus:outline-none gap-3 ${buttonClassName}`}
      >
        <span className="truncate whitespace-nowrap">{displayValue}</span>
        <Icons.chevronDown className={`w-4 h-4 text-zinc-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 min-w-[180px] mt-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 flex flex-col ring-1 ring-black/50">
          {searchable && (
            <div className="p-2 border-b border-white/10 bg-transparent shrink-0">
              <div className="relative">
                <Icons.search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-8 pr-2 text-[16px] sm:text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto custom-scrollbar py-1.5 px-1">
            {allOption && !searchQuery && (
              <button
                className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-lg mb-0.5 ${value === allOption.id ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                onClick={() => {
                  onChange(allOption.id);
                  setIsOpen(false);
                }}
              >
                {allOption.name}
              </button>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-zinc-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-lg mb-0.5 ${value === option.id ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
