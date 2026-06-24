import { FACTION_COLORS, FACTION_BG_LIGHT } from "@/lib/colors";

interface TierEntry {
  hero_name: string;
  tier: string;
}

interface HeroInfo {
  name: string;
  faction: string;
  icon_url: string | null;
}

interface Props {
  tiers: TierEntry[];
  title: string;
  heroMap: Record<string, HeroInfo>;
}

const tierColors: Record<string, string> = {
  'S+': 'bg-red-600',
  S: 'bg-orange-500',
  'A+': 'bg-yellow-500',
  A: 'bg-green-600',
  B: 'bg-blue-600',
  C: 'bg-gray-500',
};

export default function TierGrid({ tiers, title, heroMap }: Props) {
  const grouped: Record<string, TierEntry[]> = {};
  for (const t of tiers) {
    (grouped[t.tier] ||= []).push(t);
  }
  const tierOrder = ['S+', 'S', 'A+', 'A', 'B', 'C'];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-2">
        {tierOrder.map(tier => {
          const entries = grouped[tier];
          if (!entries) return null;
          return (
            <div key={tier} className="flex items-start gap-3">
              <span className={`shrink-0 w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm ${tierColors[tier] || 'bg-gray-600'}`}>
                {tier}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entries.map(e => {
                  const info = heroMap[e.hero_name];
                  const fc = info ? FACTION_BG_LIGHT[info.faction] || 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-700 text-gray-200 border-gray-600';
                  return (
                    <span key={e.hero_name} className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${fc}`}>
                      {info?.icon_url
                        ? <img src={info.icon_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                        : <span className={`w-4 h-4 rounded-full shrink-0 ${info ? FACTION_COLORS[info.faction] || 'bg-gray-600' : 'bg-gray-600'}`} />
                      }
                      {e.hero_name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
