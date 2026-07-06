import Star from "@/assets/icons/Star.svg"
import ProgressBar from "@/components/sections/productpage/reviewProgressBar"

type ReviewGraphProps = {
    reviews: { rating: number }[];
};

export default function ReviewGraph( {reviews}: ReviewGraphProps) {
    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 for 1-star, Index 4 for 5-star
    reviews.forEach((review) => {
        ratingCounts[review.rating - 1]++;
    });
    return (
        <div>
            {ratingCounts.map((count : number, index: number) => (
                <div key={index}>
                    <span>{index + 1} <Star /></span>
                    <ProgressBar percentage={(count / reviews.length) * 100} />
                </div>
            ))}
        </div>
    );
}