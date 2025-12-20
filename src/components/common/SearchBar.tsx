import { Button } from "@/components/ui/button";
import  SearchInput from "./SearchInput";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <SearchInput
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        onClear={() => onChange("")}
        placeholder="搜索用户"
      />
      <Button size="sm" onClick={onSearch}>
        搜索
      </Button>
    </div>
  );
}
