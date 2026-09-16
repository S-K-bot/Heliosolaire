import React, { useState } from 'react';
import { Sun, Moon, Zap, Battery, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { HourlyPoint } from '../types';

interface HourlySimulationChartProps {
  hourlyProfiles: {
    summer: HourlyPoint[];
    midSeason: HourlyPoint[];
    winter: HourlyPoint[];
  };
  hasBattery: boolean;
  hasRouter: boolean;
}

export const HourlySimulationChart: React.FC<HourlySimulationChartProps> = ({
  hourlyProfiles,
  hasBattery,
  hasRouter,
}) => {
  const [season, setSeason] = useState<'summer' | 'midSeason' | 'winter'>('midSeason');
  const [hoveredHour, setHoveredHour] = useState<number | null>(13);

  const points = hourlyProfiles[season];
  const maxW = Math.max(
    ...points.map((p) => Math.max(p.productionW, p.consumptionW, 2500))
  );

  const activePoint = points.find((p) => p.hour === (hoveredHour ?? 13)) || points[13];

  // Dimensions SVG
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (hour: number) => paddingLeft + (hour / 23) * chartW;
  const getY = (valW: number) => paddingTop + chartH - (valW / (maxW * 1.1)) * chartH;

  // Polyline points
  const prodLine = points.map((p) => `${getX(p.hour)},${getY(p.productionW)}`).join(' ');
  const consLine = points.map((p) => `${getX(p.hour)},${getY(p.consumptionW)}`).join(' ');
  const selfLine = points.map((p) => `${getX(p.hour)},${getY(p.selfConsumedW)}`).join(' ');

  // Area under curves
  const prodArea = `${getX(0)},${getY(0)} ${prodLine} ${getX(23)},${getY(0)}`;
  const consArea = `${getX(0)},${getY(0)} ${consLine} ${getX(23)},${getY(0)}`;
  const selfArea = `${getX(0)},${getY(0)} ${selfLine} ${getX(23)},${getY(0)}`;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-500" />
            Courbe de Puissance Journalière (24h)
          </h3>
          <p className="text-xs text-neutral-500">
            Équilibre en temps réel entre production solaire, consommation et stockage
          </p>
        </div>

        {/* Season Selector */}
        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSeason('summer')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              season === 'summer' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Journée d'été
          </button>
          <button
            type="button"
            onClick={() => setSeason('midSeason')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              season === 'midSeason' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Mi-saison
          </button>
          <button
            type="button"
            onClick={() => setSeason('winter')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              season === 'winter' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Hiver
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredHour(13)}
        >
          <defs>
            <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="selfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const valW = Math.round(maxW * ratio);
            const y = getY(valW);
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
                  {valW >= 1000 ? `${(valW / 1000).toFixed(1)} kW` : `${valW} W`}
                </text>
              </g>
            );
          })}

          {/* Time axis marks */}
          {[0, 4, 8, 12, 16, 20, 23].map((h) => {
            const x = getX(h);
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 4}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 14}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-500 font-medium"
                >
                  {h}h
                </text>
              </g>
            );
          })}

          {/* Solar Production Fill */}
          <polygon points={prodArea} fill="url(#prodGradient)" />

          {/* Self-consumed Fill */}
          <polygon points={selfArea} fill="url(#selfGradient)" />

          {/* Production curve */}
          <polyline
            points={prodLine}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Household Consumption curve */}
          <polyline
            points={consLine}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Self-consumed line */}
          <polyline
            points={selfLine}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical cursor for hovered hour */}
          {hoveredHour !== null && (
            <g>
              <line
                x1={getX(hoveredHour)}
                y1={paddingTop}
                x2={getX(hoveredHour)}
                y2={height - paddingBottom}
                stroke="#0f172a"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredHour)}
                cy={getY(activePoint.productionW)}
                r="4.5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={getX(hoveredHour)}
                cy={getY(activePoint.consumptionW)}
                r="4"
                fill="#64748b"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Interactive touch/hover overlay bars */}
          {points.map((p) => {
            const x = getX(p.hour);
            const slotW = chartW / 24;
            return (
              <rect
                key={p.hour}
                x={x - slotW / 2}
                y={paddingTop}
                width={slotW}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredHour(p.hour)}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend & Hover Details */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full" />
            <span className="text-neutral-700">Production Solaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-500" />
            <span className="text-neutral-700">Besoins Foyer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span className="text-neutral-700">Autoconsommé direct</span>
          </div>
        </div>

        {/* Dynamic hour inspector */}
        <div className="flex items-center gap-3 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
          <span className="font-bold text-neutral-900">{activePoint.timeLabel} :</span>
          <span className="text-amber-700 font-semibold">
            {activePoint.productionW} W produit
          </span>
          <span className="text-neutral-400">|</span>
          <span className="text-slate-700 font-semibold">
            {activePoint.consumptionW} W consommé
          </span>
          {activePoint.gridExportW > 0 && (
            <>
              <span className="text-neutral-400">|</span>
              <span className="text-emerald-700 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +{activePoint.gridExportW} W surplus
              </span>
            </>
          )}
          {activePoint.gridImportW > 0 && (
            <>
              <span className="text-neutral-400">|</span>
              <span className="text-red-700 font-semibold flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                {activePoint.gridImportW} W réseau
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
