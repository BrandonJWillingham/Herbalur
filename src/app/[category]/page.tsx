import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: { category: string } }) {
    const { category } = params;
    if (category != "skincare" && category != "haircare" && category != "bodycare" && category != "wellness") {
        return <p>No category provided</p>;
    }
    const products = await prisma.product.findMany({
    where: {
        category,
    },
    });

    return (
        <section>
            <div className="typography hero">
                
            </div>
            <hr />
            <div>
                <p>{products.length} products found</p>
                <button>Filter</button>
            </div>
            <div className="product-grid">
                {products.map((product) => (
                    <div key={product.slug}>
                        <img src={product.imageUrl} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>{product.buzzWords}</p>
                        <button>View Product</button>
                    </div>
                ))}
            </div>
        </section>
    );
}