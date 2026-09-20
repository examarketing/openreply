import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { createInstagramContext } from "@/lib/instagram/provider";
import { getUserProfile, type InstagramUserProfile } from "@/lib/meta/client";

// Cache curto em memória: a URL da foto expira, e a Meta limita chamadas.
const cache = new Map<string, { at: number; value: InstagramUserProfile | null }>();
const TTL_MS = 30 * 60 * 1000;

/**
 * GET /api/instagram/profiles?ids=a,b,c[&instagramAccountId=…]
 * Devolve { [id]: { username, name, profile_pic, … } } para até 30 pessoas.
 */
export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (ids.length === 0) {
    return NextResponse.json({ success: true, data: {} });
  }
  const account = await getWorkspaceInstagramAccount(
    workspaceId,
    request.nextUrl.searchParams.get("instagramAccountId")
  );
  if (!account || account.provider !== "META") {
    return NextResponse.json({ success: true, data: {} });
  }
  const context = await createInstagramContext(account);
  if (context.provider !== "META") {
    return NextResponse.json({ success: true, data: {} });
  }
  const now = Date.now();
  const out: Record<string, InstagramUserProfile | null> = {};
  await Promise.all(
    ids.map(async (id) => {
      const key = `${account.id}:${id}`;
      const hit = cache.get(key);
      if (hit && now - hit.at < TTL_MS) {
        out[id] = hit.value;
        return;
      }
      const value = await getUserProfile(context.accessToken, id);
      cache.set(key, { at: now, value });
      out[id] = value;
    })
  );
  return NextResponse.json({ success: true, data: out });
}
