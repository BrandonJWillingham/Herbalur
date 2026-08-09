// src/app/api/shippo/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ParcelInput = {
  length: number;
  width: number;
  height: number;
  weight: number;

  // We'll default to inches + ounces.
  distanceUnit?: "in" | "cm";
  massUnit?: "oz" | "lb" | "g" | "kg";
};

type RatesRequest = {
  action: "rates";

  /*
   * Stripe Checkout Session:
   *
   * cs_test_...
   * or
   * cs_live_...
   */
  sessionId: string;

  /*
   * The package that Sharon has packed.
   *
   * Example:
   * 8 × 6 × 4 inches
   * 12 ounces
   */
  parcel: ParcelInput;
};

type PurchaseRequest = {
  action: "purchase";

  /*
   * Shippo Rate ID returned by the rates request.
   */
  rateId: string;
};

type ShippoRequestBody = RatesRequest | PurchaseRequest;

/*
 * ============================================================
 * SHIPPO API
 * ============================================================
 */

const SHIPPO_API_URL = "https://api.goshippo.com";

/*
 * Helper used for all Shippo requests.
 */
async function shippoRequest<T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${SHIPPO_API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        Authorization: `ShippoToken ${apiKey}`,
        "Content-Type": "application/json",

        /*
         * Merge any additional headers.
         */
        ...options.headers,
      },

      /*
       * Shipping information should never be cached.
       */
      cache: "no-store",
    }
  );

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "Shippo API request failed:",
      response.status,
      data
    );

    /*
     * Shippo errors can have several shapes,
     * so don't rely on only one error property.
     */
    const message =
      data &&
      typeof data === "object" &&
      "detail" in data &&
      typeof data.detail === "string"
        ? data.detail
        : "Shippo request failed.";

    throw new Error(message);
  }

  return data as T;
}

/*
 * ============================================================
 * PARCEL VALIDATION
 * ============================================================
 */

function validateParcel(parcel: ParcelInput) {
  if (
    !Number.isFinite(parcel.length) ||
    !Number.isFinite(parcel.width) ||
    !Number.isFinite(parcel.height) ||
    !Number.isFinite(parcel.weight)
  ) {
    return false;
  }

  if (
    parcel.length <= 0 ||
    parcel.width <= 0 ||
    parcel.height <= 0 ||
    parcel.weight <= 0
  ) {
    return false;
  }

  return true;
}

/*
 * ============================================================
 * POST /api/shippo
 * ============================================================
 *
 * This endpoint does TWO things:
 *
 * action: "rates"
 * ----------------
 * Finds shipping rates.
 *
 * action: "purchase"
 * -------------------
 * Purchases the selected shipping label.
 *
 * IMPORTANT:
 *
 * Getting rates does NOT purchase postage.
 *
 * "purchase" DOES purchase postage when using
 * your live Shippo API key.
 *
 * ============================================================
 */

