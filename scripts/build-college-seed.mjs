import { writeFileSync } from "node:fs";

const categories = [
  "Overall",
  "University",
  "College",
  "Engineering",
  "Management",
  "Medical",
  "Law",
  "Pharmacy",
  "Dental",
  "Architecture",
  "Research",
  "Agriculture",
];

const categoryType = {
  Overall: "Multi-disciplinary",
  University: "University",
  College: "Degree College",
  Engineering: "Engineering",
  Management: "Management",
  Medical: "Medical",
  Law: "Law",
  Pharmacy: "Pharmacy",
  Dental: "Dental",
  Architecture: "Architecture",
  Research: "Research",
  Agriculture: "Agriculture",
};

const sourcePages = categories.flatMap((category) => {
  const base = `https://www.nirfindia.org/Rankings/2025/${category}Ranking`;
  if (category === "Engineering") {
    return [`${base}.html`, `${base}150.html`, `${base}200.html`, `${base}300.html`];
  }
  return [`${base}.html`];
});

const manualWebsites = new Map(
  Object.entries({
    "Indian Institute of Technology Madras": "https://www.iitm.ac.in",
    "Indian Institute of Technology Delhi": "https://home.iitd.ac.in",
    "Indian Institute of Technology Bombay": "https://www.iitb.ac.in",
    "Indian Institute of Technology Kanpur": "https://www.iitk.ac.in",
    "Indian Institute of Technology Kharagpur": "https://www.iitkgp.ac.in",
    "Indian Institute of Technology Roorkee": "https://www.iitr.ac.in",
    "Indian Institute of Technology Hyderabad": "https://www.iith.ac.in",
    "Indian Institute of Technology Guwahati": "https://www.iitg.ac.in",
    "Indian Institute of Technology (Banaras Hindu University) Varanasi": "https://www.iitbhu.ac.in",
    "Indian Institute of Technology Indore": "https://www.iiti.ac.in",
    "Indian Institute of Technology (Indian School of Mines)": "https://www.iitism.ac.in",
    "Indian Institute of Technology Patna": "https://www.iitp.ac.in",
    "Indian Institute of Technology Gandhinagar": "https://www.iitgn.ac.in",
    "Indian Institute of Technology Mandi": "https://www.iitmandi.ac.in",
    "Indian Institute of Technology Jodhpur": "https://www.iitj.ac.in",
    "Indian Institute of Technology Ropar": "https://www.iitrpr.ac.in",
    "Indian Institute of Technology Bhubaneswar": "https://www.iitbbs.ac.in",
    "Indian Institute of Technology Tirupati": "https://www.iittp.ac.in",
    "Indian Institute of Technology Palakkad": "https://iitpkd.ac.in",
    "Indian Institute of Technology Jammu": "https://www.iitjammu.ac.in",
    "Indian Institute of Technology Dharwad": "https://www.iitdh.ac.in",
    "Indian Institute of Technology Bhilai": "https://www.iitbhilai.ac.in",
    "Indian Institute of Technology Goa": "https://www.iitgoa.ac.in",
    "Indian Institute of Science": "https://iisc.ac.in",
    "National Institute of Technology Tiruchirappalli": "https://www.nitt.edu",
    "National Institute of Technology Rourkela": "https://www.nitrkl.ac.in",
    "National Institute of Technology Karnataka, Surathkal": "https://www.nitk.ac.in",
    "National Institute of Technology Calicut": "https://nitc.ac.in",
    "National Institute of Technology Warangal": "https://www.nitw.ac.in",
    "National Institute of Technology Durgapur": "https://nitdgp.ac.in",
    "National Institute of Technology Silchar": "https://www.nits.ac.in",
    "National Institute of Technology Patna": "https://www.nitp.ac.in",
    "National Institute of Technology Meghalaya": "https://www.nitm.ac.in",
    "National Institute of Technology Kurukshetra": "https://nitkkr.ac.in",
    "National Institute of Technology, Raipur": "https://www.nitrr.ac.in",
    "National Institute of Technology Hamirpur": "https://nith.ac.in",
    "National Institute of Technology Puducherry": "https://www.nitpy.ac.in",
    "Indian Institute of Management Ahmedabad": "https://www.iima.ac.in",
    "Indian Institute of Management Bangalore": "https://www.iimb.ac.in",
    "Indian Institute of Management Kozhikode": "https://www.iimk.ac.in",
    "Indian Institute of Management Calcutta": "https://www.iimcal.ac.in",
    "Indian Institute of Management Lucknow": "https://www.iiml.ac.in",
    "Indian Institute of Management Mumbai": "https://iimmumbai.ac.in",
    "Indian Institute of Management Indore": "https://www.iimidr.ac.in",
    "Indian Institute of Management Tiruchirappalli": "https://www.iimtrichy.ac.in",
    "Indian Institute of Management Udaipur": "https://www.iimu.ac.in",
    "Indian Institute of Management Raipur": "https://iimraipur.ac.in",
    "Indian Institute of Management Ranchi": "https://iimranchi.ac.in",
    "Indian Institute of Management Rohtak": "https://www.iimrohtak.ac.in",
    "Indian Institute of Management Kashipur": "https://www.iimkashipur.ac.in",
    "Indian Institute of Management Shillong": "https://www.iimshillong.ac.in",
    "Indian Institute of Management Visakhapatnam": "https://www.iimv.ac.in",
    "Indian Institute of Management Nagpur": "https://www.iimnagpur.ac.in",
    "Indian Institute of Management Amritsar": "https://iimamritsar.ac.in",
    "Indian Institute of Management Bodh Gaya": "https://iimbg.ac.in",
    "Indian Institute of Management Jammu": "https://www.iimj.ac.in",
    "Indian Institute of Management Sambalpur": "https://iimsambalpur.ac.in",
    "Indian Institute of Management Sirmaur": "https://www.iimsirmaur.ac.in",
    "All India Institute of Medical Sciences, Delhi": "https://www.aiims.edu",
    "Post Graduate Institute of Medical Education and Research": "https://pgimer.edu.in",
    "Christian Medical College": "https://www.cmch-vellore.edu",
    "Jawaharlal Institute of Post Graduate Medical Education & Research": "https://jipmer.edu.in",
    "National Law School of India University": "https://www.nls.ac.in",
    "National Law University Delhi": "https://nludelhi.ac.in",
    "NALSAR University of Law": "https://www.nalsar.ac.in",
    "Jamia Hamdard": "https://jamiahamdard.edu",
    "Hindu College": "https://hinducollege.ac.in",
    "Miranda House": "https://www.mirandahouse.ac.in",
    "St. Stephen`s College": "https://www.ststephens.edu",
    "Kirori Mal College": "https://kmc.du.ac.in",
    "Lady Shri Ram College for Women": "https://lsr.edu.in",
    "Loyola College": "https://www.loyolacollege.edu",
    "Presidency College": "https://www.presidencycollegechennai.ac.in",
    "PSGR Krishnammal College for Women": "https://www.psgrkcw.ac.in",
    "Chandigarh University": "https://www.cuchd.in",
    "Manipal Academy of Higher Education-Manipal": "https://manipal.edu",
    "JSS Academy of Higher Education and Research": "https://www.jssuni.edu.in",
    "Thapar Institute of Engineering and Technology (Deemed-to-be-university)": "https://www.thapar.edu",
    "Koneru Lakshmaiah Education Foundation University (K L College of Engineering)": "https://www.kluniversity.in",
    "S.R.M. Institute of Science and Technology": "https://www.srmist.edu.in",
    "Symbiosis International": "https://www.symbiosis.ac.in",
  }),
);

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/`/g, "'")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(deemed|to|be|university|college|institute|of|the|and|for|women|autonomous)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseRows(html, category, url) {
  const rowRegex = /<tr>\s*<td>(IR-[^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\d.]+|--)<\/td>\s*<td>([^<]+)<\/td>\s*<\/tr>/g;
  const rows = [];
  for (const match of html.matchAll(rowRegex)) {
    const name = cleanText(match[2].replace(/<div[\s\S]*$/i, ""));
    const city = cleanText(match[3]);
    const state = cleanText(match[4]);
    const score = Number(match[5]);
    const rankText = cleanText(match[6]);
    rows.push({
      nirfId: match[1],
      name,
      city,
      state,
      score: Number.isFinite(score) ? score : null,
      rank: /^\d+$/.test(rankText) ? Number(rankText) : null,
      rankBand: /^\d+$/.test(rankText) ? null : rankText,
      category,
      sourceUrl: url,
      pdfUrl: `https://www.nirfindia.org/nirfpdfcdn/2025/pdf/${category}/${match[1]}.pdf`,
    });
  }
  return rows;
}

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": "college-discovery-seed/1.0 (student project)" },
    });
    if (response.ok) return response.json();
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${response.status} ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  throw new Error(`Failed after retries: ${url}`);
}

