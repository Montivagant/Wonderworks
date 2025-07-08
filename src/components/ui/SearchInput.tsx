'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'order' | 'customer';
  url: string;
}

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string, filters: Record<string, string>) => void;
  suggestions?: SearchSuggestion[];
  filters?: SearchFilter[];
  className?: string;
  showFilters?: boolean;
  loading?: boolean;
}

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  suggestions = [],
  filters = [],
  className,
  showFilters = false,
  loading = false
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.text, activeFilters);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value, activeFilters);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const updateFilter = (filterId: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const clearFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-12 py-2 border border-neutral-300 rounded-lg',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'text-neutral-900 placeholder-neutral-500',
            'transition-colors duration-200',
            isFocused && 'border-primary-500'
          )}
        />
        
        {/* Clear Button */}
        {value && (
          <button
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Filter Toggle */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              'absolute inset-y-0 right-0 pr-10 flex items-center',
              'text-neutral-400 hover:text-neutral-600 transition-colors',
              hasActiveFilters && 'text-primary-600'
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-400"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find(f => f.id === filterId);
            const option = filter?.options.find(o => o.value === value);
            return (
              <span
                key={filterId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
              >
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => clearFilter(filterId)}
                  className="ml-1 hover:text-primary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={clearAllFilters}
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-4"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-900">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {filter.label}
                    </label>
                    <select
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => updateFilter(filter.id, e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">All {filter.label}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-neutral-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 