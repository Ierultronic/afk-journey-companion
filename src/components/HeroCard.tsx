import Link from 'next/link';
import { FACTION_COLORS } from '@/lib/colors';

interface Props {
  name: string;
  faction: string;
  class: string;
  rarity: string;
  icon_url?: string | null;
}

export default function HeroCard({ name, faction, class: cls, rarity, icon_url }: Props) {
  return (
    <Link
      href={`/heroes/${encodeURIComponent(name)}`}
      className="block bg-gray-800 rounded-lg border border-gray-700 p-3 hover:border-indigo-500 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon_url ? (
          <img src={icon_url} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${FACTION_COLORS[faction] || 'bg-gray-600'}`}>
            {name[0]}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-white font-medium truncate">{name}</div>
          <div className="text-xs text-gray-400">
            {rarity} · {cls} · {faction}
          </div>
        </div>
      </div>
    </Link>
  );
}
