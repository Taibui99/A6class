export const COMPETITION_CLASS = {
  name: "12A6",
  schoolYear: "2026-2027",
} as const;

export type MemberRoleTag =
  | "TT" // Tổ trưởng
  | "PHT" // Phó học tập
  | "TQ" // Thủ quỹ
  | "LT"; // Lớp trưởng

export type RosterStudent = {
  name: string;
  team: string;
  role?: MemberRoleTag;
};

/** Danh sách chép từ file Excel "Theo dõi thi đua hàng tuần lớp 12A6 (2026-2027)".
 *  Tổ 1: 10 em · Tổ 2: 10 em · Tổ 3: 9 em · Tổ 4: 7 em = 36 em.
 *  Chữ trong ngoặc là chức vụ ghi trong file Excel. */
export const ROSTER: RosterStudent[] = [
  // ── Tổ 1 ────────────────────────────────────────────────
  { name: "Yến Nhi", team: "Tổ 1" },
  { name: "Gia Kha", team: "Tổ 1" },
  { name: "Tấn Phát", team: "Tổ 1" },
  { name: "Quốc Hiệp", team: "Tổ 1" },
  { name: "Uyên Như", team: "Tổ 1" },
  { name: "Gia Kỳ", team: "Tổ 1" },
  { name: "Kim Ngân", team: "Tổ 1", role: "PHT" },
  { name: "Duy Khang", team: "Tổ 1" },
  { name: "Minh Hào", team: "Tổ 1" },
  { name: "Cát Tiên", team: "Tổ 1", role: "TT" },

  // ── Tổ 2 ────────────────────────────────────────────────
  { name: "Trọng Ân", team: "Tổ 2" },
  { name: "Hoàng Anh", team: "Tổ 2" },
  { name: "Bảo Ngọc", team: "Tổ 2" },
  { name: "Ngọc Hoài", team: "Tổ 2" },
  { name: "Bảo Vi", team: "Tổ 2" },
  { name: "Tường Vy", team: "Tổ 2", role: "TQ" },
  { name: "Mạnh Thương", team: "Tổ 2" },
  { name: "Thành Danh", team: "Tổ 2" },
  { name: "Phương Thảo", team: "Tổ 2", role: "LT" },
  { name: "Quốc Huy", team: "Tổ 2", role: "TT" },

  // ── Tổ 3 ────────────────────────────────────────────────
  { name: "Ngọc Hảo", team: "Tổ 3" },
  { name: "Ngọc Diệu", team: "Tổ 3" },
  { name: "Hà My", team: "Tổ 3" },
  { name: "Thảo Ngân", team: "Tổ 3" },
  { name: "Kim Hoa", team: "Tổ 3" },
  { name: "Gia Hân", team: "Tổ 3" },
  { name: "Nguyên Vũ", team: "Tổ 3" },
  { name: "Gia Bảo", team: "Tổ 3" },
  { name: "Hữu Tài", team: "Tổ 3", role: "TT" },

  // ── Tổ 4 ────────────────────────────────────────────────
  { name: "Trọng Đức", team: "Tổ 4" },
  { name: "Mỹ Duyên", team: "Tổ 4" },
  { name: "Ngọc Như", team: "Tổ 4" },
  { name: "Phương Trâm", team: "Tổ 4" },
  { name: "Ngọc Trâm", team: "Tổ 4" },
  { name: "Anh Thư", team: "Tổ 4" },
  { name: "Trâm Anh", team: "Tổ 4", role: "TT" },
];

export const TEAM_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"] as const;

/** Chuẩn hoá tên: bỏ khoảng trắng thừa ở đầu/cuối và gộp khoảng trắng bên trong.
 *  File Excel có vài tên bị thừa khoảng trắng ở cuối. */
export function normalizeName(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tách chức vụ trong ngoặc ra khỏi tên, ví dụ "Kim Ngân (PHT)". */
export function splitRole(raw: string): { name: string; role?: MemberRoleTag } {
  const m = /\(([^)]*)\)\s*$/.exec(raw.trim());
  const tag = m?.[1]?.trim().toUpperCase();
  const role =
    tag === "TT" || tag === "PHT" || tag === "TQ" || tag === "LT"
      ? tag
      : undefined;
  return { name: normalizeName(raw), role };
}

