import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm, LoginFooter } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params?.redirect ?? null;

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Vào ngôi nhà số của lớp 12A6"
      footer={<LoginFooter />}
    >
      <LoginForm redirect={redirectTo ?? null} />
    </AuthShell>
  );
}