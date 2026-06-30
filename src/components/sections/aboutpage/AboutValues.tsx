import IconCard from "@/components/cards/AboutIconCard";

export default function AboutValues() {
    return (
        <section className="about-values">
            <div className="">
              <IconCard src="/path/to/image.jpg" subHeader="Sub Header" description="Description" />
              <hr />
              <IconCard src="/path/to/image.jpg" subHeader="Sub Header" description="Description" />
              <hr />
              <IconCard src="/path/to/image.jpg" subHeader="Sub Header" description="Description" />
            </div>
        </section>
    );
}