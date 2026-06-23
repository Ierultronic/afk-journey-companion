const TIER_SOURCE = 'https://gamer-choice.com/afk-journey-tier-list/';
const TEAMS_SOURCE = 'https://playafkjourney.com/teams/';

const MODE_MAP: Record<string, string> = {
  'Story Mode': 'afk_stages',
  'Dream Realm': 'dream_realm',
  'PvP': 'pvp',
};

export async function scrapeTierList(): Promise<
  { hero_name: string; mode: string; tier: string }[]
> {
  const res = await fetch(TIER_SOURCE);
  const html = await res.text();

  // Extract all <h3> and <h4> content with their following <p>
  const sections: { heading: string; tier: string; heroes: string }[] = [];
  const lines = html.split('\n');

  let currentMode = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const modeMatch = line.match(/<h3>(.+?)<\/h3>/i);
    if (modeMatch) {
      currentMode = modeMatch[1].trim();
      continue;
    }

    const tierMatch = line.match(/<h4>(S|A|B|C) Tier<\/h4>/i);
    if (tierMatch && currentMode) {
      const tier = tierMatch[1].toUpperCase();
      let heroes = '';
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const pMatch = lines[j].match(/<p>(.+?)<\/p>/i);
        if (pMatch) {
          heroes += (heroes ? ',' : '') + pMatch[1];
        } else if (lines[j].match(/<\/?h[34]/)) {
          break;
        }
      }
      sections.push({ heading: currentMode, tier, heroes });
    }
  }

  // Parse hero names per mode, deduplicate
  const modeTiers: Record<string, Set<string>> = {};
  for (const section of sections) {
    const dbMode = MODE_MAP[section.heading];
    if (!dbMode) continue; // skip "Overall"

    const heroes = section.heroes
      .split(',')
      .map(h => h.replace(/<[^>]*>/g, '').trim())
      .filter(Boolean);

    for (const hero of heroes) {
      const key = `${dbMode}::${section.tier}::${hero}`;
      if (!modeTiers[key]) {
        const set = new Set<string>();
        modeTiers[key] = set;
      }
      modeTiers[key].add(hero);
    }
  }

  const result: { hero_name: string; mode: string; tier: string }[] = [];
  for (const [key] of Object.entries(modeTiers)) {
    const [mode, tier, hero_name] = key.split('::', 3);
    if (hero_name) {
      result.push({ hero_name, mode, tier });
    }
  }

  return result;
}

export async function scrapeTeamComps(): Promise<
  { name: string; mode: string; hero_names: string[]; description: string }[]
> {
  try {
    const res = await fetch(TEAMS_SOURCE);
    const html = await res.text();
    const comps: any[] = [];
    const { parse } = await import('node-html-parser');
    const root = parse(html);
    const tables = root.querySelectorAll('table');
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) continue;
        const heroEls = cells[0].querySelectorAll('a, span, strong');
        const heroes = [...new Set(heroEls.map(h => h.textContent.trim()).filter(Boolean))];
        if (heroes.length >= 3) {
          comps.push({
            name: `Team ${comps.length + 1}`,
            mode: 'dream_realm',
            hero_names: heroes,
            description: cells[1]?.textContent?.trim()?.slice(0, 200) || '',
          });
        }
      }
    }
    return comps;
  } catch {
    return [];
  }
}
