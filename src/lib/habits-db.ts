import type { Habit } from '@/types/habit';

type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  completed_dates: string[] | null;
  created_at_str: string | null;
};

export function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    color: row.color,
    completedDates: row.completed_dates ?? [],
    createdAt: row.created_at_str ?? new Date().toISOString().split('T')[0],
  };
}

export function habitToRow(habit: Habit, userId: string): HabitRow {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    category: habit.category,
    color: habit.color,
    completed_dates: habit.completedDates,
    created_at_str: habit.createdAt,
  };
}
