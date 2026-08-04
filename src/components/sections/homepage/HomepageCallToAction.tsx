import CallToActionCard from "@/components/cards/CallToActionCard";

export default function HomepageCallToAction() {
  return (
    <section className="bg-[#f8f5ef] py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-3">
        <CallToActionCard
          href="/body"
          backgroundImage="/images/products/body.png"
          title="Body"
          subtitle="Nourish. Hydrate. Glow."
          description="Care that goes beyond clean—made to deeply nourish and restore."
          dark
        />

        <CallToActionCard
          href="/hair"
          backgroundImage="/images/products/hair.png"
          title="Hair"
          subtitle="Stronger. Healthier. Naturally."
          description="Formulated with plant-powered ingredients to support healthy growth."
        />

        <CallToActionCard
          href="/face"
          backgroundImage="/images/products/face.png"
          title="Skincare"
          subtitle="Clean. Gentle. Effective."
          description="Skincare that works with your skin—not against it."
        />
      </div>
    </section>
  );
}