//React
import { Link } from "@tanstack/react-router";

//Types
import type { NFTCardProps } from "../types/NFTCardProps";

//Lib
import { formatEth } from "../lib/eth";

//ui
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export default function NFTCard({
  nft,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: NFTCardProps) {
  return (
    <Card as="article" className="min-w-0 border-0 bg-transparent">
      <div className="relative rounded-t-[7px] bg-[#24150f] p-2.25 max-[680px]:rounded-[20px] max-[680px]:bg-[#2a1a12] max-[680px]:p-1">
        <img
          src={nft.image}
          alt={nft.name}
          loading="lazy"
          className="block aspect-square w-full rounded-[10px] object-cover max-[680px]:rounded-2xl"
        />

        {nft.isRare && (
          <Badge className="absolute left-2.25 top-[48%] rounded-none px-2.75 py-2 max-[680px]:left-0 max-[680px]:px-2 max-[680px]:py-1.5">
            RARO
          </Badge>
        )}

        <button
          type="button"
          aria-label={
            isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(nft.id)}
          className={`absolute right-3.75 top-3.75 grid size-7.5 place-items-center rounded-full border border-[#704d31] bg-[#21130dcc] text-[19px] transition-colors hover:text-[#f5a56d] max-[680px]:right-2.25 max-[680px]:top-2.25 max-[680px]:size-7 ${
            isFavorite ? "text-[#f5a56d]" : "text-[#e6c7a6]"
          }`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <p className="mb-1.75 mt-2.5 truncate text-xs text-[#e9d8c2] max-[680px]:mx-1.25 max-[680px]:mb-1.25 max-[680px]:mt-2.25 max-[680px]:text-[11px]">
        {nft.name}
      </p>

      <Link
        to="/nft/$nftId"
        params={{ nftId: String(nft.id) }}
        className="mb-3 inline-block text-xs text-[#e99b48] hover:underline"
      >
        Ver detalhes ↗
      </Link>

      <div className="flex items-center justify-between gap-1.25 max-[680px]:block max-[680px]:px-1.25">
        <strong className="whitespace-nowrap text-sm text-[#f0a653] max-[680px]:block max-[680px]:text-[13px]">
          {formatEth(nft.price, 2)} {nft.currency}
        </strong>

        <button
          type="button"
          onClick={() => onAddToCart(nft.id)}
          disabled={nft.available === false}
          aria-label={`Adicionar ${nft.name} ao carrinho`}
          className="whitespace-nowrap rounded border border-[#593b28] bg-[#21130d] px-2 py-1.75 text-[10px] text-[#d9b18b] transition-colors hover:bg-[#3a2113] disabled:cursor-not-allowed disabled:opacity-40 max-[680px]:hidden"
        >
          {nft.available === false ? (
            "Indisponível"
          ) : (
            <>
              + <span>Adicionar</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
