import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Confirmação visual curta (≈0,9 s) ao concluir uma visita ou registrar uma venda.
 * Não bloqueia toques (pointer-events: none) e não atrasa a ação: o dado já foi salvo
 * quando ela aparece. Com movimento reduzido, vira um selo estático breve.
 */
export type CelebrationKind = "venda" | "visita";
const EVENT = "vnfc:celebrate";

export function celebrate(kind: CelebrationKind, label?: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { kind, label } }));
  try { navigator.vibrate?.(kind === "venda" ? [12, 40, 18] : 10); } catch { /* sem vibração (iOS Safari) */ }
}

export function CelebrationLayer() {
  const [item, setItem] = useState<{ id: number; kind: CelebrationKind; label?: string; leaving?: boolean } | null>(null);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail as { kind: CelebrationKind; label?: string };
      clearTimeout(t1); clearTimeout(t2);
      const id = Date.now();
      setItem({ id, ...d });
      t1 = setTimeout(() => setItem((x) => (x?.id === id ? { ...x, leaving: true } : x)), 750);
      t2 = setTimeout(() => setItem((x) => (x?.id === id ? null : x)), 1000);
    };
    window.addEventListener(EVENT, on);
    return () => { window.removeEventListener(EVENT, on); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (!item) return null;
  const sale = item.kind === "venda";
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-hidden>
      <div key={item.id} className={cn("flex flex-col items-center gap-3", item.leaving ? "animate-celebrate-out" : "animate-celebrate-in")}>
        <div className="relative grid h-24 w-24 place-items-center">
          <span className={cn("absolute inset-0 rounded-full animate-ring", sale ? "bg-ok/40" : "bg-primary/40")} />
          <span className={cn("absolute inset-0 rounded-full shadow-2xl", sale ? "bg-ok" : "bg-primary")} />
          <svg viewBox="0 0 24 24" className="relative h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={48} className="animate-draw" />
          </svg>
        </div>
        <div className="rounded-full bg-foreground px-4 py-1.5 text-sm font-bold text-background shadow-xl">{item.label ?? (sale ? "Venda registrada" : "Visita salva")}</div>
      </div>
    </div>
  );
}
