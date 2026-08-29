import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLASS_NAME = "Lớp 12A6";
const TEACHER_EMAIL = "gv12a6@a6class.test";

const classmates = [
  { email: "an12a6@a6class.test", name: "Nguyễn Văn An" },
  { email: "bich12a6@a6class.test", name: "Trần Thị Bích" },
  { email: "chau12a6@a6class.test", name: "Lê Minh Châu" },
  { email: "khoa12a6@a6class.test", name: "Phạm Đăng Khoa" },
  { email: "ha12a6@a6class.test", name: "Vũ Thu Hà" },
  { email: "manh12a6@a6class.test", name: "Hoàng Đức Mạnh" },
  { email: "trang12a6@a6class.test", name: "Đỗ Quỳnh Trang" },
  { email: "thu12a6@a6class.test", name: "Bùi Anh Thư" },
];

function dayFromNow(days, hour = 8) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const teacher = await prisma.user.upsert({
    where: { email: TEACHER_EMAIL },
    update: { fullName: "Cô Mai Anh", role: "TEACHER", status: "ACTIVE" },
    create: { email: TEACHER_EMAIL, fullName: "Cô Mai Anh", role: "TEACHER" },
  });

  const users = await Promise.all(
    classmates.map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: { fullName: c.name, role: "STUDENT", status: "ACTIVE" },
        create: { email: c.email, fullName: c.name, role: "STUDENT" },
      })
    )
  );

  let cls = await prisma.class.findFirst({ where: { name: CLASS_NAME } });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        name: CLASS_NAME,
        schoolYear: "2026-2027",
        school: "THPT Tạ Quang Bửu",
        description: "Ngôi nhà chung của lớp 12A6 năm học 2026-2027.",
      },
    });
  }
  const classId = cls.id;

  const teamsData = [
    { name: "Tổ 1", color: "#e11d48" },
    { name: "Tổ 2", color: "#2563eb" },
    { name: "Tổ 3", color: "#16a34a" },
    { name: "Tổ 4", color: "#d97706" },
  ];
  const teams = [];
  for (let i = 0; i < teamsData.length; i++) {
    let team = await prisma.team.findFirst({
      where: { classId, name: teamsData[i].name },
    });
    if (!team) {
      team = await prisma.team.create({
        data: { classId, name: teamsData[i].name, color: teamsData[i].color },
      });
    }
    team = await prisma.team.update({
      where: { id: team.id },
      data: { totalScore: 40 - i * 5, rank: i + 1 },
    });
    teams.push(team);
  }

  const upsertMembership = (userId, role, teamId = null) =>
    prisma.classMembership.upsert({
      where: { userId_classId: { userId, classId } },
      update: { role, teamId },
      create: { userId, classId, role, teamId },
    });

  const memberships = [upsertMembership(teacher.id, "CLASS_MONITOR")];
  users.forEach((u, i) =>
    memberships.push(upsertMembership(u.id, "STUDENT", teams[i % 4].id))
  );
  await Promise.all(memberships);

  for (let t = 0; t < teams.length; t++) {
    const members = users.filter((_, i) => i % 4 === t);
    await prisma.team.update({
      where: { id: teams[t].id },
      data: { leaderId: members[0]?.id, viceLeaderId: members[1]?.id },
    });
  }

  const announcementsDemo = [
    {
      title: "Khai giảng năm học 2026-2027",
      content:
        "Chào mừng cả lớp đến năm học cuối cấp! Lịch khai giảng 8h sáng thứ Hai, có mặt đầy đủ nhé.",
      priority: "HIGH",
      isPinned: true,
    },
    {
      title: "Kế hoạch thi đua tháng 9",
      content:
        "Mỗi tổ đăng ký một phong trào nhỏ cho tháng 9. Bí thư lớp tổng hợp trước thứ Sáu.",
      priority: "NORMAL",
      isPinned: false,
    },
  ];
  for (const a of announcementsDemo) {
    const exists = await prisma.announcement.findFirst({
      where: { classId, title: a.title },
    });
    if (!exists) {
      await prisma.announcement.create({
        data: { classId, authorId: teacher.id, ...a },
      });
    }
  }

  const tasksDemo = [
    {
      title: "Rà soát danh sách lớp 12A6",
      description: "Kiểm tra lại sĩ số và thông tin cá nhân.",
      deadline: dayFromNow(2),
      priority: "HIGH",
      points: 10,
    },
    {
      title: "Chuẩn bị sơ kết tuần đầu",
      description: "Tổng hợp điểm số và nhận xét từng tổ.",
      deadline: dayFromNow(5),
      priority: "MEDIUM",
      points: 5,
    },
  ];
  for (const t of tasksDemo) {
    const existing = await prisma.task.findFirst({
      where: { classId, title: t.title },
    });
    if (existing) continue;
    const task = await prisma.task.create({
      data: {
        classId,
        creatorId: teacher.id,
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        priority: t.priority,
        points: t.points,
        assigneeType: "INDIVIDUAL",
      },
    });
    await prisma.taskAssignment.upsert({
      where: { taskId_userId: { taskId: task.id, userId: teacher.id } },
      update: {},
      create: { taskId: task.id, userId: teacher.id },
    });
  }

  const pointsDemo = [
    { amount: 10, reason: "Hoàn thành báo cáo tuần 1" },
    { amount: 5, reason: "Chuẩn bị tiết sinh hoạt lớp" },
  ];
  for (const p of pointsDemo) {
    const exists = await prisma.pointTransaction.findFirst({
      where: {
        classId,
        targetUserId: teacher.id,
        amount: p.amount,
        reason: p.reason,
      },
    });
    if (!exists) {
      await prisma.pointTransaction.create({
        data: {
          classId,
          targetUserId: teacher.id,
          amount: p.amount,
          reason: p.reason,
          giverId: teacher.id,
        },
      });
    }
  }

  console.log("Seeded:", {
    classId,
    className: CLASS_NAME,
    teacher: TEACHER_EMAIL,
    members: 1 + users.length,
    teams: teams.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());