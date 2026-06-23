'use client';

import { useMemo, useState } from 'react';

interface Hero {
  name: string;
  faction: string;
  class: string;
  rarity: string;
  icon_url: string | null;
}

interface TierRating {
  hero_name: string;
  mode: string;
  tier: string;
}

interface Props {
  heroes: Hero[];
  tiers: TierRating[];
}

const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

const MODE_LABELS: Record<string, string> = {
  afk_stages: 'AFK Stages',
  dream_realm: 'Dream Realm',
  dream_realm_endless: 'Dream Realm (Endless)',
  pvp: 'PvP',
};

const FACTION_COLORS: Record<string, string> = {
  Lightbearer: 'bg-yellow-600',
  Mauler: 'bg-red-700',
  Wilder: 'bg-green-700',
  Graveborn: 'bg-purple-800',
  Celestial: 'bg-blue-600',
  Hypogean: 'bg-pink-700',
  Dimensional: 'bg-cyan-700',
};

const TIER_COLORS: Record<string, string> = {
  S: 'bg-orange-500 text-white',
  A: 'bg-green-600 text-white',
  B: 'bg-blue-600 text-white',
  C: 'bg-gray-500 text-white',
};

function tierScore(t: string) {
  return TIER_ORDER[t.toUpperCase()] ?? 99;
}

export default function TeamSlot({ heroes, tiers }: Props) {
  const [selectedMode, setSelectedMode] = useState('dream_realm');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const heroSet = useMemo(() => new Set(heroes.map(h => h.name)), [heroes]);

  const tierByHero = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tiers) {
      if (t.mode === selectedMode && !map[t.hero_name]) {
        map[t.hero_name] = t.tier;
      }
    }
    return map;
  }, [tiers, selectedMode]);

  const owned = useMemo(
    () => heroes.filter(h => picked.has(h.name)),
    [heroes, picked]
  );

  const pickedSorted = useMemo(
    () => [...owned].sort((a, b) => tierScore(tierByHero[a.name] || '') - tierScore(tierByHero[b.name] || '')),
    [owned, tierByHero]
  );

  const recommended = pickedSorted.slice(0, 5);
  const bench = pickedSorted.slice(5);

  const missingS = useMemo(() => {
    const ownedSet = picked;
    return heroes
      .filter(h => !ownedSet.has(h.name) && tierByHero[h.name] === 'S')
      .slice(0, 10);
  }, [heroes, picked, tierByHero]);

  const missingA = useMemo(() => {
    const ownedSet = picked;
    return heroes
      .filter(h => !ownedSet.has(h.name) && tierByHero[h.name] === 'A')
      .slice(0, 10);
  }, [heroes, picked, tierByHero]);

  const toggleHero = (name: string) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const heroPool = search
    ? heroes.filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
    : heroes;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(MODE_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setSelectedMode(k)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedMode === k ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {picked.size > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-400">Your heroes</span>
            <span className="text-xs text-gray-500">({picked.size})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {pickedSorted.map(h => (
              <span
                key={h.name}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                  tierByHero[h.name] ? TIER_COLORS[tierByHero[h.name]] : 'bg-gray-700 text-gray-200'
                }`}
                onClick={() => toggleHero(h.name)}
              >
                {tierByHero[h.name] && <span className="font-bold">{tierByHero[h.name]}</span>}
                {h.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search heroes to add..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
      />

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {heroPool.map(h => (
          <button
            key={h.name}
            onClick={() => toggleHero(h.name)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors ${
              picked.has(h.name)
                ? 'bg-indigo-700 border-indigo-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-indigo-500'
            }`}
          >
            {tierByHero[h.name] && (
              <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${TIER_COLORS[tierByHero[h.name]]}`}>
                {tierByHero[h.name]}
              </span>
            )}
            {h.name}
          </button>
        ))}
      </div>

      {picked.size >= 3 && recommended.length > 0 && (
        <div className="bg-gray-800/60 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-white font-semibold text-sm">Recommended Team</h3>
            <span className="text-[10px] text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded">for {MODE_LABELS[selectedMode]}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {recommended.map((h, i) => (
              <div key={h.name} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 min-w-0">
                <span className="text-xs text-gray-500 font-mono w-4">#{i + 1}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${FACTION_COLORS[h.faction] || 'bg-gray-600'}`}>
                  {h.icon_url ? <img src={h.icon_url} alt="" className="w-7 h-7 rounded-full object-cover" /> : h.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-medium leading-tight truncate max-w-[120px]">{h.name}</div>
                  <div className="text-[10px] text-gray-500">{h.class} · {h.faction}</div>
                </div>
                {tierByHero[h.name] && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[tierByHero[h.name]]}`}>
                    {tierByHero[h.name]}
                  </span>
                )}
              </div>
            ))}
          </div>
          {bench.length > 0 && (
            <p className="text-[10px] text-gray-500 mt-2">{bench.length} more owned hero{bench.length > 1 ? 'es' : ''} on the bench</p>
          )}
        </div>
      )}

      {picked.size < 3 && (
        <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">Pick at least 3 heroes to see a recommended team</p>
        </div>
      )}

      {(missingS.length > 0 || missingA.length > 0) && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Consider adding these S-tier heroes</h3>
          <div className="flex flex-wrap gap-2">
            {missingS.map(h => (
              <button
                key={h.name}
                onClick={() => toggleHero(h.name)}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-orange-900/20 border border-orange-700/30 text-orange-300 hover:bg-orange-900/40 transition-colors"
              >
                <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center bg-orange-500 text-white">S</span>
                {h.name}
              </button>
            ))}
            {missingA.length > 0 && (
              <details className="w-full mt-1">
                <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-400">
                  {missingA.length} A-tier heroes
                </summary>
                <div className="flex flex-wrap gap-2 mt-2">
                  {missingA.map(h => (
                    <button
                      key={h.name}
                      onClick={() => toggleHero(h.name)}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-green-900/20 border border-green-700/30 text-green-300 hover:bg-green-900/40 transition-colors"
                    >
                      <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center bg-green-600 text-white">A</span>
                      {h.name}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {tiers.length === 0 && (
        <p className="text-gray-500 text-sm">No tier data available. Sync via cron to enable recommendations.</p>
      )}
    </div>
  );
}
