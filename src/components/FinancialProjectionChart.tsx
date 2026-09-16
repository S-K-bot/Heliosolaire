import React, { useState } from 'react';
import { TrendingUp, Award, HelpCircle } from 'lucide-react';
import { YearProjection, CurrencyConfig } from '../types';
import { formatMoney } from '../data/countries';

interface FinancialProjectionChartProps {
  projections: YearProjection[];
  paybackPeriodYears: number;
  netInvestmentCost: number;
  currency?: CurrencyConfig;
}

export const FinancialProjectionChart: React.FC<FinancialProjectionChartProps> = ({
  projections,
  paybackPeriodYears,
  netInvestmentCost,
  currency = { code: 'EUR', symbol: '€', name: 'Euro', exchangeRateFromEUR: 1, position: 'after' as const },
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(15);

  const activeYear = projections.find((p) => p.year === (hoveredYear ?? 15)) || projections[14];

  // Min and max values for scale
  const minVal = -netInvestmentCost;
  const maxVal = Math.max(...projections.map((p) => p.netCashFlowCumulative), 15000);

  // Dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (year: number) => paddingLeft + ((year - 1) / 24) * chartW;
  const getY = (val: number) => {
    const range = maxVal - minVal;
    return paddingTop + chartH - ((val - minVal) / range) * chartH;
  };

  const zeroY = getY(0);

  // Line points
  const pointsString = projections.map((p) => `${getX(p.year)},${getY(p.netCashFlowCumulative)}`).join(' ');

  // Positive profit area
  const paybackYearInt = Math.min(25, Math.ceil(paybackPeriodYears));
  const profitPoints = projections
    .filter((p) => p.year >= paybackYearInt)
    .map((p) => `${getX(p.year)},${getY(p.netCashFlowCumulative)}`)
    .join(' ');

  const profitArea = profitPoints
    ? `${getX(paybackPeriodYears)},${zeroY} ${profitPoints} ${getX(25)},${zeroY}`
    : '';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Rentabilité & Gain Net Cumulé sur 25 Ans
          </h3>
          <p className="text-xs text-neutral-500">
            Évolution de votre trésorerie après amortissement de l'investissement initial
          </p>
        </div>

        {/* Breakeven badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-800">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Point mort atteint en : <strong>{paybackPeriodYears} ans</strong></span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredYear(15)}
        >
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Zero baseline line */}
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={width - paddingRight}
            y2={zeroY}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={paddingLeft - 6}
            y={zeroY + 3}
            textAnchor="end"
            className="text-[9px] fill-neutral-600 font-bold"
          >
            0 {currency.symbol}
          </text>

          {/* Grid lines for positive amounts */}
          {[0.33, 0.66, 1].map((ratio) => {
            const val = Math.round(maxVal * ratio);
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
                  +{Math.round(val / 1000)} k{currency.symbol}
                </text>
              </g>
            );
          })}

          {/* Year axis */}
          {[1, 5, 10, 15, 20, 25].map((yr) => {
            const x = getX(yr);
            return (
              <g key={yr}>
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
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-500 font-medium"
                >
                  An {yr}
                </text>
              </g>
            );
          })}

          {/* Profit area fill */}
          {profitArea && (
            <polygon points={profitArea} fill="url(#profitGrad)" />
          )}

          {/* Cumulative Cash Flow Curve */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Payback marker dot */}
          <circle
            cx={getX(paybackPeriodYears)}
            cy={zeroY}
            r="6"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Active hover vertical crosshair */}
          {hoveredYear !== null && (
            <g>
              <line
                x1={getX(hoveredYear)}
                y1={paddingTop}
                x2={getX(hoveredYear)}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredYear)}
                cy={getY(activeYear.netCashFlowCumulative)}
                r="5"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Touch/mouse hover interaction rectangles */}
          {projections.map((p) => {
            const x = getX(p.year);
            const slotW = chartW / 25;
            return (
              <rect
                key={p.year}
                x={x - slotW / 2}
                y={paddingTop}
                width={slotW}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredYear(p.year)}
              />
            );
          })}
        </svg>
      </div>

      {/* Year Inspector footer */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
            Année {activeYear.year}
          </span>
          <span className="text-neutral-500">
            Prix du kWh projeté :{' '}
            <strong className="text-neutral-800">
              {activeYear.electricityPricePerKWh} {currency.symbol}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <span className="text-neutral-500">Gain net cumulé : </span>
            <strong
              className={`font-semibold ${
                activeYear.netCashFlowCumulative >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {activeYear.netCashFlowCumulative >= 0 ? '+' : ''}
              {formatMoney(activeYear.netCashFlowCumulative, currency)}
            </strong>
          </div>
          <span className="text-neutral-300">|</span>
          <div>
            <span className="text-neutral-500">Économie de l'année : </span>
            <strong className="text-neutral-900 font-semibold">
              +{formatMoney(activeYear.solarSavingsAnnual, currency)}/an
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
