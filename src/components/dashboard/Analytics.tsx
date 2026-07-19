'use client';
import React, { useState } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import type { Habit } from '@/app/page';

interface AnalyticsProps {
  habits: Habit[];
}

type Timeframe = 'day' | 'week' | 'month' | 'year';

/* ── Stat Card ─────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="minimal-card rounded-xl p-5 bg-neutral-950 flex flex-col gap-2 transition-all duration-200">
      <span className="text-xl filter grayscale opacity-80">{icon}</span>
      <span className="text-2xl font-semibold tracking-tight text-white">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </span>
    </div>
  );
}

/* ── Donut Chart ──────────────────────────────────────── */
function DonutChart({ pct, label }: { pct: number; label: string }) {
  const safeP = Math.max(0, Math.min(100, pct));
  const gradient = `conic-gradient(#ffffff ${safeP}%, #262626 ${safeP}% 100%)`;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{ background: gradient, transform: 'rotate(-90deg)' }}
      />
      {/* Centre hole */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-[86px] h-[86px] rounded-full bg-neutral-950 flex flex-col items-center justify-center border border-neutral-900">
          <span className="text-xl font-bold text-white">
            {safeP}%
          </span>
          <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Category Progress Bar ─────────────────────────────── */
function CategoryBar({
  category,
  totalCompletions,
  expectedCompletions,
}: {
  category: string;
  totalCompletions: number;
  expectedCompletions: number;
}) {
  const pct = expectedCompletions === 0 ? 0 : Math.round((totalCompletions / expectedCompletions) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{category}</span>
        <span>{totalCompletions} / {expectedCompletions} [{pct}%]</span>
      </div>
      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function Analytics({ habits }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('day');

  const total = habits.length;

  if (total === 0) {
    return (
      <ClayCard className="bg-neutral-950/20 border border-dashed border-neutral-800 flex items-center justify-center flex-col gap-3 py-16 text-center">
        <span className="text-3xl filter grayscale opacity-40">📊</span>
        <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">No data available</p>
      </ClayCard>
    );
  }

  // Get date range limits
  const today = new Date();
  const getDaysLimit = (tf: Timeframe) => {
    switch (tf) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
    }
  };

  const daysLimit = getDaysLimit(timeframe);

  // Helper to check if a date is within timeframe
  const isWithinTimeframe = (dateStr: string, limitDays: number) => {
    const date = new Date(dateStr);
    const timeDiff = today.getTime() - date.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= limitDays;
  };

  // Helper to calculate habits active days in range
  const getActiveDaysInRange = (habitCreatedAt: string, limitDays: number) => {
    const created = new Date(habitCreatedAt);
    const startRange = new Date(today);
    startRange.setDate(today.getDate() - limitDays + 1);
    
    const activeStart = created > startRange ? created : startRange;
    const diffTime = today.getTime() - activeStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return Math.max(1, diffDays); // Minimum 1 day active
  };

  // Gather stats based on timeframe
  let totalCompletions = 0;
  let expectedCompletions = 0;
  const categoryMap: Record<string, { total: number; done: number }> = {};

  habits.forEach((h) => {
    const activeDays = getActiveDaysInRange(h.createdAt, daysLimit);
    expectedCompletions += activeDays;

    const completionsInRange = h.completedDates.filter(d => isWithinTimeframe(d, daysLimit)).length;
    totalCompletions += completionsInRange;

    if (!categoryMap[h.category]) {
      categoryMap[h.category] = { total: 0, done: 0 };
    }
    categoryMap[h.category].total += activeDays;
    categoryMap[h.category].done += completionsInRange;
  });

  const overallRate = expectedCompletions === 0 ? 0 : Math.round((totalCompletions / expectedCompletions) * 100);

  // Stat Card generation
  const renderStatCards = () => {
    if (timeframe === 'day') {
      const todayStr = today.toISOString().split('T')[0];
      const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
      const remainingToday = total - completedToday;
      const rateToday = total === 0 ? 0 : Math.round((completedToday / total) * 100);

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Habits"  value={total}          icon="📋" />
          <StatCard label="Completed"     value={completedToday} icon="✓" />
          <StatCard label="Remaining"     value={remainingToday} icon="⌛" />
          <StatCard label="Rate"          value={`${rateToday}%`} icon="📈" />
        </div>
      );
    }

    const dailyAverage = (totalCompletions / daysLimit).toFixed(1);
    
    // Find best category
    let bestCat = 'None';
    let bestRate = -1;
    Object.entries(categoryMap).forEach(([cat, vals]) => {
      const rate = vals.total === 0 ? 0 : vals.done / vals.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestCat = cat;
      }
    });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Check-ins" value={totalCompletions} icon="✓" />
        <StatCard label="Avg Per Day"      value={dailyAverage}     icon="📈" />
        <StatCard label="Best Category"    value={bestCat}          icon="🏆" />
        <StatCard label="Completion Rate"  value={`${overallRate}%`} icon="📊" />
      </div>
    );
  };

  const categories = Object.entries(categoryMap);

  return (
    <div className="space-y-6">
      {/* Minimal Tab Switcher */}
      <div className="flex justify-center md:justify-start">
        <div className="border border-neutral-900 rounded-lg bg-neutral-950 p-1 flex gap-1 inline-flex select-none">
          {(['day', 'week', 'month', 'year'] as Timeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-1.5 rounded font-medium text-xs uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      {renderStatCards()}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut Progress */}
        <ClayCard className="flex flex-col items-center gap-4 border border-neutral-900 bg-neutral-950 rounded-xl">
          <h3 className="font-semibold text-neutral-400 self-start uppercase tracking-wider text-[10px]">
            {timeframe === 'day' ? "Today's completion" : `${timeframe} progress`}
          </h3>
          <DonutChart pct={overallRate} label="Rate" />
          <div className="text-center mt-2 text-xs text-neutral-500">
            <p className="font-medium text-neutral-300">
              {totalCompletions} total check-ins
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              out of {expectedCompletions} expected completions
            </p>
          </div>
        </ClayCard>

        {/* Category Breakdown */}
        <ClayCard className="flex flex-col gap-4 border border-neutral-900 bg-neutral-950 rounded-xl">
          <h3 className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Categories</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {categories.length > 0 ? (
              categories.map(([cat, vals]) => (
                <CategoryBar
                  key={cat}
                  category={cat}
                  totalCompletions={vals.done}
                  expectedCompletions={vals.total}
                />
              ))
            ) : (
              <p className="text-neutral-600 text-center text-xs py-8">No records available</p>
            )}
          </div>
        </ClayCard>
      </div>
    </div>
  );
}
