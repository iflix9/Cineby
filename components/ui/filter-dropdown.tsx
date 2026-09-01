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
        className={`flex items-center justify-between w-full min-w-[130px] bg-[#111111] border border-zinc-800/80 rounded-lg px-3.5 py-2 text-sm text-zinc-200 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 shadow-sm gap-3 ${buttonClassName}`}
      >
        <span className="truncate whitespace-nowrap">{displayValue}</span>
        <Icons.chevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 min-w-[160px] mt-1.5 bg-[#161616] border border-zinc-800/80 rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-zinc-800/80 bg-[#161616] shrink-0">
              <div className="relative">
                <Icons.search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-md py-1.5 pl-8 pr-2 text-[16px] sm:text-xs text-white focus:outline-none focus:border-red-500/50"
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
            {allOption && !searchQuery && (
              <button
                className={`w-full text-left px-3.5 py-1.5 text-sm transition-colors hover:bg-zinc-800/50 ${value === allOption.id ? 'text-red-500 bg-red-500/10 font-medium' : 'text-zinc-300'}`}
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
                  className={`w-full text-left px-3.5 py-1.5 text-sm transition-colors hover:bg-zinc-800/50 ${value === option.id ? 'text-red-500 bg-red-500/10 font-medium' : 'text-zinc-300'}`}
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
