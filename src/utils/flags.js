// Country name → ISO code mapping used to build flag URLs.
//
// This used to call restcountries.com at runtime, but that API sends no CORS
// headers, so every lookup failed in the browser and no flags rendered. The
// list below mirrors API-Football's /countries endpoint (the same provider that
// supplies every other dataset on the site), so lookups are instant, offline
// friendly and do not cost an API request.
const SPECIAL_CODES = {
  england: "gb-eng",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",
  europe: "eur",
  world: "world",
  "south america": "sam",
  africa: "afr",
  "nc america": "ncam",
  asia: "asia",
};

const COMPETITION_FLAGS = {
  eur: "/logos/uefa.png",
  world: "/logos/world.png",
  sam: "/logos/conmebol.png",
  afr: "/logos/caf.png",
  ncam: "/logos/concacaf.png",
  asia: "/logos/afc.png",
};

const COUNTRY_CODES = {
  albania: "al",
  algeria: "dz",
  andorra: "ad",
  angola: "ao",
  "antigua and barbuda": "ag",
  argentina: "ar",
  armenia: "am",
  aruba: "aw",
  australia: "au",
  austria: "at",
  azerbaijan: "az",
  bahrain: "bh",
  bangladesh: "bd",
  barbados: "bb",
  belarus: "by",
  belgium: "be",
  belize: "bz",
  benin: "bj",
  bermuda: "bm",
  bhutan: "bt",
  bolivia: "bo",
  bosnia: "ba",
  botswana: "bw",
  brazil: "br",
  bulgaria: "bg",
  "burkina faso": "bf",
  burundi: "bi",
  cambodia: "kh",
  cameroon: "cm",
  canada: "ca",
  "cape verde": "cv",
  "central african republic": "cf",
  chad: "td",
  chile: "cl",
  china: "cn",
  "chinese taipei": "tw",
  colombia: "co",
  comoros: "km",
  congo: "cg",
  "congo dr": "cd",
  "costa rica": "cr",
  crimea: "ua",
  croatia: "hr",
  cuba: "cu",
  curacao: "cw",
  cyprus: "cy",
  "czech republic": "cz",
  denmark: "dk",
  "dominican republic": "do",
  ecuador: "ec",
  egypt: "eg",
  "el salvador": "sv",
  england: "gb-eng",
  "equatorial guinea": "gq",
  estonia: "ee",
  eswatini: "sz",
  ethiopia: "et",
  "faroe islands": "fo",
  fiji: "fj",
  finland: "fi",
  france: "fr",
  gabon: "ga",
  gambia: "gm",
  georgia: "ge",
  germany: "de",
  ghana: "gh",
  gibraltar: "gi",
  greece: "gr",
  grenada: "gd",
  guadeloupe: "gp",
  guatemala: "gt",
  guinea: "gn",
  "guinea bissau": "gw",
  haiti: "ht",
  honduras: "hn",
  "hong kong": "hk",
  hungary: "hu",
  iceland: "is",
  india: "in",
  indonesia: "id",
  iran: "ir",
  iraq: "iq",
  ireland: "ie",
  israel: "il",
  italy: "it",
  "ivory coast": "ci",
  jamaica: "jm",
  japan: "jp",
  jordan: "jo",
  kazakhstan: "kz",
  kenya: "ke",
  kosovo: "xk",
  kuwait: "kw",
  kyrgyzstan: "kg",
  laos: "la",
  latvia: "lv",
  lebanon: "lb",
  lesotho: "ls",
  liberia: "lr",
  libya: "ly",
  liechtenstein: "li",
  lithuania: "lt",
  luxembourg: "lu",
  macau: "mo",
  macedonia: "mk",
  madagascar: "mg",
  malawi: "mw",
  malaysia: "my",
  maldives: "mv",
  mali: "ml",
  malta: "mt",
  mauritania: "mr",
  mauritius: "mu",
  mexico: "mx",
  moldova: "md",
  mongolia: "mn",
  montenegro: "me",
  morocco: "ma",
  mozambique: "mz",
  myanmar: "mm",
  namibia: "na",
  nepal: "np",
  netherlands: "nl",
  "new zealand": "nz",
  nicaragua: "ni",
  niger: "ne",
  nigeria: "ng",
  "northern ireland": "gb-nir",
  norway: "no",
  oman: "om",
  pakistan: "pk",
  palestine: "ps",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  romania: "ro",
  russia: "ru",
  rwanda: "rw",
  "san marino": "sm",
  "saudi arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  serbia: "rs",
  "sierra leone": "sl",
  singapore: "sg",
  slovakia: "sk",
  slovenia: "si",
  somalia: "so",
  "south africa": "za",
  "south korea": "kr",
  spain: "es",
  sudan: "sd",
  suriname: "sr",
  sweden: "se",
  switzerland: "ch",
  syria: "sy",
  tajikistan: "tj",
  tanzania: "tz",
  thailand: "th",
  togo: "tg",
  "trinidad and tobago": "tt",
  tunisia: "tn",
  turkey: "tr",
  turkmenistan: "tm",
  uganda: "ug",
  ukraine: "ua",
  "united arab emirates": "ae",
  "united states": "us",
  uruguay: "uy",
  usa: "us",
  uzbekistan: "uz",
  venezuela: "ve",
  vietnam: "vn",
  wales: "gb-wls",
  yemen: "ye",
  zambia: "zm",
  zimbabwe: "zw",

  // Common alternative spellings returned by other data sources.
  "bosnia and herzegovina": "ba",
  "cape verde islands": "cv",
  czechia: "cz",
  "cote d'ivoire": "ci",
  "côte d'ivoire": "ci",
  "democratic republic of congo": "cd",
  "dr congo": "cd",
  holland: "nl",
  "korea republic": "kr",
  "north macedonia": "mk",
  "republic of ireland": "ie",
  uae: "ae",
  "united states of america": "us",
};

const countryCodeCache = new Map();

const normalizeName = (countryName) =>
  countryName
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

export async function getCountryCode(countryName) {
  if (!countryName || typeof countryName !== "string") return null;

  const normalized = normalizeName(countryName);
  if (!normalized) return null;
  if (SPECIAL_CODES[normalized]) return SPECIAL_CODES[normalized];
  if (countryCodeCache.has(normalized)) return countryCodeCache.get(normalized);

  const code = COUNTRY_CODES[normalized] || null;
  countryCodeCache.set(normalized, code);
  return code;
}

export function getFlagUrl(countryCode) {
  if (!countryCode) return null;
  return (
    COMPETITION_FLAGS[countryCode] ||
    `https://media.api-sports.io/flags/${countryCode}.svg`
  );
}

export async function getFlagForCountry(countryName) {
  const code = await getCountryCode(countryName);
  return getFlagUrl(code);
}