export const ROLE_LABELS: Record<MemberRoleTag, string> = {
  TT: "Tổ trưởng",
  PHT: "Phó học tập",
  TQ: "Thủ quỹ",
  LT: "Lớp trưởng",
};

// ============================================
// TIÊU CHÍ CHẤM ĐIỂM
// Bám sát cột C-AN của bảng Excel: 3 nhóm cộng + 16 nhóm trừ = 19 nhóm cột.
// Mỗi nhóm sinh ra một hoặc nhiều Criterion trong DB.
// "Điểm tốt" tách thành 4 mức vì mỗi con điểm 7/8/9/10 cộng một mức khác nhau.
// ============================================

export type CriterionKind = "POSITIVE" | "NEGATIVE";

export type CriterionDef = {
  key: string;
  label: string;
  /** Điểm mặc định (số dương, là mức phạt nếu kind = NEGATIVE). Giáo viên sửa được. */
  defaultPoints: number;
};

export type CriterionGroupDef = {
  key: string;
  label: string;
  kind: CriterionKind;
  /** COUNT = nhập "số lần" · GRADE = chọn con điểm 7/8/9/10 */
  input: "COUNT" | "GRADE";
  criteria: CriterionDef[];
};

export const CRITERION_GROUPS: CriterionGroupDef[] = [
  // ── Nhóm điểm cộng (3 nhóm) ─────────────────────────────────
  {
    key: "PHAT_BIEU",
    label: "Phát biểu, xung phong lên bảng làm bài tập",
    kind: "POSITIVE",
    input: "COUNT",
    criteria: [{ key: "PHAT_BIEU", label: "Phát biểu, xung phong", defaultPoints: 1 }],
  },
  {
    key: "DIEM_TOT",
    label: "Điểm tốt kiểm tra thường xuyên (7, 8, 9, 10)",
    kind: "POSITIVE",
    input: "GRADE",
    criteria: [
      { key: "DIEM_7", label: "Điểm 7", defaultPoints: 1 },
      { key: "DIEM_8", label: "Điểm 8", defaultPoints: 2 },
      { key: "DIEM_9", label: "Điểm 9", defaultPoints: 3 },
      { key: "DIEM_10", label: "Điểm 10", defaultPoints: 4 },
    ],
  },
  {
    key: "CHU_DONG",
    label: "Chủ động, trách nhiệm, tham gia, nhận nhiệm vụ",
    kind: "POSITIVE",
    input: "COUNT",
    criteria: [{ key: "CHU_DONG", label: "Chủ động, nhận nhiệm vụ", defaultPoints: 1 }],
  },

  // ── Nhóm điểm trừ (16 nhóm) ─────────────────────────────────
  {
    key: "KHONG_HOAN_THANH",
    label: "Không hoàn thành nhiệm vụ học tập, nhiệm vụ khác",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "KHONG_HOAN_THANH", label: "Không hoàn thành nhiệm vụ", defaultPoints: 2 }],
  },
  {
    key: "NOI_CHUYEN",
    label: "Nói chuyện, tự ý đổi chỗ ngồi",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "NOI_CHUYEN", label: "Nói chuyện, tự ý đổi chỗ", defaultPoints: 2 }],
  },
  {
    key: "VE_GIUA_BUOI",
    label: "Về giữa buổi có phép, vào tiết trễ",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "VE_GIUA_BUOI", label: "Về giữa buổi, vào tiết trễ", defaultPoints: 1 }],
  },
  {
    key: "HOOC_TRONH",
    label: "Đi học trễ, vắng học có phép",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "HOOC_TRONH", label: "Đi học trễ, vắng có phép", defaultPoints: 1 }],
  },
  {
    key: "VANG_KHONG_PHEP",
    label: "Vắng học không phép",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "VANG_KHONG_PHEP", label: "Vắng không phép", defaultPoints: 5 }],
  },
  {
    key: "TAC_PHONG",
    label: "Vi phạm tác phong (sai đồng phục, giày dép, phù hiệu)",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "TAC_PHONG", label: "Sai tác phong, đồng phục", defaultPoints: 2 }],
  },
  {
    key: "CHAO_COA",
    label: "Tập trung chậm giờ chào cờ (sau 6h55)",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "CHAO_COA", label: "Tập trung chậm giờ chào cờ", defaultPoints: 1 }],
  },
  {
    key: "THUC_AN",
    label: "Mang thức ăn, nước uống có màu vào lớp, chất cấm",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "THUC_AN", label: "Mang thức ăn, chất cấm", defaultPoints: 2 }],
  },
  {
    key: "LOI_TAP_THE",
    label: "Ngồi lên bàn, lan can; nói tục, chửi thề, xúc phạm bạn",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "LOI_TAP_THE", label: "Lỗi tác phẻ tập thể", defaultPoints: 3 }],
  },
  {
    key: "GAY_GO",
    label: "Gây gổ, đánh nhau (trong và ngoài nhà trường)",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "GAY_GO", label: "Gây gổ, đánh nhau", defaultPoints: 5 }],
  },
  {
    key: "KHONG_MANG_SACH",
    label: "Không mang sách vở khi đến lớp",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "KHONG_MANG_SACH", label: "Không mang sách vở", defaultPoints: 1 }],
  },
  {
    key: "XA_RAC",
    label: "Xả rác bừa bãi",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "XA_RAC", label: "Xả rác bừa bãi", defaultPoints: 1 }],
  },
  {
    key: "HINH_THUC",
    label: "Nhuộm tóc, kẻ tóc, sơn móng, trang điểm, xỏ khuyên tai, xăm mình",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "HINH_THUC", label: "Vi phạm hình thức", defaultPoints: 2 }],
  },
  {
    key: "DIEN_THOAI",
    label: "Sử dụng điện thoại trong giờ học khi giáo viên chưa cho phép",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "DIEN_THOAI", label: "Dùng điện thoại khi chưa được phép", defaultPoints: 3 }],
  },
  {
    key: "QUY_CHE_KIEM_TRA",
    label: "Vi phạm quy chế kiểm tra, thi cử",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "QUY_CHE_KIEM_TRA", label: "Vi phạm quy chế kiểm tra", defaultPoints: 3 }],
  },
  {
    key: "TRUOM_CAP",
    label: "Trộm cắp, phá hoại tài sản, đánh bài, hút thuốc",
    kind: "NEGATIVE",
    input: "COUNT",
    criteria: [{ key: "TRUOM_CAP", label: "Trộm cắp, phá hoại, hút thuốc", defaultPoints: 5 }],
  },
];

