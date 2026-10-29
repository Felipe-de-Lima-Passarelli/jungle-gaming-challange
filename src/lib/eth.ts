const WEI_PER_ETH = 10n ** 18n;

export function ethToWei(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,18})?$/.test(text))
    throw new Error(`Valor ETH inválido: ${text}`);
  const [whole, fraction = ""] = text.split(".");
  return (
    BigInt(whole) * WEI_PER_ETH +
    BigInt((fraction + "0".repeat(18)).slice(0, 18))
  );
}

export function weiToEthString(value: bigint, maxFractionDigits = 18): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / WEI_PER_ETH;
  const fraction = (absolute % WEI_PER_ETH).toString().padStart(18, "0");
  const digits = Math.max(0, Math.min(18, maxFractionDigits));
  const trimmed = fraction.slice(0, digits).replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${trimmed ? `.${trimmed}` : ""}`;
}

export function formatEth(value: string | number, fractionDigits = 3): string {
  return Number(value).toFixed(fractionDigits);
}

export function sumEth(
  values: Array<{ price: string | number; quantity: number }>,
): bigint {
  return values.reduce((sum, item) => {
    const quantity = BigInt(Math.max(0, Math.floor(item.quantity)));
    return sum + ethToWei(item.price) * quantity;
  }, 0n);
}

export function quoteEth(
  subtotalWei: bigint,
  coupon: string,
  networkFeeWei = ethToWei("0.015"),
) {
  const normalizedCoupon = coupon.trim().toUpperCase();
  const discountWei =
    normalizedCoupon === "KURIO10" ? (subtotalWei * 1000n) / 10000n : 0n;
  return {
    subtotal: weiToEthString(subtotalWei),
    discount: weiToEthString(discountWei),
    networkFee: weiToEthString(networkFeeWei),
    total: weiToEthString(subtotalWei - discountWei + networkFeeWei),
  };
}
