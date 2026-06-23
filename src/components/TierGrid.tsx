interface TierEntry {
  hero_name: string;
  tier: string;
}

interface Props {
  tiers: TierEntry[];
  title: string;
}

const tierColors: Record<string, string> = {
  'S+': 'bg-red-600',
  S: 'bg-orange-500',
  'A+': 'bg-yellow-500',
  A: 'bg-green-600',
  B: 'bg-blue-600',
  C: 'bg-gray-500',
};

export default function TierGrid({ tiers, title }: Props) {
  const grouped: Record<string, string[]> = {};
  for (const t of tiers) {
    (grouped[t.tier] ||= []).push(t.hero_name);
  }
  const tierOrder = ['S+', 'S', 'A+', 'A', 'B', 'C'];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-2">
        {tierOrder.map(tier => {
          const heroes = grouped[tier];
          if (!heroes) return null;
          return (
            <div key={tier} className="flex items-start gap-3">
              <span className={`shrink-0 w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm ${tierColors[tier] || 'bg-gray-600'}`}>
                {tier}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {heroes.map(h => (
                  <span key={h} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
