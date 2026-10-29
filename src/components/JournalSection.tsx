//Mock data
import { articles } from "../mocks/data";

export default function JournalSection() {
  return (
    <section
      id="diario"
      className="mx-auto mt-16 w-full max-w-360 px-4 sm:px-6 lg:mt-24 lg:px-10"
    >
      <div className="mb-8 flex flex-col gap-3 sm:mb-10">
        <h2 className="text-2xl font-bold text-[#ead9c6] sm:text-3xl">
          Diário da Cunhagem
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-[#b89a7a] sm:text-base">
          Histórias, visão e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-xl border border-[#493023] bg-[#24150f] transition-colors duration-300 hover:border-[#dc9149]"
          >
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-5">
              <div className="text-xs text-[#b89a7a]">
                {item.date} · {item.read}
              </div>

              <h3 className="mt-3 text-lg font-bold leading-snug text-[#ead9c6]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#b89a7a]">
                {item.desc}
              </p>

              <a
                href="#diario"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f0a653] transition-colors hover:text-[#ead9c6]"
              >
                Ler mais →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
