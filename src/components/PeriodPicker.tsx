import { PERIOD_LABELS, type PeriodKey } from "@/lib/dates";
import { Chips } from "@/components/ui";

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = (["hoje", "ontem", "semana", "7d", "mes", "mes_passado", "30d", "tudo"] as PeriodKey[]).map((k) => ({ value: k, label: PERIOD_LABELS[k] }));

export function PeriodPicker({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <Chips size="sm" className="flex-nowrap" options={PERIOD_OPTIONS} value={value} onChange={onChange} />
    </div>
  );
}
