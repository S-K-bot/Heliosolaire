import React, { useState } from 'react';
import { CalendarDays, Sun, Zap, ArrowUpRight } from 'lucide-react';
import { MonthlyBreakdown } from '../types';

interface MonthlyProductionChartProps {
  monthlyData: MonthlyBreakdown[];
}

export const MonthlyProductionChart: React.FC<MonthlyProductionChartProps> = ({
  monthlyData,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(6); // Juillet par défaut

  const maxKWh = Math.max(
    ...monthlyData.map((d) => Math.max(d.solarProductionKWh, d.consumptionKWh, 400))
  );

  const activeMonth = monthlyData[hoveredIndex ?? 6] || monthlyData[6];

  // Dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const slotW = chartW / 12;
  const barW = Math.min(16, slotW * 0.36);

  const getY = (val: number) => paddingTop + chartH - (val / (maxKWh * 1.15)) * chartH;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            Bilan Saisonnier sur 12 Mois (Production vs Consommation)
          </h3>
          <p className="text-xs text-neutral-500">
            Comparatif mensuel de votre production solaire face à vos besoins réels (kWh)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-500 rounded-sm" />
            <span className="text-neutral-700">Production Solaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-400 rounded-sm" />
            <span className="text-neutral-700">Consommation Foyer</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(6)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(maxKWh * ratio);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-neutral-400"
                >
                  {val} kWh
                </text>
              </g>
            );
          })}

          {/* Month bars */}
          {monthlyData.map((d, idx) => {
            const slotCenterX = paddingLeft + idx * slotW + slotW / 2;
            const isHovered = hoveredIndex === idx;

            // Bar 1: Solar Production
            const prodH = chartH - (getY(d.solarProductionKWh) - paddingTop);
            const prodY = getY(d.solarProductionKWh);

            // Bar 2: Household Consumption
            const consH = chartH - (getY(d.consumptionKWh) - paddingTop);
            const consY = getY(d.consumptionKWh);

            return (
              <g
                key={d.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {/* Background hover highlight */}
                {isHovered && (
                  <rect
                    x={paddingLeft + idx * slotW + 2}
                    y={paddingTop}
                    width={slotW - 4}
                    height={chartH}
                    fill="#fef3c7"
                    opacity="0.4"
                    rx="4"
                  />
                )}

                {/* Solar Bar */}
                <rect
                  x={slotCenterX - barW - 1.5}
                  y={prodY}
                  width={barW}
                  height={Math.max(2, prodH)}
                  fill={isHovered ? '#d97706' : '#f59e0b'}
                  rx="3"
                />

                {/* Consumption Bar */}
                <rect
                  x={slotCenterX + 1.5}
                  y={consY}
                  width={barW}
                  height={Math.max(2, consH)}
                  fill={isHovered ? '#475569' : '#94a3b8'}
                  rx="3"
                />

                {/* Month label */}
                <text
                  x={slotCenterX}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    isHovered
                      ? 'fill-amber-800 font-bold'
                      : 'fill-neutral-500 font-medium'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Month Inspector details */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
            Mois de {activeMonth.month}
          </span>
          <span className="text-neutral-500">
            Autoconsommation :{' '}
            <strong className="text-emerald-700">
              {activeMonth.solarProductionKWh > 0
                ? Math.round((activeMonth.selfConsumedKWh / activeMonth.solarProductionKWh) * 100)
                : 0}
              %
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Production :</span>
            <strong className="text-amber-700 font-semibold">{activeMonth.solarProductionKWh} kWh</strong>
          </div>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Consommation :</span>
            <strong className="text-slate-700 font-semibold">{activeMonth.consumptionKWh} kWh</strong>
          </div>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Surplus vendu :</span>
            <strong className="text-emerald-700 font-semibold">{activeMonth.exportedKWh} kWh</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
