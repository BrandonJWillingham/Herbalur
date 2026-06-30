import FiveStars from "@/components/cards/FiveStars";
import TiktokCard from "@/components/cards/TiktokCard";


export default function TikToks (){
    

    return(
        <div>
            <h3> 
                Real people, Real results.
            </h3>
            <div>
                <TiktokCard
                    src={"/videos/tiktok1.mp4"}
                    caption={"@emilyskincarejourney: I’ve been using herbalur for a month now and my skin has never looked better! #herbalur #skincare"}
                />
                <TiktokCard
                    src={"/videos/tiktok2.mp4"}
                    caption={"@johndoe: Herbalur has completely transformed my skin! #herbalur #skincare"}
                />
                <TiktokCard
                    src={"/videos/tiktok3.mp4"}
                    caption={"@sarahbeauty: I can’t believe the difference herbalur has made in just a few weeks! #herbalur #skincare"}
                />
            </div>

            <div>
                <FiveStars/>
                <p>
                    4.9/5 stars from 500+ happy customers.
                </p>
            </div>

        </div>
    )
}