export async function POST(req: NextRequest) {
  try {
    /*
     * ========================================================
     * ENVIRONMENT VARIABLES
     * ========================================================
     *
     * Read these inside POST() instead of initializing
     * external services globally.
     *
     * This follows the same Vercel-safe approach as your
     * Stripe webhook.
     */

    const shippoApiKey =
      process.env.SHIPPO_API_KEY?.trim();

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY?.trim();

    /*
     * Herbalur shipping origin.
     *
     * This should be the actual address packages
     * physically leave from.
     */

    const shipFromName =
      process.env.SHIP_FROM_NAME?.trim();

    const shipFromStreet1 =
      process.env.SHIP_FROM_STREET1?.trim();

    const shipFromStreet2 =
      process.env.SHIP_FROM_STREET2?.trim();

    const shipFromCity =
      process.env.SHIP_FROM_CITY?.trim();

    const shipFromState =
      process.env.SHIP_FROM_STATE?.trim();

    const shipFromZip =
      process.env.SHIP_FROM_ZIP?.trim();

    const shipFromCountry =
      process.env.SHIP_FROM_COUNTRY?.trim() || "US";

    const shipFromPhone =
      process.env.SHIP_FROM_PHONE?.trim();

    const shipFromEmail =
      process.env.SHIP_FROM_EMAIL?.trim();

    /*
     * ========================================================
     * VERIFY SHIPPO CONFIGURATION
     * ========================================================
     */

    if (!shippoApiKey) {
      console.error("Missing SHIPPO_API_KEY.");

      return NextResponse.json(
        {
          error: "Shippo is not configured.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * ========================================================
     * PARSE REQUEST
     * ========================================================
     */

    const body = (await req.json()) as ShippoRequestBody;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Invalid shipping request.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * ACTION: GET RATES
     * ========================================================
     */

    if (body.action === "rates") {
      /*
       * We need Stripe here because Stripe currently
       * holds the customer's shipping address.
       */

      if (!stripeSecretKey) {
        console.error("Missing STRIPE_SECRET_KEY.");

        return NextResponse.json(
          {
            error: "Stripe is not configured.",
          },
          {
            status: 503,
          }
        );
      }

      /*
       * Make sure Herbalur's origin address exists.
       */

      if (
        !shipFromName ||
        !shipFromStreet1 ||
        !shipFromCity ||
        !shipFromState ||
        !shipFromZip
      ) {
        console.error(
          "Herbalur shipping origin is not completely configured."
        );

        return NextResponse.json(
          {
            error:
              "Herbalur's shipping origin is not configured.",
          },
          {
            status: 503,
          }
        );
      }

      /*
       * Verify Checkout Session ID.
       */

      if (
        !body.sessionId ||
        typeof body.sessionId !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Missing Stripe Checkout Session ID.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Verify package.
       */

      if (!body.parcel || !validateParcel(body.parcel)) {
        return NextResponse.json(
          {
            error:
              "Parcel length, width, height, and weight must all be greater than 0.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ======================================================
       * RETRIEVE STRIPE CHECKOUT SESSION
       * ======================================================
       */

      const stripe = new Stripe(stripeSecretKey);

      const session =
        await stripe.checkout.sessions.retrieve(
          body.sessionId
        );

      /*
       * NEVER create shipping for an unpaid Checkout Session.
       */

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          {
            error:
              "This Checkout Session has not been paid.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ======================================================
       * CUSTOMER SHIPPING INFORMATION
       * ======================================================
       *
       * Your checkout route already collects this through:
       *
       * shipping_address_collection
       * phone_number_collection
       */

      const shippingDetails =
        session.collected_information?.shipping_details;

      const shippingAddress =
        shippingDetails?.address;

      if (!shippingDetails || !shippingAddress) {
        return NextResponse.json(
          {
            error:
              "No shipping address was found for this order.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Make sure we have the required address values
       * before sending anything to Shippo.
       */

      if (
        !shippingAddress.line1 ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.postal_code ||
        !shippingAddress.country
      ) {
        return NextResponse.json(
          {
            error:
              "The customer's shipping address is incomplete.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ======================================================
       * CREATE SHIPPO SHIPMENT
       * ======================================================
       *
       * Creating the Shipment allows Shippo to return
       * available carrier rates.
       */

      const shipment = await shippoRequest<any>(
        "/shipments/",
        shippoApiKey,
        {
          method: "POST",

          body: JSON.stringify({
            /*
             * CUSTOMER ADDRESS
             */

            address_to: {
              name:
                shippingDetails.name ||
                session.customer_details?.name ||
                "Herbalur Customer",

              street1: shippingAddress.line1,

              street2:
                shippingAddress.line2 || "",

              city: shippingAddress.city,

              state: shippingAddress.state,

              zip: shippingAddress.postal_code,

              country:
                shippingAddress.country,

              phone:
                session.customer_details?.phone || "",

              email:
                session.customer_details?.email ||
                session.customer_email ||
                "",
            },

            /*
             * HERBALUR ADDRESS
             */

            address_from: {
              name: shipFromName,

              street1: shipFromStreet1,

              street2:
                shipFromStreet2 || "",

              city: shipFromCity,

              state: shipFromState,

              zip: shipFromZip,

              country: shipFromCountry,

              phone:
                shipFromPhone || "",

              email:
                shipFromEmail || "",
            },

            /*
             * PACKAGE
             */

            parcels: [
              {
                length: String(
                  body.parcel.length
                ),

                width: String(
                  body.parcel.width
                ),

                height: String(
                  body.parcel.height
                ),

                distance_unit:
                  body.parcel.distanceUnit || "in",

                weight: String(
                  body.parcel.weight
                ),

                mass_unit:
                  body.parcel.massUnit || "oz",
              },
            ],

            /*
             * This makes it easier to identify the shipment
             * later in Shippo.
             */

            metadata:
              `Herbalur ${session.id}`.slice(0, 100),

            /*
             * Wait for Shippo to return carrier rates.
             */

            async: false,
          }),
        }
      );

      /*
       * ======================================================
       * CLEAN UP RATE RESPONSE
       * ======================================================
       *
       * Shippo returns much more information than the
       * admin dashboard actually needs.
       */

      const rawRates = Array.isArray(
        shipment.rates
      )
        ? shipment.rates
        : [];

      const rates = rawRates
        .map((rate: any) => {
          return {
            /*
             * IMPORTANT:
             *
             * Save/send this ID when the owner chooses
             * which label to purchase.
             */

            rateId: rate.object_id,

            carrier:
              rate.provider || "Unknown",

            service:
              rate.servicelevel?.name ||
              rate.servicelevel_name ||
              "Shipping",

            serviceToken:
              rate.servicelevel?.token || null,

            /*
             * Shippo usually returns this as a string.
             */

            amount: rate.amount,

            currency:
              rate.currency || "USD",

            estimatedDays:
              rate.estimated_days ?? null,

            durationTerms:
              rate.duration_terms ?? null,

            attributes:
              rate.attributes ?? [],
          };
        })

        /*
         * Cheapest first.
         */
        .sort(
          (
            a: { amount: string },
            b: { amount: string }
          ) =>
            Number(a.amount) -
            Number(b.amount)
        );

      /*
       * ======================================================
       * RETURN RATES
       * ======================================================
       */

      return NextResponse.json({
        success: true,

        shipmentId:
          shipment.object_id,

        stripeSessionId:
          session.id,

        customer: {
          name:
            shippingDetails.name ||
            session.customer_details?.name ||
            null,

          city:
            shippingAddress.city,

          state:
            shippingAddress.state,

          postalCode:
            shippingAddress.postal_code,
        },

        parcel: body.parcel,

        rates,
      });
    }

    /*
     * ========================================================
     * ACTION: PURCHASE LABEL
     * ========================================================
     *
     * WARNING:
     *
     * With a LIVE Shippo API key, this action purchases
     * postage.
     */

    if (body.action === "purchase") {
      if (
        !body.rateId ||
        typeof body.rateId !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Missing Shippo Rate ID.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ======================================================
       * CREATE SHIPPO TRANSACTION
       * ======================================================
       *
       * A Transaction purchases the selected Rate and
       * creates the actual carrier label.
       */

      const transaction =
        await shippoRequest<any>(
          "/transactions/",
          shippoApiKey,
          {
            method: "POST",

            body: JSON.stringify({
              /*
               * Rate selected from action: "rates".
               */

              rate: body.rateId,

              /*
               * 4 × 6 thermal printer format.
               */

              label_file_type: "PDF_4x6",

              /*
               * Wait for Shippo to finish generating
               * the label.
               */

              async: false,
            }),
          }
        );

      /*
       * ======================================================
       * VERIFY TRANSACTION
       * ======================================================
       *
       * The HTTP request can succeed while the carrier
       * rejects the actual label purchase.
       */

      if (transaction.status !== "SUCCESS") {
        console.error(
          "Shippo label transaction failed:",
          transaction
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Shippo could not purchase this label.",

            status:
              transaction.status,

            messages:
              transaction.messages || [],
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ======================================================
       * LABEL SUCCESS
       * ======================================================
       *
       * Eventually these values should be saved to your
       * Prisma Order record.
       */

      return NextResponse.json({
        success: true,

        transactionId:
          transaction.object_id,

        /*
         * Open this URL to view / print the 4 × 6 label.
         */

        labelUrl:
          transaction.label_url,

        /*
         * Carrier tracking information.
         */

        trackingNumber:
          transaction.tracking_number,

        trackingUrl:
          transaction.tracking_url_provider,

        /*
         * Helpful shipping details.
         */

        carrier:
          transaction.rate?.provider ??
          null,

        service:
          transaction.rate
            ?.servicelevel_name ??
          transaction.rate
            ?.servicelevel?.name ??
          null,

        amount:
          transaction.rate?.amount ??
          null,

        currency:
          transaction.rate?.currency ??
          "USD",
      });
    }

    /*
     * ========================================================
     * INVALID ACTION
     * ========================================================
     */

    return NextResponse.json(
      {
        error:
          'Invalid Shippo action. Use "rates" or "purchase".',
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Shippo route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process shipping request.",
      },
      {
        status: 500,
      }
    );
  }
}