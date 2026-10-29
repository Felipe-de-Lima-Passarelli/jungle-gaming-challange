export default function Hero() {
  return (
    <section className="relative grid min-h-137.5 grid-cols-[1.12fr_0.88fr] items-center gap-[8%] px-[8.8%] pb-19 pt-8.5 max-[1050px]:gap-[5%] max-[1050px]:px-[5%] max-[680px]:block max-[680px]:min-h-0 max-[680px]:px-[6%] max-[680px]:pb-5 max-[680px]:pt-3.5">
      <div className="relative py-2.5 max-[680px]:z-1 max-[680px]:overflow-hidden max-[680px]:rounded-[25px] max-[680px]:bg-[radial-gradient(circle_at_15%_45%,#6a4527_0%,#4a2d1a_40%,#2b1a10_75%)] max-[680px]:px-4 max-[680px]:pb-5.5 max-[680px]:pt-4.5">
        <p className="mb-5.5 text-xs tracking-[0.3px] text-[#e6c9a6] max-[680px]:relative max-[680px]:mb-3 max-[680px]:text-[11px]">
          Bem-vindo à Kurio
        </p>

        <h1 className="mb-3 text-[clamp(28px,3.1vw,43px)] font-bold leading-[1.55] tracking-[-1.2px] text-[#f3e5d5] max-[680px]:relative max-[680px]:mb-1.75 max-[680px]:max-w-[72%] max-[680px]:text-[clamp(21px,6vw,28px)] max-[680px]:tracking-[-0.5px]">
          SEJA DONO DO FUTURO
          <br />
          DA ARTE DIGITAL
        </h1>

        <p className="mb-6.75 max-w-130 text-xs leading-[1.8] text-[#b89a7a] max-[680px]:relative max-[680px]:mb-0.75 max-[680px]:max-w-[68%] max-[680px]:text-[10px] max-[680px]:leading-[1.7]">
          Descubra NFTs selecionados de criadores emergentes e consagrados.
          Colecione arte digital rara, apoie artistas e tenha uma parte da
          cultura da internet.
        </p>

        <a
          href="#mercado"
          className="inline-flex items-center gap-6.25 rounded-[5px] bg-[#dc9149] px-5.5 py-3.25 text-xs font-bold text-[#1c1008] transition-colors hover:bg-[#f0a653] max-[680px]:relative max-[680px]:bg-transparent max-[680px]:p-0 max-[680px]:text-[11px] max-[680px]:text-[#f0a653]"
        >
          EXPLORAR <span>↗</span>
        </a>

        <div className="mt-11 flex justify-end gap-1.75 pr-2 max-[680px]:relative max-[680px]:mt-3.75 max-[680px]:justify-center max-[680px]:p-0">
          {[0, 1, 2].map((dot) => (
            <i
              key={dot}
              className="block size-2 rounded-full bg-[#dc9149] max-[680px]:size-1.75"
            />
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-120 justify-self-end max-[680px]:absolute max-[680px]:right-[6%] max-[680px]:top-27.75 max-[680px]:z-2 max-[680px]:w-[36%] max-[680px]:max-w-36.25">
        <img
          src="/images/emerald-ape.jpg"
          alt="Emerald Ape, colecionável digital da Kurio"
          className="block aspect-square w-full rounded-[22px] object-cover max-[680px]:aspect-[0.88] max-[680px]:rounded-[15px]"
        />

        <span className="absolute bottom-3.5 left-3.5 rounded bg-[#1d120ccc] px-3 py-2.25 text-[9px] tracking-[1px] text-[#f3d5b2] max-[680px]:hidden">
          COLEÇÃO EM DESTAQUE
        </span>
      </div>
    </section>
  );
}
