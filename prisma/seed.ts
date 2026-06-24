import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const states = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
];

const citiesByState: Record<string, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangalore", "Hubballi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  Delhi: ["New Delhi"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Varanasi"],
  "West Bengal": ["Kolkata", "Siliguri", "Durgapur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Patiala"],
};

const courseTemplates = [
  "Computer Science",
  "Data Science",
  "Business Administration",
  "Artificial Intelligence",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
];

const reviewTemplates = [
  "Strong faculty support and good campus culture.",
  "Placements are decent and the academic structure is solid.",
  "Infrastructure is modern and the labs are well maintained.",
  "A practical choice for students focused on career outcomes.",
  "Good balance of academics, events, and industry exposure.",
];

const collegeData = Array.from({ length: 50 }, (_, index) => {
  const state = states[index % states.length];
  const cities = citiesByState[state];
  const city = cities[index % cities.length];
  const collegeNumber = index + 1;
  const fees = 85000 + index * 7000;
  const rating = Number((3.4 + (index % 15) * 0.08).toFixed(2));
  const highestPackage = 1800000 + index * 45000;
  const averagePackage = 650000 + index * 22000;

  return {
    name: `${city} Institute of Advanced Studies`,
    state,
    city,
    fees: fees.toFixed(2),
    rating: rating.toFixed(2),
    highestPackage: highestPackage.toFixed(2),
    averagePackage: averagePackage.toFixed(2),
    overview: `A career-focused college in ${city}, ${state} offering industry-aligned programs, active student life, and strong placement support.`,
  };
});

async function main() {
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.college.deleteMany();

  await prisma.college.createMany({
    data: collegeData,
  });

  const colleges = await prisma.college.findMany({
    where: {
      name: {
        in: collegeData.map((college) => college.name),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const collegeIdByName = new Map(
    colleges.map((college) => [college.name, college.id]),
  );

  const courseData = collegeData.flatMap((college, collegeIndex) => {
    const collegeId = collegeIdByName.get(college.name);

    if (!collegeId) {
      throw new Error(`Missing college ID for ${college.name}`);
    }

    return Array.from({ length: 5 }, (_, courseIndex) => {
      const template =
        courseTemplates[(collegeIndex + courseIndex) % courseTemplates.length];

      return {
        collegeId,
        name: `${template} ${courseIndex + 1}`,
        duration: `${3 + (courseIndex % 2)} Years`,
        fees: (45000 + collegeIndex * 1200 + courseIndex * 3500).toFixed(2),
      };
    });
  });

  const reviewData = collegeData.flatMap((college, collegeIndex) => {
    const collegeId = collegeIdByName.get(college.name);

    if (!collegeId) {
      throw new Error(`Missing college ID for ${college.name}`);
    }

    return Array.from({ length: 3 }, (_, reviewIndex) => ({
      collegeId,
      rating: 4 + ((collegeIndex + reviewIndex) % 2),
      comment: `${reviewTemplates[(collegeIndex + reviewIndex) % reviewTemplates.length]} Batch ${reviewIndex + 1}.`,
    }));
  });

  await prisma.course.createMany({
    data: courseData,
  });

  await prisma.review.createMany({
    data: reviewData,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
