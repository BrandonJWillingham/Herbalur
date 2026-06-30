import Image from "next/image";

export default function AboutStory (){
    return (
        <section className="about-story">
            <Image src="/images/about-us.jpg" 
                alt="About Us"
                width={600}
                height={400}
            />

            <div className="about-story-content">
                <h2>Our Story</h2>
                <h3> From a mother's search to a brand that you can trust</h3>
                <p> Herbalur started from a simple mission: to create 
                    safe, and effective skincare for my daughters.
                </p>
                <p> When my daughters struggled with eczema, I tried countless 
                    products- but most were filled with harsh chemicals or didnt 
                    have long lasting results.
                </p>
                <p> So I returned to nature, and to the wisdom passed down to me.
                    I started making skincare with simple, and meaningful ingredients.
                    What began as simple body lotion and tumeric soap, has grown into
                    a trusted solution for hundreds of families. Our products are made with care, and backed by science.
                </p>
            </div>
            
        </section>
    ); 
}