"use client";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type WeeklyPoint = { label: string; minutes: number; sleepHours: number | null };

/** Bars = workout minutes (left axis), line = self-reported sleep hours (right axis). */
export function WeeklyChart({ data, minutesLabel, sleepLabel, summary }: { data: WeeklyPoint[]; minutesLabel: string; sleepLabel: string; summary: string }) {
  return (
    <figure>
      <div className="h-64 w-full text-slate-500" aria-hidden>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="m" tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis yAxisId="s" orientation="right" domain={[0, 12]} tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, color: "#0F172A" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="m" dataKey="minutes" name={minutesLabel} fill="#14B8A6" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Line yAxisId="s" dataKey="sleepHours" name={sleepLabel} stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Text alternative for screen readers (WCAG 1.1.1) */}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
