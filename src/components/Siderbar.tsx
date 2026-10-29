//Types
import { type SidebarProps } from "../types/Siderbar";

//Mock data
import { collections, networks } from "../mocks/data";

export default function Sidebar({
  category,
  network,
  onSelectNetwork,
  onSelectCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onApplyRange,
}: SidebarProps) {
  return (
    <aside className="hidden min-w-0 min-[681px]:block">
      <div className="bg-[#24150f] px-5.5 pb-5 pt-6.5">
        <h2 className="mb-4 text-[15px] text-[#f0dfca]">Coleções</h2>

        <div className="flex flex-col">
          {collections.map(([name, count]) => {
            const selected = category === name;

            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectCategory(selected ? "" : name)}
                className={`flex w-full items-center justify-between border-0 px-2 py-2.5 text-left text-xs transition-colors ${
                  selected
                    ? "bg-[#dc91490d] text-[#f0a653]"
                    : "bg-transparent text-[#b99a7a] hover:text-[#f0a653]"
                }`}
              >
                <span>{name}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="my-5.25 h-px bg-[#493023]" />

        <h2 className="mb-4 text-[15px] text-[#f0dfca]">Faixa de preço</h2>

        <div className="flex gap-2.25">
          <label className="grid min-w-0 flex-1 gap-1.5 text-[10px] text-[#b89a7a]">
            ETH
            <input
              aria-label="Preço mínimo em ETH"
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(Number(event.target.value))}
              className="w-full min-w-0 rounded border border-[#493023] bg-[#160d08] p-2 text-[11px] text-[#ead9c6] outline-none focus:border-[#f0a653]"
            />
          </label>

          <label className="grid min-w-0 flex-1 gap-1.5 text-[10px] text-[#b89a7a]">
            ETH
            <input
              aria-label="Preço máximo em ETH"
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full min-w-0 rounded border border-[#493023] bg-[#160d08] p-2 text-[11px] text-[#ead9c6] outline-none focus:border-[#f0a653]"
            />
          </label>
        </div>

        <p className="my-3 text-[10px] text-[#b89a7a]">
          Preço: {minPrice.toFixed(2)} – {maxPrice.toFixed(2)} ETH
        </p>

        <button
          type="button"
          onClick={onApplyRange}
          className="rounded-[5px] bg-[#dc9149] px-3.75 py-2.25 text-[11px] font-bold text-[#1c1008] transition-colors hover:bg-[#f0a653]"
        >
          Aplicar
        </button>

        <div className="my-5.25 h-px bg-[#493023]" />

        <h2 className="mb-4 text-[15px] text-[#f0dfca]">Rede</h2>

        <div className="flex flex-col">
          {networks.map(([name, count]) => {
            const selected = network === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectNetwork(selected ? "" : name)}
                className={`flex w-full items-center justify-between border-0 px-2 py-2.5 text-left text-xs transition-colors ${selected ? "bg-[#dc91490d] text-[#f0a653]" : "bg-transparent text-[#b99a7a] hover:text-[#f0a653]"}`}
              >
                <span>{name}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5.5 bg-[#24150f] px-4.5 py-5.2">
        <span className="text-xs font-bold text-[#dc9149]">
          NFT EM DESTAQUE
        </span>

        <h3 className="my-3.5 text-right text-[13px]">OFERTA LIMITADA</h3>

        <img
          src="/images/sage-nomad.jpg"
          alt="Sage Nomad em destaque"
          loading="lazy"
          className="aspect-square w-full rounded-xl object-cover"
        />

        <p className="mb-1.5 mt-3 text-xs">Sage Nomad #009</p>

        <strong className="text-sm text-[#f0a653]">1.69 ETH</strong>
      </div>
    </aside>
  );
}
