"use client";

import React from "react";
import {
  X, CheckCircle2, AlertTriangle, ShieldCheck, Database,
  FileText, Activity, BookOpen
} from "lucide-react";
import { WhyExplanation } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  whyData?: WhyExplanation;
}

export function WhyRationaleDrawer({ isOpen, onClose, whyData }: Props) {
  if (!isOpen || !whyData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-ocean-950 border-l border-slate-800 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Why ORCA Says This
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Grounded Lineage & Governed Rule Evaluation
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-ocean-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Headline & Summary */}
          <div className="mt-5 p-4 rounded-xl bg-ocean-900/80 border border-slate-800">
            <div className="font-bold text-cyan-300 text-sm">
              {whyData.headline}
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {whyData.summary_prose}
            </p>
          </div>

          {/* Favorable Factors */}
          <div className="mt-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Favorable Supporting Factors
            </h4>
            <div className="space-y-2.5">
              {whyData.positive_factors.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs"
                >
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>{f.category}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700">
                      {f.source_authority}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">{f.detail}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-emerald-900/40">
                    <span>Observed: {f.raw_value}</span>
                    {f.threshold && <span>Threshold: {f.threshold}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors & Operational Constraints */}
          {whyData.risk_factors.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-4 h-4" />
                Operational Risk Factors & Constraints
              </h4>
              <div className="space-y-2.5">
                {whyData.risk_factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs"
                  >
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>{f.category}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-700">
                        {f.source_authority}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1">{f.detail}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-amber-900/40">
                      <span>Value: {f.raw_value}</span>
                      {f.threshold && <span>Rule: {f.threshold}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Evidence Notes */}
          <div className="mt-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Sensor Lineage & Methodology
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-400">
              {whyData.scientific_evidence_notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
}
