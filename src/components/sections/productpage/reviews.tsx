
export default function Review({ rating, reviewCount, profilePic, name, subject, description }: { rating: number; reviewCount: number; profilePic?: string; name: string; subject: string; description: string }) {
    return (
        <div>
            <img src={profilePic? profilePic : "/default-profile-pic.jpg"} alt="profile picture" />
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