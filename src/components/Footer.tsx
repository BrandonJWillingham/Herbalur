import Link from "next/link";
import EmailCapture from "./sections/footer/EmailCapture";

export default function Footer(){
    
    return(
        <section>
            <EmailCapture/>
            <div>
                <div>
                    <h3>
                        Herbalur logo
                    </h3>
                    <p>
                        clean and effective skincare for all
                    </p>
                    <div>
                        <a href="https://www.facebook.com/Herbalur" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://www.instagram.com/Herbalur" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://www.twitter.com/Herbalur" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </div>
                </div>
                <div>
                    <div>
                        <h3>
                            Shop
                        </h3>
                        <Link href="/Body">
                            Body
                        </Link>
                        <Link href="/Hair">
                            Hair
                        </Link>
                        <Link href="/Skincare">
                            Skincare    
                        </Link>                        
                    </div>
                    <div>
                        <h3>
                            Support
                        </h3>
                        <Link href="/Contact">
                            Contact Us
                        </Link>
                        <Link href="/FAQ">
                            FAQ
                        </Link>
                        <Link href="/Shipping">
                            Shipping & Returns
                        </Link>
                    </div>
                </div>
            </div>
            <div>
                <hr/>
                <p> @2023 Herbalur. All rights reserved. | Josiah B Willingham</p>
            </div>
        </section>
    )

}