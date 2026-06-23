interface Props {
  hero_name: string;
  banner_type: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export default function BannerCard({ hero_name, banner_type, start_date, end_date, is_active }: Props) {
  const now = new Date();
  const ends = end_date ? new Date(end_date) : null;
  const daysLeft = ends ? Math.ceil((ends.getTime() - now.getTime()) / 86400000) : null;

  return (
    <div className={`bg-gray-800 rounded-lg border p-4 ${
      is_active ? 'border-indigo-500' : 'border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-white font-medium">{hero_name}</div>
          <div className="text-xs text-gray-400 capitalize">{banner_type.replace('_', ' ')}</div>
        </div>
        {is_active && (
          <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded">Active</span>
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
