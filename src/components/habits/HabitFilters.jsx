import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ArrowUpDown, Filter, X } from 'lucide-react'
import { useHabits } from '../../contexts/HabitContext'

const SORT_OPTIONS = [
  { value: 'created', label: 'Newest' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'streak', label: 'Streak' },
  { value: 'priority', label: 'Priority' },
  { value: 'difficulty', label: 'Difficulty' }
]

const CATEGORIES = ['all', 'health', 'mind', 'fitness', 'study', 'work', 'social', 'finance', 'custom']
const PRIORITIES = ['all', 'high', 'medium', 'low']
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard']

export default function HabitFilters({ search, setSearch, categoryFilter, setCategoryFilter, priorityFilter, setPriorityFilter, difficultyFilter, setDifficultyFilter, sortBy, setSortBy }) {
  const [showFilters, setShowFilters] = useState(false)

  const hasFilters = categoryFilter !== 'all' || priorityFilter !== 'all' || difficultyFilter !== 'all'
  const clearFilters = () => { setCategoryFilter('all'); setPriorityFilter('all'); setDifficultyFilter('all') }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search habits..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer border-0 bg-transparent">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            showFilters || hasFilters ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--input-bg)] border-[var(--border-color)] text-muted'
          }`}
        >
          <Filter size={16} />
        </button>
        <div className="relative">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="appearance-none rounded-xl px-3 py-2.5 pr-8 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2.5 overflow-hidden">
          <div>
            <label className="text-[10px] text-muted block mb-1 font-medium">Category</label>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all cursor-pointer border-0 ${
                    categoryFilter === c ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted block mb-1 font-medium">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setPriorityFilter(p)}
                    className={`flex-1 py-1 rounded-lg text-[10px] capitalize transition-all cursor-pointer border-0 ${
                      priorityFilter === p ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted block mb-1 font-medium">Difficulty</label>
              <div className="flex gap-1">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficultyFilter(d)}
                    className={`flex-1 py-1 rounded-lg text-[10px] capitalize transition-all cursor-pointer border-0 ${
                      difficultyFilter === d ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer border-0 bg-transparent">
              Clear all filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
