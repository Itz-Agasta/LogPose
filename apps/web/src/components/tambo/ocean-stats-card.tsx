"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconArrowDown, IconArrowUp, IconMinus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Stat = {
  label?: string | null;
  value?: string | number | null;
  unit?: string | null;
  change?: number | null;
  trend?: "up" | "down" | "stable" | string | null;
};

type OceanStatsCardProps = {
  title?: string;
  stats?: Stat[];
  description?: string;
};

const getTrendIcon = (trend?: string | null) => {
  switch (trend) {
    case "up":
      return IconArrowUp;
    case "down":
      return IconArrowDown;
    case "stable":
      return IconMinus;
    default:
      return null;
  }
};

const getTrendColor = (trend?: string | null): string => {
  switch (trend) {
    case "up":
      return "text-green-400";
    case "down":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
};

export default function OceanStatsCard({
  title,
  stats,
  description,
}: OceanStatsCardProps) {
  return (
    <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title ?? "Ocean Statistics"}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {stats && stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const TrendIcon = getTrendIcon(stat.trend);

              return (
                <div
                  key={stat.label ?? index}
                  className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {stat.label ?? "Statistic"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">
                      {stat.value !== undefined ? stat.value : "—"}
                    </span>
                    {stat.unit && (
                      <span className="text-sm text-muted-foreground">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                  {(stat.change !== undefined && stat.change !== null) ||
                  stat.trend ? (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        getTrendColor(stat.trend),
                      )}
                    >
                      {TrendIcon && <TrendIcon className="h-3 w-3" />}
                      {stat.change !== undefined && stat.change !== null && (
                        <span>
                          {stat.change > 0 ? "+" : ""}
                          {stat.change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No statistics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
