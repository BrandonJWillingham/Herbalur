import Image from "next/image";
type abtProdProps = {
    src: string;
    prodName: string;
    prodDescription: string;
}

export default function AboutProductCard({src, prodName, prodDescription} : abtProdProps) {
    return (
        <div className="about-product-card">
            <Image src= {src} 
            alt={prodName}
            width={300} 
            height={300} />
            <h3>{prodName}</h3>
            <p>{prodDescription}</p>
        </div>
    );
}