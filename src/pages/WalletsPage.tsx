//React
import { useState, type SyntheticEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//Lib
import { api } from "../lib/api";
import { getCurrentUser } from "../lib/auth";

//Types
import { type Wallet } from "../types/Wallet";

export default function WalletsPage() {
  const user = getCurrentUser();
  const client = useQueryClient();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [primary, setPrimary] = useState(false);
  const wallets = useQuery({
    queryKey: ["wallets", user?.id],
    enabled: Boolean(user),
    queryFn: async () => (await api.get<Wallet[]>("/wallets")).data,
  });
  const add = useMutation({
    mutationFn: async () =>
      editingId
        ? (
            await api.put<Wallet[]>(`/wallets/${editingId}`, {
              label,
              address,
              network,
              primary,
            })
          ).data
        : (
            await api.post<Wallet[]>("/wallets", {
              label,
              address,
              network,
              primary,
            })
          ).data,
    onSuccess: (data) => {
      client.setQueryData(["wallets", user?.id], data);
      setLabel("");
      setAddress("");
      setEditingId(null);
      setPrimary(false);
      setError("");
    },
    onError: () =>
      setError(
        "Não foi possível salvar a carteira. Confira os dados e tente novamente.",
      ),
  });
  const remove = useMutation({
    mutationFn: async (id: string) =>
      (await api.delete<Wallet[]>(`/wallets/${id}`)).data,
    onSuccess: (data) => client.setQueryData(["wallets", user?.id], data),
  });
  function submit(e: SyntheticEvent) {
    e.preventDefault();
    add.mutate();
  }
  if (!user)
    return (
      <main className="min-h-screen bg-[#140c08] p-8 text-[#f3e5d5]">
        <h1 className="text-2xl">Entre para acessar suas carteiras</h1>
        <Link
          to="/login"
          search={{ returnTo: undefined }}
          className="mt-4 inline-block text-[#f0a653] underline"
        >
          Fazer login
        </Link>
      </main>
    );
  return (
    <main className="min-h-screen bg-[#140c08] px-4 py-10 text-[#f3e5d5] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/profile" className="text-sm text-[#f0a653]">
          ← Meu perfil
        </Link>
        <h1 className="mt-5 text-3xl font-semibold">Minhas carteiras</h1>
        <p className="mt-2 text-sm text-[#bca48d]">
          Endereços fictícios para a demonstração. Nenhuma carteira será
          conectada de verdade.
        </p>
        <form
          onSubmit={submit}
          className="mt-7 grid gap-4 rounded-xl border border-[#493023] bg-[#21130d] p-5 md:grid-cols-2"
        >
          <label className="text-sm">
            Nome da carteira
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Minha carteira"
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-3"
            />
          </label>
          <label className="text-sm">
            Rede
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-3"
            >
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>Solana</option>
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            Endereço
            <input
              required
              minLength={8}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço de demonstração"
              className="mt-2 w-full rounded-md border border-[#493023] bg-[#140c08] px-3 py-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={primary}
              onChange={(e) => setPrimary(e.target.checked)}
            />{" "}
            Definir como carteira principal
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-300 md:col-span-2">
              {error}
            </p>
          )}
          <button
            disabled={add.isPending}
            className="rounded-md bg-[#dc9149] px-5 py-3 text-sm font-bold text-[#1c1008] disabled:opacity-50 md:col-span-2"
          >
            {add.isPending
              ? "Salvando…"
              : editingId
                ? "Salvar carteira"
                : "Adicionar carteira"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setLabel("");
                setAddress("");
                setPrimary(false);
              }}
              className="rounded-md border border-[#493023] px-5 py-3 text-sm md:col-span-2"
            >
              Cancelar edição
            </button>
          )}
        </form>
        <div className="mt-6 space-y-3">
          {wallets.isLoading ? (
            <p role="status">Carregando carteiras…</p>
          ) : wallets.data?.length ? (
            wallets.data.map((wallet) => (
              <article
                key={wallet.id}
                className="flex flex-col gap-3 rounded-xl border border-[#493023] bg-[#21130d] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">
                    {wallet.label}{" "}
                    {wallet.primary && (
                      <span className="ml-2 text-xs text-[#f0a653]">
                        Principal
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-xs text-[#bca48d]">
                    {wallet.network}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-[#d7c0a9]">
                    {wallet.address}
                  </p>
                </div>
                <div className="flex gap-2 self-start">
                  <button
                    onClick={() => {
                      setEditingId(wallet.id);
                      setLabel(wallet.label);
                      setAddress(wallet.address);
                      setNetwork(wallet.network);
                      setPrimary(wallet.primary);
                    }}
                    className="rounded-md border border-[#493023] px-3 py-2 text-sm hover:border-[#dc9149]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove.mutate(wallet.id)}
                    className="rounded-md border border-[#493023] px-3 py-2 text-sm hover:border-red-400"
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-[#493023] p-6 text-sm text-[#bca48d]">
              Nenhuma carteira cadastrada.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
