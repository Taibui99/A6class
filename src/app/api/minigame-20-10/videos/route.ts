import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MAX_FILES = 60;
const MAX_SIZE = 500 * 1024 * 1024;
const ALLOWED = /\.(mp4|webm|mov|m4v)$/i;

type Saved = { name: string; path: string };

function safeName(raw: string): string {
  const base = (raw.split(/[\\/]/).pop() ?? "video.mp4").trim();
  const cleaned = base
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "-")
    .replace(/^[.\-_]+/, "")
    .slice(0, 90);
  return cleaned || "video.mp4";
}

/* Nhận file video từ máy đang chạy local và ghi thẳng vào public/videos/ để cả lớp cùng xem. */
export async function POST(req: Request) {
  if (process.env.VERCEL) {
    return Response.json(
      { ok: false, error: "Chỉ up được khi mở bản local (npm run dev) ở máy của bạn." },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ ok: false, error: "Không có file nào." }, { status: 400 });
  if (files.length > MAX_FILES) {
    return Response.json({ ok: false, error: `Mỗi lần tối đa ${MAX_FILES} file.` }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "videos");
  await mkdir(dir, { recursive: true });

  const saved: Saved[] = [];
  const skipped: string[] = [];

  for (const f of files) {
    const name = safeName(f.name);
    if (!ALLOWED.test(name)) {
      skipped.push(`${f.name} — không phải .mp4/.webm/.mov/.m4v`);
      continue;
    }
    if (f.size > MAX_SIZE) {
      skipped.push(`${f.name} — quá 500MB`);
      continue;
    }
    try {
      const buf = Buffer.from(await f.arrayBuffer());
      await writeFile(path.join(dir, name), buf);
      saved.push({ name, path: `/videos/${encodeURIComponent(name).replace(/%2F/g, "/")}` });
    } catch {
      skipped.push(`${f.name} — ghi file lỗi`);
    }
  }

  if (!saved.length) {
    return Response.json(
      { ok: false, error: skipped.length ? `Không file nào hợp lệ. ${skipped[0]}` : "Không lưu được file." },
      { status: 400 },
    );
  }

  return Response.json({ ok: true, saved, skipped });
}
