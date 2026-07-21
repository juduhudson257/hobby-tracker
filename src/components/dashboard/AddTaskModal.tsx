'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard } from '@/components/ui/ClayCard';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: { name: string; category: string; color: string }) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Fitness');
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalCategory = category;
    if (category === 'NEW_CUSTOM') {
      const trimmedCustom = customCategory.trim();
      if (!trimmedCustom) return;
      onAddCategory(trimmedCustom);
      finalCategory = trimmedCustom;
    }

    onAdd({ name, category: finalCategory, color: '#ffffff' });
    
    setName('');
    setCategory(categories[0] || 'Fitness');
    setCustomCategory('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-40"
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-10 mx-auto max-w-lg"
          >
            <ClayCard className="border border-neutral-800 bg-neutral-950 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold tracking-tight text-white">New Habit</h2>
                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-lg border border-neutral-800 flex items-center justify-center text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="habit-name" className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5 font-medium">
                    Name
                  </label>
                  <input
                    id="habit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Meditate"
                    className="w-full rounded-lg px-3 py-2.5 outline-none border border-neutral-800 focus:border-neutral-600 transition-all bg-black text-white placeholder-neutral-700 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="habit-category" className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5 font-medium">
                    Category
                  </label>
                  <select
                    id="habit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 outline-none border border-neutral-800 focus:border-neutral-600 transition-all bg-black text-white text-sm cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-950 text-white">
                        {cat}
                      </option>
                    ))}
                    <option value="NEW_CUSTOM" className="bg-neutral-950 text-neutral-300 font-semibold">
                      + Add Custom Category...
                    </option>
                  </select>
                </div>

                {category === 'NEW_CUSTOM' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label htmlFor="custom-category" className="block text-xs uppercase tracking-widest text-neutral-500 mb-1.5 font-medium">
                      Custom Category Name
                    </label>
                    <input
                      id="custom-category"
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Finance"
                      className="w-full rounded-lg px-3 py-2.5 outline-none border border-neutral-800 focus:border-neutral-600 transition-all bg-black text-white placeholder-neutral-700 text-sm"
                      autoFocus
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold tracking-wide text-sm transition-all cursor-pointer"
                >
                  Create Habit
                </button>
              </form>
            </ClayCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
