import React from 'react';

export function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark', onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-structural)]/50 transition-all text-sm"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '[L]' : '[D]'}
    </button>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`neu-raised p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', className = '' }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'outline', className?: string }) {
  const base = "px-4 py-2 font-mono font-bold tracking-widest uppercase transition-all duration-200 text-xs flex items-center justify-center relative rounded-xl active:scale-95";
  const variants = {
    primary: "neu-raised bg-[var(--accent-structural)] text-black hover:bg-[var(--accent-positive)] hover:opacity-90 active:neu-pressed",
    secondary: "neu-raised text-[var(--accent-structural)] active:neu-pressed",
    outline: "neu-inset text-[var(--text-secondary)] hover:text-[var(--accent-structural)]"
  };
  
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = "number", suffix, prefix, helpText, min = 0, max = 100, step = 1 }: any) {
  const isNumeric = ['number', 'currency', 'percent', 'slider'].includes(type);
  
  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">{label}</label>
        {helpText && (
          <div className="group relative flex items-center justify-center w-4 h-4 rounded-full neu-raised text-[10px] text-[var(--text-secondary)] cursor-help hover:text-[var(--accent-structural)] transition-colors">
            ?
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 neu-raised font-mono text-[10px] text-[var(--text-primary)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-normal leading-relaxed uppercase tracking-wider">
              {helpText}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative flex items-center neu-inset focus-within:border-[var(--accent-structural)] transition-all">
        {prefix && <span className="absolute left-3 font-mono text-[var(--text-secondary)] font-bold pointer-events-none">{prefix}</span>}
        <input 
          type={isNumeric ? 'number' : type} 
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => {
            if (isNumeric) {
              onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
            } else {
              onChange(e.target.value);
            }
          }}
          className={`w-full bg-transparent py-2 ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} outline-none text-[var(--text-primary)] font-bold font-mono text-lg transition-all rounded-xl`}
        />
        {suffix && <span className="absolute right-4 font-mono text-[var(--text-secondary)] font-bold pointer-events-none uppercase tracking-widest text-xs">{suffix}</span>}
      </div>

      {isNumeric && (
        <div className="px-0 mt-3 relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value || 0}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-2 neu-inset appearance-none cursor-pointer accent-[var(--accent-structural)] hover:accent-[var(--accent-positive)] focus:outline-none rounded-full"
          />
        </div>
      )}
    </div>
  );
}
