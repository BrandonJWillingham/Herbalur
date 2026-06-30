import AboutHero from "@/components/sections/aboutpage/hero";
import AboutStory from "@/components/sections/aboutpage/AboutStory";
import AboutValues from "@/components/sections/aboutpage/AboutValues";
import CallToAction from "@/components/sections/aboutpage/AboutCTA";

export default function AboutPage() {
    return (
        <section>
          <AboutHero />
          <AboutStory />
          <AboutValues />
          <CallToAction />
        </section>
    );
}
            