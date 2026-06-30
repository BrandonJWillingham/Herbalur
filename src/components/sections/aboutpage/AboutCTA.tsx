import AboutProductCard from "@/components/cards/AboutProdCard";
import Image from "next/image";

export default function AboutCallToAction() {
    return (
        <section className="about-cta">
            <div className="best-sellers">
                <h3> Our Best Sellers</h3>
                <AboutProductCard 
                    src="/path/to/image.jpg"
                    prodName="Product Image"
                    prodDescription="text12e3"
                />
                <AboutProductCard
                    src="/path/to/image.jpg"
                    prodName="Product Image"
                    prodDescription="text12e3"
                />
            </div>
            <div className="note">
                <Image
                    src="/headshot"
                    alt="testing 123"
                    width={400}
                    height={200} 
                />
                <p>
                    herbalur will always be more than just a brand to 
                    me. It's a promise to create skincare I trust for my family
                    and yours -- now and for years to come
                </p>
            </div>

        </section>
    );
}