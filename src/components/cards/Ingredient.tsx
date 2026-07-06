import Image from "next/image";

export default function IngredientCard({ name, description, image }: { name: string; description: string; image: string }) {
    return (
        <div>
            <Image src={image} alt={name} width={200} height={200} />
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
    );
}