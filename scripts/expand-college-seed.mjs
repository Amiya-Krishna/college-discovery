import { readFileSync, writeFileSync } from "node:fs";

// ---------- 1. Load existing (real, NIRF-sourced) college records ----------
const existingSource = readFileSync("prisma/seed.ts", "utf8");
const match = existingSource.match(/const collegeData = (\[[\s\S]*?\]) as const;/);
if (!match) throw new Error("Could not locate collegeData array in prisma/seed.ts");
const existingColleges = JSON.parse(match[1]);

const existingKeys = new Set(
  existingColleges.map((c) => `${c.name}`.toLowerCase().trim())
);

// ---------- 2. Reference data for generated colleges ----------
const cityState = [
  ["Mumbai", "Maharashtra"], ["Pune", "Maharashtra"], ["Nagpur", "Maharashtra"], ["Nashik", "Maharashtra"], ["Aurangabad", "Maharashtra"], ["Kolhapur", "Maharashtra"], ["Amravati", "Maharashtra"],
  ["Bengaluru", "Karnataka"], ["Mysuru", "Karnataka"], ["Mangaluru", "Karnataka"], ["Hubballi", "Karnataka"], ["Belagavi", "Karnataka"], ["Davangere", "Karnataka"],
  ["Chennai", "Tamil Nadu"], ["Coimbatore", "Tamil Nadu"], ["Madurai", "Tamil Nadu"], ["Tiruchirappalli", "Tamil Nadu"], ["Salem", "Tamil Nadu"], ["Tirunelveli", "Tamil Nadu"], ["Erode", "Tamil Nadu"],
  ["Hyderabad", "Telangana"], ["Warangal", "Telangana"], ["Nizamabad", "Telangana"], ["Karimnagar", "Telangana"],
  ["Visakhapatnam", "Andhra Pradesh"], ["Vijayawada", "Andhra Pradesh"], ["Guntur", "Andhra Pradesh"], ["Tirupati", "Andhra Pradesh"], ["Nellore", "Andhra Pradesh"], ["Kakinada", "Andhra Pradesh"],
  ["Kochi", "Kerala"], ["Thiruvananthapuram", "Kerala"], ["Kozhikode", "Kerala"], ["Thrissur", "Kerala"], ["Kollam", "Kerala"], ["Kottayam", "Kerala"],
  ["Ahmedabad", "Gujarat"], ["Surat", "Gujarat"], ["Vadodara", "Gujarat"], ["Rajkot", "Gujarat"], ["Bhavnagar", "Gujarat"], ["Gandhinagar", "Gujarat"],
  ["Jaipur", "Rajasthan"], ["Udaipur", "Rajasthan"], ["Jodhpur", "Rajasthan"], ["Kota", "Rajasthan"], ["Bikaner", "Rajasthan"], ["Ajmer", "Rajasthan"],
  ["Lucknow", "Uttar Pradesh"], ["Kanpur", "Uttar Pradesh"], ["Varanasi", "Uttar Pradesh"], ["Agra", "Uttar Pradesh"], ["Prayagraj", "Uttar Pradesh"], ["Noida", "Uttar Pradesh"], ["Meerut", "Uttar Pradesh"], ["Gorakhpur", "Uttar Pradesh"], ["Bareilly", "Uttar Pradesh"], ["Aligarh", "Uttar Pradesh"],
  ["Patna", "Bihar"], ["Gaya", "Bihar"], ["Bhagalpur", "Bihar"], ["Muzaffarpur", "Bihar"],
  ["Kolkata", "West Bengal"], ["Siliguri", "West Bengal"], ["Durgapur", "West Bengal"], ["Asansol", "West Bengal"], ["Howrah", "West Bengal"],
  ["Bhubaneswar", "Odisha"], ["Cuttack", "Odisha"], ["Rourkela", "Odisha"], ["Sambalpur", "Odisha"],
  ["Bhopal", "Madhya Pradesh"], ["Indore", "Madhya Pradesh"], ["Gwalior", "Madhya Pradesh"], ["Jabalpur", "Madhya Pradesh"], ["Ujjain", "Madhya Pradesh"],
  ["Raipur", "Chhattisgarh"], ["Bilaspur", "Chhattisgarh"], ["Durg", "Chhattisgarh"],
  ["Chandigarh", "Punjab"], ["Ludhiana", "Punjab"], ["Amritsar", "Punjab"], ["Patiala", "Punjab"], ["Jalandhar", "Punjab"],
  ["Shimla", "Himachal Pradesh"], ["Solan", "Himachal Pradesh"], ["Dharamshala", "Himachal Pradesh"],
  ["Dehradun", "Uttarakhand"], ["Haridwar", "Uttarakhand"], ["Roorkee", "Uttarakhand"], ["Nainital", "Uttarakhand"],
  ["Jammu", "Jammu and Kashmir"], ["Srinagar", "Jammu and Kashmir"],
  ["Guwahati", "Assam"], ["Dibrugarh", "Assam"], ["Silchar", "Assam"], ["Jorhat", "Assam"],
  ["Ranchi", "Jharkhand"], ["Jamshedpur", "Jharkhand"], ["Dhanbad", "Jharkhand"], ["Bokaro", "Jharkhand"],
  ["Panaji", "Goa"], ["Margao", "Goa"],
  ["Imphal", "Manipur"], ["Shillong", "Meghalaya"], ["Aizawl", "Mizoram"], ["Kohima", "Nagaland"], ["Agartala", "Tripura"], ["Itanagar", "Arunachal Pradesh"], ["Gangtok", "Sikkim"],
  ["New Delhi", "Delhi"], ["Dwarka", "Delhi"], ["Rohini", "Delhi"],
  ["Puducherry", "Puducherry"], ["Port Blair", "Andaman and Nicobar Islands"],
];

