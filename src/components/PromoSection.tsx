export default function PromoSection() {
  return (
    <section
      id="criadores"
      className="mx-auto mt-12 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:gap-6"
    >
      <article className="group relative flex min-h-65 flex-col justify-end overflow-hidden rounded-xl border border-[#493023] bg-[#24150f] p-6 sm:p-7">
        <img
          src="/images/emerald-ape.jpg"
          alt="Coleção Emerald Ape"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#140c08] via-[#140c08]/65 to-transparent" />

        <div className="relative z-10">
          <h3 className="text-xl font-bold leading-tight text-[#ead9c6] sm:text-2xl">
            Lançamentos gênesis
            <br />
            de edição limitada
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#ead9c6]/80">
            Colecione edições escassas diretamente dos criadores antes da
            revelação pública.
          </p>

          <a
            href="#mercado"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f0a653] transition-colors hover:text-[#ead9c6]"
          >
            Explorar →
          </a>
        </div>
      </article>

      <article className="group relative flex min-h-65 flex-col justify-end overflow-hidden rounded-xl border border-[#493023] bg-[#301b11] p-6 sm:p-7">
        <img
          src="/images/neon-vessel.jpg"
          alt="Arte digital selecionada"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#140c08] via-[#140c08]/65 to-transparent" />

        <div className="relative z-10">
          <h3 className="text-xl font-bold leading-tight text-[#ead9c6] sm:text-2xl">
            Arte digital selecionada
            <br />e muito mais
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#ead9c6]/80">
            Explore novos artistas, coleções verificadas e obras digitais que
            definem o futuro.
          </p>

          <a
            href="#mercado"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f0a653] transition-colors hover:text-[#ead9c6]"
          >
            Explorar →
          </a>
        </div>
      </article>
    </section>
  );
}
