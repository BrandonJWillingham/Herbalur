import { prisma } from "../../src/lib/prisma";

type SeedProduct = {
  name: string;
  slug: string;
  category: "body" | "face" | "hair";
  buzzWords: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  details: {
    highlight1: string;
    highlight2: string;
    highlight3: string;
    howToUse: string;
  };
  ingredients: {
    name: string;
    description: string;
    imageUrl?: string;
  }[];
};

const products: SeedProduct[] = [
  {
    name: "Scalp Therapy Oil",
    slug: "scalp-therapy-oil",
    category: "hair",
    buzzWords: "Soothe • Nourish • Restore",
    description:
      "A lightweight scalp oil created to moisturize dry areas, support a comfortable scalp, and leave hair feeling nourished without a heavy finish.",
    price: 1800,
    inventory: 24,
    imageUrl: "/images/products/scalp-therapy-oil.webp",
    details: {
      highlight1: "Helps moisturize a dry, tight-feeling scalp",
      highlight2: "Lightweight oil blend for regular scalp care",
      highlight3: "Designed for protective styles and everyday routines",
      howToUse:
        "Apply a small amount directly to the scalp. Massage gently with fingertips for one to two minutes. Use two to four times per week or as needed.",
    },
    ingredients: [
      {
        name: "Castor Oil",
        description:
          "A rich plant oil commonly used to seal in moisture and condition the scalp and hair.",
      },
      {
        name: "Jojoba Oil",
        description:
          "A lightweight oil that helps soften hair and support a balanced-feeling scalp.",
      },
      {
        name: "Rosemary",
        description:
          "An aromatic botanical traditionally used in scalp and hair-care routines.",
      },
    ],
  },
  {
    name: "Turmeric Glow Up Brightening Oil",
    slug: "turmeric-glow-up-brightening-oil",
    category: "face",
    buzzWords: "Glow • Soften • Even",
    description:
      "A lightweight facial oil formulated to help soften the look of uneven, dull skin while leaving the complexion moisturized and luminous.",
    price: 2200,
    inventory: 20,
    imageUrl: "/images/products/turmeric-brightening-oil.webp",
    details: {
      highlight1: "Supports a brighter-looking complexion",
      highlight2: "Helps seal in moisture without a greasy finish",
      highlight3: "Ideal as the final step of an evening routine",
      howToUse:
        "Warm two to four drops between clean fingertips and press onto the face and neck after water-based products. Use once daily, preferably at night.",
    },
    ingredients: [
      {
        name: "Turmeric",
        description:
          "A botanical known for its antioxidant content and use in brightening skincare routines.",
      },
      {
        name: "Sunflower Seed Oil",
        description:
          "A lightweight emollient that helps soften the skin and reduce moisture loss.",
      },
      {
        name: "Vitamin E",
        description:
          "An antioxidant that helps condition the skin and support the formula's oil blend.",
      },
    ],
  },
  {
    name: "Turmeric Glow Up Face & Body Wash",
    slug: "turmeric-glow-up-face-body-wash",
    category: "body",
    buzzWords: "Cleanse • Refresh • Brighten",
    description:
      "A versatile daily cleanser for the face and body that removes buildup while helping skin feel fresh, comfortable, and clean.",
    price: 1900,
    inventory: 30,
    imageUrl: "/images/products/turmeric-face-body-wash.webp",
    details: {
      highlight1: "Multi-use cleanser for face and body",
      highlight2: "Cleanses without an overly stripped feeling",
      highlight3: "Pairs well with the Turmeric Glow Up routine",
      howToUse:
        "Dispense onto wet hands or a washcloth and work into a gentle lather. Massage over damp skin, avoiding the eye area, then rinse thoroughly.",
    },
    ingredients: [
      {
        name: "Turmeric",
        description:
          "A botanical ingredient commonly used in routines focused on visible radiance and uneven tone.",
      },
      {
        name: "Aloe Vera",
        description:
          "Helps provide a soothing, hydrated feel during cleansing.",
      },
      {
        name: "Vegetable Glycerin",
        description:
          "A humectant that helps attract moisture to the surface of the skin.",
      },
    ],
  },
  {
    name: "Turmeric & Kojic Acid Soap",
    slug: "turmeric-kojic-acid-soap",
    category: "face",
    buzzWords: "Clarify • Brighten • Smooth",
    description:
      "A cleansing bar made for routines targeting the appearance of dark spots, uneven tone, and dullness on the face or body.",
    price: 1200,
    inventory: 45,
    imageUrl: "/images/products/turmeric-kojic-acid-soap.webp",
    details: {
      highlight1: "Created for uneven-looking tone and dark spots",
      highlight2: "Rich cleansing lather for targeted areas",
      highlight3: "Suitable for use on the face or body",
      howToUse:
        "Lather the bar between wet hands and apply the foam to damp skin. Leave on briefly, then rinse thoroughly. Begin two to three times per week and increase only as tolerated. Follow with moisturizer and daytime sunscreen.",
    },
    ingredients: [
      {
        name: "Kojic Acid",
        description:
          "A cosmetic ingredient commonly used in products designed to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Turmeric",
        description:
          "A botanical associated with antioxidant-rich and brightening skincare routines.",
      },
      {
        name: "Coconut Oil",
        description:
          "Supports the soap base and contributes to its cleansing lather.",
      },
    ],
  },
  {
    name: "Turmeric Glow Up Face & Body Scrub",
    slug: "turmeric-face-body-scrub",
    category: "body",
    buzzWords: "Polish • Smooth • Glow",
    description:
      "A physical exfoliating scrub designed to buff away rough, dull surface buildup and leave the face or body feeling smoother.",
    price: 1800,
    inventory: 18,
    imageUrl: "/images/products/turmeric-face-body-scrub.webp",
    details: {
      highlight1: "Helps smooth rough-feeling areas",
      highlight2: "Supports a more polished, radiant appearance",
      highlight3: "Can be used on the body or gently on the face",
      howToUse:
        "Massage a small amount onto damp skin using light circular motions. Avoid broken or irritated skin and the eye area. Rinse well. Use one to two times weekly.",
    },
    ingredients: [
      {
        name: "Turmeric",
        description:
          "A botanical used in body-care routines focused on visible radiance.",
      },
      {
        name: "Sugar",
        description:
          "Provides physical exfoliation to remove loose surface buildup.",
      },
      {
        name: "Shea Butter",
        description:
          "A rich emollient that helps leave exfoliated skin feeling soft.",
      },
    ],
  },
  {
    name: "After Dark Renewal Face Cleanser",
    slug: "after-dark-renewal-face-cleanser",
    category: "face",
    buzzWords: "Renew • Cleanse • Reset",
    description:
      "An evening facial cleanser designed to remove the day's buildup and prepare skin for the rest of a nighttime renewal routine.",
    price: 1700,
    inventory: 22,
    imageUrl: "/images/products/after-dark-renewal-cleanser.webp",
    details: {
      highlight1: "Removes daily oil, residue, and buildup",
      highlight2: "Designed for a simple evening cleansing ritual",
      highlight3: "Leaves skin ready for serum and moisturizer",
      howToUse:
        "Massage one to two pumps over damp skin for 30 to 60 seconds. Rinse with lukewarm water and pat dry. Follow with serum and moisturizer.",
    },
    ingredients: [
      {
        name: "Aloe Vera",
        description:
          "Helps give the cleanser a soothing and comfortable skin feel.",
      },
      {
        name: "Vegetable Glycerin",
        description:
          "A humectant used to help maintain moisture during cleansing.",
      },
      {
        name: "Green Tea",
        description:
          "An antioxidant-rich botanical often used in calming facial-care products.",
      },
    ],
  },
  {
    name: "After Dark Renewal Cream",
    slug: "after-dark-renewal-cream",
    category: "face",
    buzzWords: "Restore • Moisturize • Renew",
    description:
      "A rich nighttime moisturizer that helps soften dry skin and support a smooth, replenished appearance by morning.",
    price: 2600,
    inventory: 16,
    imageUrl: "/images/products/after-dark-renewal-cream.webp",
    details: {
      highlight1: "Rich overnight moisture for dry-feeling skin",
      highlight2: "Helps support a softer, smoother appearance",
      highlight3: "Seals in serums and nighttime treatments",
      howToUse:
        "Apply a small amount to the face and neck as the final step of your evening routine. Massage gently until absorbed.",
    },
    ingredients: [
      {
        name: "Shea Butter",
        description:
          "A rich plant butter that softens skin and helps reduce moisture loss.",
      },
      {
        name: "Squalane",
        description:
          "A lightweight emollient that supports softness without a heavy feel.",
      },
      {
        name: "Vitamin E",
        description:
          "An antioxidant and conditioning ingredient used in moisturizing formulas.",
      },
    ],
  },
  {
    name: "Alpha Man Body Oil Fragrance",
    slug: "alpha-man-body-oil-fragrance",
    category: "body",
    buzzWords: "Moisturize • Scent • Confidence",
    description:
      "A scented body oil created to soften the skin while leaving behind a warm, confident fragrance.",
    price: 2000,
    inventory: 25,
    imageUrl: "/images/products/alpha-man-body-oil.webp",
    details: {
      highlight1: "Combines lightweight moisture with fragrance",
      highlight2: "Leaves skin with a soft, conditioned finish",
      highlight3: "Ideal after showering or before going out",
      howToUse:
        "Apply a small amount to clean, slightly damp skin and massage until absorbed. Avoid the face and sensitive areas.",
    },
    ingredients: [
      {
        name: "Sweet Almond Oil",
        description:
          "A lightweight emollient that helps soften and condition the skin.",
      },
      {
        name: "Grapeseed Oil",
        description:
          "A fast-absorbing oil that supports a smooth, non-heavy finish.",
      },
      {
        name: "Fragrance",
        description:
          "Provides the product's signature warm scent profile.",
      },
    ],
  },
  {
    name: "Turmeric Glow Up Body Butter",
    slug: "turmeric-glow-up-body-butter",
    category: "body",
    buzzWords: "Nourish • Soften • Glow",
    description:
      "A rich body moisturizer made to comfort dry skin and leave it feeling soft, conditioned, and visibly radiant.",
    price: 2100,
    inventory: 28,
    imageUrl: "/images/products/turmeric-body-butter.webp",
    details: {
      highlight1: "Deep moisture for dry or rough-feeling areas",
      highlight2: "Rich butter texture that melts into the skin",
      highlight3: "Supports a soft, healthy-looking glow",
      howToUse:
        "Massage generously into clean skin, focusing on elbows, knees, hands, and other dry areas. For best results, apply after bathing.",
    },
    ingredients: [
      {
        name: "Shea Butter",
        description:
          "A rich emollient that helps soften skin and seal in moisture.",
      },
      {
        name: "Turmeric",
        description:
          "A botanical used in glow-focused skincare and body-care routines.",
      },
      {
        name: "Cocoa Butter",
        description:
          "A dense plant butter that helps condition dry, rough-feeling skin.",
      },
    ],
  },
  {
    name: "Turmeric & Kojic Acid Brightening Face Mask",
    slug: "turmeric-kojic-acid-brightening-face-mask",
    category: "face",
    buzzWords: "Clarify • Refine • Brighten",
    description:
      "A rinse-off facial mask created to support a clearer, brighter-looking complexion and improve the look of uneven tone.",
    price: 2200,
    inventory: 14,
    imageUrl: "/images/products/brightening-face-mask.webp",
    details: {
      highlight1: "Targets the appearance of dull, uneven skin",
      highlight2: "Rinse-off treatment for weekly use",
      highlight3: "Pairs well with a gentle cleanser and moisturizer",
      howToUse:
        "Apply a thin, even layer to clean, dry skin while avoiding the eye and lip areas. Leave on for 5 to 10 minutes, then rinse thoroughly. Use once weekly and follow with moisturizer.",
    },
    ingredients: [
      {
        name: "Kojic Acid",
        description:
          "A cosmetic brightening ingredient used to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Turmeric",
        description:
          "A botanical associated with antioxidant-rich and radiance-focused skincare.",
      },
      {
        name: "Kaolin Clay",
        description:
          "A gentle clay that helps absorb surface oil and provide a refreshed skin feel.",
      },
    ],
  },
  {
    name: "Jamaican Cerasee Soap",
    slug: "jamaican-cerasee-soap",
    category: "body",
    buzzWords: "Cleanse • Refresh • Botanical",
    description:
      "A botanical cleansing bar featuring cerasee, traditionally used in Caribbean self-care routines for fresh, clean-feeling skin.",
    price: 1100,
    inventory: 36,
    imageUrl: "/images/products/jamaican-cerasee-soap.webp",
    details: {
      highlight1: "Botanical cleansing bar for everyday body care",
      highlight2: "Inspired by traditional Caribbean ingredients",
      highlight3: "Leaves skin feeling fresh and thoroughly cleansed",
      howToUse:
        "Work the bar into a lather with water and apply to damp skin. Rinse thoroughly and follow with moisturizer. Avoid contact with the eyes.",
    },
    ingredients: [
      {
        name: "Cerasee",
        description:
          "A Caribbean botanical traditionally used in cleansing and herbal self-care practices.",
      },
      {
        name: "Coconut Oil",
        description:
          "Supports the cleansing soap base and contributes to lather.",
      },
      {
        name: "Olive Oil",
        description:
          "An emollient oil used to help condition the skin within the soap formula.",
      },
    ],
  },
  {
    name: "Deep Conditioner Hair Mask",
    slug: "deep-conditioner-hair-mask",
    category: "hair",
    buzzWords: "Strengthen • Repair • Soften",
    description:
      "A rich deep-conditioning treatment created to soften dry hair, improve manageability, and support stronger-feeling strands.",
    price: 2400,
    inventory: 18,
    imageUrl: "/images/products/deep-conditioner-hair-mask.webp",
    details: {
      highlight1: "Helps soften dry, brittle-feeling hair",
      highlight2: "Supports easier detangling and manageability",
      highlight3: "Rich treatment for wash-day routines",
      howToUse:
        "After shampooing, apply generously from roots to ends. Detangle gently, cover hair, and leave on for 15 to 30 minutes. Rinse thoroughly.",
    },
    ingredients: [
      {
        name: "Shea Butter",
        description:
          "A rich emollient that helps soften and condition dry hair.",
      },
      {
        name: "Avocado Oil",
        description:
          "A conditioning plant oil used to improve softness and manageability.",
      },
      {
        name: "Aloe Vera",
        description:
          "Helps provide slip and a hydrated feel during conditioning.",
      },
    ],
  },
  {
    name: "Batana & Fenugreek Hair Growth Oil",
    slug: "batana-fenugreek-hair-growth-oil",
    category: "hair",
    buzzWords: "Nourish • Strengthen • Grow",
    description:
      "A concentrated hair and scalp oil featuring batana and fenugreek to support nourished roots and stronger-looking hair.",
    price: 2300,
    inventory: 26,
    imageUrl: "/images/products/hair-growth-oil.webp",
    details: {
      highlight1: "Nourishes the scalp and dry hair",
      highlight2: "Supports stronger-looking strands and ends",
      highlight3: "Useful for scalp massage and protective styling",
      howToUse:
        "Apply sparingly to the scalp or hair and massage gently. Use two to four times per week. A small amount may also be applied to dry ends.",
    },
    ingredients: [
      {
        name: "Batana Oil",
        description:
          "A rich botanical oil traditionally used to condition dry hair and improve shine.",
      },
      {
        name: "Fenugreek",
        description:
          "A botanical commonly featured in strengthening and scalp-care routines.",
      },
      {
        name: "Castor Oil",
        description:
          "A thick plant oil that helps seal in moisture and condition hair.",
      },
    ],
  },
  {
    name: "Rose Dew Face Oil",
    slug: "rose-dew-face-oil",
    category: "face",
    buzzWords: "Nourish • Soften • Radiance",
    description:
      "A lightweight facial oil with a rose-inspired blend that seals in moisture and leaves skin looking soft and luminous.",
    price: 2400,
    inventory: 17,
    imageUrl: "/images/products/rose-dew-face-oil.webp",
    details: {
      highlight1: "Helps seal in moisture and soften skin",
      highlight2: "Lightweight finishing step for a natural glow",
      highlight3: "Can be used alone or over moisturizer",
      howToUse:
        "Press two to four drops onto the face and neck after moisturizer. Use morning or evening. Apply sunscreen afterward during the day.",
    },
    ingredients: [
      {
        name: "Rosehip Seed Oil",
        description:
          "A lightweight plant oil used to nourish and support a radiant-looking complexion.",
      },
      {
        name: "Jojoba Oil",
        description:
          "A skin-softening oil with a light texture suitable for facial use.",
      },
      {
        name: "Vitamin E",
        description:
          "An antioxidant and conditioning ingredient commonly included in facial oil blends.",
      },
    ],
  },
];

async function main() {
  console.log(`Seeding ${products.length} Herbalur products...`);

  for (const product of products) {
    const { details, ingredients, ...productData } = product;

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      create: {
        ...productData,
        details: {
          create: details,
        },
        ingredients: {
          create: ingredients,
        },
      },
      update: {
        ...productData,
        details: {
          upsert: {
            create: details,
            update: details,
          },
        },
        ingredients: {
          deleteMany: {},
          create: ingredients,
        },
      },
    });

    console.log(`✓ ${product.name}`);
  }

  console.log("Herbalur product seed completed.");
}

main()
  .catch((error) => {
    console.error("Herbalur seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });