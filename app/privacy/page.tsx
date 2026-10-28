import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Dioka",
  description: "How Dioka collects, uses, and protects account, order, and customer information.",
  alternates: { canonical: "https://www.diokacraft.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy & data protection"
      title="Privacy policy"
      intro="This policy explains what information Dioka collects when you browse, create an account, place an order, subscribe to updates, or contact our team, and how we use that information."
      updated="October 28, 2026"
      sections={[
        {
          title: "Information we collect",
          content: (
            <>
              <p>We collect information you choose to provide, such as your name, email address, account details, delivery and billing details, order history, messages to our team, newsletter preferences, and any image or design notes you upload for a custom request.</p>
              <p>When you use Google to sign in, Dioka receives basic account information that Google shares for authentication, such as your name, email address, and profile image if available. We use it to create or access your Dioka account. Dioka does not request access to your Google contacts, files, calendar, or other Google services.</p>
              <p>Our website and service providers may also process technical information needed to operate the site, such as device and browser details, security logs, and session cookies.</p>
            </>
          ),
        },
        {
          title: "How we use information",
          content: (
            <ul>
              <li>Create and secure your account, including Google sign-in.</li>
              <li>Process orders, payments, delivery, returns, and customer support.</li>
              <li>Review custom design requests and the images you choose to upload.</li>
              <li>Send newsletters if you subscribe, and service messages related to your account or orders.</li>
              <li>Protect the website, prevent misuse, and maintain reliable service.</li>
            </ul>
          ),
        },
        {
          title: "Payments and service providers",
          content: (
            <>
              <p>We use service providers to host the website, manage account authentication and data, process payments, and support delivery and customer care. They receive only information needed to perform their services for Dioka and handle it under their own privacy and security terms.</p>
              <p>Payments are handled by our payment provider. Dioka does not ask you to send full payment card details by email or chat. We do not sell personal information or use Google account data for advertising.</p>
            </>
          ),
        },
        {
          title: "Cookies and account security",
          content: (
            <p>We use cookies and similar storage where needed to keep you signed in, protect account sessions, remember essential preferences, and operate the shopping experience. You can manage cookies through your browser, though blocking essential cookies may affect sign-in or checkout. We use reasonable safeguards to protect information, but no internet service can guarantee absolute security.</p>
          ),
        },
        {
          title: "Retention and your choices",
          content: (
            <>
              <p>We keep information for as long as needed to provide the service, maintain order and business records, resolve disputes, and meet legal obligations. You can unsubscribe from marketing emails using the link in the message. You may contact us to request access, correction, or deletion of your account information, subject to records we are required to retain.</p>
              <p>To request help with your information, email <a href="mailto:contactus@diokacraft.com">contactus@diokacraft.com</a>.</p>
            </>
          ),
        },
        {
          title: "Changes and contact",
          content: (
            <p>We may update this policy as the website or our data practices change. The current version will be published on this page with its update date. For privacy questions, contact Dioka at <a href="mailto:contactus@diokacraft.com">contactus@diokacraft.com</a>.</p>
          ),
        },
      ]}
    />
  );
}
