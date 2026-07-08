"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { parseNaturalLanguage } from '../../nlp/parser';

interface NlpGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocale: string;
}

export function NlpGatewayModal({ isOpen, onClose, currentLocale }: NlpGatewayModalProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Handle Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // The navbar should handle the open, but if it's already open, we might want to focus
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);

    // Parse the natural language query
    const result = parseNaturalLanguage(query);

    setTimeout(() => {
      if (result.targetCalculatorSlug) {
        // Build the query string from params
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(result.params)) {
          queryParams.set(key, value.toString());
        }
        const qs = queryParams.toString();
        
        // Navigate to the correct calculator with the pre-filled params
        router.push(`/${currentLocale}/calculators/${result.targetCalculatorSlug}${qs ? `?${qs}` : ''}`);
        onClose();
      } else {
        // Fallback: didn't understand the instrument. Maybe search or show error.
        alert("Command not recognized. Try specifying a calculator, e.g., '5000 SIP for 10 years'");
      }
      setIsProcessing(false);
    }, 600); // Artificial delay for "processing" effect
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-[#040914] border-2 border-[var(--accent-structural)] shadow-[0_0_50px_rgba(0,255,255,0.2)] rounded-[30px] p-8 md:p-12 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] z-10" />

        <div className="relative z-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-mono text-[var(--accent-structural)] tracking-widest font-bold uppercase">
              NLP Command Gateway
            </h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--accent-structural)] font-mono text-sm tracking-widest">
              [ ESC TO ABORT ]
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center border-b-2 border-[var(--border-glow)] pb-4 focus-within:border-[var(--accent-structural)] transition-colors">
              <span className="text-4xl text-[var(--accent-structural)] font-mono mr-4 animate-pulse">
                &gt;_
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 5000 SIP at 12% for 10 years"
                disabled={isProcessing}
                className="w-full bg-transparent border-none outline-none text-3xl md:text-5xl font-mono text-white placeholder-[var(--text-secondary)]/30"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            
            {isProcessing && (
              <div className="absolute left-0 -bottom-8 text-xs font-mono text-[var(--accent-positive)] tracking-widest uppercase flex items-center gap-2 animate-pulse">
                <span>[ PROCESSING INTENT... ]</span>
              </div>
            )}
          </form>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
            <div className="bg-black/50 border border-[var(--border-subtle)] p-4 rounded-xl">
              <p className="text-[var(--text-secondary)] mb-2 uppercase tracking-widest text-[10px]">Recognized Targets</p>
              <div className="flex flex-wrap gap-2 text-[var(--accent-structural)]">
                <span>SIP</span> <span>PPF</span> <span>401K</span> <span>IRA</span> <span>NPS</span> <span>EMI</span> <span>MORTGAGE</span> <span>SSY</span>
              </div>
            </div>
            <div className="bg-black/50 border border-[var(--border-subtle)] p-4 rounded-xl">
              <p className="text-[var(--text-secondary)] mb-2 uppercase tracking-widest text-[10px]">Example Commands</p>
              <ul className="space-y-1 text-gray-400">
                <li>"10k monthly sip for 15 years"</li>
                <li>"calculate mortgage for 500k house"</li>
                <li>"1.5L PPF deposit"</li>
                <li>"Fire calculator with 1M saved"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
