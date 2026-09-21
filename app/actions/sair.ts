"use server";

import { signOut } from "@/lib/auth";

// Encerra a sessão no banco e volta pro login.
export async function sair() {
  await signOut({ redirectTo: "/login" });
}
