
import IngredientCard from "@/components/cards/Ingredient";
import {prisma} from "@/lib/prisma";
import ReviewGraph from "@/components/sections/productpage/reviewgraph";
import ReviewStars from "@/components/sections/productpage/reviewstars";
import Reviews from "@/components/sections/productpage/reviews";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
    where: { slug },
    include: {
        details: true,
        ingredients: true,
        reviews: {
        where: { approved: true },
        },
    },
    });
    return (
        <section>
            <div>
                <div>
                    <img src={product.image} alt={product.name} />
                    <div>
                        <h3>Highlights</h3>
                        <ul>
                            <li>{product?.details?.highlight1}</li>
                            <li>{product?.details?.highlight2}</li>
                            <li>{product?.details?.highlight3}</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Ingredients</h3>
                        <ul>
                            <IngredientCard 
                                name={product?.ingredients?.[0]?.name}
                                description={product?.ingredients?.[0]?.description}
                                image={product?.ingredients?.[0]?.image}
                            />
                            <IngredientCard
                                name={product?.ingredients?.[1]?.name}
                                description={product?.ingredients?.[1]?.description}
                                image={product?.ingredients?.[1]?.image}
                            />
                            <IngredientCard
                                name={product?.ingredients?.[2]?.name}
                                description={product?.ingredients?.[2]?.description}
                                image={product?.ingredients?.[2]?.image}
                            />
                        </ul>
                    </div>
                    <div>
                        <h3>How to Use</h3>
                        <p>{product?.howToUse}</p>
                    </div>
                </div>
                <div>
                    <h1>{product?.name}</h1>
                    <p>{product?.lineDescription}</p>
                    <Reviews rating={product?.rating} reviewCount={product?.reviewCount} />
                    <p>{product?.longDescription}</p>
                    <p>{product?.buzzwords}</p>
                    <button>Add to Cart {product?.price}</button>
                </div>
            </div>
            <div>
                <h2>{product?.reviews?.[0]?.name}</h2>
                <ReviewStars rating={product?.reviews?.[0]?.rating} />
                <ReviewGraph rating={product?.reviews?.[0]?.rating} reviewCount={product?.reviews?.[0]?.reviewCount} />
            </div>
            <Reviews 
                rating={product?.reviews?.[0]?.rating}
                reviewCount={product?.reviews?.[0]?.reviewCount}
                profilePic={product?.reviews?.[0]?.profilePic}
                name={product?.reviews?.[0]?.name}
                subject={product?.reviews?.[0]?.subject}
                description={product?.reviews?.[0]?.description}
            />
        </section>
    );
}