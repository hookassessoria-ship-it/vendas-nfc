import { useMemo, useState } from "react";
import {
  AlertCircle, BadgeDollarSign, BarChart3, CalendarClock, ChevronDown, ChevronRight, ClipboardCheck, FileUp, Footprints, MapPinned,
  Navigation, Percent, Receipt, Target, TrendingUp, Wallet,
} from "lucide-react";
import type { AppData } from "@/hooks/useData";
import type { Dataset } from "@/lib/finance/engine";
import { aggregate, dailySeries } from "@/lib/finance/engine";
import { pendingFollowUps } from "@/lib/finance/intel";
import { evalFor } from "@/hooks/useMetrics";
import { findRule, type Light } from "@/lib/finance/goals";
import { dayKey, fmtLong, fmtWeekdayShort, periodRange } from "@/lib/dates";
import { formatBRL, formatPct } from "@/lib/money";
import { mapsNavUrl, placeQuery } from "@/lib/maps";
import type { Settings } from "@/db/types";
import { updateStop } from "@/db/actions";
import { go } from "@/hooks/useHashRoute";
import { useUI } from "@/components/UIProvider";
import { AnimatedNumber, Button, Card, EmptyState, LightBadge, Progress, ProgressRing, LIGHT_STYLE } from "@/components/ui";
import { cn } from "@/lib/utils";
import { pendingItems } from "@/lib/pending";

/**
 * Início: só o que importa na rua, hoje. Métricas do período, rentabilidade detalhada
 * e gráficos ficam em Relatórios (#/relatorios), Finanças e Análises.
 */
