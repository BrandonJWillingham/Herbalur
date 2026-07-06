import StarIcon from "@/icons/Star 5.svg";


export default function ReviewStars({ rating }: { rating: number }) {
    
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return(
        <div>
            {[...Array(fullStars)].map((_, index) => (
                <StarIcon key={`full-${index}`} />
            ))}
            {[...Array(halfStar ? 1 : 0)].map((_, index) => (
                <StarIcon key={`half-${index}`} />
            ))}
            {[...Array(emptyStars)].map((_, index) => (
                <StarIcon key={`empty-${index}`} />
            ))}
        </div>
    )
}