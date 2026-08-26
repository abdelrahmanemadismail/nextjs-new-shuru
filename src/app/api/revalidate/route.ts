import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GLOBAL_SETTINGS_TAG } from "@/strapi/global";
import { HEADER_SETTINGS_TAG } from "@/strapi/header";
import { FOOTER_SETTINGS_TAG } from "@/strapi/footer";
import { HOME_TAG, TESTIMONIALS_TAG } from "@/strapi/home";
import { EXPERTS_PAGE_TAG } from "@/strapi/experts-page";
import { COMPANY_PROFILE_PAGE_TAG } from "@/strapi/company-profile-page";
import { REQUEST_INFO_PAGE_TAG } from "@/strapi/request-info-page";
import { CONTACT_PAGE_TAG } from "@/strapi/contact-page";
import { PAGE_TAG } from "@/strapi/page";

// Complete list of all application cache tags to purge on every change
const ALL_TAGS = [
  HEADER_SETTINGS_TAG,
  FOOTER_SETTINGS_TAG,
  GLOBAL_SETTINGS_TAG,
  HOME_TAG,
  TESTIMONIALS_TAG,
  EXPERTS_PAGE_TAG,
  "experts",
  COMPANY_PROFILE_PAGE_TAG,
  REQUEST_INFO_PAGE_TAG,
  CONTACT_PAGE_TAG,
  "services",
  "articles",
  "author",
  "categories",
  "news-items",
  "magazine-issues",
  "majlises",
  "podcasts",
  "insights",
  PAGE_TAG,
];

function safeRevalidateTag(tag: string) {
  try {
    (revalidateTag as any)(tag, "default");
  } catch {
    try {
      (revalidateTag as any)(tag);
    } catch (err) {
      console.error(`[Revalidation] Error revalidating tag ${tag}:`, err);
    }
  }
}

function verifySecret(request: NextRequest, bodySecret?: string): boolean {
  const expectedSecret = process.env.STRAPI_REVALIDATE_SECRET || "secret";

  const secretFromHeader =
    request.headers.get("x-revalidate-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const secretFromQuery = request.nextUrl.searchParams.get("secret");

  const providedSecret = secretFromHeader || secretFromQuery || bodySecret;

  return Boolean(providedSecret && providedSecret === expectedSecret);
}

async function handleRevalidation(request: NextRequest, isGet = false) {
  let body: Record<string, any> = {};

  if (!isGet) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  if (!verifySecret(request, body.secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const model = (
    request.nextUrl.searchParams.get("model") ||
    body.model ||
    body.event?.split(".")?.[0] ||
    ""
  ).toLowerCase();

  const explicitTag = request.nextUrl.searchParams.get("tag") || body.tag;
  const explicitPath = request.nextUrl.searchParams.get("path") || body.path;

  const revalidatedTags: string[] = [];
  const revalidatedPaths: string[] = [];

  // 1. Revalidate ALL application cache tags
  for (const tag of ALL_TAGS) {
    safeRevalidateTag(tag);
    revalidatedTags.push(tag);
  }

  // 2. Revalidate explicit tag if any additional one is provided
  if (explicitTag && !revalidatedTags.includes(explicitTag)) {
    safeRevalidateTag(explicitTag);
    revalidatedTags.push(explicitTag);
  }

  // 3. Revalidate entire site layout and routes
  try {
    revalidatePath("/", "layout");
    revalidatePath("/[locale]", "layout");
    revalidatedPaths.push("/", "/[locale]");
  } catch (err) {
    console.error(`[Revalidation] Error revalidating layout paths:`, err);
  }

  // 4. Revalidate explicit path if provided
  if (explicitPath && !revalidatedPaths.includes(explicitPath)) {
    try {
      revalidatePath(explicitPath);
      revalidatedPaths.push(explicitPath);
    } catch (err) {
      console.error(`[Revalidation] Error revalidating path ${explicitPath}:`, err);
    }
  }

  console.log(
    `[Revalidation] Revalidated everything successfully! Model: "${model || "all"}". Tags: ${revalidatedTags.length}, Paths: [${revalidatedPaths.join(", ")}]`
  );

  return NextResponse.json({
    revalidated: true,
    message: "Revalidated all application caches and layouts successfully",
    model: model || "all",
    revalidatedTags: Array.from(new Set(revalidatedTags)),
    revalidatedPaths: Array.from(new Set(revalidatedPaths)),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  return handleRevalidation(request, false);
}

export async function GET(request: NextRequest) {
  return handleRevalidation(request, true);
}
