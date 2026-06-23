'use client';

import { useState } from 'react';

interface Props {
  events: {
    id: number;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    event_type: string | null;
  }[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function dateParts(d: string) {
  const date = new Date(d);
  return { month: date.toLocaleDateString('en-US', { month: 'short' }), day: date.getDate() };
}

export default function EventTimeline({ events }: Props) {
  const now = Date.now();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const active = events.filter(e => e.start_date && e.end_date && new Date(e.start_date) <= new Date(now) && new Date(e.end_date) >= new Date(now));
  const upcoming = events.filter(e => e.start_date && new Date(e.start_date) > new Date(now));
  const past = events.filter(e => e.end_date && new Date(e.end_date) < new Date(now));

  const sections = [
    { label: 'Active', items: active, color: 'border-green-500 bg-green-500/10' },
    { label: 'Upcoming', items: upcoming, color: 'border-blue-500 bg-blue-500/10' },
    { label: 'Past', items: past, color: 'border-gray-600 bg-gray-800/50' },
  ];

  return (
    <div className="space-y-10">
      {sections.map(section => {
        const sorted = [...section.items].sort((a, b) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime());
        if (sorted.length === 0) return null;
        return (
          <div key={section.label}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-white">{section.label}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${section.color} border`}>{sorted.length}</span>
            </div>
            <div className="space-y-3">
              {sorted.map(e => {
                const start = e.start_date ? dateParts(e.start_date) : null;
                const end = e.end_date ? dateParts(e.end_date) : null;
                const dl = e.end_date ? daysLeft(e.end_date) : null;
                const isActive = section.label === 'Active';
                const isExpanded = expanded[e.id] ?? false;
                const descLen = e.description?.length || 0;
                const isLong = descLen > 120;

                return (
                  <div
                    key={e.id}
                    className={`group relative bg-gray-800/80 backdrop-blur-sm rounded-xl border ${
                      isActive ? 'border-green-600/50 hover:border-green-500' : 'border-gray-700 hover:border-gray-500'
                    } transition-all duration-200 overflow-hidden`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-green-500/[0.03] to-transparent pointer-events-none" />}
                    <div className="flex items-stretch gap-0">
                      {start && (
                        <div className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-4 border-r ${isActive ? 'border-green-600/30' : 'border-gray-700'}`}>
                          <span className="text-xs uppercase tracking-wider text-gray-400">{start.month}</span>
                          <span className={`text-2xl font-bold ${isActive ? 'text-green-400' : 'text-white'}`}>{start.day}</span>
                          {end && end.month !== start.month && (
                            <><span className="text-xs text-gray-500 mt-1">to</span><span className="text-xs uppercase tracking-wider text-gray-400">{end.month}</span><span className={`text-lg font-bold ${isActive ? 'text-green-400' : 'text-white'}`}>{end.day}</span></>
                          )}
                          {end && end.month === start.month && <span className="text-xs text-gray-400 mt-1">– {end.day}</span>}
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-white font-medium text-sm leading-tight">{e.name}</h3>
                            {e.event_type && (
                              <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>{e.event_type}</span>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {dl !== null && dl > 0 && <span className={`text-xs font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>{dl}d left</span>}
                            {isActive && <div className="mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] text-green-400/70">LIVE</span></div>}
                          </div>
                        </div>

                        {e.description && (
                          <div className="mt-2">
                            <p className={`text-xs text-gray-400 leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {e.description}
                            </p>
                            {isLong && (
                              <button
                                onClick={() => setExpanded(p => ({ ...p, [e.id]: !isExpanded }))}
                                className="mt-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                              </button>
                            )}
                          </div>
                        )}

                        {e.start_date && e.end_date && (
                          <p className="text-[10px] text-gray-500 mt-2">{formatDate(e.start_date)} – {formatDate(e.end_date)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No events yet.</p>
          <p className="text-xs mt-1">Run the sync cron job to fetch events from Fandom Wiki.</p>
        </div>
      )}
    </div>
  );
}
