export async function getProductBySlug(slug: string) {
    
    // sends get request getting product data by slug, returns product data
    const productData = await fetch(`/api/products/${slug}`).then(res => res.json());

    return productData;
}

export async function getReviewData(slug: string) {
    // sends get request getting review data by product slug, returns review data
    const reviewData = await fetch(`/api/reviews/${slug}`).then(res => res.json());
    
    return reviewData;
}