/** Danh sách phẳng 22 tiêu chí để seed DB. */
export const ALL_CRITERIA: (CriterionDef & {
  kind: CriterionKind;
  sortOrder: number;
})[] = CRITERION_GROUPS.flatMap((g, gi) =>
  g.criteria.map((c, ci) => ({
    ...c,
    kind: g.kind,
    sortOrder: gi * 100 + ci,
  })),
);

/** Điểm có dấu của một tiêu chí: POSITIVE = +points, NEGATIVE = −points. */
export function signedPoints(points: number, kind: CriterionKind): number {
  return kind === "NEGATIVE" ? -Math.abs(points) : Math.abs(points);
}

// ============================================
// XẾP LOẠI
// Dựa trên tổng điểm ròng của tuần (điểm tốt − điểm trừ).
// Đây là ngưỡng mặc định — file Excel gốc không ghi công thức,
// giáo viên chỉnh trực tiếp ở đây nếu muốn đổi.
// ============================================

export type GradeTier = {
  min: number;
  label: string;
  tone: string;
};

export const GRADE_TIERS: GradeTier[] = [
  { min: 20, label: "Xuất sắc", tone: "text-amber-300" },
  { min: 12, label: "Tốt", tone: "text-emerald-300" },
  { min: 6, label: "Khá", tone: "text-sky-300" },
  { min: 1, label: "Trung bình", tone: "text-slate-300" },
  { min: Number.NEGATIVE_INFINITY, label: "Yếu", tone: "text-rose-300" },
];

export function gradeTier(net: number): GradeTier {
  return GRADE_TIERS.find((t) => net >= t.min) ?? GRADE_TIERS[GRADE_TIERS.length - 1];
}