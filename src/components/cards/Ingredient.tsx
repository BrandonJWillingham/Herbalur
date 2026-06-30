export default function IngredientCard({ name, description, image }: { name: string; description: string; image: string }) {
    return (
        <div>
            <img src={image} alt={name} />
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
    );
}