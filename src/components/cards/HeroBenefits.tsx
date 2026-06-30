import Image from "next/image"

type Props = {
    iconSrc: string
    altText?: string
    width?: number
    height?: number
    benefit?: string
    benefitDescription?: string
}

export default function HeroBenefits({ iconSrc, altText = '', width = 24, height = 24, benefit, benefitDescription }: Props) {
    return (
        <div>
            <Image src={iconSrc} alt={altText} width={width} height={height} />
            <h3>
                {benefit}
            </h3>
            <p>
                {benefitDescription}
            </p>
        </div>
    )
}