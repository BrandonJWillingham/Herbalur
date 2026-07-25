import Image from "next/image";
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
                <div key={index} className="flex items-center flex-row align-items m-3 gap-2">
                    <span className="text-lg flex flex-row m-1">{index + 1} </span>
                    <Image src="/icons/Star.svg" alt="" width={18} height={18} />
                    <ProgressBar percentage={(count / reviews.length) * 100} />
                </div>
            ))}
        </div>
    );
}