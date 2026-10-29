export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#493023] bg-[#140c08] text-[#ead9c6]">
      <div className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <article>
            <b className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#301b11] text-lg text-[#f0a653]">
              W
            </b>
            <h3 className="font-bold">Segurança da carteira</h3>
            <p className="mt-2 text-sm leading-6 text-[#b89a7a]">
              Proteja sua carteira e colecione arte digital verificada com
              confiança.
            </p>
          </article>

          <article>
            <b className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#301b11] text-lg text-[#f0a653]">
              C
            </b>
            <h3 className="font-bold">Criadores em destaque</h3>
            <p className="mt-2 text-sm leading-6 text-[#b89a7a]">
              Conheça artistas, estúdios e comunidades que moldam a cultura
              digital.
            </p>
          </article>

          <article>
            <b className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#301b11] text-lg text-[#f0a653]">
              D
            </b>
            <h3 className="font-bold">Alertas de lançamentos</h3>
            <p className="mt-2 text-sm leading-6 text-[#b89a7a]">
              Receba calendários de cunhagem, novidades e listas de acesso.
            </p>
          </article>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Inscrição demonstrativa recebida!");
            }}
          >
            <h3 className="font-bold">Antecipe-se ao próximo lançamento</h3>

            <div className="mt-4 flex overflow-hidden rounded-lg border border-[#493023] bg-[#24150f]">
              <input
                type="email"
                required
                placeholder="Digite seu e-mail..."
                aria-label="Seu e-mail"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#ead9c6] outline-none placeholder:text-[#b89a7a]"
              />
              <button
                type="submit"
                className="bg-[#dc9149] px-4 text-sm font-bold text-[#140c08] transition-colors hover:bg-[#f0a653]"
              >
                Enviar
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#b89a7a]">
              Receba lançamentos selecionados, histórias de criadores e
              novidades do mercado.
            </p>
          </form>
        </div>

        <div className="my-10 flex flex-col gap-3 border-y border-[#493023] py-6 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <strong className="text-xl tracking-[0.2em]">KURIO</strong>
          <span className="text-[#b89a7a]">
            Feito para colecionadores, criadores e cultura
          </span>
          <a
            href="mailto:contato@email.com"
            className="transition-colors hover:text-[#f0a653]"
          >
            contato@email.com
          </a>
          <span className="text-[#b89a7a]">+55 11 4002 8922</span>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-3">
            <h4 className="font-bold">Meu perfil</h4>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Meu perfil
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Minha coleção
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Atividade
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Estúdio do criador
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Lista de interesse
            </a>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h4 className="font-bold">Central de ajuda</h4>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Central de ajuda
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Como comprar NFTs
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Carteira e segurança
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Política do mercado
            </a>
            <a
              href="#inicio"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Denunciar item
            </a>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h4 className="font-bold">Coleções</h4>
            <a
              href="#mercado"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Arte digital
            </a>
            <a
              href="#mercado"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Fotografia
            </a>
            <a
              href="#mercado"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Música
            </a>
            <a
              href="#mercado"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Arte 3D
            </a>
            <a
              href="#mercado"
              className="text-sm text-[#b89a7a] hover:text-[#f0a653]"
            >
              Utilidade
            </a>
          </div>

          <div>
            <h4 className="font-bold">Redes sociais</h4>
            <div className="mt-3 flex flex-wrap gap-3">
              {["f", "◎", "𝕏", "in"].map((social) => (
                <a
                  key={social}
                  href="#inicio"
                  className="flex size-9 items-center justify-center rounded-full border border-[#493023] text-sm transition-colors hover:border-[#dc9149] hover:text-[#f0a653]"
                >
                  {social}
                </a>
              ))}
            </div>

            <h4 className="mt-6 font-bold">Carteiras compatíveis</h4>
            <p className="mt-2 text-xs leading-5 text-[#b89a7a]">
              METAMASK · WALLETCONNECT · COINBASE
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#493023] pt-5 text-xs text-[#b89a7a]">
          © 2026 Kurio. Propriedade digital para todos.
        </div>
      </div>
    </footer>
  );
}
