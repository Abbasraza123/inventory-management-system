import { Search } from "lucide-react";

function SearchBar({ value, onChange }) {
  return (
    <label className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 shadow-sm transition-all duration-200 focus-within:border-cyan-300 focus-within:bg-white focus-within:shadow-md hover:border-slate-300">
      <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-cyan-500" />
      <input
        type="text"
        placeholder="Search products by name or category..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          type="button"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </label>
  );
}

export default SearchBar;
