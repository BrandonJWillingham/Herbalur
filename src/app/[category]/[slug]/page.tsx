
import IngredientCard from "@/components/cards/Ingredient";
import {prisma} from "@/lib/prisma";
import ReviewGraph from "@/components/sections/productpage/reviewGraph";
import ReviewStars from "@/components/sections/productpage/reviewstars";
import Review from "@/components/sections/productpage/reviews";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const cart = useCartStore();
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
    if (!product) {
        return <div>Product not found</div>;
    }
    const handleAddToCart = async (product: { id: string; name: string; slug: string; price: number; imageUrl: string }) => {
        cart.addItem({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            imageUrl: product.imageUrl,
        });
    }

    const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length || 0;

    return (
        <section>
            <div>
                <div>
                    <Image src={product.imageUrl} alt={product.name} />
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
                                image={product?.ingredients?.[0]?.imageUrl || "/default-image.jpg"}
                            />
                            <IngredientCard
                                name={product?.ingredients?.[1]?.name}
                                description={product?.ingredients?.[1]?.description}
                                image={product?.ingredients?.[1]?.imageUrl || "/default-image.jpg"}
                            />
                            <IngredientCard
                                name={product?.ingredients?.[2]?.name}
                                description={product?.ingredients?.[2]?.description}
                                image={product?.ingredients?.[2]?.imageUrl || "/default-image.jpg"}
                            />
                        </ul>
                    </div>
                    <div>
                        <h3>How to Use</h3>
                            <p>{product?.details?.howToUse}</p>
                    </div>
                </div>
                <div>
                    <h1>{product?.name}</h1>
                    <p>{product?.description}</p>
                    <p>{product?.description}</p>
                    <p>{product?.buzzWords}</p>
                    <button onClick={() => handleAddToCart(product)}>
                        Add to Cart ${ (product?.price / 100).toFixed(2) }
                    </button>
                </div>
            </div>
            <hr />
            <div>
                <div>
                    <h2>{averageRating.toFixed(1)}</h2>
                    <div>
                        <ReviewStars rating={averageRating}/>
                        <p>({averageRating.toFixed(1)}/5 from {product?.reviews.length || 0} reviews)</p>    
                    </div>
                    <ReviewGraph reviews={product?.reviews} />
                </div>
                <hr />
                <Review 
                    rating={product?.reviews?.[0]?.rating}
                    reviewCount={product?.reviews?.length || 0}
                    profilePic={product?.reviews?.[0]?.pfpUrl}
                    name={product?.reviews?.[0]?.name}
                    subject={product?.reviews?.[0]?.subject}
                    description={product?.reviews?.[0]?.comment}
                />    
            </div>

        </section>
    );
}