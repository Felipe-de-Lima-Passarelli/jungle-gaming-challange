import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Isolate local storage before the application and MSW initialize. This
  // avoids a reload racing the service worker/socket startup on mobile Chromium.
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("__kurio_e2e_initialized")) {
      localStorage.clear();
      sessionStorage.setItem("__kurio_e2e_initialized", "1");
    }
  });
  await page.goto("/");
  await expect(page.locator('img[alt="Golden Beat #207"]')).toBeVisible({
    timeout: 15_000,
  });
});

test("catálogo mostra NFTs e paginação é funcional", async ({ page }) => {
  // Aguarda o conteúdo real do catálogo, em vez de depender do tempo de carregamento.
  const firstNft = page.locator('img[alt="Golden Beat #207"]');
  await expect(firstNft).toBeVisible({ timeout: 15_000 });

  const next = page.getByRole("button", { name: "Próxima página" });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page).toHaveURL(/page=2/, { timeout: 5_000 });
  await page.goBack();
  await expect(page).not.toHaveURL(/page=2/);
  await expect(firstNft).toBeVisible();
});

test("cadastro e sessão persistem após refresh", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel(/Nome completo/i).fill("Conta de Teste");
  await page.getByLabel(/E-mail/i).fill(`teste-${Date.now()}@kurio.test`);
  await page.getByLabel(/^Senha$/i).fill("senha-ficticia-123");
  await page.getByLabel(/Confirmar senha/i).fill("senha-ficticia-123");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/", { timeout: 10_000 }),
    page.getByRole("button", { name: /Criar minha conta/i }).click(),
  ]);
  // A navegação completa antes de acessar o contexto da página novamente.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("kurio:session")))
    .not.toBeNull();
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("kurio:session")))
    .not.toBeNull();
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Meu perfil" })).toBeVisible();
});

test("detalhe inexistente apresenta mensagem recuperável", async ({ page }) => {
  await page.goto("/nft/999999");
  await expect(
    page.getByRole("heading", { name: /NFT não encontrado/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Voltar ao marketplace/i }),
  ).toBeVisible();
});

test("compra demonstrativa confirma pedido e mostra recibo", async ({
  page,
}) => {
  await page.goto("/nft/1");
  await page.getByRole("button", { name: /Adicionar ao carrinho/i }).click();
  await page.goto("/register");
  await page.getByLabel(/Nome completo/i).fill("Comprador Teste");
  await page.getByLabel(/E-mail/i).fill(`compra-${Date.now()}@kurio.test`);
  await page.getByLabel(/^Senha$/i).fill("senha-ficticia-123");
  await page.getByLabel(/Confirmar senha/i).fill("senha-ficticia-123");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/", { timeout: 10_000 }),
    page.getByRole("button", { name: /Criar minha conta/i }).click(),
  ]);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("kurio:session")))
    .not.toBeNull();
  await page.goto("/?openCart=1");
  await page.getByRole("button", { name: /Continuar para finalizar/i }).click();
  await page.getByLabel(/Entendo que esta é uma demonstração/i).check();
  await page
    .getByRole("button", { name: /Confirmar pedido demonstrativo/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /Pedido demonstrativo confirmado/i }),
  ).toBeVisible();
  await expect(page.getByText(/Referência simulada/i)).toBeVisible();
});

test("favoritos persistem após atualizar a página", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel(/Nome completo/i).fill("Colecionador Teste");
  await page.getByLabel(/E-mail/i).fill(`favoritos-${Date.now()}@kurio.test`);
  await page.getByLabel(/^Senha$/i).fill("senha-ficticia-123");
  await page.getByLabel(/Confirmar senha/i).fill("senha-ficticia-123");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/", { timeout: 10_000 }),
    page.getByRole("button", { name: /Criar minha conta/i }).click(),
  ]);

  const favoriteButton = page
    .getByRole("button", { name: "Adicionar aos favoritos" })
    .first();
  await favoriteButton.click();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
});

test("perfil e carteiras salvam as alterações", async ({ page }) => {
  // The registration route occasionally aborts its first navigation in desktop Chromium on Windows.
  // DOMContentLoaded is sufficient here because the form is asserted before interacting with it.
  await page.goto("/register", {
    waitUntil: "domcontentloaded",
    timeout: 20_000,
  });
  await expect(page.getByLabel(/Nome completo/i)).toBeVisible({
    timeout: 10_000,
  });
  await page.getByLabel(/Nome completo/i).fill("Perfil Teste");
  await page.getByLabel(/E-mail/i).fill(`perfil-${Date.now()}@kurio.test`);
  await page.getByLabel(/^Senha$/i).fill("senha-ficticia-123");
  await page.getByLabel(/Confirmar senha/i).fill("senha-ficticia-123");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/", { timeout: 10_000 }),
    page.getByRole("button", { name: /Criar minha conta/i }).click(),
  ]);

  await page.goto("/profile");
  await page.getByLabel("Nome completo").fill("Perfil Atualizado");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Perfil atualizado." }),
  ).toBeVisible();

  await page.goto("/wallets");
  await page.getByLabel("Nome da carteira").fill("Carteira de Teste");
  await page.getByLabel("Endereço").fill("0x1234567890abcdef");
  await page.getByRole("button", { name: "Adicionar carteira" }).click();
  await expect(
    page.getByRole("heading", { name: "Carteira de Teste" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Carteira de Teste" }),
  ).toBeVisible();
});

