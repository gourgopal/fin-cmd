"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useUrlState } from "../../hooks/useUrlState";
import {
  useSharedFinancialState,
  getCategoryForCalculator,
} from "../../hooks/useSharedFinancialState";
import { CalculatorConfig } from "../../lib/calculators";
import { Card, Input, Button } from "../ui";
import { engineMap } from "../../engine";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../lib/currencies";
import { getLocaleConfig } from "../../lib/locales";

interface CalculatorShellProps {
  config: CalculatorConfig;
  locale: string;
}

export function CalculatorShell({ config, locale }: CalculatorShellProps) {
  const [isMounted, setIsMounted] = useState(false);
  const localeConfig = getLocaleConfig(locale);
  const currencyCode = localeConfig.currency;

  const { sharedState, saveToCategory } = useSharedFinancialState();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialState = useMemo(() => {
    const state: Record<string, any> = {};
    config.fields.forEach((f) => {
      if (config.slug === "net-worth-tracker") {
        if (f.key === "investments" && sharedState.investments)
          state[f.key] = sharedState.investments;
        else if (f.key === "cash" && sharedState.cash)
          state[f.key] = sharedState.cash;
        else if (f.key === "property" && sharedState.property)
          state[f.key] = sharedState.property;
        else if (f.key === "mortgage" && sharedState.mortgage)
          state[f.key] = sharedState.mortgage;
        else if (f.key === "other_loans" && sharedState.other_loans)
          state[f.key] = sharedState.other_loans;
        else if (
          f.key === "depreciating_assets" &&
          sharedState.depreciating_assets
        )
          state[f.key] = sharedState.depreciating_assets;
        else state[f.key] = f.default;
      } else {
        state[f.key] = f.default;
      }
    });
    return state;
  }, [config, sharedState]);

  const [state, setState, isLoaded] = useUrlState(initialState);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [chartType, setChartType] = useState<"pie" | "area" | "bar">("bar");
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleStateChange = (key: string, val: any) => {
    setState({ [key]: val });
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 500);
  };

  const result = useMemo(() => {
    if (!config.engineFn || !engineMap[config.engineFn]) return null;
    try {
      return engineMap[config.engineFn](state);
    } catch (e) {
      console.error("Engine calc error", e);
      return null;
    }
  }, [state, config.engineFn]);

  const handleSaveToNetWorth = () => {
    const category = getCategoryForCalculator(config.slug);
    if (category && result?.finalBalance !== undefined) {
      saveToCategory(category, result.finalBalance);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }
  };

  const handleReset = () => {
    setState(initialState);
  };

  if (!isLoaded)
    return <div className="p-4 text-center animate-pulse">Loading...</div>;

  const isNetWorth = config.slug === "net-worth-tracker";
  const isDebt = config.category === "debt";
  const isTax = config.category === "tax";

  const labelTotal = isNetWorth ? "Net Worth" : isTax ? "Net Income" : isDebt ? "Total Payable" : "Total Value";
  const labelPrincipal = isNetWorth ? "Total Assets" : isTax ? "Gross Income" : isDebt ? "Principal Amount" : "Invested Amount";
  const labelInterest = isNetWorth ? "Total Liabilities" : isTax ? "Total Tax" : isDebt ? "Total Interest" : "Est. Returns";

  // New Theme Colors
  const colorPrincipal = isNetWorth ? "var(--accent-positive)" : "var(--text-primary)";
  const colorInterest = isDebt || isNetWorth ? "var(--accent-negative)" : "var(--accent-structural)";

  const pieData = [
    {
      name: labelPrincipal,
      value: result?.totalContributions || 0,
      color: colorPrincipal,
    },
    {
      name: labelInterest,
      value: result?.totalInterest || 0,
      color: colorInterest,
    },
  ].filter((d) => d.value > 0);

  const areaData = result?.growthSeries || result?.amortization || [];

  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-primary)]/95 backdrop-blur-md border border-[var(--border-subtle)] p-3 rounded-xl shadow-xl">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex flex-col">
              <span className="text-xs text-[var(--text-secondary)] font-semibold uppercase">
                {entry.name}
              </span>
              <span
                style={{ color: entry.payload.color }}
                className="text-lg font-bold"
              >
                {formatCurrency(entry.value, currencyCode, { compact: true })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-primary)]/90 backdrop-blur border border-[var(--border-subtle)] p-3 rounded-xl shadow-xl">
          <p className="font-bold text-[var(--text-primary)] mb-1 text-sm">
            Year {label}
          </p>
          {payload.map((entry: any) => (
            <p
              key={entry.name}
              style={{ color: entry.color }}
              className="text-xs font-semibold"
            >
              {entry.name}:{" "}
              {formatCurrency(entry.value, currencyCode, { compact: true })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const standardFields = config.fields.filter((f) => !f.advanced);
  const advancedFields = config.fields.filter((f) => f.advanced);

  return (
    <div className="neu-raised w-full max-w-full xl:max-w-[98%] mx-auto p-0 flex flex-col md:flex-row relative z-10 animate-in fade-in duration-500 min-h-[600px] overflow-hidden">
      {/* Toast Notification */}
      {showSaveToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--accent-positive)] text-black px-6 py-2 border border-[var(--accent-positive)] font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_var(--accent-positive)] animate-in slide-in-from-top fade-in flex items-center gap-2">
          <span>DATA TRANSMITTED TO FLEET STORAGE</span>
        </div>
      )}

      {/* Left Side: Inputs */}
      <div className="md:w-[40%] p-6 flex flex-col relative z-20 border-r border-[var(--border-subtle)]">
        <h2 className="text-xl font-mono font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-4">
          <span className="p-2 neu-inset text-sm text-[var(--accent-structural)]">
            {config.icon}
          </span>
          {config.shortTitle || config.title}
        </h2>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {standardFields.map((field) => (
            <div 
              key={field.key} 
              className={(field.type === 'currency' || field.key === 'salaryLpa') && field.key !== 'monthly' ? 'col-span-1 md:col-span-2' : 'col-span-1'}
            >
              <Input
                label={field.label}
                value={state[field.key]}
                onChange={(val: any) => handleStateChange(field.key, val)}
                type={
                  field.type === "number" ||
                  field.type === "currency" ||
                  field.type === "percent" ||
                  field.type === "slider"
                    ? "number"
                    : "text"
                }
                prefix={
                  field.type === "currency"
                    ? localeConfig.currencySymbol
                    : field.prefix
                }
                suffix={field.suffix}
                helpText={field.helpText}
                min={field.min}
                max={field.max}
                step={field.step}
              />
            </div>
          ))}
          </div>

          {/* Modular Kitchen Advanced Drawer */}
          {advancedFields.length > 0 && (
            <div className="mt-4 border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-primary)]/50">
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Advanced Options
                <svg
                  className={`w-4 h-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isAdvancedOpen && (
                <div className="p-3 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-[var(--border-subtle)] animate-in slide-in-from-top-2 fade-in">
                  {advancedFields.map((field) => (
                    <div 
                      key={field.key}
                      className={field.type === 'currency' ? 'col-span-1 md:col-span-2' : 'col-span-1'}
                    >
                      <Input
                        label={field.label}
                        value={state[field.key]}
                        onChange={(val: any) =>
                          handleStateChange(field.key, val)
                        }
                        type={
                          field.type === "number" ||
                          field.type === "currency" ||
                          field.type === "percent" ||
                          field.type === "slider"
                            ? "number"
                            : "text"
                        }
                        prefix={
                          field.type === "currency"
                            ? localeConfig.currencySymbol
                            : field.prefix
                        }
                        suffix={field.suffix}
                        helpText={field.helpText}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Results & Chart */}
      <div
        className={`md:w-[60%] p-4 md:p-6 flex flex-col transition-opacity duration-300 relative z-20 ${isUpdating ? "opacity-50" : "opacity-100"}`}
      >
        {/* Top Result Numbers */}
        {result && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="neu-raised col-span-2 flex justify-between items-center relative overflow-hidden">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono font-bold">
                {labelTotal}
              </div>
              <div className="text-3xl font-mono font-black text-[var(--text-primary)] tracking-wider">
                {formatCurrency(result.finalBalance || 0, currencyCode, {
                  compact: false,
                })}
              </div>
            </div>
            
            {/* If Debt, show EMI if available */}
            {isDebt && result.amortization && result.amortization.length > 0 && (
              <div className="neu-raised col-span-2 flex justify-between items-center relative overflow-hidden">
                <div className="text-[10px] text-[var(--accent-structural)] uppercase tracking-widest font-mono font-bold">
                  Monthly EMI
                </div>
                <div className="text-2xl font-mono font-black text-[var(--accent-structural)] tracking-wider">
                  {formatCurrency(result.amortization[0].emi || 0, currencyCode, {
                    compact: false,
                  })}
                </div>
              </div>
            )}

            <div className="neu-inset p-3 flex flex-col justify-center">
              <div className="text-[9px] text-[var(--text-secondary)] mb-1 uppercase tracking-widest font-mono font-bold">
                {labelPrincipal}
              </div>
              <div className="text-lg font-mono font-bold text-[var(--text-primary)]">
                {formatCurrency(result.totalContributions || 0, currencyCode, {
                  compact: true,
                })}
              </div>
            </div>
            <div className="neu-inset p-3 flex flex-col justify-center">
              <div className="text-[9px] text-[var(--text-secondary)] mb-1 uppercase tracking-widest font-mono font-bold">
                {labelInterest}
              </div>
              <div
                className={`text-lg font-mono font-bold ${isDebt ? "text-[var(--accent-negative)]" : "text-[var(--accent-positive)]"}`}
              >
                {isDebt ? "" : "+"}
                {formatCurrency(result.totalInterest || 0, currencyCode, {
                  compact: true,
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="primary"
            onClick={handleSaveToNetWorth}
            className="flex-1 py-4 text-sm font-mono tracking-widest uppercase"
          >
            [ TRANSMIT ]
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="py-4 px-6 text-sm font-mono tracking-widest uppercase"
          >
            [ RESET ]
          </Button>
        </div>

        {config.proFeature && (
          <div className="mb-4 p-3 neu-inset text-[10px] font-mono tracking-widest text-[var(--accent-warning)]">
            <span className="font-bold">PRO OVERRIDE:</span> ADVANCED ALGORITHMS ENGAGED.
          </div>
        )}

        {/* Chart Section */}
        <div className="flex-1 w-full min-h-[300px] neu-inset p-4 flex flex-col relative overflow-hidden">
          
          <div className="flex justify-end gap-2 mb-4 relative z-10">
            <button 
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase border ${chartType === 'area' ? 'bg-[var(--accent-structural)] text-black border-[var(--accent-structural)]' : 'bg-black text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-structural)]'}`}
            >
              AREA
            </button>
            <button 
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase border ${chartType === 'pie' ? 'bg-[var(--accent-structural)] text-black border-[var(--accent-structural)]' : 'bg-black text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-structural)]'}`}
            >
              PIE
            </button>
            {areaData.length > 0 && (
              <button 
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase border ${chartType === 'bar' ? 'bg-[var(--accent-structural)] text-black border-[var(--accent-structural)]' : 'bg-black text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-structural)]'}`}
              >
                BAR
              </button>
            )}
          </div>

          {isMounted && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderPieTooltip} />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] ml-1 uppercase tracking-widest">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              ) : chartType === "area" ? (
                <AreaChart
                  data={areaData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colorInterest}
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor={colorInterest}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorContrib"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={colorPrincipal} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colorPrincipal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="var(--text-secondary)"
                    tick={{
                      fontSize: 10,
                      fill: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{
                      fontSize: 10,
                      fill: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      formatCurrency(v, currencyCode, { compact: true })
                    }
                    dx={-10}
                    width={40}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    vertical={false}
                    opacity={0.5}
                  />
                  <Tooltip
                    content={renderAreaTooltip}
                    cursor={{
                      stroke: "var(--accent-structural)",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "5px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    stackId="a"
                    dataKey={isDebt ? "cumulativePrincipal" : "contributions"}
                    name={labelPrincipal}
                    stroke={colorPrincipal}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContrib)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    stackId="a"
                    dataKey={isDebt ? "cumulativeInterest" : "interest"}
                    name={labelInterest}
                    stroke={colorInterest}
                    strokeWidth={3}
                    activeDot={{
                      r: 4,
                      fill: colorInterest,
                      stroke: "black",
                      strokeWidth: 2,
                    }}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <BarChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="year"
                    stroke="var(--text-secondary)"
                    tick={{
                      fontSize: 10,
                      fill: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                    tickFormatter={(v) =>
                      formatCurrency(v, currencyCode, { compact: true })
                    }
                    dx={-10}
                    width={40}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    vertical={false}
                    opacity={0.5}
                  />
                  <Tooltip content={renderAreaTooltip} cursor={{ fill: 'rgba(0, 255, 255, 0.1)' }} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "5px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Bar dataKey={isDebt ? "cumulativePrincipal" : "contributions"} name={labelPrincipal} stackId="a" fill={colorPrincipal} isAnimationActive={false} />
                  <Bar dataKey={isDebt ? "cumulativeInterest" : "interest"} name={labelInterest} stackId="a" fill={colorInterest} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50 font-mono text-xs tracking-widest">
              {!isMounted ? (
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 bg-[var(--accent-structural)] rounded-full"></div>
                  <div className="w-2 h-2 bg-[var(--accent-structural)] rounded-full"></div>
                </div>
              ) : (
                <span>[ NO DATA ]</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
