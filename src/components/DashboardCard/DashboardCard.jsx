import { CircleHelp } from "lucide-react";

const formatter = new Intl.NumberFormat();

export default function DashboardCard({
  title,
  value,
  icon: Icon = CircleHelp,
  description,
}) {
  const displayValue =
    typeof value === "number" ? formatter.format(value) : value ?? "--";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white/90 p-6 shadow-sm">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{displayValue}</h3>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}
