'use client';

import React, { useMemo } from 'react';

/* ============================================================
 * Lightweight SVG Chart Components
 * These are used as a fallback/simple option. For richer charts,
 * we lazy-load Recharts via the ChartWrapper component below.
 * ============================================================ */

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

/* ============================================================
 * MiniChart — Sparkline-style inline chart
 * ============================================================ */

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

export function MiniChart({
  data,
  width = 120,
  height = 40,
  color = 'var(--accent-positive)',
  showArea = true,
  className = '',
}: MiniChartProps) {
  if (data.length < 2) return null;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * w,
    y: padding + h - ((val - minVal) / range) * h,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={color}
          opacity={0.1}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill={color}
      />
    </svg>
  );
}

/* ============================================================
 * DonutChart — Breakdown/allocation chart
 * ============================================================ */

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function DonutChart({
  segments,
  size = 200,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  className = '',
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += segmentLength;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-500 ease-out"
            >
              <title>{segment.label}: {((segment.value / total) * 100).toFixed(1)}%</title>
            </circle>
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-[var(--text-secondary)]">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * BarChart — Horizontal bar chart for comparisons
 * ============================================================ */

interface BarChartItem {
  label: string;
  value: number;
  color?: string;
  formattedValue?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  className?: string;
}

export function BarChart({ items, className = '' }: BarChartProps) {
  const maxVal = Math.max(...items.map((i) => i.value));

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => {
        const percentage = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] font-medium">
                {item.label}
              </span>
              <span className="font-mono text-[var(--text-primary)] font-semibold">
                {item.formattedValue ?? item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor:
                    item.color ?? 'var(--accent-structural)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * GrowthChart — Year-by-year growth projection (SVG)
 * ============================================================ */

interface GrowthChartProps {
  data: DataPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

export function GrowthChart({
  data,
  height = 300,
  primaryColor = 'var(--accent-positive)',
  secondaryColor = 'var(--accent-structural)',
  primaryLabel = 'Growth',
  secondaryLabel,
  formatValue = (v) => v.toLocaleString(),
  className = '',
}: GrowthChartProps) {
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 80 };

  const computed = useMemo(() => {
    if (data.length === 0) return null;

    const allValues = data.flatMap((d) =>
      d.secondaryValue != null
        ? [d.value, d.secondaryValue]
        : [d.value]
    );
    const maxVal = Math.max(...allValues);
    const minVal = Math.min(0, ...allValues);
    const range = maxVal - minVal || 1;

    const w = chartWidth - padding.left - padding.right;
    const h = height - padding.top - padding.bottom;

    const xStep = data.length > 1 ? w / (data.length - 1) : 0;

    const primaryPoints = data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + h - ((d.value - minVal) / range) * h,
    }));

    const secondaryPoints = data
      .filter((d) => d.secondaryValue != null)
      .map((d, i) => ({
        x: padding.left + i * xStep,
        y:
          padding.top +
          h -
          (((d.secondaryValue ?? 0) - minVal) / range) * h,
      }));

    // Y-axis ticks
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
      minVal + (range / tickCount) * i
    );

    // X-axis labels (show max ~10)
    const labelInterval = Math.max(1, Math.ceil(data.length / 10));

    return {
      primaryPoints,
      secondaryPoints,
      yTicks,
      labelInterval,
      w,
      h,
      maxVal,
      minVal,
      range,
    };
  }, [data, height]);

  if (!computed || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-[var(--text-secondary)] text-sm ${className}`}
        style={{ height }}
      >
        No data to display
      </div>
    );
  }

  const makeLinePath = (points: { x: number; y: number }[]) =>
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

  const makeAreaPath = (points: { x: number; y: number }[]) => {
    const baseline = padding.top + computed.h;
    return `${makeLinePath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-2 ml-20">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-xs text-[var(--text-secondary)]">
            {primaryLabel}
          </span>
        </div>
        {secondaryLabel && computed.secondaryPoints.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {secondaryLabel}
            </span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {computed.yTicks.map((tick, i) => {
          const y =
            padding.top +
            computed.h -
            ((tick - computed.minVal) / computed.range) * computed.h;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-[var(--text-secondary)]"
                fontFamily="monospace"
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % computed.labelInterval !== 0 && i !== data.length - 1)
            return null;
          const x =
            padding.left +
            i *
              (computed.w / (data.length > 1 ? data.length - 1 : 1));
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px] fill-[var(--text-secondary)]"
              fontFamily="monospace"
            >
              {d.label}
            </text>
          );
        })}

        {/* Secondary area + line */}
        {computed.secondaryPoints.length > 0 && (
          <>
            <path
              d={makeAreaPath(computed.secondaryPoints)}
              fill={secondaryColor}
              opacity={0.08}
            />
            <path
              d={makeLinePath(computed.secondaryPoints)}
              fill="none"
              stroke={secondaryColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="6 3"
            />
          </>
        )}

        {/* Primary area + line */}
        <path
          d={makeAreaPath(computed.primaryPoints)}
          fill={primaryColor}
          opacity={0.12}
        />
        <path
          d={makeLinePath(computed.primaryPoints)}
          fill="none"
          stroke={primaryColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End point dots */}
        {computed.primaryPoints.length > 0 && (
          <circle
            cx={computed.primaryPoints[computed.primaryPoints.length - 1].x}
            cy={computed.primaryPoints[computed.primaryPoints.length - 1].y}
            r={4}
            fill={primaryColor}
            stroke="var(--bg-card)"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
}
