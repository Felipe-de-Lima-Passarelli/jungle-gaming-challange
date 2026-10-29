//React
import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//Lib
import { api } from "../lib/api";
import { getCurrentUser, hashPassword, logoutAccount } from "../lib/auth";

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () =>
      (
        await api.get<{ name: string; email: string; avatar: string }>(
          "/profile",
        )
      ).data,
  });
  const profileName = name ?? profile.data?.name ?? user?.name ?? "";
  const profileAvatar = avatar ?? profile.data?.avatar ?? "";

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.put("/profile", {
          name: profileName,
          avatar: profileAvatar,
        })
      ).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", user?.id], data);
      try {
        const raw = localStorage.getItem("kurio:session");
        if (raw) {
          const session = JSON.parse(raw) as {
            user?: { id: string; name: string; avatar?: string };
            token?: string;
            expiresAt?: number;
          };
          const sessionUser = session.user;
          if (
            sessionUser !== undefined &&
            sessionUser !== null &&
            user !== null &&
            sessionUser.id === user.id
          ) {
            sessionUser.name = data.name;
            sessionUser.avatar = data.avatar ?? "";
            localStorage.setItem("kurio:session", JSON.stringify(session));
            window.dispatchEvent(new Event("kurio:profile-updated"));
          }
        }
      } catch {
        /* the profile response remains authoritative for this page */
      }
      setMessage("Perfil atualizado.");
    },
    onError: () =>
      setMessage(
        "Não foi possível salvar. Verifique sua sessão e tente novamente.",
      ),
  });
  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 6)
        throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
      if (newPassword !== confirmPassword)
        throw new Error("A confirmação da senha não corresponde.");
      return api.put("/profile/password", {
        currentPasswordHash: await hashPassword(currentPassword),
        newPasswordHash: await hashPassword(newPassword),
      });
    },
    onSuccess: () => {
      setPasswordMessage("Senha alterada nesta demonstração.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) =>
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.",
      ),
  });
  if (!user)
    return (
      <main className="min-h-screen bg-[#140c08] p-8 text-[#f3e5d5]">
        <h1 className="text-2xl">Entre para acessar seu perfil</h1>
        <Link
          to="/login"
          search={{ returnTo: undefined }}
          className="mt-4 inline-block text-[#f0a653] underline"
        >
          Fazer login
        </Link>
      </main>
    );
  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    save.mutate();
  }
  return (
    <main className="min-h-screen bg-[#140c08] px-4 py-10 text-[#f3e5d5] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-[#f0a653]">
          ← Voltar ao marketplace
        </Link>
        <h1 className="mt-5 text-3xl font-semibold">Meu perfil</h1>
        <p className="mt-2 text-sm text-[#bca48d]">
          Atualize as informações da sua conta demonstrativa.
        </p>
        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-xl border border-[#493023] bg-[#21130d] p-5 sm:p-7"
        >
          <label className="block text-sm">
            Nome completo
            <input
              required
              minLength={2}
              value={profileName}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-3 outline-none focus:border-[#dc9149]"
            />
          </label>
          <label className="block text-sm">
            E-mail
            <input
              readOnly
              value={profile.data?.email ?? user.email}
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08]/60 px-3 py-3 text-[#bca48d]"
            />
          </label>
          <label className="block text-sm">
            URL do avatar (opcional)
            <input
              type="url"
              value={profileAvatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-3 outline-none focus:border-[#dc9149]"
            />
          </label>
          {message && (
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-[#f0a653]"
            >
              {message}
            </p>
          )}
          <button
            disabled={save.isPending}
            className="rounded-md bg-[#dc9149] px-5 py-3 text-sm font-bold text-[#1c1008] disabled:opacity-50"
          >
            {save.isPending ? "Salvando…" : "Salvar alterações"}
          </button>
        </form>
        <section className="mt-5 rounded-xl border border-[#493023] p-5">
          <h2 className="font-semibold">Segurança da conta</h2>
          <p className="mt-2 text-sm text-[#bca48d]">
            Use apenas credenciais fictícias. A troca é simulada pelo MSW.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPasswordMessage("");
              changePassword.mutate();
            }}
            className="mt-4 space-y-3"
          >
            <label className="block text-sm">
              Senha atual
              <input
                required
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Nova senha
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Confirmar nova senha
              <input
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-2"
              />
            </label>
            {passwordMessage && (
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-[#f0a653]"
              >
                {passwordMessage}
              </p>
            )}
            <button
              disabled={changePassword.isPending}
              className="rounded-md border border-[#dc9149] px-4 py-2 text-sm text-[#f0a653]"
            >
              {changePassword.isPending ? "Alterando…" : "Alterar senha"}
            </button>
          </form>
          <button
            onClick={() => {
              logoutAccount();
              queryClient.clear();
              void navigate({ to: "/login", search: { returnTo: undefined } });
            }}
            className="mt-4 rounded-md border border-[#493023] px-4 py-2 text-sm hover:border-[#dc9149]"
          >
            Sair da conta
          </button>
        </section>
        <Link
          to="/wallets"
          className="mt-5 inline-block text-[#f0a653] underline"
        >
          Gerenciar carteiras →
        </Link>
      </div>
    </main>
  );
}
