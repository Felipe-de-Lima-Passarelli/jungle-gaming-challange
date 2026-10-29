//React
import { useState, type SyntheticEvent } from "react";
import { Link, useSearch } from "@tanstack/react-router";

//Icons
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

//Lib
import { loginAccount, registerAccount } from "../lib/auth";

//Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type Props = { mode: "login" | "register" };
export default function AuthPage({ mode }: Props) {
  const isRegister = mode === "register";
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (isRegister && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    const result = await (isRegister
      ? registerAccount(name, email, password)
      : loginAccount(email, password));
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.user) {
      try {
        const guestRaw = localStorage.getItem("kurio:guest:cart");
        if (guestRaw) {
          const guest = (JSON.parse(guestRaw) as unknown[]).map((item) =>
            typeof item === "number"
              ? { id: item, quantity: 1 }
              : (item as { id: number; quantity: number }),
          );
          const key = `kurio:${result.user.id}:cart`;
          const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as {
            id: number;
            quantity: number;
          }[];
          const merged = [...existing];
          for (const item of guest) {
            const found = merged.find((line) => line.id === item.id);
            if (found)
              found.quantity = Math.min(5, found.quantity + item.quantity);
            else
              merged.push({
                id: item.id,
                quantity: Math.min(5, item.quantity),
              });
          }
          localStorage.setItem(key, JSON.stringify(merged));
          localStorage.removeItem("kurio:guest:cart");
        }
      } catch {
        /* Error */
      }
    }
    const destination =
      search.returnTo === "checkout"
        ? "/?openCart=1"
        : search.returnTo === "orders"
          ? "/?openOrders=1"
          : search.returnTo === "profile"
            ? "/profile"
            : search.returnTo?.startsWith("/nft/")
              ? search.returnTo
              : "/";
    window.location.assign(destination);
  }
  return (
    <main className="min-h-screen bg-[#140c08] text-[#f3e5d5]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-[#493023] bg-[radial-gradient(ellipse_at_25%_25%,#4b2a18_0%,#24150f_42%,#140c08_75%)] p-12 lg:flex lg:flex-col lg:justify-between xl:p-20">
          <Link
            to="/"
            className="text-xl font-bold tracking-[0.35em] text-white"
          >
            KURIO<span className="text-[#dc9149]">.</span>
          </Link>
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#dc9149]">
              Sua próxima descoberta começa aqui
            </p>
            <h1 className="text-5xl font-semibold leading-[1.12] xl:text-6xl">
              A arte digital
              <br />
              tem um novo lar.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#bca48d]">
              Descubra peças únicas, acompanhe criadores e construa sua coleção
              no seu ritmo.
            </p>
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-xs text-xs leading-6 text-[#947b65]">
              Um espaço para colecionadores, criadores e cultura digital.
            </div>
            <div className="grid size-32 rotate-6 place-items-center rounded-3xl border border-[#8a542d]/60 bg-[#dc9149]/10 text-5xl text-[#dc9149]">
              ✳
            </div>
          </div>
        </section>
        <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-24">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[#bca48d] transition hover:text-[#f0a653]"
            >
              <ArrowLeft size={16} /> Voltar ao marketplace
            </Link>
            <span className="text-sm font-bold tracking-[0.25em] text-white lg:hidden">
              KURIO<span className="text-[#dc9149]">.</span>
            </span>
          </div>
          <div className="mx-auto my-auto w-full max-w-md py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#dc9149]">
              {isRegister ? "Faça parte da comunidade" : "Bem-vindo de volta"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {isRegister ? "Crie sua conta" : "Entre na sua conta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#bca48d]">
              {isRegister
                ? "Crie seu perfil para salvar seus pedidos e começar sua coleção."
                : "Acesse sua conta para continuar sua experiência na KURIO."}
            </p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              {isRegister && (
                <label className="block text-sm text-[#e8d6c3]">
                  Nome completo
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#493023] bg-[#21130d] px-3 focus-within:border-[#dc9149]">
                    <UserRound size={17} className="shrink-0 text-[#947b65]" />
                    <input
                      required
                      minLength={2}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#806953]"
                    />
                  </div>
                </label>
              )}
              <label className="block text-sm text-[#e8d6c3]">
                E-mail
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#493023] bg-[#21130d] px-3 focus-within:border-[#dc9149]">
                  <Mail size={17} className="shrink-0 text-[#947b65]" />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#806953]"
                  />
                </div>
              </label>
              <label className="block text-sm text-[#e8d6c3]">
                Senha
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#493023] bg-[#21130d] px-3 focus-within:border-[#dc9149]">
                  <LockKeyhole size={17} className="shrink-0 text-[#947b65]" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isRegister ? "Mínimo de 6 caracteres" : "Sua senha"
                    }
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#806953]"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#947b65] hover:text-[#f0a653]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
              {isRegister && (
                <label className="block text-sm text-[#e8d6c3]">
                  Confirmar senha
                  <Input
                    required
                    minLength={6}
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 h-auto py-3.5"
                    placeholder="Digite a senha novamente"
                  />
                </label>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg px-5 py-4 text-xs uppercase tracking-[0.16em]"
              >
                {busy
                  ? "Aguarde…"
                  : isRegister
                    ? "Criar minha conta"
                    : "Entrar"}
              </Button>
            </form>
            <p className="mt-7 text-center text-sm text-[#bca48d]">
              {isRegister ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
              <Link
                to={isRegister ? "/login" : "/register"}
                search={{ returnTo: undefined }}
                className="font-semibold text-[#f0a653] hover:underline"
              >
                {isRegister ? "Entrar" : "Criar conta"}
              </Link>
            </p>
            <p className="mt-8 text-center text-[11px] leading-5 text-[#806953]">
              Demonstração local: os dados da conta ficam armazenados neste
              navegador e não são enviados a um servidor.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
