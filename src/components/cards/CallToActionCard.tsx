import Link from "next/link"


type CallToActionCardProps = {
    type?:string;
    href: string;
    subHeader?: string;
    description?: string;
    backgroundImageSrc?: string;
};

export default function CallToActionCard (propData: CallToActionCardProps){

    return(
        <div style={{ backgroundImage: `url(${propData.backgroundImageSrc})` }}>
            <h2>
                {propData.type}
            </h2>
            <h3>
                {propData.subHeader}
            </h3>
            <p>{propData.description}</p> 

           <Link href={propData.href}>
           <div>
                <p>
                    shop {propData.type}
                </p>
           </div>
           </Link>
            
        </div>
    )
}