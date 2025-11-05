import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function DailyChart({ days = [], data = [], units = "metric" }) {
  const tempSuffix = units === "metric" ? "°C" : "°F";

  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "2-digit" }),
    []
  );

  const mapped = useMemo(() => {
    if (Array.isArray(days) && days.length) {
      return days.slice(0, 10).map((d) => {
        const dateObj = d.date ? new Date(d.date + "T12:00:00") : new Date();
        return {
          d: dayFmt.format(dateObj),
          tmax: Math.round(Number(d.tmax)),
          tmin: Math.round(Number(d.tmin)),
          pop: clamp0_100(Number(d.pop)),
        };
      });
    }
    return (Array.isArray(data) ? data : []).slice(0, 10).map((d) => ({
      d: dayFmt.format(new Date((d.dt || 0) * 1000)),
      tmax: safeRound(d?.temp?.max),
      tmin: safeRound(d?.temp?.min),
      pop: clamp0_100(Math.round(((d?.pop || 0) * 100))),
    }));
  }, [days, data, dayFmt]);

  const [yMin, yMax] = useMemo(() => {
    if (!mapped.length) return [0, 1];
    const arr = mapped.flatMap((x) => [x.tmin, x.tmax]).filter(isFinite);
    if (!arr.length) return [0, 1];
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return [
      Math.min(0, Math.floor(min - 1)),
      Math.max(0, Math.ceil(max + 1)),
    ];
  }, [mapped]);

  if (!mapped.length) {
    return <div className="glass rounded-2xl p-3 sm:p-4 skel h-[280px]" />;
  }

  return (
    <div className="glass rounded-2xl p-3 sm:p-4">
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <ComposedChart data={mapped} margin={{ top: 10, right: 16, left: 28, bottom: 24 }}>
            <CartesianGrid strokeOpacity={0.15} />

            <XAxis
              dataKey="d"
              tick={{ fill: "rgba(255,255,255,.85)", fontSize: 12 }}
              tickMargin={8}
              minTickGap={8}
            />

            <YAxis
              yAxisId="left"
              domain={[yMin, yMax]}
              tick={{ fill: "rgba(255,255,255,.85)", fontSize: 12 }}
              tickMargin={10}
              padding={{ top: 6, bottom: 12 }}
              tickFormatter={(v) => `${v}${tempSuffix}`}
              width={44}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,.85)", fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              width={34}
            />

            <ReferenceLine y={0} yAxisId="left" stroke="currentColor" strokeOpacity={0.4} strokeDasharray="3 3" />

            <Tooltip
              contentStyle={{
                background: "rgba(20,24,38,.92)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 12,
                color: "#fff",
              }}
              formatter={(val, name) =>
                name === "tmax" || name === "tmin"
                  ? [`${val}${tempSuffix}`, name.toUpperCase()]
                  : [`${val}%`, "Pioggia"]
              }
            />

            <Bar
              yAxisId="right"
              dataKey="pop"
              fill="rgba(122,214,255,0.35)"
              stroke="rgba(122,214,255,0.8)"
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
              maxBarSize={20}
            />

            <Line yAxisId="left" dataKey="tmax" stroke="#7ad6ff" strokeWidth={2.5} dot={false} />
            <Line yAxisId="left" dataKey="tmin" stroke="#ffffff" strokeOpacity={0.8} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function safeRound(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
function clamp0_100(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}