import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import {
  calculateCtr,
  normalizeTopKeywords,
  summarizeDmStatuses,
} from "@/lib/tracking/analytics";

export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = await getCurrentUserId();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? 7);
  const periodDays = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
  const periodStart = new Date(todayStart);
  periodStart.setDate(periodStart.getDate() - (periodDays - 1));
  const requestedInstagramAccountId =
    request.nextUrl.searchParams.get("instagramAccountId");
  const selectedAccountId =
    requestedInstagramAccountId && requestedInstagramAccountId !== "all"
      ? requestedInstagramAccountId
      : null;
  const accountFilter = selectedAccountId
    ? { instagramAccountId: selectedAccountId }
    : {};

  const [
    workspace,
    instagramAccount,
    instagramAccounts,
    totalAutomations,
    activeAutomations,
    dmsSentToday,
    dmsSentWeek,
    dmsSentMonth,
    totalDMs,
    dmStatusCountsThisMonth,
    clicksThisMonth,
    totalClicks,
    topKeywordRows,
    recentLogs,
    user,
    contactRows,
  ] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        name: true,
        dmsSentThisPeriod: true,
      },
    }),
    prisma.instagramAccount.findFirst({
      where: { workspaceId },
      orderBy: { connectedAt: "desc" },
      select: {
        id: true,
        username: true,
        instagramId: true,
        provider: true,
        tokenExpiresAt: true,
        webhookSubscribed: true,
      },
    }),
    prisma.instagramAccount.findMany({
      where: { workspaceId },
      orderBy: { connectedAt: "desc" },
      select: {
        id: true,
        username: true,
        instagramId: true,
        name: true,
        provider: true,
        tokenExpiresAt: true,
        webhookSubscribed: true,
      },
    }),
    prisma.automation.count({ where: { workspaceId, ...accountFilter } }),
    prisma.automation.count({
      where: { workspaceId, isActive: true, ...accountFilter },
    }),
    prisma.dmLog.count({
      where: {
        workspaceId,
        status: "SENT",
        createdAt: { gte: todayStart },
        ...accountFilter,
      },
    }),
    prisma.dmLog.count({
      where: {
        workspaceId,
        status: "SENT",
        createdAt: { gte: weekStart },
        ...accountFilter,
      },
    }),
    prisma.dmLog.count({
      where: {
        workspaceId,
        status: "SENT",
        createdAt: { gte: monthStart },
        ...accountFilter,
      },
    }),
    prisma.dmLog.count({
      where: { workspaceId, status: "SENT", ...accountFilter },
    }),
    prisma.dmLog.groupBy({
      by: ["status"],
      where: { workspaceId, createdAt: { gte: monthStart }, ...accountFilter },
      _count: { _all: true },
    }),
    prisma.linkClick.count({
      where: { workspaceId, createdAt: { gte: monthStart }, ...accountFilter },
    }),
    prisma.linkClick.count({ where: { workspaceId, ...accountFilter } }),
    prisma.dmLog.groupBy({
      by: ["matchedKeyword"],
      where: { workspaceId, matchedKeyword: { not: null }, ...accountFilter },
      _count: { _all: true },
    }),
    prisma.dmLog.findMany({
      where: { workspaceId, ...accountFilter },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        automation: { select: { name: true } },
        instagramAccount: { select: { username: true } },
      },
    }),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        })
      : Promise.resolve(null),
    // Distinct people who have interacted, counted as "contacts".
    prisma.dmLog.findMany({
      where: { workspaceId, ...accountFilter },
      distinct: ["commenterId"],
      select: { commenterId: true },
    }),
  ]);

  // ── Período selecionado (7/30/90 dias): série diária, funil, status e por automação
  const [periodLogs, periodClicks, automationNames] = await Promise.all([
    prisma.dmLog.findMany({
      where: { workspaceId, createdAt: { gte: periodStart }, ...accountFilter },
      select: { createdAt: true, status: true, automationId: true, commenterId: true },
    }),
    prisma.linkClick.findMany({
      where: { workspaceId, createdAt: { gte: periodStart }, ...accountFilter },
      select: { createdAt: true, automationId: true },
    }),
    prisma.automation.findMany({
      where: { workspaceId, ...accountFilter },
      select: { id: true, name: true, isActive: true, instagramAccount: { select: { username: true } } },
    }),
  ]);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const seriesMap = new Map<string, { date: string; comentarios: number; enviadas: number; cliques: number }>();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    seriesMap.set(dayKey(d), {
      date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      comentarios: 0,
      enviadas: 0,
      cliques: 0,
    });
  }
  const statusBreakdown: Record<string, number> = {};
  const perAutomationMap = new Map<string, { comentarios: number; enviadas: number; cliques: number; pessoas: Set<string> }>();
  const uniquePeople = new Set<string>();
  for (const log of periodLogs) {
    const bucket = seriesMap.get(dayKey(new Date(log.createdAt)));
    if (bucket) {
      bucket.comentarios += 1;
      if (log.status === "SENT") bucket.enviadas += 1;
    }
    statusBreakdown[log.status] = (statusBreakdown[log.status] ?? 0) + 1;
    uniquePeople.add(log.commenterId);
    const pa = perAutomationMap.get(log.automationId) ?? { comentarios: 0, enviadas: 0, cliques: 0, pessoas: new Set<string>() };
    pa.comentarios += 1;
    if (log.status === "SENT") pa.enviadas += 1;
    pa.pessoas.add(log.commenterId);
    perAutomationMap.set(log.automationId, pa);
  }
  for (const click of periodClicks) {
    const bucket = seriesMap.get(dayKey(new Date(click.createdAt)));
    if (bucket) bucket.cliques += 1;
    const pa = perAutomationMap.get(click.automationId) ?? { comentarios: 0, enviadas: 0, cliques: 0, pessoas: new Set<string>() };
    pa.cliques += 1;
    perAutomationMap.set(click.automationId, pa);
  }
  const periodSent = periodLogs.filter((l) => l.status === "SENT").length;
  const periodMatched = periodLogs.filter((l) => l.status !== "SKIPPED_NO_MATCH").length;
  const period = {
    days: periodDays,
    series: Array.from(seriesMap.values()),
    funnel: {
      comentarios: periodLogs.length,
      comPalavra: periodMatched,
      enviadas: periodSent,
      cliques: periodClicks.length,
      pessoas: uniquePeople.size,
    },
    ctr: calculateCtr(periodClicks.length, periodSent),
    statusBreakdown,
    perAutomation: automationNames
      .map((a) => {
        const pa = perAutomationMap.get(a.id);
        return {
          id: a.id,
          name: a.name,
          isActive: a.isActive,
          username: a.instagramAccount?.username ?? "",
          comentarios: pa?.comentarios ?? 0,
          enviadas: pa?.enviadas ?? 0,
          cliques: pa?.cliques ?? 0,
          pessoas: pa?.pessoas.size ?? 0,
          ctr: calculateCtr(pa?.cliques ?? 0, pa?.enviadas ?? 0),
        };
      })
      .sort((x, y) => y.enviadas - x.enviadas || y.comentarios - x.comentarios),
  };

  const dailyDMs: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await prisma.dmLog.count({
      where: {
        workspaceId,
        status: "SENT",
        createdAt: { gte: dayStart, lt: dayEnd },
        ...accountFilter,
      },
    });

    dailyDMs.push({
      date: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }),
      count,
    });
  }

  const monthlyStatusSummary = summarizeDmStatuses(
    dmStatusCountsThisMonth.map((row) => ({
      status: row.status,
      _count: row._count._all,
    }))
  );
  const topKeywords = normalizeTopKeywords(
    topKeywordRows.map((row) => ({
      matchedKeyword: row.matchedKeyword,
      _count: row._count._all,
    }))
  );

  const firstName =
    user?.name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    null;

  return NextResponse.json({
    success: true,
    data: {
      userName: firstName,
      contactsCount: contactRows.length,
      workspace,
      instagramAccount,
      instagramAccounts,
      selectedInstagramAccountId: selectedAccountId,
      totalAutomations,
      activeAutomations,
      dmsSentToday,
      dmsSentWeek,
      dmsSentMonth,
      dmsSkippedMonth: monthlyStatusSummary.skipped,
      dmsFailedMonth: monthlyStatusSummary.failed,
      totalDMs,
      clicksThisMonth,
      totalClicks,
      ctrThisMonth: calculateCtr(clicksThisMonth, dmsSentMonth),
      topKeywords,
      dailyDMs,
      recentLogs,
      period,
    },
  });
}
