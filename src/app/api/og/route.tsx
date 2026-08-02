import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { type Locale } from '@/lib/i18n';
import { extractMediaUrl, toAbsoluteUrl } from '@/lib/strapi';
import { fixArabicText } from '@/lib/arabic';
import { getHeaderSettings } from '@/strapi/header';
import { getHomeCached } from '@/strapi/home';
import { getPageCached } from '@/strapi/page';
import {
  getArticleBySlugCached,
  getNewsItemBySlugCached,
  getPodcastBySlugCached,
  getMagazineIssueBySlugCached,
  getMajlisBySlugCached,
} from '@/strapi/insights';

export const runtime = 'nodejs';

// Font memory cache
let interRegular: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;
let tajawalRegular: ArrayBuffer | null = null;
let tajawalBold: ArrayBuffer | null = null;

function loadLocalFont(filename: string): ArrayBuffer {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', filename);
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Local font file not found at path: ${fontPath}`);
  }
  const buffer = fs.readFileSync(fontPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

async function getFonts(): Promise<{
  interRegular: ArrayBuffer;
  interBold: ArrayBuffer;
  tajawalRegular: ArrayBuffer;
  tajawalBold: ArrayBuffer;
}> {
  if (!interRegular) {
    interRegular = loadLocalFont('Inter-Regular.ttf');
  }
  if (!interBold) {
    interBold = loadLocalFont('Inter-Bold.ttf');
  }
  if (!tajawalRegular) {
    tajawalRegular = loadLocalFont('Tajawal-Regular.ttf');
  }
  if (!tajawalBold) {
    tajawalBold = loadLocalFont('Tajawal-Bold.ttf');
  }
  return {
    interRegular: interRegular!,
    interBold: interBold!,
    tajawalRegular: tajawalRegular!,
    tajawalBold: tajawalBold!,
  };
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error('Failed to fetch logo image as base64:', url, err);
    return null;
  }
}

async function fetchRawImageResponse(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('Failed to fetch raw cover image from Strapi:', url, err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'insight';
    const slug = searchParams.get('slug') || '';
    const locale = (searchParams.get('locale') || 'ar') as Locale;
    const isAr = locale === 'ar';

    let title = searchParams.get('title') || '';
    let description = searchParams.get('description') || '';
    let cta1 = searchParams.get('cta1') || '';
    let cta2 = searchParams.get('cta2') || '';
    let category = searchParams.get('category') || '';
    let customLogoUrl = searchParams.get('logoUrl');
    let rawCoverUrl: string | null = null;

    // 1. Fetch data from Strapi based on type and slug
    if (type === 'hero') {
      try {
        const homeData = await getHomeCached(locale);
        const heroBlock = homeData?.blocks?.find(
          (b): b is import('@/strapi/home').StrapiHeroBlock => b.__component === 'home.hero'
        );
        if (heroBlock) {
          if (!title) title = heroBlock.title;
          if (!description) description = heroBlock.subtitle || '';
          if (!cta1) cta1 = heroBlock.primaryCtaText;
          if (!cta2) cta2 = heroBlock.secondaryCtaText || '';
        }
      } catch (e) {
        console.error('Failed to fetch hero data from Strapi:', e);
      }
    } else if (slug) {
      try {
        if (type === 'article') {
          const article = await getArticleBySlugCached(slug, locale);
          if (article) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(article.cover_image) || extractMediaUrl(article.seo?.og_image));
            if (!title) title = article.seo?.meta_title || article.title;
            if (!description) description = article.seo?.meta_description || article.description || '';
            if (!category && article.categories && article.categories.length > 0) {
              category = article.categories[0].name;
            }
          }
        } else if (type === 'news') {
          const news = await getNewsItemBySlugCached(slug, locale);
          if (news) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(news.cover_image) || extractMediaUrl(news.seo?.og_image));
            if (!title) title = news.seo?.meta_title || news.title;
            if (!description) description = news.seo?.meta_description || news.description || '';
          }
        } else if (type === 'podcast') {
          const podcast = await getPodcastBySlugCached(slug, locale);
          if (podcast) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(podcast.cover_image) || extractMediaUrl(podcast.seo?.og_image));
            if (!title) title = podcast.seo?.meta_title || podcast.title;
            if (!description) description = podcast.seo?.meta_description || podcast.description || '';
          }
        } else if (type === 'magazine') {
          const issue = await getMagazineIssueBySlugCached(slug, locale);
          if (issue) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(issue.cover_image) || extractMediaUrl(issue.seo?.og_image));
            if (!title) title = issue.seo?.meta_title || issue.title;
            if (!description) description = issue.seo?.meta_description || issue.description || '';
          }
        } else if (type === 'majlis') {
          const majlis = await getMajlisBySlugCached(slug, locale);
          if (majlis) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(majlis.cover_image) || extractMediaUrl(majlis.seo?.og_image));
            if (!title) title = majlis.seo?.meta_title || majlis.title;
            if (!description) description = majlis.seo?.meta_description || majlis.description || '';
          }
        } else if (type === 'page') {
          const page = await getPageCached(slug, locale);
          if (page) {
            rawCoverUrl = toAbsoluteUrl(extractMediaUrl(page.seo?.og_image));
            if (!title) title = page.seo?.meta_title || page.title;
            if (!description) description = page.seo?.meta_description || '';
          }
        }
      } catch (err) {
        console.error(`Failed to fetch Strapi entity (${type}/${slug}):`, err);
      }
    }

    // 2. If Strapi returned a raw cover image, stream it directly
    if (rawCoverUrl) {
      const rawResponse = await fetchRawImageResponse(rawCoverUrl);
      if (rawResponse) return rawResponse;
    }

    // Fallback default title if still missing
    if (!title) {
      title = isAr ? 'شروع – رحلة نحو التميز' : 'SHURU – The journey toward excellence';
    }

    // Process Arabic text with Reshaper + BiDi reordering for Satori rendering
    const displayTitle = isAr ? fixArabicText(title) : title;
    const displayDescription = isAr ? fixArabicText(description) : description;
    const displayCategory = isAr ? fixArabicText(category) : category;
    const displayCta1 = isAr ? fixArabicText(cta1) : cta1;
    const displayCta2 = isAr ? fixArabicText(cta2) : cta2;

    // 3. Resolve site logo (from Strapi header settings or local fallback)
    let logoBase64: string | null = null;
    if (customLogoUrl) {
      logoBase64 = await fetchImageAsBase64(customLogoUrl);
    }

    if (!logoBase64) {
      try {
        const headerSettings = await getHeaderSettings(locale);
        const strapiLogo = headerSettings?.darkLogoUrl || headerSettings?.lightLogoUrl;
        if (strapiLogo) {
          logoBase64 = await fetchImageAsBase64(strapiLogo);
        }
      } catch (e) {
        console.error('Failed to load header logo from Strapi:', e);
      }
    }

    if (!logoBase64) {
      try {
        const logoPath = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
      } catch (e) {
        console.error('Failed to load local brand logo:', e);
      }
    }

    // 4. Load local Satori-safe fonts from public/fonts/
    const fontData = await getFonts();
    const fonts = [
      { name: 'Tajawal', data: fontData.tajawalRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Tajawal', data: fontData.tajawalBold, weight: 700 as const, style: 'normal' as const },
      { name: 'Inter', data: fontData.interRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Inter', data: fontData.interBold, weight: 700 as const, style: 'normal' as const },
    ];

    const activeFont = isAr ? 'Tajawal' : 'Inter';

    const cacheHeaders = {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    };

    // Hero Template Card
    if (type === 'hero') {
      return new ImageResponse(
        (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '1200px',
              height: '630px',
              backgroundColor: '#f8fafc',
              fontFamily: activeFont,
              overflow: 'hidden',
            }}
          >
            {/* Soft Ambient Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-120px',
                ...(isAr ? { right: '-120px' } : { left: '-120px' }),
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, rgba(20, 184, 166, 0) 70%)',
              }}
            />

            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                padding: '60px 80px',
                alignItems: isAr ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Header Logo */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: isAr ? 'flex-end' : 'flex-start',
                }}
              >
                {logoBase64 ? (
                  <img
                    src={logoBase64}
                    alt="Logo"
                    style={{
                      height: '56px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontFamily: activeFont,
                    }}
                  >
                    {isAr ? fixArabicText('شورى SHURU') : 'SHURU'}
                  </span>
                )}
              </div>

              {/* Main Content Body */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAr ? 'flex-end' : 'flex-start',
                  width: '100%',
                  margin: 'auto 0',
                }}
              >
                <h1
                  style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 20px 0',
                    lineHeight: 1.3,
                    maxWidth: '960px',
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily: activeFont,
                  }}
                >
                  {displayTitle}
                </h1>
                {displayDescription ? (
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 400,
                      color: '#475569',
                      margin: '0 0 32px 0',
                      lineHeight: 1.4,
                      maxWidth: '960px',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: activeFont,
                    }}
                  >
                    {displayDescription}
                  </p>
                ) : null}

                {/* CTAs */}
                {(displayCta1 || displayCta2) && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isAr ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    {displayCta1 ? (
                      <div
                        style={{
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 700,
                          padding: '14px 32px',
                          borderRadius: '9999px',
                          fontFamily: activeFont,
                        }}
                      >
                        {displayCta1}
                      </div>
                    ) : null}
                    {displayCta2 ? (
                      <div
                        style={{
                          border: '1px solid #cbd5e1',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          color: '#334155',
                          fontSize: '18px',
                          fontWeight: 700,
                          padding: '14px 30px',
                          borderRadius: '9999px',
                          fontFamily: activeFont,
                        }}
                      >
                        {displayCta2}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isAr ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: isAr ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ width: '16px', height: '2px', backgroundColor: '#0d9488' }} />
                <span
                  style={{
                    fontSize: '18px',
                    color: '#64748b',
                    fontWeight: 700,
                    fontFamily: activeFont,
                  }}
                >
                  shuru.sa
                </span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630, fonts, headers: cacheHeaders }
      );
    }

    // Default & Insight Card Template
    return new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            backgroundColor: '#f6f6f6',
            fontFamily: activeFont,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: '60px 80px',
              alignItems: isAr ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
                alignSelf: isAr ? 'flex-end' : 'flex-start',
              }}
            >
              {logoBase64 ? (
                <img
                  src={logoBase64}
                  alt="Logo"
                  style={{
                    height: '56px',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#0d111d',
                    fontFamily: activeFont,
                  }}
                >
                  {isAr ? fixArabicText('شورى SHURU') : 'SHURU'}
                </span>
              )}
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAr ? 'flex-end' : 'flex-start',
                width: '100%',
                margin: 'auto 0',
              }}
            >
              {displayCategory && (
                <div
                  style={{
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    color: '#0d9488',
                    fontSize: '16px',
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    margin: '0 0 20px 0',
                    fontFamily: activeFont,
                  }}
                >
                  {displayCategory}
                </div>
              )}
              <h1
                style={{
                  fontSize: '52px',
                  fontWeight: 700,
                  color: '#0d111d',
                  margin: '0 0 20px 0',
                  lineHeight: 1.2,
                  maxWidth: '960px',
                  textAlign: isAr ? 'right' : 'left',
                  fontFamily: activeFont,
                }}
              >
                {displayTitle}
              </h1>
              {displayDescription ? (
                <p
                  style={{
                    fontSize: '22px',
                    fontWeight: 400,
                    color: '#334155',
                    margin: 0,
                    lineHeight: 1.4,
                    maxWidth: '960px',
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily: activeFont,
                  }}
                >
                  {displayDescription}
                </p>
              ) : null}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: isAr ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '8px',
                alignSelf: isAr ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ width: '16px', height: '2px', backgroundColor: '#14b8a6' }} />
              <span
                style={{
                  fontSize: '18px',
                  color: '#475569',
                  fontWeight: 700,
                  fontFamily: activeFont,
                }}
              >
                shuru.sa
              </span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts, headers: cacheHeaders }
    );
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
