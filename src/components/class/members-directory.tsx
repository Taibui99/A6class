"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Search,
  Users,
  Trophy,
  Sparkles,
  X,
  Medal,
  Flag,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { TiltCard } from "@/components/ui/tilt-card";
import type { MemberCard, MembersPageData } from "@/lib/members";

const TEAM_FALLBACK = [
  { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/40" },
  { bg: "bg-surface-2", text: "text-text-secondary", ring: "ring-border" },
  { bg: "bg-accent/15", text: "text-accent-ink", ring: "ring-accent/40" },
  { bg: "bg-danger/15", text: "text-danger", ring: "ring-danger/40" },
];

function teamTone(index: number) {
  return TEAM_FALLBACK[index % TEAM_FALLBACK.length];
}

/** Avatar viền gradient, có ảnh thật thì dùng ảnh, không thì dùng chữ cái đầu. */
function HoloAvatar({
  name,
  src,
  size = 56,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  return (
    <span
      className="vt-holo-ring grid shrink-0 place-items-center rounded-2xl p-[2px]"
      style={{ width: size, height: size }}
    >
      <span
        className="grid size-full place-items-center overflow-hidden rounded-[13px] bg-surface font-black text-text"
        style={{ fontSize: size * 0.4 }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          initials(name)
        )}
      </span>
    </span>
  );
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Số áo = thứ hạng theo điểm thi đua thật của lớp, không gán số thứ tự
 * đại hạng. Học sinh chưa có điểm đứng cuối và không hiện số áo.
 */
function rankOf(members: MemberCard[]): Map<string, number> {
  const scored = members
    .filter((m) => m.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return new Map(scored.map((m, i) => [m.id, i + 1]));
}

function MemberCard3D({
  member,
  teamIndex,
  maxScore,
  rank,
  onOpen,
}: {
  member: MemberCard;
  teamIndex: number;
  maxScore: number;
  rank: number | null;
  onOpen: () => void;
}) {
  const tone = teamTone(teamIndex);
  const ratio = member.score !== null && maxScore > 0 ? member.score / maxScore : null;

  return (
    <TiltCard className="vt-holo h-full rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={onOpen}
        className="relative flex h-full w-full flex-col items-center gap-3 overflow-hidden rounded-2xl p-5 text-center"
      >
        {/* Số áo mờ ở góc phải, kiểu thẻ cầu thủ */}
        <span
          aria-hidden
          className="vt-led pointer-events-none absolute -right-2 -top-3 text-7xl font-black opacity-[0.07]"
        >
          {rank ?? ""}
        </span>

        <span className="relative">
          <HoloAvatar name={member.fullName} src={member.avatarUrl} />

          {rank === 1 ? (
            <span
              aria-hidden
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#FFB800] text-[#1A1200] ring-2 ring-surface"
            >
              <Crown className="size-3" />
            </span>
          ) : null}
        </span>

        <div className="relative min-w-0">
          <p className="truncate text-sm font-bold text-text">{member.fullName}</p>
          <p className="mt-0.5 truncate text-[11px] text-text-muted">
            {member.roleLabel}
          </p>
        </div>

        {member.teamName ? (
          <span
            className={`relative inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            <Flag className="size-2.5" />
            {member.teamName}
          </span>
        ) : (
          <span className="relative text-[10px] text-text-muted">Chưa vào tổ</span>
        )}

        <div className="relative mt-auto w-full space-y-1.5 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Điểm
            </span>
            <span className="vt-led text-sm font-bold">
              {member.score !== null ? member.score : "—"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${ratio !== null ? Math.max(ratio * 100, 2) : 0}%` }}
            />
          </div>
        </div>
      </button>
    </TiltCard>
  );
}

export function MembersDirectory({
  data,
  scanOpen = false,
}: {
  data: MembersPageData;
  scanOpen?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [selected, setSelected] = useState<MemberCard | null>(null);
  // Mở sẵn modal quét khi vào từ nút "Quét thành viên" ở thanh trên cùng
  // (?scan=1). Khởi tạo từ prop thay vì setState trong effect — điều hướng
  // sang URL khác sẽ mount lại component nên không cần đồng bộ lại.
  const [scanning, setScanning] = useState(scanOpen);

  useEffect(() => {
    if (!selected && !scanning) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setScanning(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, scanning]);

  const officers = useMemo(
    () => data.members.filter((m) => m.role !== "STUDENT"),
    [data.members],
  );

  const students = useMemo(
    () => data.members.filter((m) => m.role === "STUDENT"),
    [data.members],
  );

  const maxScore = useMemo(
    () => data.members.reduce((max, m) => Math.max(max, m.score ?? 0), 0),
    [data.members],
  );

  const ranks = useMemo(() => rankOf(data.members), [data.members]);

  const teamIndexOf = useMemo(() => {
    const map = new Map<string, number>();
    data.teams.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [data.teams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((m) => {
      if (selectedTeam !== "ALL" && m.teamId !== selectedTeam) return false;
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.roleLabel.toLowerCase().includes(q) ||
        (m.teamName ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, search, selectedTeam]);

  const totalScore = data.members.reduce((sum, m) => sum + (m.score ?? 0), 0);
  const hasScores = data.members.some((m) => m.score !== null);

  if (data.members.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <Users className="mx-auto size-10 text-text-muted" />
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-text sm:text-2xl">Lớp chưa có thành viên</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
          Hãy thêm học sinh vào lớp ở mục Sĩ số để danh bạ hiển thị ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/30">
            <Users className="size-3.5" />
            {data.className}
            {data.schoolYear ? ` · Niên khóa ${data.schoolYear}` : ""}
          </span>

          <h1 className="vt-neon-title text-xl font-extrabold tracking-tight sm:text-2xl">
            Danh bạ Thành viên{data.teams.length > 0 ? ` & ${data.teams.length} Tổ` : ""}
          </h1>

          {data.description ? (
            <p className="max-w-2xl text-sm text-text-secondary">{data.description}</p>
          ) : (
            <p className="max-w-2xl text-sm text-text-secondary">
              {data.members.length} thành viên
              {officers.length > 0 ? `, trong đó có ${officers.length} cán sự` : ""}
              {data.periodName ? ` — kỳ thi đang chạy: ${data.periodName}` : ""}.
            </p>
          )}
        </div>

        <dl className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <dt className="text-xs font-semibold text-text-muted">Tổng thành viên</dt>
            <dd className="vt-led mt-2 text-2xl font-black">
              {data.members.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <dt className="text-xs font-semibold text-text-muted">Số tổ</dt>
            <dd className="vt-led mt-2 text-2xl font-black">{data.teams.length}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <dt className="text-xs font-semibold text-text-muted">Ban cán sự</dt>
            <dd className="vt-led mt-2 text-2xl font-black">{officers.length}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <dt className="text-xs font-semibold text-text-muted">Tổng điểm thi đua</dt>
            <dd className="vt-led mt-2 text-2xl font-black">
              {hasScores ? totalScore : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {officers.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-text">
            <Crown className="size-4 text-accent-ink" />
            Ban cán sự
          </h2>
          <div className="cv-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {officers.map((m) => {
              return (
                <TiltCard
                  key={m.id}
                  className="vt-holo rounded-2xl border border-border bg-surface"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left"
                  >
                    <HoloAvatar name={m.fullName} src={m.avatarUrl} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-text">
                        {m.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-accent-ink">
                        {m.roleLabel}
                      </p>
                      {m.teamName ? (
                        <p className="mt-0.5 truncate text-[11px] text-text-muted">
                          {m.teamName}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </TiltCard>
              );
            })}
          </div>
        </section>
      )}

      {data.teams.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-text">
            <Flag className="size-4 text-text-secondary" />
            Các tổ
          </h2>
          <div className="cv-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.teams.map((t, i) => {
              const tone = teamTone(i);
              const active = selectedTeam === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeam(active ? "ALL" : t.id)}
                  aria-pressed={active}
                  className={`rounded-2xl p-4 text-left ring-1 transition ${
                    active
                      ? `bg-surface-2 ${tone.ring}`
                      : "bg-surface ring-border hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
                    <span className="truncate">{t.name}</span>
                    <span className={`size-2.5 shrink-0 rounded-full ${tone.bg} ${tone.ring} ring-1`} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-text">
                    {t.memberCount}{" "}
                    <span className="text-xs font-medium text-text-muted">bạn</span>
                  </p>
                  {t.leaderName ? (
                    <p className="mt-1 truncate text-[11px] text-text-muted">
                      Tổ trưởng: {t.leaderName}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-text-muted">Chưa có tổ trưởng</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTeam("ALL")}
            aria-pressed={selectedTeam === "ALL"}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedTeam === "ALL"
                ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                : "text-text-secondary hover:bg-surface-hover hover:text-text"
            }`}
          >
            Tất cả ({students.length})
          </button>
          {data.teams.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTeam(t.id)}
              aria-pressed={selectedTeam === t.id}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedTeam === t.id
                  ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

<button
            type="button"
            onClick={() => setScanning(true)}
            className="vt-btn-gold inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold"
          >
            <QrCode aria-hidden className="size-3.5" />
            Quét thành viên
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, chức danh, tổ..."
              aria-label="Tìm thành viên"
              className="pl-9"
            />
          </div>
        </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Không có thành viên nào khớp bộ lọc.
        </p>
      ) : (
        <div className="cv-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <MemberCard3D
              key={m.id}
              member={m}
              teamIndex={m.teamId ? (teamIndexOf.get(m.teamId) ?? 0) : 0}
              maxScore={maxScore}
              rank={ranks.get(m.id) ?? null}
              onOpen={() => setSelected(m)}
            />
          ))}
        </div>
      )}

      {scanning && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setScanning(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vip-scan-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-2 p-6 text-white shadow-lg"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="vt-scan-line top-0" />
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h2 id="vip-scan-title" className="vt-led vt-led-neon text-lg font-bold">
                  Quét thẻ VIP
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Đưa mã QR của học sinh vào khung bên dưới để mở hồ sơ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScanning(false)}
                aria-label="Đóng"
                className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            <div className="relative mt-5 grid aspect-square place-items-center rounded-xl border border-dashed border-white/20 bg-black/30">
              <QrCode aria-hidden className="size-16 text-white/15" />
            </div>

            <button
              type="button"
              onClick={() => setScanning(false)}
              className="relative mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/5 text-xs font-bold text-white/70 ring-1 ring-white/15 transition hover:bg-white/10"
            >
              <ShieldCheck aria-hidden className="size-3.5" />
              Chọn thủ công trong danh bạ
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Hồ sơ ${selected.fullName}`}
            onClick={(e) => e.stopPropagation()}
            className="vt-holo relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-surface p-6 shadow-lg"
          >
            <span className="vt-scan-line" aria-hidden />
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Đóng"
              className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-4">
              <HoloAvatar name={selected.fullName} src={selected.avatarUrl} size={64} />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-text">
                  {selected.fullName}
                </h2>
                <p className="text-sm text-accent-ink">{selected.roleLabel}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="flex items-center gap-2 text-text-muted">
                  <Flag className="size-3.5" /> Tổ
                </dt>
                <dd className="font-bold text-text">{selected.teamName ?? "Chưa vào tổ"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <dt className="flex items-center gap-2 text-text-muted">
                  <Trophy className="size-3.5" /> Điểm thi đua
                </dt>
                <dd className="vt-led font-bold">
                  {selected.score !== null ? selected.score : "Chưa có điểm"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-text-muted">
                  <Medal className="size-3.5" /> Số ghi nhận
                </dt>
                <dd className="font-bold text-text">
                  {selected.marks !== null ? selected.marks : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
        <Sparkles className="size-3" />
        Sĩ số và điểm lấy trực tiếp từ dữ liệu lớp
      </p>
    </div>
  );
}