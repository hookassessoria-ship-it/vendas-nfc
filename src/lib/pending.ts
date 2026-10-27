import type { AppData } from "@/hooks/useData";
import type { Settings } from "@/db/types";

/** Dados que faltam para os indicadores ficarem completos (mostrados no Início). */
export function pendingItems(data: AppData, settings: Settings) {
  const out: { text: string; to: string; tone: "warn" | "bad" }[] = [];
  const profile = [...data.costProfiles].sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
  const placa = profile?.components.find((c) => c.key === "placa")?.amount ?? null;
  const lotWithCost = data.stockLots.some((l) => l.totalPaid != null);
  if (placa == null && !lotWithCost) out.push({ text: "Custo unitário da placa não informado (margens e lucro ficam pendentes)", to: "financas/custos", tone: "bad" });
  const costPending = data.sales.filter((s) => s.status === "ativa" && s.items.some((i) => i.unitCost == null)).length;
  if (costPending) out.push({ text: `${costPending} venda(s) com custo pendente: aplicar custo informado`, to: "financas/custos", tone: "warn" });
  const feeUnknown = settings.paymentMethods.filter((m) => m.active && m.feePct == null).map((m) => m.label);
  if (feeUnknown.length) out.push({ text: `Taxas não informadas: ${feeUnknown.join(", ")}`, to: "configuracoes", tone: "warn" });
  if (!data.stockLots.length) out.push({ text: "Estoque não cadastrado (quantidade inicial e lotes)", to: "financas/estoque", tone: "warn" });
  if (!data.establishments.length) out.push({ text: "Nenhum estabelecimento: importe os 88 do roteiro", to: "importar", tone: "warn" });
  return out;
}
