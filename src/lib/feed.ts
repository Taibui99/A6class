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
  isPinned: boolean;
  createdAtLabel: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  comments: FeedComment[];
};

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
      isPinned: p.isPinned,
      createdAtLabel: formatRelativeTime(p.createdAt),
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