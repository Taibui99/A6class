import Link from "next/link";

import { HOME_PATH } from "@/lib/home";
import { Logo } from "@/components/layout/logo";

export function Brand({
  size = "md",
  href = HOME_PATH,
}: {
  size?: "sm" | "md";
  href?: string;
}) {
  return (
    <Link href={href} className="flex min-w-0 items-center">
      <Logo size={size} />
    </Link>
  );
}