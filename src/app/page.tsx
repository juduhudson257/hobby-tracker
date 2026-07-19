'use client';
import React, { useState, useEffect } from 'react';
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { ClayCard } from '@/components/ui/ClayCard';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { Analytics } from '@/components/dashboard/Analytics';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type Habit = {
  id: string;
  name: string;
  category: string;
  color: string;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;        // YYYY-MM-DD
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [categories, setCategories] = useState<string[]>([
    'Fitness',
    'Learning',
    'Mindfulness',
    'Creativity',
    'Health',
  ]);
  const { user, isLoaded } = useUser();

  // Load habits from Supabase or LocalStorage
  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return;
      
      let initialHabits: Habit[] = [];

      if (isSupabaseConfigured && user) {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          // Log the real error message so it's actionable
          console.warn(
            '⚠️ Supabase fetch failed — using localStorage fallback.\n' +
            `Code: ${error.code} | Message: ${error.message}\n` +
            'If the table is missing, run the SQL in your Supabase SQL Editor:\n' +
            'create table habits (\n' +
            '  id text primary key,\n' +
            '  user_id text not null,\n' +
            '  name text not null,\n' +
            '  category text not null,\n' +
            '  color text not null,\n' +
            '  completed_dates text[] not null default \'{}\',\n' +
            '  created_at_str text not null\n' +
            ');'
          );
          // Fall back to localStorage
          const local = localStorage.getItem('minimal_habits');
          if (local) initialHabits = JSON.parse(local);
        } else if (data) {
          initialHabits = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            color: item.color,
            completedDates: item.completed_dates || [],
            createdAt: item.created_at_str || getTodayStr(),
          }));
          // Keep localStorage in sync
          localStorage.setItem('minimal_habits', JSON.stringify(initialHabits));
        }
      } else {
        // LocalStorage fallback
        const local = localStorage.getItem('minimal_habits');
        if (local) initialHabits = JSON.parse(local);
      }
      
      setHabits(initialHabits);
      setIsInitializing(false);
    };

    loadData();
  }, [user, isLoaded]);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name = isLoaded && user?.firstName ? user.firstName.toUpperCase() : 'USER';
    
    if (hrs >= 5 && hrs < 12) {
      return `GOOD MORNING "${name}", HAVE A NICE DAY.`;
    } else if (hrs >= 12 && hrs < 17) {
      return `GOOD AFTERNOON "${name}", HALF A DAY WAS PASS!!`;
    } else if (hrs >= 17 && hrs < 21) {
      return `GOOD EVENING "${name}", HAVE A SOME SNACKS.`;
    } else {
      return `GOOD NIGHT "${name}", TIME TO SLEEP I GUESS.`;
    }
  };

  /* ── Add a new habit ───────────────────────────── */
  const handleAddHabit = async (data: { name: string; category: string; color: string }) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      category: data.category,
      color: data.color || '#ffffff',
      completedDates: [],
      createdAt: getTodayStr(),
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    localStorage.setItem('minimal_habits', JSON.stringify(updatedHabits));

    if (isSupabaseConfigured && user) {
      try {
        await supabase.from('habits').insert({
          id: newHabit.id,
          user_id: user.id,
          name: newHabit.name,
          category: newHabit.category,
          color: newHabit.color,
          completed_dates: newHabit.completedDates,
          created_at_str: newHabit.createdAt,
        });
      } catch (err) {
        console.error('Failed to save habit to Supabase:', err);
      }
    }
  };

  /* ── Add a custom category ─────────────────────── */
  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  /* ── Toggle today's completion ─────────────────── */
  const toggleHabit = async (id: string) => {
    const today = getTodayStr();
    let updatedHabit: Habit | null = null;
    
    const updatedHabits = habits.map((h) => {
      if (h.id !== id) return h;
      const already = h.completedDates.includes(today);
      updatedHabit = {
        ...h,
        completedDates: already
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today],
      };
      return updatedHabit;
    });

    setHabits(updatedHabits);
    localStorage.setItem('minimal_habits', JSON.stringify(updatedHabits));

    if (isSupabaseConfigured && user && updatedHabit) {
      try {
        await supabase
          .from('habits')
          .update({ completed_dates: (updatedHabit as Habit).completedDates })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to update habit in Supabase:', err);
      }
    }
  };

  /* ── Delete a habit ───────────────────────────────── */
  const deleteHabit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent toggling when clicking delete
    const updatedHabits = habits.filter((h) => h.id !== id);
    setHabits(updatedHabits);
    localStorage.setItem('minimal_habits', JSON.stringify(updatedHabits));

    if (isSupabaseConfigured && user) {
      try {
        await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete habit from Supabase:', err);
      }
    }
  };

  const today = getTodayStr();
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

  if (isInitializing) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Syncing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto space-y-12 bg-black text-white selection:bg-white selection:text-black">
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHabit}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* ── Header ─────────────────────────────────── */}
      <header className="flex justify-between items-center border-b border-neutral-900 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight font-sans">MY HOBBY</h1>
          <p className="text-neutral-400 text-sm mt-1">{getGreeting()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SignedIn>
            <div className="border border-neutral-800 rounded-full p-0.5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-full',
                    userButtonPopoverCard: 'bg-neutral-950 border border-neutral-800 text-white',
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="minimal-btn px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          {habits.length > 0 && (
            <span className="text-[10px] font-medium tracking-wider text-neutral-400">
              {completedToday} of {habits.length} completed
            </span>
          )}
        </div>
      </header>

      {/* ── Today's Habits ─────────────────────────── */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-medium tracking-tight">Today</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {habits.length === 0
                ? 'No habits tracked yet'
                : `${completedToday} completed`}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {habits.length === 0 && (
          <ClayCard className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-neutral-800 bg-neutral-950/20">
            <span className="text-3xl filter grayscale opacity-60">○</span>
            <p className="font-semibold text-neutral-400 text-sm uppercase tracking-wider">No active habits</p>
            <p className="text-xs text-neutral-600 max-w-xs uppercase tracking-wide">
              Create a habit below to begin tracking.
            </p>
          </ClayCard>
        )}

        {/* Habit cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const done = habit.completedDates.includes(today);
            return (
              <ClayCard
                key={habit.id}
                pressed={done}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center gap-4 cursor-pointer select-none transition-all duration-200 ${
                  done ? 'bg-white text-black border-white' : 'bg-black text-white border-neutral-800'
                }`}
              >
                {/* Minimal B&W Check Indicator */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 text-xs font-bold border ${
                    done ? 'bg-black border-black text-white' : 'border-neutral-700 text-transparent'
                  }`}
                >
                  ✓
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-base truncate transition-all duration-200 ${
                      done ? 'line-through text-neutral-400' : 'text-white'
                    }`}
                  >
                    {habit.name}
                  </h3>
                  <p className={`text-xs ${done ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    {habit.category}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => deleteHabit(habit.id, e)}
                  aria-label={`Delete ${habit.name}`}
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold border transition-all duration-200 hover:scale-110 active:scale-90 ${
                    done
                      ? 'border-neutral-300 text-neutral-400 hover:border-black hover:bg-black hover:text-white'
                      : 'border-neutral-800 text-neutral-600 hover:border-white hover:bg-white hover:text-black'
                  }`}
                >
                  ✕
                </button>
              </ClayCard>
            );
          })}
        </div>

        {/* FAB */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center justify-center text-2xl font-light hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label="Add new habit"
          >
            +
          </button>
        </div>
      </section>

      {/* ── Analytics ──────────────────────────────── */}
      <section className="space-y-4 pt-6 border-t border-neutral-900">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Analytics</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Historical habit data</p>
        </div>
        <Analytics habits={habits} />
      </section>
    </main>
  );
}
