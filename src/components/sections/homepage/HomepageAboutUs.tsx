import Link from "next/link"


export default function HomepageAboutUs(){

    return(
        <div>

            <div>
                <p className="color-gold">
                    Our Mission
                </p>
                <h3>
                    Rooted in life 
                    <br/>
                    Made For Real Life
                </h3>
                <p>
                    how herbalur was created description
                </p>

                <Link href={"/about"}>
                    <div>
                            Learn more about us
                            <svg> arrow</svg>
                    </div>
                </Link>
            </div>
            {/* image of ingredients, or groups of ingredients */}
            <image>

            </image>
        </div>
    )
}