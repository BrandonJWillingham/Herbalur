import Link from "next/link"

export default function Header (){

    return(
        <div className="flex spacebetween w-100">
            <Link href='/'>
            Herbalur
            </Link>

            <div className="flex">
                <Link href='/Body'>
                Body
                </Link>
                <Link href='/Hair'>
                Hair
                </Link>
                <Link href='/Skincare'>
                Skincare
                </Link>
                <Link href='/About'>
                About 
                </Link>   
            </div>
           

            <Link href='/'>
            Shop
            </Link>
        </div>
    )
}