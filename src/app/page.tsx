import HomepageCallToAction from "@/components/sections/homepage/HomepageCallToAction";
import HomepageHero from "@/components/sections/homepage/HomepageHero";
import HomepageAboutUs from "@/components/sections/homepage/HomepageAboutUs";
import Image from "next/image";

import TikToks from "@/components/sections/homepage/Tiktoks";
export default function Home() {
  return (
    <div>
      <HomepageHero/>
      <HomepageCallToAction/>
      <HomepageAboutUs/>
      <TikToks/>
    </div>
  );
}
