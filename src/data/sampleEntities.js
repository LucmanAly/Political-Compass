/**
 * Illustrative starter chart — not authoritative scores.
 * Free images via Wikimedia Commons (Special:FilePath) when available.
 * Positions approximate widely used educational placements on a two-axis compass.
 * `notes` is the short 1–2 line description shown when an entity is selected.
 */
const commons = (fileName) => (
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=256`
);

/** IDs from the pre-v2 ideology samples — used only for one-time upgrade. */
export const LEGACY_SAMPLE_IDS = Object.freeze([
  'sample-social-democracy',
  'sample-classical-liberalism',
  'sample-authoritarian-right',
  'sample-anarchism',
  'sample-centrism',
]);

/** First persons-only pack shipped after the atlas rebuild. */
export const PERSON_SAMPLE_IDS = Object.freeze([
  'sample-stalin',
  'sample-marx',
  'sample-lenin',
  'sample-hitler',
  'sample-thatcher',
  'sample-reagan',
  'sample-friedman',
  'sample-gandhi',
  'sample-chomsky',
  'sample-mandela',
]);

/**
 * Bump when starter descriptions/content change so existing starter charts refresh.
 * Only applies when every saved entity is still a known sample id.
 */
export const SAMPLE_CONTENT_VERSION = 3;

const SAMPLE_PERSONS = [
  {
    id: 'sample-stalin',
    name: 'Joseph Stalin',
    type: 'person',
    imageUrl: commons('JStalin_Secretary_general_CCCP_1942.jpg'),
    economic: -8.5,
    social: -8.5,
    notes: 'Soviet leader who enforced a planned economy and absolute one-party control. Often placed deep in the authoritarian left.',
    createdAt: 1,
  },
  {
    id: 'sample-marx',
    name: 'Karl Marx',
    type: 'person',
    imageUrl: commons('Karl_Marx_001.jpg'),
    economic: -9.0,
    social: -1.5,
    notes: 'Philosopher of communism who argued for collective ownership of production. Far left on economics; social placement is more contested.',
    createdAt: 2,
  },
  {
    id: 'sample-lenin',
    name: 'Vladimir Lenin',
    type: 'person',
    imageUrl: commons('Lenin_in_1920.jpg'),
    economic: -8.2,
    social: -7.0,
    notes: 'Bolshevik revolutionary who led Russia’s first communist state through a centralized vanguard party.',
    createdAt: 3,
  },
  {
    id: 'sample-hitler',
    name: 'Adolf Hitler',
    type: 'person',
    imageUrl: commons('Adolf_Hitler_cropped_restored.jpg'),
    economic: 3.2,
    social: -9.0,
    notes: 'Nazi dictator of Germany; extreme authoritarian nationalism with a mixed, state-directed economy.',
    createdAt: 4,
  },
  {
    id: 'sample-thatcher',
    name: 'Margaret Thatcher',
    type: 'person',
    imageUrl: commons('Margaret_Thatcher_(1983).jpg'),
    economic: 7.4,
    social: -4.0,
    notes: 'British prime minister known for free-market reforms and a firm conservative social stance.',
    createdAt: 5,
  },
  {
    id: 'sample-reagan',
    name: 'Ronald Reagan',
    type: 'person',
    imageUrl: commons('Official_Portrait_of_President_Reagan_1981.jpg'),
    economic: 6.8,
    social: -2.8,
    notes: 'U.S. president associated with tax cuts, deregulation, and Cold War conservatism.',
    createdAt: 6,
  },
  {
    id: 'sample-friedman',
    name: 'Milton Friedman',
    type: 'person',
    imageUrl: commons('Portrait_of_Milton_Friedman.jpg'),
    economic: 8.2,
    social: 5.6,
    notes: 'Economist who championed free markets, monetary restraint, and limited government power.',
    createdAt: 7,
  },
  {
    id: 'sample-gandhi',
    name: 'Mahatma Gandhi',
    type: 'person',
    imageUrl: commons('Mahatma-Gandhi,_studio,_1931.jpg'),
    economic: -4.2,
    social: 6.8,
    notes: 'Leader of India’s independence movement through non-violence, village self-reliance, and moral politics.',
    createdAt: 8,
  },
  {
    id: 'sample-chomsky',
    name: 'Noam Chomsky',
    type: 'person',
    imageUrl: commons('Noam_Chomsky_portrait_2017.jpg'),
    economic: -7.4,
    social: 7.6,
    notes: 'Linguist and left-libertarian critic of concentrated corporate and state power.',
    createdAt: 9,
  },
  {
    id: 'sample-mandela',
    name: 'Nelson Mandela',
    type: 'person',
    imageUrl: commons('Nelson_Mandela_1994.jpg'),
    economic: -3.4,
    social: 2.2,
    notes: 'Anti-apartheid leader and South Africa’s first Black president; centre-left and democratically oriented.',
    createdAt: 10,
  },
];

const SAMPLE_PARTIES = [
  {
    id: 'sample-party-democratic',
    name: 'Democratic Party (US)',
    type: 'party',
    imageUrl: commons('DemocraticLogo.svg'),
    economic: -2.2,
    social: 2.0,
    notes: 'Major U.S. centre-left party; generally favors a mixed economy and broader social rights.',
    createdAt: 11,
  },
  {
    id: 'sample-party-republican',
    name: 'Republican Party (US)',
    type: 'party',
    imageUrl: commons('Republicanlogo.svg'),
    economic: 4.5,
    social: -2.4,
    notes: 'Major U.S. centre-right party; typically supports lower taxes, markets, and social conservatism.',
    createdAt: 12,
  },
  {
    id: 'sample-party-labour',
    name: 'Labour Party (UK)',
    type: 'party',
    imageUrl: '',
    economic: -3.6,
    social: 1.4,
    notes: 'Britain’s main centre-left party, rooted in labour unions and social-democratic policy.',
    createdAt: 13,
  },
  {
    id: 'sample-party-conservative-uk',
    name: 'Conservative Party (UK)',
    type: 'party',
    imageUrl: '',
    economic: 4.2,
    social: -2.0,
    notes: 'Britain’s main centre-right party, associated with markets, tradition, and national institutions.',
    createdAt: 14,
  },
  {
    id: 'sample-party-spd',
    name: 'SPD (Germany)',
    type: 'party',
    imageUrl: commons('SPD_logo.svg'),
    economic: -3.0,
    social: 1.8,
    notes: 'Germany’s historic social-democratic party; centre-left on welfare and workplace rights.',
    createdAt: 15,
  },
  {
    id: 'sample-party-cpc',
    name: 'Communist Party of China',
    type: 'party',
    imageUrl: commons('Flag_of_the_Communist_Party_of_China.svg'),
    economic: -6.5,
    social: -7.2,
    notes: 'Ruling party of the PRC; state-led development under tight one-party political control.',
    createdAt: 16,
  },
  {
    id: 'sample-party-cpsu',
    name: 'Communist Party of the Soviet Union',
    type: 'party',
    imageUrl: commons('Flag_of_the_Soviet_Union.svg'),
    economic: -8.0,
    social: -8.0,
    notes: 'Former ruling party of the USSR; planned economy and highly centralized authority.',
    createdAt: 17,
  },
  {
    id: 'sample-party-green-uk',
    name: 'Green Party (UK)',
    type: 'party',
    imageUrl: commons('Logo_of_the_Green_Party_(UK).svg'),
    economic: -4.0,
    social: 5.2,
    notes: 'Environmental and social-justice party with left-leaning economics and liberal social views.',
    createdAt: 18,
  },
  {
    id: 'sample-party-inc',
    name: 'Indian National Congress',
    type: 'party',
    imageUrl: commons('Indian_National_Congress_hand_logo.svg'),
    economic: -1.5,
    social: 1.0,
    notes: 'Historic Indian party of independence-era politics; usually broad-tent centre to centre-left.',
    createdAt: 19,
  },
  {
    id: 'sample-party-bjp',
    name: 'Bharatiya Janata Party',
    type: 'party',
    imageUrl: '',
    economic: 3.0,
    social: -3.5,
    notes: 'India’s major right-leaning party; market reforms mixed with cultural nationalism.',
    createdAt: 20,
  },
];

const SAMPLE_PHILOSOPHIES = [
  {
    id: 'sample-phil-anarchism',
    name: 'Anarchism',
    type: 'ideology',
    imageUrl: '',
    economic: -6.0,
    social: 8.5,
    notes: 'Rejects hierarchical state power and often capitalism, aiming for voluntary cooperative society.',
    createdAt: 21,
  },
  {
    id: 'sample-phil-socialism',
    name: 'Socialism',
    type: 'ideology',
    imageUrl: '',
    economic: -7.0,
    social: 1.0,
    notes: 'Seeks social or public ownership of major resources; democratic and authoritarian forms differ sharply.',
    createdAt: 22,
  },
  {
    id: 'sample-phil-communism',
    name: 'Communism',
    type: 'ideology',
    imageUrl: '',
    economic: -9.0,
    social: -4.0,
    notes: 'Calls for a classless common ownership of production; historical states were usually highly authoritarian.',
    createdAt: 23,
  },
  {
    id: 'sample-phil-social-democracy',
    name: 'Social Democracy',
    type: 'ideology',
    imageUrl: '',
    economic: -3.5,
    social: 2.5,
    notes: 'Supports capitalism with strong welfare, unions, and democratic checks on market power.',
    createdAt: 24,
  },
  {
    id: 'sample-phil-liberalism',
    name: 'Classical Liberalism',
    type: 'ideology',
    imageUrl: '',
    economic: 5.5,
    social: 5.0,
    notes: 'Emphasizes individual rights, free exchange, and limits on government coercion.',
    createdAt: 25,
  },
  {
    id: 'sample-phil-libertarianism',
    name: 'Libertarianism',
    type: 'ideology',
    imageUrl: '',
    economic: 7.5,
    social: 7.5,
    notes: 'Maximizes personal and economic liberty, favoring minimal state intervention in both markets and private life.',
    createdAt: 26,
  },
  {
    id: 'sample-phil-conservatism',
    name: 'Conservatism',
    type: 'ideology',
    imageUrl: '',
    economic: 4.0,
    social: -3.5,
    notes: 'Prefers tradition, social order, and usually market institutions over rapid cultural or economic upheaval.',
    createdAt: 27,
  },
  {
    id: 'sample-phil-fascism',
    name: 'Fascism',
    type: 'ideology',
    imageUrl: '',
    economic: 2.0,
    social: -9.0,
    notes: 'Ultranationalist authoritarian ideology that subordinates individuals to a dictatorial state.',
    createdAt: 28,
  },
  {
    id: 'sample-phil-progressivism',
    name: 'Progressivism',
    type: 'ideology',
    imageUrl: '',
    economic: -2.5,
    social: 4.0,
    notes: 'Pushes reform for equality and social change, usually with regulated markets and expanded civil rights.',
    createdAt: 29,
  },
  {
    id: 'sample-phil-centrism',
    name: 'Centrism',
    type: 'ideology',
    imageUrl: '',
    economic: 0.0,
    social: 0.0,
    notes: 'Seeks compromise between left and right, mixing market and state tools without a strong ideological extreme.',
    createdAt: 30,
  },
];

export const SAMPLE_ENTITIES = [
  ...SAMPLE_PERSONS,
  ...SAMPLE_PARTIES,
  ...SAMPLE_PHILOSOPHIES,
];

export const SAMPLE_ENTITY_IDS = Object.freeze(SAMPLE_ENTITIES.map((entity) => entity.id));

function sameIdSet(entities, expectedIds) {
  if (!Array.isArray(entities) || entities.length !== expectedIds.length) return false;
  const ids = new Set(entities.map((entity) => entity.id));
  return expectedIds.every((id) => ids.has(id));
}

function isOnlyKnownSamples(entities) {
  if (!Array.isArray(entities) || !entities.length) return false;
  const known = new Set(SAMPLE_ENTITY_IDS);
  return entities.every((entity) => known.has(entity.id));
}

/**
 * True when saved chart is a previous or current built-in pack that should refresh.
 * Never true for empty charts or charts that include user-created ids.
 */
export function shouldUpgradeSamplePack(entities, contentVersion = 0) {
  if (sameIdSet(entities, LEGACY_SAMPLE_IDS)) return true;
  if (sameIdSet(entities, PERSON_SAMPLE_IDS)) return true;
  // Refresh descriptions/content for pure starter packs when version bumps.
  if (isOnlyKnownSamples(entities) && contentVersion < SAMPLE_CONTENT_VERSION) return true;
  return false;
}

/** @deprecated use shouldUpgradeSamplePack */
export function isLegacySampleOnly(entities) {
  return shouldUpgradeSamplePack(entities, 0);
}
