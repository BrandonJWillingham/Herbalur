"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export default async function Cart() {
   const { cart, isCartOpen, closeCart } = useCartStore();
   
    const checkoutItems = cart.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    }));
    return (
        <div>
           <div>
                <h2> Your Cart</h2>
                <button className="x-icon" onClick={closeCart}>
                    X
                </button>
           </div>

            {cart.map((product) => (
                <CartItem key={product.id} {...product} />
            ))}
            <button onClick={() => handleCheckout(checkoutItems)}>Checkout</button>
        </div>
    )
}

type CartProduct = {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
    quantity: number;
};

const CartItem = (product: CartProduct) => {
    return (
        <div>
            <div>
                <Image src={product.imageUrl || "/default-image.jpg"} alt={product.name} />    
            </div>
            

            <h3>{product.name}</h3>
            <p>${(product.price / 100).toFixed(2)}</p>
            <div>
                <p>-</p>
                <p>{product.quantity}</p>
                <p>+</p>
            </div>
            <button className="trash-icon">Trash</button>
        </div>
    )
}

const handleCheckout = async (checkoutItems: { id: string; quantity: number }[]) => {
    const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: checkoutItems }),
    });

    const { url } = await response.json();

    window.location.href = url;
};