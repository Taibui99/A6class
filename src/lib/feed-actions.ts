"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current";
import { getUserClassId } from "@/lib/feed";

type ActionResult = { ok?: boolean; error?: string };

function fail(error: string): ActionResult {
  return { error };
}

export async function createPost(input: {
  content: string;
}): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Bạn cần đăng nhập.");
    const classId = await getUserClassId(user.id);
    if (!classId) return fail("Bạn chưa vào lớp nào.");
    const content = input.content?.trim();
    if (!content) return fail("Đừng để trống nội dung nhé.");
    if (content.length > 2000) return fail("Bài viết quá dài rồi (tối đa 2000 ký tự).");

    await prisma.post.create({ data: { classId, authorId: user.id, content } });
    revalidatePath("/feed");
    revalidatePath("/bang-dieu-khien");
    return { ok: true };
  } catch {
    return fail("Có lỗi xảy ra, thử lại nhé.");
  }
}

export async function toggleLike(postId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Bạn cần đăng nhập.");
    const classId = await getUserClassId(user.id);
    if (!classId) return fail("Bạn chưa vào lớp nào.");

    const post = await prisma.post.findFirst({
      where: { id: postId, classId },
      select: { id: true },
    });
    if (!post) return fail("Bài viết không tồn tại.");

    const existing = await prisma.reaction.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });
    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: { userId: user.id, postId, type: "LIKE" },
      });
    }

    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return fail("Có lỗi xảy ra, thử lại nhé.");
  }
}

export async function createComment(input: {
  postId: string;
  content: string;
}): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Bạn cần đăng nhập.");
    const classId = await getUserClassId(user.id);
    if (!classId) return fail("Bạn chưa vào lớp nào.");

    const post = await prisma.post.findFirst({
      where: { id: input.postId, classId },
      select: { id: true },
    });
    if (!post) return fail("Bài viết không tồn tại.");

    const content = input.content?.trim();
    if (!content) return fail("Đừng để trống bình luận nhé.");
    if (content.length > 1000) return fail("Bình luận quá dài rồi.");

    await prisma.comment.create({
      data: { postId: post.id, authorId: user.id, content },
    });
    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return fail("Có lỗi xảy ra, thử lại nhé.");
  }
}