// Run this to seed the database manually after setting SUPABASE_URL and SUPABASE_SERVICE_KEY
// npx tsx scripts/test-scrapers.ts

import { getAllHeroNames, getHeroWikitext, parseHeroInfobox, parseHeroSkills } from '../src/lib/scrapers/fandom';

async function main() {
  console.log('Testing Fandom API scraper...\n');

  const names = await getAllHeroNames();
  console.log(`Found ${names.length} heroes\n`);

  // Test first hero
  const sample = names[0];
  console.log(`Testing with: ${sample}`);
  const wt = await getHeroWikitext(sample);
  const info = parseHeroInfobox(wt);
  console.log('Infobox:', info);
  const skills = parseHeroSkills(wt);
  console.log('Skills:', skills.length, 'found\n');

  console.log('Scraper test complete.');
}

main().catch(console.error);
