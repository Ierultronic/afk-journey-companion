import Link from "next/link";

const sections = [
  { href: "/heroes", label: "Hero Database", desc: "Browse all 117+ heroes with skills and stats" },
  { href: "/tier-list", label: "Tier List", desc: "Meta rankings for every game mode" },
  { href: "/team-builder", label: "Team Builder", desc: "Build and discover team compositions" },
  { href: "/banners", label: "Banner Tracker", desc: "Current and upcoming recruitment banners" },
  { href: "/events", label: "Events", desc: "Live and upcoming in-game events" },
  { href: "/patch-notes", label: "Patch Notes", desc: "Balance changes and version history" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-white mb-3">AFK Journey Companion</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Automated hero database, meta tier lists, team builder, and event tracker — all synced from community sources.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="block bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-indigo-500 transition-colors"
          >
            <h2 className="text-lg font-semibold text-white mb-1">{s.label}</h2>
            <p className="text-sm text-gray-400">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
        Data auto-synced daily from Fandom Wiki and Prydwen.gg. Not affiliated with Lilith Games.
      </div>
    </div>
  );
}
