'use client';

import { useState } from 'react';

interface TeamComp {
  id: number;
  name: string;
  mode: string;
  hero_names: string[];
  description: string | null;
}

interface Props {
  comps: TeamComp[];
  availableHeroes: string[];
}

export default function TeamSlot({ comps, availableHeroes }: Props) {
  const [selectedMode, setSelectedMode] = useState('dream_realm');
  const [picked, setPicked] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = comps.filter(c => c.mode === selectedMode);
  const modeLabels: Record<string, string> = {
    afk_stages: 'AFK Stages',
    dream_realm: 'Dream Realm',
    dream_realm_endless: 'Dream Realm (Endless)',
    pvp: 'PvP',
  };

  const toggleHero = (name: string) => {
    setPicked(prev =>
      prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
    );
  };

  const heroPool = search
    ? availableHeroes.filter(h => h.toLowerCase().includes(search.toLowerCase()))
    : availableHeroes;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(modeLabels).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setSelectedMode(k)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedMode === k
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {picked.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-2">Your picks ({picked.length}/5):</div>
          <div className="flex flex-wrap gap-2">
            {picked.map(h => (
              <span key={h} className="bg-indigo-700 text-white text-xs px-2 py-1 rounded">
                {h} <button onClick={() => toggleHero(h)} className="ml-1">✕</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search heroes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
      />

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {heroPool.map(h => (
          <button
            key={h}
            onClick={() => toggleHero(h)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              picked.includes(h)
                ? 'bg-indigo-700 border-indigo-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-indigo-500'
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-medium">Recommended Teams</h3>
        {filtered.map(comp => (
          <div key={comp.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {comp.hero_names.map(h => (
                <span
                  key={h}
                  className={`text-xs px-2 py-1 rounded ${
                    picked.includes(h) ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {h}
                </span>
              ))}
            </div>
            {comp.description && (
              <p className="text-xs text-gray-400">{comp.description}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm">No team comps available yet. Sync data via cron.</p>
        )}
      </div>
    </div>
  );
}
