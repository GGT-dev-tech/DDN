import { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressOption {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (address: string, lat: string, lon: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, disabled }: AddressAutocompleteProps) {
  const [options, setOptions] = useState<AddressOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Close dropdown if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!value || value.length < 5) {
      setOptions([]);
      return;
    }
    
    // Only search if the dropdown is actually supposed to be open (user is typing)
    // If they just selected something, we shouldn't trigger another search immediately 
    // unless they start modifying it. We'll handle this by debounce.
    const delayDebounceFn = setTimeout(async () => {
      if (!isOpen) return;
      
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=br&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [value, isOpen]);

  const handleSelect = (option: AddressOption) => {
    setIsOpen(false);
    onSelect(option.display_name, option.lat, option.lon);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Input 
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => {
            if (value.length >= 5) setIsOpen(true);
          }}
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <Loader2 size={16} className="animate-spin text-brand-500" />
          </div>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-surface-white border border-surface-variant rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <li 
              key={index}
              className="px-4 py-2 hover:bg-surface-bright cursor-pointer text-sm text-on-surface-variant flex items-start gap-2 border-b border-surface-variant last:border-0"
              onClick={() => handleSelect(option)}
            >
              <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
              <span>{option.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
