import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm, RegisterFooter } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Trở thành thành viên lớp 11A6"
      footer={<RegisterFooter />}
    >
      <RegisterForm />
    </AuthShell>
  );
}