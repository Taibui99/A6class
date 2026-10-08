import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";

export type FeedComment = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAtLabel: string;
};

export type FeedPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "TEACHER" | "STUDENT";
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  createdAtLabel: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  comments: FeedComment[];
};

/**
 * Timestamp ngữ cảnh cho bài đăng (§5.3):
 * <1h "8 phút" · hôm nay "18:40" · hôm qua "Hôm qua, 18:40" · cũ "05/10 · 18:40".
 */
export function formatPostTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const sameDay = d.toDateString() === now.toDateString();
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return "vừa xong";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} phút`;
  if (sameDay) return hhmm;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hôm qua, ${hhmm}`;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm} · ${hhmm}`;
}

export async function getUserClassId(userId: string): Promise<string | null> {
  const membership = await prisma.classMembership.findFirst({
    where: { userId },
    select: { classId: true },
  });
  return membership?.classId ?? null;
}

export async function getClassName(classId: string): Promise<string | null> {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { name: true },
  });
  return cls?.name ?? null;
}

export async function getFeed(
  userId: string,
  classId: string
): Promise<FeedPost[]> {
  try {
    const [posts, myReactions] = await Promise.all([
      prisma.post.findMany({
        where: { classId },
        include: {
          author: { select: { id: true, fullName: true, role: true } },
          comments: {
            include: { author: { select: { id: true, fullName: true } } },
            orderBy: { createdAt: "asc" },
            take: 5,
          },
          _count: { select: { reactions: true, comments: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      }),
      prisma.reaction.findMany({
        where: { userId, postId: { not: null } },
        select: { postId: true },
      }),
    ]);

    const likedIds = new Set(myReactions.map((r) => r.postId));

    return posts.map((p) => ({
      id: p.id,
      authorId: p.author.id,
      authorName: p.author.fullName,
      authorRole: p.author.role,
      content: p.content,
      imageUrls: p.imageUrls,
      isPinned: p.isPinned,
      createdAtLabel: formatPostTime(p.createdAt),
      likeCount: p._count.reactions,
      likedByMe: likedIds.has(p.id),
      commentCount: p._count.comments,
      comments: p.comments.map((c) => ({
        id: c.id,
        authorId: c.author.id,
        authorName: c.author.fullName,
        content: c.content,
        createdAtLabel: formatRelativeTime(c.createdAt),
      })),
    }));
  } catch {
    return [];
  }
}