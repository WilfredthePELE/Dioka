import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Dioka",
  description: "Terms for using the Dioka website, shopping, and requesting custom designs.",
  alternates: { canonical: "https://www.diokacraft.com/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Using the Dioka atelier"
      title="Terms of service"
      intro="These terms apply when you browse the Dioka website, create an account, place an order, or send a request for a personalized design."
      updated="October 28, 2026"
      sections={[
        {
          title: "Using the website",
          content: <p>Please provide accurate account and order information, keep your sign-in details secure, and use the website lawfully. You are responsible for activity carried out through your account. Contact us promptly if you believe someone has accessed it without permission.</p>,
        },
        {
          title: "Products, prices, and orders",
          content: <p>Product descriptions, images, availability, and prices are presented on the website and may change. Colors and materials can appear differently across screens. Submitting an order request does not guarantee acceptance; an order is accepted when Dioka confirms it. The price, delivery details, and applicable charges shown at checkout or in the order confirmation apply to that order.</p>,
        },
        {
          title: "Payment and delivery",
          content: <p>Payment is processed through the payment method offered at checkout. You authorize the applicable charge when you place an order. Delivery estimates are provided for guidance and may be affected by circumstances outside Dioka’s control. We will use the delivery details you provide to fulfill the order and contact you about it.</p>,
        },
        {
          title: "Custom design requests and uploads",
          content: <p>You may upload reference images or describe a design for a custom request. You confirm that you have the right to share those materials and permit Dioka to use them to assess and fulfill your request. Do not upload unlawful, harmful, or confidential material belonging to someone else. A custom request becomes an order only after Dioka confirms its scope, price, and timing with you.</p>,
        },
        {
          title: "Returns, care, and support",
          content: <p>Any return, exchange, or warranty terms shown on the product page, checkout, or order confirmation apply to your purchase. Please review those terms before ordering. For help with an order or product care, contact <a href="mailto:contactus@diokacraft.com">contactus@diokacraft.com</a>.</p>,
        },
        {
          title: "Website content and availability",
          content: <p>Dioka and its licensors retain rights to the website’s branding, text, images, and designs. You may not copy or use them commercially without permission. We work to keep the website available and accurate, but features or content may change, and uninterrupted access cannot be guaranteed.</p>,
        },
        {
          title: "Updates and contact",
          content: <p>We may revise these terms as our services change. The current version and its update date will appear on this page. Continued use after an update means the revised terms apply to future use. Questions can be sent to <a href="mailto:contactus@diokacraft.com">contactus@diokacraft.com</a>.</p>,
        },
      ]}
    />
  );
}
