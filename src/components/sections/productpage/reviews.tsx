
export default function Review({ rating, reviewCount, name, subject, description }: { rating: number; reviewCount: number; name: string; subject?: string; description: string }) {
    return (
        <div>

            <div>
                <div>
                    <p>{name}</p>
                    <p>Rating: {rating} ({reviewCount} reviews)</p>                    
                </div>
                <h4>{subject? subject : "No subject"}</h4>
                <p> {description}</p>
            </div>
            
        </div>
    );
}