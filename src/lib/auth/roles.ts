/**
 * Vai trò quản trị: giáo viên + admin hệ thống.
 * Mọi gate "chỉ giáo viên" đều dùng isStaff() để admin đi qua —
 * module thuần, dùng được cả client lẫn server.
 */
export function isStaff(role: string | null | undefined): boolean {
  return role === "TEACHER" || role === "ADMIN";
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN";
}
