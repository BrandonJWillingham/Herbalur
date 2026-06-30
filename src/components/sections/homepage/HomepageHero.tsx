import HeroBenefits from "@/components/cards/HeroBenefits";


export default function HomepageHero (){

    return (
        <section  className="relative min-h-[700px]">

            <div className="Intro">
                <h2>
                    Welcome to herbalur        
                </h2>
                <h1>
                    "Authentic Ingredients <br/> Authentic Results"
                </h1>
                <div>
                    <hr className="textDivider"/>
                    <p>
                        We create clean, effective skincare and powerful bodycare using natures most powerful ingredients
                        <br/>
                        so you can feel confident in the skin you're in
                    </p>
                    <a href="#about">
                        explore our collections
                    </a>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e8] via-[#f7f1e8]/80 to-transparent" />
            <div>
                <video
                src={"/videos/heroMuted.mp4"}
                className=""
                autoPlay
                loop
                muted
                />
            </div>
            
            <div id="icons" className="absolute bottom-0 left-0 flex space-between w-50">
                <HeroBenefits
                    iconSrc={"/icons/cruelty-free.svg"}
                    altText={"cruelty-free icon"}
                    benefit={"Cruelty-Free"}
                    benefitDescription={"Our products are 100% cruelty-free, never tested on animals."}
                />
                <HeroBenefits
                    iconSrc={"/icons/herbalur-flask-icon.svg"}
                    altText={"flask icon"}
                    benefit={"No harsh chemicals"}
                    benefitDescription={"No sulfates, or parabens - just pure, effective ingredients that are gentle on your skin."}
                />
                <HeroBenefits
                    iconSrc={"/icons/herbalur-leaf.svg"}
                    altText={"clean ingredients icon"}
                    benefit={"Clean Ingredients"}
                    benefitDescription={"All natural, all effective"}
                />

            </div>
        </section>
    )
}