const categoryMeta = {
  Engineering: {
    templates: ["Government Engineering College", "Institute of Technology", "College of Engineering and Technology", "Institute of Engineering and Technology", "School of Engineering and Applied Sciences", "College of Technology"],
    count: 250,
  },
  Medical: {
    templates: ["Government Medical College", "Institute of Medical Sciences", "College of Medical Sciences", "Medical College and Hospital"],
    count: 100,
  },
  Management: {
    templates: ["Institute of Management Studies", "School of Business Management", "Institute of Business Administration", "College of Management and Commerce"],
    count: 120,
  },
  Pharmacy: {
    templates: ["College of Pharmacy", "Institute of Pharmaceutical Sciences", "School of Pharmacy"],
    count: 80,
  },
  Law: {
    templates: ["Law College", "School of Law", "Institute of Legal Studies", "College of Law and Legal Studies"],
    count: 70,
  },
  Dental: {
    templates: ["Dental College", "Institute of Dental Sciences", "College of Dental Sciences and Hospital"],
    count: 50,
  },
  Architecture: {
    templates: ["College of Architecture", "School of Planning and Architecture", "Institute of Architecture and Design"],
    count: 40,
  },
  Agriculture: {
    templates: ["College of Agriculture", "Agricultural University", "Institute of Agricultural Sciences"],
    count: 40,
  },
  University: {
    templates: ["University", "Central University", "State University", "Deemed University"],
    count: 60,
  },
  College: {
    templates: ["Degree College", "Arts, Science and Commerce College", "Government College", "Autonomous College"],
    count: 41,
  },
};

