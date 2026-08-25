import { getChatGPTUser, requireChatGPTUser } from "../app/chatgpt-auth";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

async function allowedAdminEmails() {
  const { env } = await import("cloudflare:workers");
  return new Set(
    (env.CONTRIBUTION_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalize)
      .filter(Boolean),
  );
}

export async function isContributionAdmin(email: string) {
  return (await allowedAdminEmails()).has(normalize(email));
}

export async function getContributionAdmin() {
  const user = await getChatGPTUser();
  if (!user || !(await isContributionAdmin(user.email))) return null;
  return user;
}

export async function requireContributionAdmin(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  if (!(await isContributionAdmin(user.email))) return null;
  return user;
}
