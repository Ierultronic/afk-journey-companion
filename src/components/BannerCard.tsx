import { FACTION_BG_LIGHT } from "@/lib/colors";

interface Props {
  hero_name: string;
  banner_type: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  faction?: string;
  icon_url?: string | null;
}

export default function BannerCard({ hero_name, banner_type, start_date, end_date, is_active, faction, icon_url }: Props) {
  const now = new Date();
  const ends = end_date ? new Date(end_date) : null;
  const daysLeft = ends ? Math.ceil((ends.getTime() - now.getTime()) / 86400000) : null;

  return (
    <div className={`bg-gray-800 rounded-lg border p-4 ${is_active ? 'border-indigo-500' : 'border-gray-700'}`}>
      <div className="flex items-start gap-3 mb-2">
        {icon_url ? (
          <img src={icon_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className={`w-10 h-10 rounded-full shrink-0 bg-gray-600 flex items-center justify-center text-white text-xs font-bold`}>
            {hero_name[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{hero_name}</span>
            {faction && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${FACTION_BG_LIGHT[faction] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                {faction}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 capitalize">{banner_type.replace('_', ' ')}</div>
        </div>
        {is_active && (
          <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded shrink-0">Active</span>
        )}
      </div>
      {start_date && (
        <div className="text-xs text-gray-400">
          {new Date(start_date).toLocaleDateString()} – {end_date ? new Date(end_date).toLocaleDateString() : 'TBD'}
        </div>
      )}
      {daysLeft !== null && daysLeft > 0 && (
        <div className="text-xs text-yellow-400 mt-1">{daysLeft} days left</div>
      )}
    </div>
  );
}