export function Overview({ data, ds, settings }: { data: AppData; ds: Dataset; settings: Settings }) {
  const ui = useUI();
  const today = useMemo(() => aggregate(ds, periodRange("hoje")), [ds]);
  const week = useMemo(() => dailySeries(ds, periodRange("7d")), [ds]);
  const follow = useMemo(() => pendingFollowUps(data.visits, data.sales, data.establishments), [data.visits, data.sales, data.establishments]);
  const pending = pendingItems(data, settings);

  const revenueRule = findRule(data.goals, "faturamento", "dia");
  const visitRule = findRule(data.goals, "visitas", "dia");
  const revenueEval = evalFor("faturamento", data.goals, "dia", today);
  const visitsEval = evalFor("visitas", data.goals, "dia", today);
  const convEval = evalFor("conversao", data.goals, "dia", today);
  const ticketEval = evalFor("ticket_medio", data.goals, "dia", today);

  const everVisited = data.visits.length > 0;
  const everSold = data.sales.some((s) => s.status === "ativa");

  // Anel do hero: meta diária de faturamento; sem ela, meta diária de visitas.
  const ring = revenueRule?.target
    ? { value: today.net / (revenueRule.target * 100), light: revenueEval?.light ?? "sem_meta", text: `meta ${formatBRL(revenueRule.target * 100)}`, label: "Meta diária de faturamento" }
    : visitRule?.target
      ? { value: today.visitsRealized / visitRule.target, light: today.visitsRealized ? visitsEval?.light ?? "sem_meta" : "sem_dados", text: `${today.visitsRealized}/${visitRule.target} visitas`, label: "Meta diária de visitas" }
      : null;

  return (
    <div className="space-y-4">
      {/* Hoje */}
      <section className="card gradient-hero relative overflow-hidden p-5">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-muted first-letter:uppercase">{fmtLong(new Date())}</div>
            <div className="mt-2 text-[13px] font-semibold text-muted">Faturamento hoje</div>
            <AnimatedNumber value={today.net} format={formatBRL} className="block text-[38px] font-black leading-[44px] tracking-tight" />
            <div className="mt-0.5 text-sm text-muted"><span className="tabular font-semibold text-foreground">{formatBRL(today.received)}</span> recebido</div>
          </div>
          {ring ? (
            <ProgressRing value={ring.value} light={ring.light as Light} size={76} label={ring.label}>
              <span className="text-[15px] font-black tabular">{Math.min(999, Math.round(Math.max(0, ring.value) * 100))}%</span>
            </ProgressRing>
          ) : null}
        </div>
        {ring ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{ring.label}: {ring.text}</span>
            {(revenueRule?.target ? revenueEval : visitsEval) && <LightBadge light={ring.light as Light} label={(revenueRule?.target ? revenueEval : visitsEval)!.label} />}
          </div>
        ) : (
          <button type="button" onClick={() => go("metas")} className="press mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Target className="h-3.5 w-3.5" />Definir meta diária</button>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="primary" size="lg" onClick={() => ui.openSale(ui.nextStop?.stop.status === "a_caminho" ? { establishmentId: ui.nextStop.stop.establishmentId, stopId: ui.nextStop.stop.id, routeId: ui.nextStop.routeId } : {})}>
            <BadgeDollarSign className="h-5 w-5" />Vender
          </Button>
          <Button size="lg" onClick={() => (ui.nextStop ? ui.openStopStatus(ui.nextStop.stop) : ui.openVisit())}>
            <ClipboardCheck className="h-5 w-5" />Visita
          </Button>
        </div>
      </section>

      <NextAction data={data} follow={follow} pendingCost={pending.some((p) => p.tone === "bad") && everSold} />

      {!everVisited && !everSold ? (
        <Card>
          <EmptyState icon={ClipboardCheck} title="Registre sua primeira visita"
            action={<div className="flex flex-wrap justify-center gap-2">
              {data.establishments.length ? <Button variant="primary" onClick={() => go("rotas")}><MapPinned className="h-4 w-4" />Abrir rotas</Button> : <Button variant="primary" onClick={() => go("importar")}><FileUp className="h-4 w-4" />Importar os 88</Button>}
              <Button onClick={() => ui.openVisit()}><Footprints className="h-4 w-4" />Visita avulsa</Button>
            </div>}>
            Cada toque no status de uma parada vira uma visita. Vendas, conversão e ticket médio aparecem aqui assim que houver registros reais. Nenhum número é inventado.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile icon={BadgeDollarSign} label="Vendas hoje" value={String(today.ordersRecognized)} sub={`${today.unitsSold} ${today.unitsSold === 1 ? "placa" : "placas"}`} onClick={() => go("vendas")} />
            <Tile icon={Footprints} label="Visitas hoje" value={String(today.visitsRealized)} sub={visitRule?.target ? `meta ${visitRule.target}` : "sem meta diária"}
              light={today.visitsRealized ? visitsEval?.light : undefined} lightLabel={visitsEval?.label} progress={visitRule?.target ? today.visitsRealized / visitRule.target : null} onClick={() => go("rotas")} />
            <Tile icon={Percent} label="Conversão" value={today.conversion.state === "ok" && today.conversion.value != null ? formatPct(today.conversion.value) : "—"}
              sub={today.visitsRealized ? `${today.salesFromVisits} de ${today.visitsRealized} visitas` : "sem visitas hoje"} light={today.conversion.state === "ok" ? convEval?.light : undefined} lightLabel={convEval?.label} onClick={() => go("inteligencia")} />
            <Tile icon={Receipt} label="Ticket médio" value={today.ticket.state === "ok" && today.ticket.value != null ? formatBRL(Math.round(today.ticket.value)) : "—"}
              sub={today.ordersRecognized ? "por pedido hoje" : "sem vendas hoje"} light={today.ticket.state === "ok" ? ticketEval?.light : undefined} lightLabel={ticketEval?.label} onClick={() => go("vendas")} />
          </div>

          <Profit today={today} hasSalesToday={today.ordersRecognized > 0} />

          {everSold && <WeekBars days={week} />}
        </>
      )}

      {pending.length > 0 && <PendingData items={pending} />}

      <button type="button" onClick={() => go("relatorios")} className="card press flex w-full items-center gap-3 p-4 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><BarChart3 className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Relatórios completos</span>
          <span className="block text-xs text-muted">Períodos, comparação, rentabilidade, projeção e gráficos</span>
        </span>
        <ChevronRight className="h-5 w-5 text-subtle" />
      </button>
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub, light, lightLabel, progress, onClick }: {
  icon: typeof Target; label: string; value: string; sub: string; light?: Light; lightLabel?: string; progress?: number | null; onClick: () => void;
}) {
  const showLight = light === "verde" || light === "amarelo" || light === "vermelho";
  const L = showLight ? LIGHT_STYLE[light] : null;
  return (
    <button type="button" onClick={onClick} className="card press relative flex min-h-[124px] flex-col overflow-hidden p-4 text-left animate-slide-up">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-muted"><Icon className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{label}</span></span>
        {L && <L.Icon className={cn("h-4 w-4 shrink-0", `text-${L.tone}`)} aria-label={lightLabel} />}
      </div>
      <div className="mt-2 truncate text-[26px] font-extrabold leading-8 tracking-tight tabular">{value}</div>
      <div className="mt-auto truncate pt-1 text-xs text-subtle">{showLight && lightLabel ? <span className={`font-semibold text-${L!.tone}`}>{lightLabel} · </span> : null}{sub}</div>
      {progress != null && <Progress className="mt-2 h-1.5" value={progress} light={light ?? "sem_meta"} label={`Progresso: ${label}`} />}
    </button>
  );
}

/** Resultado e margem só aparecem com dados suficientes (vendas hoje e custo conhecido). */
function Profit({ today, hasSalesToday }: { today: ReturnType<typeof aggregate>; hasSalesToday: boolean }) {
  if (!hasSalesToday) return null;
  if (today.contribution.state !== "ok" || today.contribution.value == null) {
    return (
      <button type="button" onClick={() => go("financas/custos")} className="card press flex w-full items-center gap-3 p-4 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neutral-soft text-neutral"><Wallet className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-muted">Margem e resultado de hoje</span>
          <span className="block font-bold text-neutral">Pendente</span>
          <span className="block text-xs text-subtle">Informe o custo da placa para calcular. Nada é estimado sem ele.</span>
        </span>
        <ChevronRight className="h-5 w-5 text-subtle" />
      </button>
    );
  }
  const pct = today.contributionPct.state === "ok" ? today.contributionPct.value : null;
  const res = today.opResult.state === "ok" ? today.opResult.value : null;
  return (
    <section className="card p-4 animate-slide-up">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted"><TrendingUp className="h-4 w-4 text-primary" />Rentabilidade de hoje</div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-subtle">Margem de contribuição</div>
          <div className={cn("text-xl font-extrabold tabular", today.contribution.value < 0 && "text-bad")}>{formatBRL(today.contribution.value)}</div>
          {pct != null && <div className="text-xs text-muted tabular">{formatPct(pct)} da receita</div>}
        </div>
        <div>
          <div className="text-xs text-subtle">Resultado operacional</div>
          <div className={cn("text-xl font-extrabold tabular", res != null && res < 0 && "text-bad")}>{res == null ? "—" : formatBRL(res)}</div>
          <div className="text-xs text-muted">estimativa gerencial</div>
        </div>
      </div>
    </section>
  );
}

function WeekBars({ days }: { days: { day: string; net: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.net));
  const total = days.reduce((a, d) => a + d.net, 0);
  const todayKey = dayKey(new Date());
  return (
    <section className="card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[12px] font-semibold text-muted">Faturamento · últimos 7 dias</div>
        <div className="text-sm font-bold tabular">{formatBRL(total)}</div>
      </div>
      <div className="mt-3 flex h-24 items-end gap-2" role="img" aria-label={`Faturamento por dia nos últimos 7 dias: ${days.map((d) => `${fmtWeekdayShort(d.day)} ${formatBRL(d.net)}`).join(", ")}`}>
        {days.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div className={cn("w-full max-w-[28px] origin-bottom rounded-t-lg animate-[grow_.6s_cubic-bezier(.16,.8,.24,1)_both]", d.day === todayKey ? "bg-primary" : "bg-primary/40", d.net === 0 && "bg-surface-overlay")}
              style={{ height: `${Math.max(4, (d.net / max) * 100)}%`, animationDelay: `${i * 40}ms` }} />
            <span className={cn("text-[10px] font-semibold capitalize", d.day === todayKey ? "text-foreground" : "text-subtle")}>{fmtWeekdayShort(d.day).replace(".", "")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function NextAction({ data, follow, pendingCost }: { data: AppData; follow: ReturnType<typeof pendingFollowUps>; pendingCost: boolean }) {
  const ui = useUI();
  const todayKey = dayKey(new Date());
  const ns = ui.nextStop;
  const est = ns ? data.establishments.find((e) => e.id === ns.stop.establishmentId) : undefined;
  const due = follow.find((f) => f.followUpAt && f.followUpAt.slice(0, 10) <= todayKey);
  const dueEst = due ? data.establishments.find((e) => e.id === due.establishmentId) : undefined;

  let body: React.ReactNode;
  if (!data.establishments.length) {
    body = <Action icon={FileUp} kicker="Comece por aqui" title="Importe os 88 estabelecimentos" text="Cria as 3 rotas com as paradas na ordem do roteiro." primary={{ label: "Importar", icon: FileUp, onClick: () => go("importar") }} />;
  } else if (ns && est) {
    body = (
      <Action icon={MapPinned} kicker={`Próxima parada · #${ns.stop.order}`} title={est.name} text={est.address}
        primary={{ label: "Navegar", icon: Navigation, href: mapsNavUrl(placeQuery(est)), onClick: () => ns.stop.status === "pendente" && updateStop(ns.stop.id, { status: "a_caminho", statusAt: new Date().toISOString() }) }}
        secondary={[
          { label: "Visita", icon: ClipboardCheck, onClick: () => ui.openStopStatus(ns.stop) },
          { label: "Venda", icon: BadgeDollarSign, onClick: () => ui.openSale({ establishmentId: ns.stop.establishmentId, stopId: ns.stop.id, routeId: ns.routeId }) },
        ]}
        link={{ label: "Ver rota", onClick: () => go(`rotas/${ns.routeId}/${ns.stop.id}`) }} />
    );
  } else if (due && dueEst) {
    body = (
      <Action icon={CalendarClock} kicker={due.overdue ? "Retorno atrasado" : "Retorno para hoje"} title={due.name} text={dueEst.address}
        primary={{ label: "Navegar", icon: Navigation, href: mapsNavUrl(placeQuery(dueEst)) }}
        secondary={[{ label: "Venda", icon: BadgeDollarSign, onClick: () => ui.openSale({ establishmentId: due.establishmentId }) }, { label: "Reagendar", icon: CalendarClock, onClick: () => ui.openFollowUp(due.establishmentId) }]} />
    );
  } else if (pendingCost) {
    body = <Action icon={Wallet} kicker="Para ver o lucro" title="Informe o custo da placa" text="Margem, resultado e ponto de equilíbrio dependem dele." primary={{ label: "Informar custo", icon: Wallet, onClick: () => go("financas/custos") }} />;
  } else {
    body = <Action icon={MapPinned} kicker="Sem paradas pendentes" title="Planeje a próxima rota" text="Crie uma rota ou registre uma visita avulsa." primary={{ label: "Abrir rotas", icon: MapPinned, onClick: () => go("rotas") }} />;
  }
  return <section className="card border-primary/40 p-4 animate-slide-up" aria-label="Próxima ação recomendada">{body}</section>;
}

type Act = { label: string; icon: typeof Target; onClick?: () => void; href?: string };
function Action({ icon: Icon, kicker, title, text, primary, secondary = [], link }: { icon: typeof Target; kicker: string; title: string; text?: string; primary: Act; secondary?: Act[]; link?: { label: string; onClick: () => void } }) {
  const P = primary.icon;
  return (
    <>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{kicker}</div>
          <div className="mt-0.5 text-[17px] font-extrabold leading-snug">{title}</div>
          {text && <div className="line-clamp-2 text-sm text-muted">{text}</div>}
        </div>
        {link && <button type="button" onClick={link.onClick} className="press tap -mr-1 shrink-0 rounded-lg px-1.5 py-1 text-xs font-semibold text-primary">{link.label}</button>}
      </div>
      <div className={cn("mt-3 grid gap-2", secondary.length ? "grid-cols-2" : "grid-cols-1")}>
        {primary.href ? (
          <a href={primary.href} target="_blank" rel="noopener" onClick={primary.onClick} className="press col-span-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.8)]">
            <P className="h-4 w-4" />{primary.label}
          </a>
        ) : (
          <Button variant="primary" className="col-span-full h-12" onClick={primary.onClick}><P className="h-4 w-4" />{primary.label}</Button>
        )}
        {secondary.map((s) => (
          <Button key={s.label} className="h-12" onClick={s.onClick}><s.icon className="h-4 w-4" />{s.label}</Button>
        ))}
      </div>
    </>
  );
}

function PendingData({ items }: { items: ReturnType<typeof pendingItems> }) {
  const [open, setOpen] = useState(false);
  const bad = items.some((x) => x.tone === "bad");
  return (
    <section className="card overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="press flex w-full items-center gap-3 p-4 text-left">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", bad ? "bg-bad-soft text-bad" : "bg-warn-soft text-warn")}><AlertCircle className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{items.length} {items.length === 1 ? "dado pendente" : "dados pendentes"}</span>
          <span className="block truncate text-xs text-muted">{items[0].text}</span>
        </span>
        <ChevronDown className={cn("h-5 w-5 text-subtle transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="space-y-2 border-t border-border p-3 animate-fade-in">
          {items.map((x) => (
            <li key={x.text}>
              <button type="button" onClick={() => go(x.to)} className="press flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-surface-raised px-3 py-2.5 text-left text-sm">
                <AlertCircle className={cn("h-4 w-4 shrink-0", x.tone === "bad" ? "text-bad" : "text-warn")} />
                <span className="flex-1">{x.text}</span>
                <ChevronRight className="h-4 w-4 text-subtle" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
