import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { HOME_PATH } from "@/lib/home";
import { WelcomeScreen } from "@/components/entry/welcome-screen";

export default async function HomePage() {
  const user = await getCurrentUser();

  // Đã đăng nhập thì vào thẳng kho công cụ — chọn công cụ rồi chuyển tới.
  if (user) redirect(HOME_PATH);

  return <WelcomeScreen />;
}
