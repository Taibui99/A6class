export type UploadedVideo = { name: string; path: string; size: number };

const OK_EXT = /\.(mp4|webm|mov|m4v)$/i;

export function isVideoFile(f: File): boolean {
  return f.type.startsWith("video/") || OK_EXT.test(f.name);
}

export function titleFromFileName(name: string): string {
  return name
    .replace(OK_EXT, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Tải 1 file lên API local → ghi vào public/videos/ (chỉ chạy khi bạn mở dev ở máy mình). */
export async function uploadVideo(
  file: File,
): Promise<{ ok: true; video: UploadedVideo } | { ok: false; error: string }> {
  const fd = new FormData();
  fd.append("files", file, file.name);
  let res: Response;
  try {
    res = await fetch("/api/minigame-20-10/videos", { method: "POST", body: fd });
  } catch {
    return { ok: false, error: "Không kết nối được tới máy chủ local." };
  }
  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; saved?: { name: string; path: string }[]; error?: string }
    | null;
  const saved = json?.saved?.[0];
  if (!res.ok || !json?.ok || !saved) {
    return { ok: false, error: json?.error ?? `Lỗi ${res.status}` };
  }
  return { ok: true, video: { ...saved, size: file.size } };
}
