import { Search } from "lucide-react";

function SearchBar({ value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-sm">
      <Search className="h-4 w-4" />
      <input
        type="text"
        placeholder="Search products"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent outline-none"
      />
    </label>
  );
}

export default SearchBar;
