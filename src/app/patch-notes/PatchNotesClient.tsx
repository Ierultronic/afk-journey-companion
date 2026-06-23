'use client';

import { useState } from 'react';

interface Patch {
  id: number; version: string; title: string | null;
  content_html: string | null; released_at: string | null;
}

function formatDate(d: string) {
  const date = new Date(d); const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseVersion(v: string) {
  const p = v.split('.'); return { major: p[0], minor: p[1], patch: p.slice(2).join('.') };
}

const HEROES = new Set([
  'Aliceth','Alna','Alsa','Antandra','Arden','Atalanta','Aurora','Berial','Bonnie','Brutus',
  'Bryon','Carolina','Cassadee','Cecia','Chippy','Cryonaia','Damian','Dionel','Dunlingr',
  'Eironn','Elijah and Lailah','Fay','Florabelle','Granny Dahnie','Gunnar','Hammie','Harak',
  'Hewynn','Hodgkin','Hugin','Igor','Kafra','Koko','Korin','Kruger','Lenya','Lily May',
  'Lorsan','Lucca','Lucius','Ludovic','Lumont','Lyca','Marilee','Mihira','Mikola','Mirael',
  'Nara','Niru','Odie','Pandora','Parisa','Phraesto','Reinier','Rhys','Rowan','Salazer',
  'Satrana','Scarlita','Seth','Shakir','Silvina','Sinbad','Smokey and Meerky','Sonja','Soren',
  'Talene','Tasi','Temesia','Thoran','Ulmus','Vala','Valen','Valka','Viperian','Walker',
]);

const KNOWN_HEROES = HEROES;

function cleanWiki(t: string) {
  return t.replace(/'''/g, '').replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, '$2').replace(/\{\{[^}]*\}\}/g, '').trim();
}

interface PatchItem {
  text: string;
  subItems: string[];
  category: 'new' | 'fix' | 'balance' | 'optimize' | 'other';
}

function categorize(item: string): PatchItem['category'] {
  const l = item.toLowerCase();
  if (l.startsWith('add') || l.startsWith('new') || l.startsWith('launch') || l.includes('added ')) return 'new';
  if (l.startsWith('fix') || l.includes('fixed ') || l.includes('issue') || l.includes('bug')) return 'fix';
  if (l.startsWith('optim') || l.includes('optimized') || l.includes('improve') || l.includes('quality')) return 'optimize';
  if (l.includes('buff') || l.includes('nerf') || l.includes('adjust') || l.includes('rework') || l.includes('change')) return 'balance';
  return 'other';
}

function extractHeroes(text: string): string[] {
  const found: string[] = [];
  for (const hero of KNOWN_HEROES) {
    if (text.includes(hero)) found.push(hero);
  }
  return found;
}

interface PatchSection {
  heading: string;
  items: PatchItem[];
}

function parsePatchContent(raw: string | null): { sections: PatchSection[] } {
  if (!raw) return { sections: [] };
  const sections: PatchSection[] = [];
  const lines = raw.split('\n').map(l => l.trim());
  let current: PatchSection | null = null;
  let lastMain: PatchItem | null = null;

  for (const line of lines) {
    if (!line) continue;
    const hm = line.match(/^={2,}\s*(.+?)\s*={2,}$/);
    if (hm) {
      const h = hm[1].trim();
      if (h && !h.match(/^(Version|Nav|Tabs)/i)) {
        current = { heading: h, items: [] }; sections.push(current);
      }
      continue;
    }
    if (line.startsWith('#') || line.startsWith('*')) {
      const isSub = line.startsWith('#*') || line.startsWith('**');
      const text = cleanWiki(line.replace(/^[#*]+\s*/, ''));
      if (!text) continue;
      if (!current) { current = { heading: 'Changes', items: [] }; sections.push(current); }
      if (isSub && lastMain) {
        lastMain.subItems.push(text);
      } else {
        const item: PatchItem = { text, subItems: [], category: categorize(text) };
        current.items.push(item);
        lastMain = item;
      }
    }
  }
  return { sections };
}

const catConfig: Record<PatchItem['category'], { label: string; cls: string }> = {
  new:      { label: 'New',      cls: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
  fix:      { label: 'Fix',      cls: 'bg-green-900/60 text-green-300 border-green-700/50' },
  balance:  { label: 'Balance',  cls: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50' },
  optimize: { label: 'Quality',  cls: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
  other:    { label: '',         cls: '' },
};

function PatchItemRow({ item }: { item: PatchItem }) {
  const heroes = extractHeroes(item.text);
  const cat = catConfig[item.category];
  const parts = item.text.split(/(\[\[[^\]]+\]\])/g);

  return (
    <li className="group/item">
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
          item.category === 'new' ? 'bg-blue-500' :
          item.category === 'fix' ? 'bg-green-500' :
          item.category === 'balance' ? 'bg-yellow-500' :
          item.category === 'optimize' ? 'bg-purple-500' : 'bg-gray-500'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            {cat.label && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${cat.cls} shrink-0 mt-0.5`}>
                {cat.label}
              </span>
            )}
            <span className="text-sm text-gray-300 leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith('[[') && part.endsWith(']]')) {
                  const name = cleanWiki(part);
                  const isHero = KNOWN_HEROES.has(name);
                  return isHero
                    ? <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 mx-0.5">{name}</span>
                    : <span key={i} className="text-indigo-400">{name}</span>;
                }
                return <span key={i}>{part}</span>;
              })}
            </span>
          </div>
          {item.subItems.length > 0 && (
            <ul className="mt-2 ml-3 space-y-1 border-l border-gray-700/50 pl-3">
              {item.subItems.map((sub, si) => (
                <li key={si} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-600 shrink-0" />
                  <span className="text-xs text-gray-400 leading-relaxed">{sub}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function getVersionAccent(v: string) {
  const p = parseVersion(v);
  const major = parseInt(p.major); const minor = parseInt(p.minor);
  if (major >= 1 && minor >= 6) return { dot: 'bg-indigo-500', line: 'bg-indigo-500/20', grad: 'from-indigo-600 to-blue-600' };
  if (major >= 1 && minor >= 4) return { dot: 'bg-blue-500', line: 'bg-blue-500/20', grad: 'from-blue-600 to-cyan-600' };
  if (major >= 1 && minor >= 2) return { dot: 'bg-purple-500', line: 'bg-purple-500/20', grad: 'from-purple-600 to-pink-600' };
  return { dot: 'bg-gray-500', line: 'bg-gray-500/20', grad: 'from-gray-600 to-gray-500' };
}

export default function PatchNotesClient({ patches }: { patches: Patch[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-white">Patch Notes</h1>
        <p className="text-sm text-gray-400 mt-2">{patches.length} versions tracked</p>
      </div>

      <div className="space-y-4">
        {patches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No patch notes yet.</p>
          </div>
        )}

        {patches.map((p, idx) => {
          const isOpen = expanded[p.id] ?? (idx === 0);
          const { sections } = parsePatchContent(p.content_html);
          const ac = getVersionAccent(p.version);
          const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
          const cats = sections.flatMap(s => s.items.map(i => i.category));
          const hasNew = cats.includes('new');
          const hasFix = cats.includes('fix');
          const hasBal = cats.includes('balance');

          return (
            <div key={p.id}>
              <div className="relative flex gap-4">
                {idx < patches.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gray-700" />
                )}

                <div className="relative z-10 shrink-0 pt-1">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ac.grad} flex items-center justify-center shadow-lg shadow-black/30`}>
                    <span className="text-white text-xs font-bold">{p.version.split('.')[0]}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !isOpen }))}
                    className="w-full bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all duration-200 text-left group/btn"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm">Version {p.version}</span>
                            <div className="flex gap-1">
                              {hasNew && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">New</span>}
                              {hasFix && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-300 border border-green-700/50">Fix</span>}
                              {hasBal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">Balance</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {p.released_at && <span className="text-xs text-gray-500">{formatDate(p.released_at)}</span>}
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-500">{totalItems} changes</span>
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-500 mt-1 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isOpen && sections.length > 0 && (
                    <div className="mt-2 bg-gray-800/30 border border-gray-700/30 rounded-xl overflow-hidden divide-y divide-gray-700/30">
                      {sections.map((section, si) => (
                        <div key={si} className="p-4">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                            {section.heading}
                            <span className="text-[10px] text-gray-600 font-normal">({section.items.length})</span>
                          </h3>
                          <ul className="space-y-3">
                            {section.items.map((item, ii) => (
                              <PatchItemRow key={ii} item={item} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && sections.length === 0 && p.content_html && (
                    <div className="mt-2 bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {cleanWiki(p.content_html).slice(0, 1500)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
