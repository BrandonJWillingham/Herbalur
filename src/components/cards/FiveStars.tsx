import Image from "next/image"

export default function FiveStars (){
    return(
        <div className="flex flex-row">
            <Image
                src="/icons/Star.svg"
                alt="Natural ingredients"
                width={25}
                height={25}
            />
            <Image
                src="/icons/Star.svg"
                alt="Natural ingredients"
                width={25}
                height={25}
            />
            <Image
                src="/icons/Star.svg"
                alt="Natural ingredients"
                width={25}
                height={25}
            />
            <Image
                src="/icons/Star.svg"
                alt="Natural ingredients"
                width={25}
                height={25}
            />
            <Image
                src="/icons/Star.svg"
                alt="Natural ingredients"
                width={25}
                height={25}
            />
        </div>
    )
}