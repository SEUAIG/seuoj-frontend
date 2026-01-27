import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
interface SearchInputProps {
  placeholder: string;
  onChange: (v: string) => void;
  onSearch?: () => void;
  value: string;
  onClear?: () => void;
}
export default function SearchInput({
  placeholder,
  onChange,
  onSearch,
  value,
  onClear
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        className="pl-8 pr-8"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch?.();
          }
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
