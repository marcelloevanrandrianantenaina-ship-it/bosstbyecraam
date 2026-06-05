import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: any;
  action?: ReactNode;
}) {
  return (
    <section className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="h-11 w-11 shrink-0 rounded-2xl gradient-primary grid place-items-center glow-soft text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-wider text-accent font-bold">
              {eyebrow}
            </div>
          )}
          <h1 className="text-lg sm:text-xl font-black leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
