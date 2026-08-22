import "dotenv/config";
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

/*
|--------------------------------------------------------------------------
| INGREDIENT IMAGE PATHS
|--------------------------------------------------------------------------
|
| Files are stored in:
| public/images/ingredients/
|
| Because Next.js serves /public as the root, the URLs stored in Prisma
| should begin with /images/ingredients/ rather than /public/images/...
|
*/

const ingredientImages: Record<string, string> = {
  "Sweet Almond Oil": "/images/ingredients/almond.webp",
  "Almond Oil": "/images/ingredients/almond.webp",

  "Aloe Vera": "/images/ingredients/aloe.webp",
  "Aloe Vera Juice": "/images/ingredients/aloe.webp",

  "Apricot Kernel Oil": "/images/ingredients/apricot.webp",

  "Argan Oil": "/images/ingredients/argan.webp",

  "Avocado Oil": "/images/ingredients/avacado.webp",

  "Batana Oil": "/images/ingredients/batana.webp",

  "Black Castor Oil": "/images/ingredients/caster-seed.webp",
  "Castor Oil": "/images/ingredients/caster-seed.webp",
  "Castor Seed Oil": "/images/ingredients/caster-seed.webp",

  "Cerasee": "/images/ingredients/cerasee.webp",

  "Coconut Oil": "/images/ingredients/coconut.webp",

  "Jojoba Oil": "/images/ingredients/jojoba.webp",

  "Lemon Essential Oil": "/images/ingredients/lemon.webp",

  "Licorice Root Extract": "/images/ingredients/licorice-root.webp",

  "Oat Protein": "/images/ingredients/oat.webp",

  "Olive Oil": "/images/ingredients/olive.webp",
  "Squalene": "/images/ingredients/olive.webp",

  "Papaya Extract": "/images/ingredients/papaya.webp",

  "Peppermint Essential Oil": "/images/ingredients/peppermint.webp",

  "Pumpkin Seed Oil": "/images/ingredients/pumpkin-seed.webp",

  "Rosehip Oil": "/images/ingredients/rosehip.webp",
  "Rosehip Seed Oil": "/images/ingredients/rosehip.webp",

  "Rosemary Essential Oil": "/images/ingredients/rosemary.webp",

  "Saw Palmetto Extract": "/images/ingredients/saw-palmetto.webp",

  "Shea Butter": "/images/ingredients/shea.webp",

  "Hydrolyzed Silk Protein": "/images/ingredients/silk.webp",

  "Sunflower Oil": "/images/ingredients/sunflower.webp",
  "Sunflower Seed Oil": "/images/ingredients/sunflower.webp",

  "Turmeric": "/images/ingredients/tumeric.webp",
  "Turmeric Extract": "/images/ingredients/tumeric.webp",
  "Turmeric Powder": "/images/ingredients/tumeric-powder.webp",
};

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

