import CallToActionCard from "../../cards/CallToActionCard"

export default function HomepageCallToAction () {

    return(
        <section>
            <div>
                <CallToActionCard 
                href="/Body"
                backgroundImageSrc="/images/body.jpg"
                subHeader="Nurish. Hydrate. Glow"
                description="care that goes beyond clean <br/> made to deeply nourish and restore"
                type="Body"
                />
                <CallToActionCard 
                href="/Skincare"
                backgroundImageSrc="/images/face.jpg"
                subHeader="Radiant. Rejuvenate. Revive"
                description="skincare solutions for a refreshed complexion"
                type="Skincare"
                />
                <CallToActionCard 
                href="/Hair"
                backgroundImageSrc="/images/hair.jpg"
                subHeader="Strengthen. Shine. Flourish"
                description="haircare that promotes healthy growth and vibrant shine"
                type="Hair"
                />
            </div>
        </section>
    )
}