async function wikidataWebsites() {
  const query = `
SELECT ?itemLabel ?alias ?website WHERE {
  ?item wdt:P17 wd:Q668; wdt:P856 ?website.
  VALUES ?class { wd:Q3918 wd:Q189004 wd:Q875538 wd:Q2385804 wd:Q1663019 wd:Q23002054 wd:Q5341295 wd:Q38723 }
  ?item wdt:P31/wdt:P279* ?class.
  OPTIONAL { ?item skos:altLabel ?alias FILTER (LANG(?alias) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const data = await getJson(url);
  const map = new Map();
  for (const binding of data.results.bindings) {
    const website = binding.website?.value;
    const labels = [binding.itemLabel?.value, binding.alias?.value].filter(Boolean);
    for (const label of labels) {
      const key = normalizeName(label);
      if (key && website && !map.has(key)) map.set(key, website);
    }
  }
  return map;
}

async function searchWikidataWebsite(college) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=5&search=${encodeURIComponent(college.name)}`;
    const searchData = await getJson(searchUrl);
    const entityIds = (searchData.search ?? []).map((item) => item.id).filter(Boolean);
    if (entityIds.length === 0) return null;
    await new Promise((resolve) => setTimeout(resolve, 150));

    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${entityIds.join("|")}`;
    const entityData = await getJson(entityUrl);
    for (const id of entityIds) {
      const claims = entityData.entities?.[id]?.claims?.P856 ?? [];
      const website = claims
        .map((claim) => claim.mainsnak?.datavalue?.value)
        .find((value) => typeof value === "string" && /^https?:\/\//.test(value));
      if (website) return website;
    }
  } catch {
    return null;
  }
  return null;
}

async function websiteFor(college, wikiMap) {
  if (manualWebsites.has(college.name)) return manualWebsites.get(college.name);
  const normalized = normalizeName(college.name);
  if (wikiMap.has(normalized)) return wikiMap.get(normalized);

  let best = null;
  for (const [key, website] of wikiMap.entries()) {
    if (normalized.length > 8 && (key.includes(normalized) || normalized.includes(key))) {
      best = website;
      break;
    }
  }

  return best ?? (await searchWikidataWebsite(college)) ?? college.pdfUrl;
}

function titleCaseType(category) {
  return categoryType[category] ?? category;
}

function coursesFor(type, index, baseFees) {
  const templates = {
    Engineering: ["B.Tech Computer Science and Engineering", "B.Tech Electronics and Communication", "B.Tech Mechanical Engineering", "M.Tech", "Ph.D."],
    Management: ["MBA / PGDM", "Executive MBA", "Fellow Programme in Management", "Business Analytics", "Finance and Strategy"],
    Medical: ["MBBS", "MD / MS", "DM / M.Ch", "B.Sc Nursing", "Public Health"],
    Law: ["BA LL.B", "LL.M", "Ph.D. Law", "Corporate Law", "Constitutional Law"],
    Pharmacy: ["B.Pharm", "M.Pharm", "Pharm.D", "Pharmaceutical Sciences", "Ph.D. Pharmacy"],
    Dental: ["BDS", "MDS", "Oral Surgery", "Orthodontics", "Public Health Dentistry"],
    Architecture: ["B.Arch", "M.Arch", "Urban Planning", "Design", "Ph.D. Architecture"],
    Agriculture: ["B.Sc Agriculture", "M.Sc Agriculture", "Agricultural Engineering", "Food Technology", "Ph.D."],
  };
  const names = templates[type] ?? ["Undergraduate Programme", "Postgraduate Programme", "Research Programme", "Professional Certificate", "Doctoral Programme"];
  return names.map((name, courseIndex) => ({
    name,
    duration: courseIndex === 2 || courseIndex === 4 ? "3-5 Years" : courseIndex === 1 ? "2 Years" : "4 Years",
    fees: Math.max(10000, Math.round((baseFees * (0.55 + courseIndex * 0.13)) / 1000) * 1000).toFixed(2),
  }));
}

function buildCollege(row, index, website) {
  const score = row.score ?? Math.max(38, 65 - index * 0.03);
  const rating = Math.min(4.95, Math.max(3.55, 3.55 + score / 70)).toFixed(2);
  const type = titleCaseType(row.category);
  const publicLike = /Indian Institute|National Institute|University of|Jamia|Delhi University|Banaras Hindu|Jawaharlal Nehru|AIIMS|NIT|IIT|IIM/i.test(row.name);
  const baseFeesByType = {
    Engineering: publicLike ? 220000 : 350000,
    Management: publicLike ? 1100000 : 1450000,
    Medical: publicLike ? 80000 : 1200000,
    Law: publicLike ? 250000 : 450000,
    Pharmacy: 180000,
    Dental: publicLike ? 180000 : 650000,
    Architecture: 240000,
    Agriculture: 90000,
    "Degree College": 45000,
    University: publicLike ? 75000 : 220000,
    Research: publicLike ? 70000 : 180000,
  };
  const baseFees = Math.round(((baseFeesByType[type] ?? 150000) * (0.9 + (index % 7) * 0.035)) / 1000) * 1000;
  const placementBase = type === "Management" ? 1800000 : type === "Engineering" ? 1400000 : type === "Medical" ? 900000 : 650000;
  const highestPackage = Math.round((placementBase + score * 42000 + (index % 11) * 85000) / 1000) * 1000;
  const averagePackage = Math.round((highestPackage * (0.34 + (index % 5) * 0.025)) / 1000) * 1000;

  return {
    ...row,
    website,
    type,
    admissionProcess: admissionProcess(type),
    fees: baseFees.toFixed(2),
    rating,
    highestPackage: highestPackage.toFixed(2),
    averagePackage: averagePackage.toFixed(2),
    overview: `${row.name} is a ${type.toLowerCase()} institution in ${row.city}, ${row.state}, listed in India Rankings 2025 by NIRF${row.rank ? ` with ${row.category} rank ${row.rank}` : row.rankBand ? ` in the ${row.rankBand} rank band for ${row.category}` : ""}. Students should compare official admissions notices, programme fit, fees, scholarships, placements, campus location, hostel availability, alumni network, accreditation, and entrance-exam cutoffs before applying.`,
    courses: coursesFor(type, index, baseFees),
    reviews: [
      {
        rating: Math.round(Number(rating)),
        comment: `Strong option for students prioritising ${row.category.toLowerCase()} reputation, academic depth, and recognised national ranking signals.`,
      },
      {
        rating: Math.max(3, Math.round(Number(rating)) - 1),
        comment: "Check current official placement reports, fee notices, hostel rules, and entrance cutoffs before finalising your choice.",
      },
      {
        rating: Math.round(Number(rating)),
        comment: `Location in ${row.city} can matter for internships, travel cost, industry exposure, and campus lifestyle.`,
      },
    ],
  };
}

function admissionProcess(type) {
  if (type === "Engineering") return "JEE Main / JEE Advanced / institute counselling";
  if (type === "Management") return "CAT / GMAT / XAT plus institute selection rounds";
  if (type === "Medical") return "NEET-UG / NEET-PG counselling";
  if (type === "Law") return "CLAT / AILET / institute entrance route";
  if (type === "Pharmacy") return "Entrance exam or merit-based counselling";
  if (type === "Dental") return "NEET counselling";
  if (type === "Architecture") return "NATA / JEE Main Paper 2 counselling";
  if (type === "Agriculture") return "ICAR / state or university counselling";
  return "Merit-based or entrance-based admission as notified officially";
}

function tsString(value) {
  return JSON.stringify(value);
}

async function main() {
  const rows = [];
  for (const url of sourcePages) {
    const category = url.match(/\/([^/]+)Ranking/)?.[1];
    const response = await fetch(url, { headers: { "User-Agent": "college-discovery-seed/1.0" } });
    if (!response.ok) continue;
    rows.push(...parseRows(await response.text(), category, url));
  }

  const deduped = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${normalizeName(row.name)}|${row.city.toLowerCase()}|${row.state.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  const wikiMap = await wikidataWebsites();
  const colleges = [];
  for (const [index, row] of deduped.entries()) {
    if (colleges.length >= 500) break;
    colleges.push(buildCollege(row, index, await websiteFor(row, wikiMap)));
  }

  const source = `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const collegeData = ${tsString(colleges)} as const;

async function main() {
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.college.deleteMany();

  for (const college of collegeData) {
    await prisma.college.create({
      data: {
        name: college.name,
        state: college.state,
        city: college.city,
        fees: college.fees,
        rating: college.rating,
        highestPackage: college.highestPackage,
        averagePackage: college.averagePackage,
        overview: college.overview,
        website: college.website,
        type: college.type,
        admissionProcess: college.admissionProcess,
        courses: {
          create: college.courses.map((course) => ({
            name: course.name,
            duration: course.duration,
            fees: course.fees,
          })),
        },
        reviews: {
          create: college.reviews.map((review) => ({
            rating: review.rating,
            comment: review.comment,
          })),
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  writeFileSync("prisma/seed.ts", source);
  console.log(`Wrote ${colleges.length} colleges to prisma/seed.ts`);
  console.log(`${colleges.filter((college) => college.website.includes("nirfindia.org")).length} records use NIRF PDF links where homepage was unavailable.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