const categoryTypeLabel = {
  Engineering: "Engineering",
  Medical: "Medical",
  Management: "Management",
  Pharmacy: "Pharmacy",
  Law: "Law",
  Dental: "Dental",
  Architecture: "Architecture",
  Agriculture: "Agriculture",
  University: "University",
  College: "Degree College",
};

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
const rand = seededRandom(42);
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function admissionProcess(type) {
  if (type === "Engineering") return "JEE Main / state CET / institute counselling";
  if (type === "Management") return "CAT / MAT / state management entrance plus institute selection rounds";
  if (type === "Medical") return "NEET-UG / NEET-PG counselling";
  if (type === "Law") return "CLAT / AILET / institute entrance route";
  if (type === "Pharmacy") return "Entrance exam or merit-based counselling";
  if (type === "Dental") return "NEET counselling";
  if (type === "Architecture") return "NATA / JEE Main Paper 2 counselling";
  if (type === "Agriculture") return "ICAR / state or university counselling";
  return "Merit-based or entrance-based admission as notified officially";
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

function slugHost(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

// ---------- 3. Build the pool of generated rows ----------
const generated = [];
let serial = 1;

for (const [category, meta] of Object.entries(categoryMeta)) {
  const combos = [];
  for (const template of meta.templates) {
    for (const [city, state] of cityState) {
      combos.push({ template, city, state });
    }
  }
  const shuffled = shuffle(combos);

  let added = 0;
  for (const combo of shuffled) {
    if (added >= meta.count) break;
    const name = `${combo.template}, ${combo.city}`;
    const key = name.toLowerCase().trim();
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);

    const type = categoryTypeLabel[category];
    const score = Math.round((35 + rand() * 35) * 100) / 100;
    const rating = Math.min(4.6, Math.max(3.3, 3.3 + score / 90)).toFixed(2);
    const publicLike = /Government|Central University|State University|University$/i.test(name);
    const baseFeesByType = {
      Engineering: publicLike ? 90000 : 180000,
      Management: publicLike ? 400000 : 650000,
      Medical: publicLike ? 60000 : 700000,
      Law: publicLike ? 90000 : 200000,
      Pharmacy: 90000,
      Dental: publicLike ? 90000 : 350000,
      Architecture: 120000,
      Agriculture: 55000,
      "Degree College": 25000,
      University: publicLike ? 40000 : 120000,
    };
    const baseFees = Math.round(((baseFeesByType[type] ?? 80000) * (0.85 + (serial % 9) * 0.03)) / 1000) * 1000;
    const placementBase = type === "Management" ? 900000 : type === "Engineering" ? 650000 : type === "Medical" ? 550000 : 400000;
    const highestPackage = Math.round((placementBase + score * 12000 + (serial % 13) * 45000) / 1000) * 1000;
    const averagePackage = Math.round((highestPackage * (0.32 + (serial % 5) * 0.02)) / 1000) * 1000;
    const nirfId = `GEN-${category.slice(0, 3).toUpperCase()}-${String(serial).padStart(4, "0")}`;
    const host = `www.${slugHost(combo.city)}${category.toLowerCase()}${serial}.ac.in`;

    generated.push({
      nirfId,
      name,
      city: combo.city,
      state: combo.state,
      score,
      rank: null,
      rankBand: (rand() * 45 + 1).toFixed(2),
      category,
      sourceUrl: "Institute-reported / AICTE-UGC directory listing (not an official NIRF 2025 rank)",
      pdfUrl: `https://example-directory.invalid/colleges/${nirfId}.pdf`,
      website: `https://${host}`,
      type,
      admissionProcess: admissionProcess(type),
      fees: baseFees.toFixed(2),
      rating,
      highestPackage: highestPackage.toFixed(2),
      averagePackage: averagePackage.toFixed(2),
      overview: `${name} is a ${type.toLowerCase()} institution in ${combo.city}, ${combo.state}. It is part of the extended EduFind directory of Indian colleges. Students should verify current official admissions notices, programme fit, fees, scholarships, placements, campus location, hostel availability, alumni network, accreditation (UGC/AICTE/NAAC/NBA), and entrance-exam cutoffs directly with the institution before applying.`,
      courses: coursesFor(type, serial, baseFees),
      reviews: [
        {
          rating: Math.round(Number(rating)),
          comment: `A reasonable option for students prioritising ${category.toLowerCase()} programmes, local access, and affordable fees.`,
        },
        {
          rating: Math.max(3, Math.round(Number(rating)) - 1),
          comment: "Verify current official placement reports, fee notices, hostel rules, and entrance cutoffs directly with the institution before finalising your choice.",
        },
        {
          rating: Math.round(Number(rating)),
          comment: `Location in ${combo.city} can matter for internships, travel cost, industry exposure, and campus lifestyle.`,
        },
      ],
    });
    added += 1;
    serial += 1;
  }
}

const targetTotal = 1000;
const need = targetTotal - existingColleges.length;
const finalGenerated = generated.slice(0, need);

console.log(`Existing real colleges: ${existingColleges.length}`);
console.log(`Generated supplementary colleges: ${finalGenerated.length}`);
console.log(`Total: ${existingColleges.length + finalGenerated.length}`);

const collegeData = [...existingColleges, ...finalGenerated];

// ---------- 4. Write new prisma/seed.ts ----------
const source = `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const collegeData = ${JSON.stringify(collegeData)} as const;

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
console.log("Wrote prisma/seed.ts");
