import { AccountPage } from "@/components/AccountPage";
export const metadata = { title: "Your account | Dioka", robots: { index: false, follow: false } };
export default function ProfilePage() { return <AccountPage mode="profile"/>; }