const products: SeedProduct[] = [
  {
    name: "Alpha Man Body Silk Fragrance with Moisture",
    slug: "alpha-man-body-silk-fragrance",
    category: "body",
    buzzWords: "Moisturize • Soften • Scent",
    description:
      "A rich body silk that melts into the skin to soften dry areas, seal in moisture, and leave behind the Alpha Man fragrance.",
    price: 2000,
    inventory: 24,
    imageUrl: "/images/products/alpha-man-body-silk.webp",

    details: {
      highlight1: "Rich balm texture melts into warm skin",
      highlight2: "Helps soften and seal moisture into dry areas",
      highlight3: "Finished with the Alpha Man fragrance",
      howToUse:
        "Take a small amount with clean fingers, warm it between your palms until it melts, then press and glide it onto clean, slightly damp skin, focusing on dry areas like elbows, knees, and heels for intense moisture, remembering that a little goes a long way.",
    },

    ingredients: [
      {
        name: "Shea Butter",
        description:
          "A rich plant butter that helps soften skin or hair and reduce moisture loss.",
      },
      {
        name: "Sunflower Seed Oil",
        description:
          "A lightweight plant oil that helps condition and soften.",
      },
      {
        name: "Avocado Oil",
        description:
          "A conditioning plant oil that helps support softness and moisture.",
      },
    ],
  },

  {
    name: "Yoni Bliss Soap",
    slug: "yoni-bliss-soap",
    category: "body",
    buzzWords: "Cleanse • Refresh • Comfort",
    description:
      "A cleansing bar formulated with plant oils, oat protein, and peppermint essential oil for a fresh, clean-feeling wash.",
    price: 1200,
    inventory: 30,
    imageUrl: "/images/products/yoni-bliss-soap.webp",

    details: {
      highlight1: "Plant-oil soap base for everyday cleansing",
      highlight2: "Oat protein helps support a comfortable skin feel",
      highlight3: "Peppermint essential oil provides a fresh finish",
      howToUse: "",
    },

    ingredients: [
      {
        name: "Coconut Oil",
        description:
          "A plant oil commonly used to condition and support cleansing or moisturizing formulas.",
      },
      {
        name: "Oat Protein",
        description:
          "A conditioning ingredient used to support a softer, more comfortable feel.",
      },
      {
        name: "Peppermint Essential Oil",
        description:
          "An aromatic essential oil that provides a fresh, cooling sensory profile.",
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
      highlight3: "Ideal as the final step of a skincare routine",
      howToUse:
        "1. Start with clean, slightly damp skin. 2. Warm 2–4 drops of oil between your fingertips. 3. Gently press or massage it into your face and neck in upward motions. 4. Use alone or after your moisturizer to lock in hydration.",
    },

    ingredients: [
      {
        name: "Turmeric",
        description:
          "A botanical commonly featured in radiance-focused skincare routines.",
      },
      {
        name: "Papaya Extract",
        description:
          "A botanical fruit extract commonly used in brightening and smoothing skincare formulas.",
      },
      {
        name: "Jojoba Oil",
        description:
          "A lightweight conditioning oil used to soften skin and hair.",
      },
    ],
  },

  {
    name: "Brightening & Moisturizing Face Cream",
    slug: "brightening-moisturizing-face-cream",
    category: "face",
    buzzWords: "Brighten • Moisturize • Even",
    description:
      "A brightening facial treatment formulated with kojic acid, turmeric, papaya, and licorice root to support a smoother, more even-looking complexion.",
    price: 2400,
    inventory: 20,
    imageUrl: "/images/products/brightening-face-cream.webp",

    details: {
      highlight1: "Targets the appearance of uneven tone and dark spots",
      highlight2: "Combines kojic acid with botanical extracts",
      highlight3: "Rinse-off treatment for a brighter-looking complexion",
      howToUse:
        "Apply a thin, even layer to clean skin. Leave on for 10–15 minutes, then rinse with warm water. Use 2–3 times per week to brighten, even tone, and reduce dark spots.",
    },

    ingredients: [
      {
        name: "Kojic Acid",
        description:
          "A cosmetic ingredient commonly used in products designed to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Turmeric Extract",
        description:
          "A botanical extract commonly used in formulas focused on visible radiance and uneven tone.",
      },
      {
        name: "Licorice Root Extract",
        description:
          "A botanical extract commonly included in brightening and tone-evening skincare.",
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
      howToUse: "",
    },

    ingredients: [
      {
        name: "Turmeric Powder",
        description:
          "A featured ingredient selected from the product formula for its conditioning or care benefits.",
      },
      {
        name: "Lemon Essential Oil",
        description:
          "An aromatic citrus essential oil used for fragrance and a fresh sensory profile.",
      },
      {
        name: "Oat Protein",
        description:
          "A conditioning ingredient used to support a softer, more comfortable feel.",
      },
    ],
  },

  {
    name: "Cleanse Away Facial Oil",
    slug: "cleanse-away-facial-oil",
    category: "face",
    buzzWords: "Melt • Cleanse • Soften",
    description:
      "A lightweight oil cleanser that helps dissolve makeup, sunscreen, and daily buildup while leaving skin soft and conditioned.",
    price: 1900,
    inventory: 20,
    imageUrl: "/images/products/cleanse-away-facial-oil.webp",

    details: {
      highlight1: "Helps dissolve makeup and daily buildup",
      highlight2: "Oil blend leaves skin feeling soft after rinsing",
      highlight3: "Designed for daily facial cleansing",
      howToUse:
        "Massage a small amount onto dry face to dissolve makeup and impurities. Add water to emulsify, then rinse thoroughly. Use daily for soft, clean, glowing skin.",
    },

    ingredients: [
      {
        name: "Jojoba Oil",
        description:
          "A lightweight conditioning oil used to soften skin and hair.",
      },
      {
        name: "Apricot Kernel Oil",
        description:
          "A lightweight emollient oil used to soften and condition the skin.",
      },
      {
        name: "Squalene",
        description:
          "An olive-derived emollient that helps soften and condition the skin.",
      },
    ],
  },

  {
    name: "Turmeric & Kojic Face Mask",
    slug: "turmeric-kojic-face-mask",
    category: "face",
    buzzWords: "Clarify • Refine • Brighten",
    description:
      "A rinse-off face mask featuring kojic acid, turmeric, and licorice root for routines focused on dark spots, discoloration, and uneven-looking tone.",
    price: 2200,
    inventory: 14,
    imageUrl: "/images/products/brightening-face-mask.webp",

    details: {
      highlight1: "Targets the appearance of dull, uneven skin",
      highlight2: "Rinse-off treatment for weekly use",
      highlight3: "Pairs kojic acid with turmeric and licorice root",
      howToUse:
        "Apply Kojic Turmeric Mask and leave on skin for 20 to 30 minutes. Rinse off well and allow to air dry. Apply a moisturizer or serum to finish off. Use 2 to 3 times a week. Caution: Use only as directed. Avoid contact with eyes.",
    },

    ingredients: [
      {
        name: "Kojic Acid",
        description:
          "A cosmetic ingredient commonly used in products designed to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Turmeric Extract",
        description:
          "A botanical extract commonly used in formulas focused on visible radiance and uneven tone.",
      },
      {
        name: "Licorice Root Extract",
        description:
          "A botanical extract commonly included in brightening and tone-evening skincare.",
      },
    ],
  },

  {
    name: "Wake Up Beautiful After Dark Renewal Face Cleanser",
    slug: "after-dark-renewal-face-cleanser",
    category: "face",
    buzzWords: "Renew • Cleanse • Reset",
    description:
      "An evening facial cleanser formulated with aloe, rose, botanical oils, vitamin C, vitamin E, and retinol to cleanse and condition the skin.",
    price: 1700,
    inventory: 22,
    imageUrl: "/images/products/after-dark-renewal-cleanser.webp",

    details: {
      highlight1: "Botanical cleanser designed for an evening routine",
      highlight2: "Includes aloe, rose extract, and conditioning oils",
      highlight3: "Features vitamin C, vitamin E, and retinol",
      howToUse: "",
    },

    ingredients: [
      {
        name: "Retinol (Vitamin A)",
        description:
          "A vitamin A ingredient commonly used in nighttime skincare focused on skin renewal.",
      },
      {
        name: "Rose Extract",
        description:
          "A botanical extract used for its conditioning and aromatic qualities.",
      },
      {
        name: "Aloe Vera Juice",
        description:
          "A botanical juice that helps provide a hydrated, soothing feel.",
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
        "Shower & pat dry: Finish your shower and gently pat your skin with a towel, leaving it slightly damp. Warm the oil: Put a few drops in your palms and rub them together to warm it up. Massage in: Gently massage the oil onto your body in upward, circular motions, focusing on dry areas. Absorb: Allow a few minutes to absorb before dressing.",
    },

    ingredients: [
      {
        name: "Rosehip Oil",
        description:
          "A lightweight plant oil used to nourish and support a radiant-looking finish.",
      },
      {
        name: "Argan Oil",
        description:
          "A conditioning plant oil used to soften skin and hair.",
      },
      {
        name: "Sweet Almond Oil",
        description:
          "A lightweight emollient that helps soften and condition the skin.",
      },
    ],
  },

  {
    name: "Hair Growth Silky Balm",
    slug: "hair-growth-silky-balm",
    category: "hair",
    buzzWords: "Nourish • Protect • Strengthen",
    description:
      "A rich scalp and hair balm made with plant oils, botanical extracts, and essential oils for moisture, scalp care, and stronger-feeling strands.",
    price: 2400,
    inventory: 18,
    imageUrl: "/images/products/hair-growth-silky-balm.webp",

    details: {
      highlight1: "Rich balm for scalp, thinning areas, and dry ends",
      highlight2: "Features rosemary, saw palmetto, and pumpkin seed oil",
      highlight3: "Can be used as a leave-in or deeper treatment",
      howToUse:
        "Warm a small amount between your fingertips, then massage it directly into your scalp focusing on thinning areas for growth, or work it through dry ends to seal in moisture and prevent breakage, using it a few times a week or daily depending on your needs, ensuring consistency for best results. You can apply it to damp or dry hair as a leave-in, sometimes under heat for deeper treatment, but always remember to cleanse your scalp regularly to avoid buildup.",
    },

    ingredients: [
      {
        name: "Rosemary Essential Oil",
        description:
          "An aromatic botanical oil commonly used in scalp and hair-care routines.",
      },
      {
        name: "Saw Palmetto Extract",
        description:
          "A botanical extract commonly featured in scalp and hair-care formulas.",
      },
      {
        name: "Pumpkin Seed Oil",
        description:
          "A nutrient-rich plant oil used to condition the scalp and hair.",
      },
    ],
  },

  {
    name: "Smooth Strands Hair Detangler",
    slug: "smooth-strands-hair-detangler",
    category: "hair",
    buzzWords: "Detangle • Soften • Manage",
    description:
      "A leave-in detangling spray formulated to add slip, soften strands, and make everyday combing and styling easier.",
    price: 1800,
    inventory: 24,
    imageUrl: "/images/products/smooth-strands-hair-detangler.webp",

    details: {
      highlight1: "Adds slip to help reduce tugging while detangling",
      highlight2: "Leave-in formula for damp or dry hair",
      highlight3: "Supports softer, more manageable strands",
      howToUse:
        "Spray evenly onto damp or dry hair. Gently comb from ends to roots until detangled. Do not rinse. Style as usual. Use daily for soft, manageable hair.",
    },

    ingredients: [
      {
        name: "Aloe Vera Juice",
        description:
          "A botanical juice that helps provide a hydrated, soothing feel.",
      },
      {
        name: "Panthenol",
        description:
          "A provitamin ingredient used to condition hair and support softness and manageability.",
      },
      {
        name: "Castor Seed Oil",
        description:
          "A rich plant oil commonly used to seal in moisture and condition hair and skin.",
      },
    ],
  },

  {
    name: "Jamaican Ceracee Soap",
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
      howToUse: "",
    },

    ingredients: [
      {
        name: "Ceracee",
        description:
          "A Caribbean botanical traditionally used in cleansing and herbal self-care practices.",
      },
      {
        name: "Shea Butter",
        description:
          "A rich plant butter that helps soften skin or hair and reduce moisture loss.",
      },
      {
        name: "Sunflower Oil",
        description:
          "A lightweight plant oil that helps condition and soften.",
      },
    ],
  },

  {
    name: "Turmeric Glow Up Brightening Body Butter",
    slug: "turmeric-glow-up-brightening-body-butter",
    category: "body",
    buzzWords: "Nourish • Brighten • Glow",
    description:
      "A rich body butter made with shea butter, turmeric, and kojic acid to moisturize dry skin while supporting a brighter, more even-looking glow.",
    price: 2100,
    inventory: 28,
    imageUrl: "/images/products/turmeric-body-butter.webp",

    details: {
      highlight1: "Deep moisture for dry or rough-feeling areas",
      highlight2: "Features turmeric and kojic acid",
      highlight3: "Rich butter texture that melts into damp skin",
      howToUse:
        "Apply a small amount to skin that is slightly damp after a bath or shower, then gently massage it in with upward motions until it's absorbed. Warm the butter between your hands to make it easier to spread, and focus on dry areas like elbows, knees, and feet.",
    },

    ingredients: [
      {
        name: "Turmeric",
        description:
          "A botanical commonly featured in radiance-focused skincare routines.",
      },
      {
        name: "Kojic Acid",
        description:
          "A cosmetic ingredient commonly used in products designed to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Shea Butter",
        description:
          "A rich plant butter that helps soften skin or hair and reduce moisture loss.",
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
      highlight1: "Features batana oil and black castor oil",
      highlight2: "Hydrolyzed proteins support stronger-feeling strands",
      highlight3: "Rich treatment for wash-day routines",
      howToUse: "",
    },

    ingredients: [
      {
        name: "Batana Oil",
        description:
          "A rich botanical oil traditionally used to condition dry hair and improve shine.",
      },
      {
        name: "Black Castor Oil",
        description:
          "A rich oil commonly used in scalp and hair-care routines to seal in moisture.",
      },
      {
        name: "Hydrolyzed Silk Protein",
        description:
          "A conditioning protein used to support softness, smoothness, and stronger-feeling hair.",
      },
    ],
  },

  {
    name: "Turmeric Glow Up Brightening Face & Body Scrub",
    slug: "turmeric-glow-up-brightening-face-body-scrub",
    category: "body",
    buzzWords: "Polish • Smooth • Glow",
    description:
      "A sugar-based face and body scrub made to buff away rough surface buildup while pairing turmeric, kojic acid, and papaya extract with conditioning oils and butters.",
    price: 1800,
    inventory: 18,
    imageUrl: "/images/products/turmeric-face-body-scrub.webp",

    details: {
      highlight1: "Sugar exfoliation helps smooth rough-feeling skin",
      highlight2: "Features turmeric, kojic acid, and papaya extract",
      highlight3:
        "Conditioning oils and shea butter soften after exfoliation",
      howToUse:
        "Apply a small amount of scrub to your hands and gently massage it onto your skin in circular motions. After scrubbing for about 30 seconds, rinse your skin thoroughly with warm water, pat it semi-dry, and apply a moisturizer.",
    },

    ingredients: [
      {
        name: "Turmeric Extract",
        description:
          "A botanical extract commonly used in formulas focused on visible radiance and uneven tone.",
      },
      {
        name: "Kojic Acid",
        description:
          "A cosmetic ingredient commonly used in products designed to improve the appearance of uneven pigmentation.",
      },
      {
        name: "Papaya Extract",
        description:
          "A botanical fruit extract commonly used in brightening and smoothing skincare formulas.",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| SEED
|--------------------------------------------------------------------------
*/

async function main() {


  console.log(`Seeding ${products.length} Herbalur products...`);

  for (const product of products) {
    const { details, ingredients, ...productData } = product;

    /*
     * Create each ingredient once.
     *
     * If several products contain the same ingredient,
     * Prisma reuses the existing Ingredient row.
     */

    const ingredientRecords = [];

    for (const ingredient of ingredients) {
      const imageUrl =
        ingredient.imageUrl ??
        ingredientImages[ingredient.name] ??
        null;

      const ingredientRecord = await prisma.ingredient.upsert({
        where: {
          name: ingredient.name,
        },

        create: {
          name: ingredient.name,
          description: ingredient.description,
          imageUrl,
        },

        update: {
          description: ingredient.description,
          imageUrl,
        },
      });

      ingredientRecords.push(ingredientRecord);
    }

    /*
     * Create the product and connect it to its ingredients.
     */

    await prisma.product.create({
      data: {
        ...productData,

        details: {
          create: details,
        },

        ingredients: {
          connect: ingredientRecords.map((ingredient) => ({
            id: ingredient.id,
          })),
        },
      },
    });

    console.log(`✓ ${product.name}`);
  }

  console.log("Herbalur product seed completed.");
}

/*
|--------------------------------------------------------------------------
| RUN SEED
|--------------------------------------------------------------------------
*/

main()
  .catch((error) => {
    console.error("Herbalur seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });