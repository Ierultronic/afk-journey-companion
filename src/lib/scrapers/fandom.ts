const FANDOM_API = 'https://afk-journey.fandom.com/api.php';

async function wikiFetch(params: Record<string, string>) {
  const url = new URL(FANDOM_API);
  Object.entries({ ...params, format: 'json' }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );
  const res = await fetch(url.toString());
  return res.json();
}

function stripWikitext(wt: string): string {
  return wt
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/'''/g, '')
    .replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, '$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripWikitextPreserveStructure(wt: string): string {
  return wt
    // remove comments first
    .replace(/<!--[\s\S]*?-->/g, '')
    // remove templates {{...}}
    .replace(/\{\{[\s\S]*?\}\}/g, '')
    // remove wiki tables {| ... |}
    .replace(/\{\|[\s\S]*?\|\}/g, '')
    // remove leftover template param fragments (Enemy|param_delim=,|1= etc.)
    .replace(/^[A-Za-z]+\|[^\n]*$/gm, '')
    // convert ==Heading== → \nHeading
    .replace(/^={2,}\s*(.+?)\s*={2,}\s*$/gm, '\n$1\n')
    // convert '''bold''' → just text
    .replace(/'''/g, '')
    // remove HTML tags (but keep entities like &times; for now)
    .replace(/<[^>]+>/g, '')
    // convert wiki links
    .replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, '$2')
    // unescape common HTML entities
    .replace(/&times;/g, '×')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    // remove leading colon (indented text marker)
    .replace(/^:\s*/gm, '')
    // convert # item markers → - (but not ## or #*)
    .replace(/^#(?![#*])\s*/gm, '- ')
    // collapse 3+ newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    // trim each line
    .split('\n').map(l => l.trim()).join('\n')
    // remove leading/trailing blank lines
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();
}

export async function getAllHeroNames(): Promise<string[]> {
  const data = await wikiFetch({
    action: 'query',
    list: 'categorymembers',
    cmtitle: 'Category:Playable_Heroes',
    cmlimit: '200',
  });
  return data.query.categorymembers.map((m: any) => m.title);
}

export async function getHeroWikitext(name: string) {
  const data = await wikiFetch({
    action: 'parse',
    page: name,
    prop: 'wikitext',
  });
  return data.parse?.wikitext?.['*'] || '';
}

const FACTION_MAP: Record<string, string> = {
  lightbearer: 'Lightbearer',
  mauler: 'Mauler',
  wilder: 'Wilder',
  graveborn: 'Graveborn',
  celestial: 'Celestial',
  hypogean: 'Hypogean',
  dimensional: 'Dimensional',
};

const CLASS_MAP: Record<string, string> = {
  mage: 'Mage',
  marksman: 'Marksman',
  rogue: 'Rogue',
  support: 'Support',
  tank: 'Tank',
  warrior: 'Warrior',
};

export function parseHeroInfobox(wikitext: string) {
  const infoboxMatch = wikitext.match(/\{\{Character Infobox[\s\S]*?\}\}/);
  if (!infoboxMatch) return null;

  const block = infoboxMatch[0];
  const get = (label: string) => {
    const re = new RegExp(`\\|\\s*${label}\\s*=\\s*(.+?)(?:\\n\\||\\n\\})`, 'i');
    const m = block.match(re);
    return m ? m[1].trim() : null;
  };

  const factionRaw = get('faction')?.toLowerCase() || '';
  const classRaw = get('class')?.toLowerCase() || '';

  return {
    name: get('name'),
    faction: FACTION_MAP[factionRaw] || get('faction'),
    class: CLASS_MAP[classRaw] || get('class'),
    rarity: get('rarity'),
    damage_type: get('damage'),
    range: get('range'),
  };
}

const IMG_BASE = 'https://static.wikia.nocookie.net/afk-journey/images';

export async function fetchHeroImageUrl(name: string): Promise<string | null> {
  try {
    const data = await wikiFetch({
      action: 'query',
      prop: 'pageimages',
      titles: name,
      pithumbsize: '256',
    });
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as any;
    return page?.thumbnail?.source?.replace(/scale-to-width-down\/\d+/, 'scale-to-width-down/256') || null;
  } catch {
    return null;
  }
}

export function parseHeroSkills(wikitext: string) {
  const skills: { name: string; description: string; unlock_level: number }[] = [];
  const skillSection = wikitext.match(/== ?Skills? ?==[\s\S]*?(?===|$)/);
  if (!skillSection) return skills;

  const skillRegex = /\{\{Skill\s*\n([\s\S]*?)\n\}\}/g;
  let match;
  while ((match = skillRegex.exec(skillSection[0])) !== null) {
    const block = match[1];
    const nameMatch = block.match(/\|name\s*=\s*(.+)/i);
    const typeMatch = block.match(/\|type\s*=\s*(.+)/i);
    const fullDesc = block.match(/\|full\s*=\s*(.+)/i);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const desc = fullDesc ? fullDesc[1].trim() : '';
      const type = typeMatch ? typeMatch[1].trim() : '';
      const unlockLevel = type === 'Ultimate' ? 1 : type === 'Skill I' ? 11 : type === 'Skill II' ? 21 : type === 'Skill III' ? 31 : 41;
      skills.push({
        name,
        description: stripWikitext(desc).slice(0, 500),
        unlock_level: unlockLevel,
      });
    }
  }
  return skills;
}

export async function fetchAllBanners() {
  const data = await wikiFetch({
    action: 'query',
    list: 'categorymembers',
    cmtitle: 'Category:Recruitment',
    cmlimit: '200',
  });

  const banners: any[] = [];
  for (const page of data.query.categorymembers) {
    const raw = await wikiFetch({
      action: 'parse',
      page: page.title,
      prop: 'wikitext',
    });
    const wt = raw.parse?.wikitext?.['*'] || '';
    const heroMatch = wt.match(/\|hero\s*=\s*(.+)/i);
    const startMatch = wt.match(/\|time_start\s*=\s*(.+)/i);
    const endMatch = wt.match(/\|time_end\s*=\s*(.+)/i);
    if (heroMatch) {
      banners.push({
        hero_name: heroMatch[1].trim(),
        banner_type: page.title.includes('Rate_Up') ? 'rate_up' : 'standard',
        start_date: startMatch?.[1]?.trim() || null,
        end_date: endMatch?.[1]?.trim() || null,
        source_page: page.title,
      });
    }
  }
  return banners;
}

export async function fetchAllEvents() {
  const data = await wikiFetch({
    action: 'query',
    list: 'categorymembers',
    cmtitle: 'Category:Events',
    cmlimit: '200',
  });

  const events: any[] = [];
  for (const page of data.query.categorymembers) {
    const raw = await wikiFetch({
      action: 'parse',
      page: page.title,
      prop: 'wikitext',
    });
    const wt = raw.parse?.wikitext?.['*'] || '';
    const startMatch = wt.match(/\|time_start\s*=\s*(.+)/i);
    const endMatch = wt.match(/\|time_end\s*=\s*(.+)/i);
    const typeMatch = wt.match(/\|type\s*=\s*(.+)/i);
    events.push({
      name: page.title,
      description: stripWikitextPreserveStructure(wt).slice(0, 2000),
      start_date: startMatch?.[1]?.trim() || null,
      end_date: endMatch?.[1]?.trim() || null,
      event_type: typeMatch?.[1]?.trim() || null,
      source_page: page.title,
    });
  }
  return events;
}

export async function fetchPatchNotes() {
  const data = await wikiFetch({
    action: 'query',
    list: 'allpages',
    apprefix: 'Version/',
    aplimit: '50',
  });

  const patches: any[] = [];
  for (const page of data.query.allpages) {
    const raw = await wikiFetch({
      action: 'parse',
      page: page.title,
      prop: 'wikitext',
    });
    let wt = raw.parse?.wikitext?.['*'] || '';
    // Strip wiki templates but keep == headings and newlines
    wt = wt.replace(/\{\{[^}]*\}\}/g, '').replace(/'{2,}/g, '').replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, '$2').replace(/<[^>]+>/g, '');
    patches.push({
      version: page.title.replace('Version/', ''),
      title: page.title,
      content_html: wt.slice(0, 3000),
      source_page: page.title,
    });
  }
  return patches;
}