test("cotação REST retorna valores ETH como strings decimais exatas", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const response = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: 7, quantity: 3 }],
        coupon: "KURIO10",
      }),
    });
    return { status: response.status, body: await response.json() };
  });
  expect(result.status).toBe(200);
  expect(result.body.subtotal).toBe("2.97");
  expect(result.body.discount).toBe("0.297");
  expect(result.body.networkFee).toBe("0.015");
  expect(result.body.total).toBe("2.688");
  expect(typeof result.body.total).toBe("string");
});

test("eventos Socket.IO via MSW atualizam o recurso e suportam cursor REST", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('img[alt="Golden Beat #207"]')).toBeVisible({
    timeout: 10_000,
  });
  await page.waitForFunction(
    () => document.documentElement.dataset.realtimeConnected === "true",
    undefined,
    { timeout: 10_000 },
  );

  const delivered = await page.evaluate(async () => {
    const eventPromise = new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Evento Socket.IO não recebido")),
          5_000,
        );
        window.addEventListener(
          "kurio:realtime:nft.updated",
          ((event: Event) => {
            window.clearTimeout(timeout);
            resolve((event as CustomEvent<Record<string, unknown>>).detail);
          }) as EventListener,
          { once: true },
        );
      },
    );
    const publishResponse = await fetch("/api/realtime/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "nft.updated",
        payload: {
          id: 7,
          version: 1,
          price: "1.234567890123456789",
          available: true,
        },
      }),
    });
    const published = await publishResponse.json();
    const received = await eventPromise;
    const decimalQuoteResponse = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: 7, quantity: 3 }], coupon: "" }),
    });
    const decimalQuote = await decimalQuoteResponse.json();
    const unavailableResponse = await fetch("/api/realtime/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "nft.updated",
        payload: { id: 7, version: 2, available: false },
      }),
    });
    const unavailableQuoteResponse = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: 7, quantity: 1 }], coupon: "" }),
    });
    const orderEventPromise = new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Evento de pedido não recebido")),
          5_000,
        );
        window.addEventListener(
          "kurio:realtime:order.updated",
          ((event: Event) => {
            window.clearTimeout(timeout);
            resolve((event as CustomEvent<Record<string, unknown>>).detail);
          }) as EventListener,
          { once: true },
        );
      },
    );
    const orderPublishResponse = await fetch("/api/realtime/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "order.updated",
        payload: { id: "KURIO-E2E-ORDER", version: 1, status: "pending" },
      }),
    });
    const orderPublished = await orderPublishResponse.json();
    const orderReceived = await orderEventPromise;
    const nftResponse = await fetch("/api/nfts/7");
    const nft = await nftResponse.json();
    const eventsResponse = await fetch(
      `/api/realtime/events?cursor=0&limit=10`,
    );
    const events = await eventsResponse.json();
    return {
      publishStatus: publishResponse.status,
      published,
      received,
      decimalQuote,
      unavailableStatus: unavailableResponse.status,
      unavailableQuoteStatus: unavailableQuoteResponse.status,
      orderPublishStatus: orderPublishResponse.status,
      orderPublished,
      orderReceived,
      nft,
      events,
    };
  });

  expect(delivered.publishStatus).toBe(201);
  expect(delivered.received).toMatchObject({
    id: 7,
    version: 1,
    price: "1.234567890123456789",
  });
  expect(delivered.nft).toMatchObject({ id: 7, price: "1.234567890123456789" });
  expect(delivered.decimalQuote.subtotal).toBe("3.703703670370370367");
  expect(delivered.unavailableStatus).toBe(201);
  expect(delivered.unavailableQuoteStatus).toBe(409);
  expect(delivered.orderPublishStatus).toBe(201);
  expect(delivered.orderReceived).toMatchObject({
    id: "KURIO-E2E-ORDER",
    version: 1,
    status: "pending",
  });
  expect(delivered.events.events).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "nft.updated",
        payload: expect.objectContaining({ id: 7, version: 1 }),
      }),
      expect.objectContaining({
        type: "nft.updated",
        payload: expect.objectContaining({
          id: 7,
          version: 2,
          available: false,
        }),
      }),
      expect.objectContaining({
        type: "order.updated",
        payload: expect.objectContaining({ id: "KURIO-E2E-ORDER", version: 1 }),
      }),
    ]),
  );
});
