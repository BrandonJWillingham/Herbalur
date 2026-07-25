"use server";

import { Prisma } from "@/generated/prisma/client";
import {prisma} from "@/lib/prisma";

export type NewsletterState = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(
  _previousState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const rawEmail = formData.get("email");

  if (typeof rawEmail !== "string") {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  const email = rawEmail.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    });

    return {
      success: true,
      message: "Welcome to the Herbalur community!",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: true,
        message: "You’re already subscribed to the Herbalur newsletter.",
      };
    }

    console.error("Newsletter subscription failed:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}