"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/roles";
import { saveOnboarding } from "@/lib/onboarding/service";
import type { ActionState } from "@/lib/classes/actions";

export async function saveOnboardingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Bạn cần đăng nhập." };
  }
  if (isStaff(user.role)) redirect("/dashboard");
  try {
    await saveOnboarding({
      userId: user.id,
      fullName: String(formData.get("fullName") ?? ""),
      classId: String(formData.get("classId") ?? ""),
      teamId: String(formData.get("teamId") ?? "") || null,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.",
    };
  }
  redirect("/dashboard");
}
