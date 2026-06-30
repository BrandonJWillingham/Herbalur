
export function getProductsByCategory(category: string) {
    // sends get request getting category data by category name, returns category data
    const categoryData = fetch(`/api/categories/${category}`).then(res => res.json());
    return categoryData;
}

