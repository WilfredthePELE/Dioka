import Link from "next/link";
export const metadata = { title: "Sign-in assistance | Dioka", robots: { index: false, follow: false } };
export default async function AuthResult({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams;
  return <main style={{ maxWidth: 560, margin: "12vh auto", padding: 28 }}><p>DIOKA / YOUR ACCOUNT</p><h1>Let's try that again.</h1><p>Google sign-in was cancelled, expired or could not verify this account. Please try again, or sign in with your existing email and password.</p><p>If this email already has a Dioka account, sign in first and choose Connect Google from your profile. Administrator access requires the store owner's approved email.</p><Link href={params.returnTo === "/admin" ? "/admin" : "/"}>Return to Dioka</Link></main>;
}
