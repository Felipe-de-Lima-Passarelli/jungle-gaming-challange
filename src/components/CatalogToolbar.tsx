//Types
import type { CatalogToolbarProps } from "../types/Catalog";

//Mock data
import { tabs } from "../mocks/data";

export default function CatalogToolbar({
  tab,
  onChangeTab,
  sort,
  onChangeSort,
  query,
  onChangeQuery,
  category,
  onClearCategory,
  resultCount,
}: CatalogToolbarProps) {
  return (
    <div>
      <div className="mb-4.25 flex min-h-9.5 items-center justify-between gap-3 max-[1050px]:flex-col max-[1050px]:items-start max-[680px]:mb-3.5 max-[680px]:block">
        <div className="flex items-center gap-4.5 max-[680px]:gap-3.5 max-[680px]:overflow-x-auto max-[680px]:whitespace-nowrap">
          {tabs.map((name) => {
            const active = tab === name;

            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => onChangeTab(name)}
                className={`border-0 border-b-2 px-0 py-2.25 text-xs whitespace-nowrap transition-colors max-[680px]:text-[11px] ${
                  active
                    ? "border-b-[#dc9149] text-[#f0a653]"
                    : "border-b-transparent bg-transparent text-[#d3c0aa] hover:text-[#f0a653]"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-1.5 self-end whitespace-nowrap text-[10px] text-[#b89a7a] max-[680px]:hidden">
          Ordenar por:
          <select
            value={sort}
            onChange={(event) => onChangeSort(event.target.value)}
            className="max-w-37.5 border-0 bg-transparent text-[10px] text-[#e1c9ad] outline-none focus-visible:ring-1 focus-visible:ring-[#f0a653]"
          >
            <option className="bg-[#24150f]" value="recentes">
              Listados recentemente
            </option>
            <option className="bg-[#24150f]" value="menor">
              Menor preço
            </option>
            <option className="bg-[#24150f]" value="maior">
              Maior preço
            </option>
          </select>
        </label>
      </div>

      <label className="mb-2.5 flex h-10.5 items-center gap-3 rounded-[5px] border border-[#493023] bg-[#1b100b] px-3.25 focus-within:border-[#f0a653] max-[680px]:hidden">
        <span className="text-[22px] text-[#b89a7a]">⌕</span>
        <input
          id="search"
          value={query}
          onChange={(event) => onChangeQuery(event.target.value)}
          placeholder="Buscar NFTs ou coleções..."
          aria-label="Buscar NFTs ou coleções"
          className="min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#ead9c6] outline-none placeholder:text-[#b89a7a]"
        />
        <kbd className="text-[9px] text-[#b89a7a]">⌘ K</kbd>
      </label>

      <div className="flex min-h-6.25 items-center justify-between text-[10px] text-[#a98d71] max-[680px]:hidden">
        <div>
          {category && (
            <button
              type="button"
              onClick={onClearCategory}
              className="rounded-[3px] border border-[#493023] bg-[#24150f] px-2 py-1 text-[#f0a653] hover:bg-[#301b11]"
            >
              {category} ×
            </button>
          )}
        </div>

        <span>{resultCount} itens encontrados</span>
      </div>
    </div>
  );
}
