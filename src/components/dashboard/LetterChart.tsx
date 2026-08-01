'use client';

import React from 'react';
import { ChartData } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface LetterChartProps {
  data: ChartData[];
  year?: number;
}

export function LetterChart({ data, year = 2026 }: LetterChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-700 text-xs backdrop-blur-md">
          <p className="font-bold text-emerald-400 mb-1.5">{`Bulan: ${label}`}</p>
          <div className="space-y-1">
            <p className="flex items-center justify-between gap-4">
              <span className="text-emerald-300">Surat Masuk:</span>
              <span className="font-bold">{payload[0]?.value || 0}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-teal-300">Surat Keluar:</span>
              <span className="font-bold">{payload[1]?.value || 0}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#061e15] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Grafik Surat Per Bulan
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold border border-emerald-300 dark:border-emerald-700">
              Tahun {year}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-emerald-200/90 mt-0.5 font-medium">
            Perbandingan volume surat masuk dan surat keluar masjid.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-zinc-700 dark:text-emerald-100">Surat Masuk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
            <span className="text-zinc-700 dark:text-emerald-100">Surat Keluar</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415140" />
            <XAxis
              dataKey="monthName"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="suratMasuk"
              name="Surat Masuk"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMasuk)"
            />
            <Area
              type="monotone"
              dataKey="suratKeluar"
              name="Surat Keluar"
              stroke="#14b8a6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorKeluar)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
