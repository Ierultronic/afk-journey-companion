'use client';

import { useMemo, useState } from 'react';
import HeroCard from '@/components/HeroCard';

interface Hero {
  id: number;
  name: string;
  faction: string;
  class: string;
  rarity: string;
  icon_url: string | null;
}

export default function HeroesClient({ heroes }: { heroes: Hero[] }) {
  const [search, setSearch] = useState('');
  const [faction, setFaction] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const factions = useMemo(() => [...new Set(heroes.map(h => h.faction))].sort(), [heroes]);
  const classes = useMemo(() => [...new Set(heroes.map(h => h.class))].sort(), [heroes]);

  const filtered = useMemo(() => {
    return heroes.filter(h => {
      if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (faction && h.faction !== faction) return false;
      if (classFilter && h.class !== classFilter) return false;
      return true;
    });
  }, [heroes, search, faction, classFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Hero Database</h1>
      <p className="text-sm text-gray-400">{filtered.length} of {heroes.length} heroes</p>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
        />
        <select
          value={faction}
          onChange={e => setFaction(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="">All factions</option>
          {factions.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="">All classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || faction || classFilter) && (
          <button
            onClick={() => { setSearch(''); setFaction(''); setClassFilter(''); }}
            className="text-xs text-gray-400 hover:text-white px-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(h => (
          <HeroCard key={h.id} name={h.name} faction={h.faction} class={h.class} rarity={h.rarity} icon_url={h.icon_url} />
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 col-span-full text-sm">No heroes match your filters.</p>
        )}
      </div>
    </div>
  );
}
