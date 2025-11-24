import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, change, icon: Icon }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        {Icon ? <Icon className="h-5 w-5 text-slate-400" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{change}</p>
      </CardContent>
    </Card>
  );
}
