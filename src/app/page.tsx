import { getCurrentUser } from "@/lib/auth/current";
import { WelcomeScreen } from "@/components/entry/welcome-screen";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <WelcomeScreen signedIn={Boolean(user)} />;
}