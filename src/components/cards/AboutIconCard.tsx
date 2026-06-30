type AboutValuesProps = {
    src: string;
    subHeader: string;
    description: string;
};

export default function IconCard({ src, subHeader, description }: AboutValuesProps) {
    return (
        <div>
            <img src={src} alt={subHeader} />
            <h3>{subHeader}</h3>
            <p>{description}</p>
        </div>
    );
}
