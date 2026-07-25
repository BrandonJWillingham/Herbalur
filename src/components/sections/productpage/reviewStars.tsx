import Image from "next/image";

export default function ReviewStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, index) => (
        <Image
          key={`full-${index}`}
          src="/icons/Star.svg"
          alt=""
          width={18}
          height={18}
        />
      ))}

      {halfStar && (
        <Image
          src="/icons/Star.svg"
          alt=""
          width={18}
          height={18}
          className="opacity-50"
        />
      )}

      {[...Array(emptyStars)].map((_, index) => (
        <Image
          key={`empty-${index}`}
          src="/icons/Star.svg"
          alt=""
          width={18}
          height={18}
          className="opacity-25"
        />
      ))}
    </div>
  );
}