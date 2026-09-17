import Image from "next/image";

type IngredientCardProps = {
  name: string;
  description: string;
  image: string;
};

export default function IngredientCard({
  name,
  description,
  image,
}: IngredientCardProps) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        bg-white
        border border-[#e7e1d8]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f3efe8]">
        <Image
          src={image}
          alt={name}
          fill
          className="
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-105
          "
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            33vw
          "
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="
            mb-2
            font-serif
            text-xl
            font-medium
            text-[#164e35]
          "
        >
          {name}
        </h3>

        <p className="text-sm leading-6 text-[#5f5a52]">
          {description}
        </p>
      </div>
    </article>
  );
}