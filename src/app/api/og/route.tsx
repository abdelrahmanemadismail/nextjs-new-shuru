import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Cache fonts in memory to avoid fetching them on every request
let interRegular: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;
let cairoRegular: ArrayBuffer | null = null;
let cairoBold: ArrayBuffer | null = null;

async function getFonts(): Promise<{
  interRegular: ArrayBuffer;
  interBold: ArrayBuffer;
  cairoRegular: ArrayBuffer;
  cairoBold: ArrayBuffer;
}> {
  if (!interRegular) {
    interRegular = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!interBold) {
    interBold = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!cairoRegular) {
    cairoRegular = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-400-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!cairoBold) {
    cairoBold = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-700-normal.ttf').then(res => res.arrayBuffer());
  }
  return {
    interRegular: interRegular!,
    interBold: interBold!,
    cairoRegular: cairoRegular!,
    cairoBold: cairoBold!,
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

function sanitizeText(str: string | null | undefined) {
  if (!str) return '';
  let cleaned = str.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\.{2,}/g, ' ');
  cleaned = cleaned.replace(/[\.\,\;\:\،\؛]/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'insight'; // 'hero' | 'insight'
    let title = searchParams.get('title') || '';
    let description = searchParams.get('description') || '';
    let cta1 = searchParams.get('cta1') || '';
    let cta2 = searchParams.get('cta2') || '';
    const category = searchParams.get('category') || '';
    const locale = (searchParams.get('locale') || 'ar') as 'ar' | 'en';
    const logoUrl = searchParams.get('logoUrl');
    const isAr = locale === 'ar';

    // If type === 'hero' and key params missing, fetch Strapi home content server-side as fallback
    if (type === 'hero' && (!title || !cta1)) {
      try {
        const { getHomeCached } = await import('@/strapi/home');
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
        console.error('Failed to fetch fallback hero data from Strapi:', e);
      }
    }

    if (!title) {
      title = isAr ? 'شروع – رحلة نحو التميز' : 'SHURU – The journey toward excellence';
    }

    // Load Strapi Header Logo or Local Logo fallback
    let logoBase64: string | null = null;
    if (logoUrl) {
      logoBase64 = await fetchImageAsBase64(logoUrl);
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

    // Fetch Cairo & Inter fonts
    const fontData = await getFonts();
    const fonts = [
      { name: 'Cairo', data: fontData.cairoRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Cairo', data: fontData.cairoBold, weight: 700 as const, style: 'normal' as const },
      { name: 'Inter', data: fontData.interRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Inter', data: fontData.interBold, weight: 700 as const, style: 'normal' as const },
    ];

    const renderFormattedText = (
      text: string | null | undefined,
      fontSize: number,
      fontWeight: number,
      color: string,
      maxWidth: number,
      marginBottom: number,
      isHeading = false
    ) => {
      if (!text) return null;
      const rawCleaned = text.replace(/\s+/g, ' ').trim();
      if (!rawCleaned) return null;

      if (!isAr) {
        const ElementTag = isHeading ? 'h1' : 'p';
        return (
          <ElementTag
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              color,
              margin: `0 0 ${marginBottom}px 0`,
              lineHeight: 1.3,
              maxWidth: `${maxWidth}px`,
              textAlign: 'left',
              fontFamily: 'Inter',
            }}
          >
            {rawCleaned}
          </ElementTag>
        );
      }

      const sanitizedAr = sanitizeText(rawCleaned);
      const words = sanitizedAr.split(' ').filter(Boolean);

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'center',
            maxWidth: `${maxWidth}px`,
            margin: `0 0 ${marginBottom}px 0`,
            columnGap: `${Math.max(2, Math.round(fontSize * 0.08))}px`,
            rowGap: `${Math.max(2, Math.round(fontSize * 0.12))}px`,
          }}
        >
          {words.map((w, idx) => {
            const WordTag = isHeading ? 'h1' : 'span';
            return (
              <WordTag
                key={idx}
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight,
                  color,
                  lineHeight: 1.1,
                  margin: 0,
                  fontFamily: 'Cairo',
                }}
              >
                {w}
              </WordTag>
            );
          })}
        </div>
      );
    };

    const displayTitle = title;
    const displayDescription = description;
    const displayCta1 = sanitizeText(cta1);
    const displayCta2 = sanitizeText(cta2);

    // Hero Template
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
              fontFamily: isAr ? 'Cairo' : 'Inter',
              overflow: 'hidden',
            }}
          >
            {/* Soft Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-120px',
                ...(isAr ? { right: '-120px' } : { left: '-120px' }),
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%)',
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
              {/* Logo Header */}
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
                      fontFamily: isAr ? 'Cairo' : 'Inter',
                    }}
                  >
                    {isAr ? 'شورى SHURU' : 'SHURU'}
                  </span>
                )}
              </div>

              {/* Body Content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAr ? 'flex-end' : 'flex-start',
                  width: '100%',
                  margin: 'auto 0',
                }}
              >
                {renderFormattedText(displayTitle, 48, 700, '#0f172a', 960, 20, true)}
                {renderFormattedText(displayDescription, 20, 400, '#475569', 960, 32, false)}

                {/* CTA Buttons */}
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
                          fontFamily: isAr ? 'Cairo' : 'Inter',
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
                          fontFamily: isAr ? 'Cairo' : 'Inter',
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
                    fontFamily: isAr ? 'Cairo' : 'Inter',
                  }}
                >
                  shuru.sa
                </span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630, fonts }
      );
    }

    // Insight Template
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
            fontFamily: isAr ? 'Cairo' : 'Inter',
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
                    fontFamily: isAr ? 'Cairo' : 'Inter',
                  }}
                >
                  {isAr ? 'شورى SHURU' : 'SHURU'}
                </span>
              )}
            </div>

            {/* Body: Category, Title and Description */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAr ? 'flex-end' : 'flex-start',
                width: '100%',
                margin: 'auto 0',
              }}
            >
              {category && (
                <div
                  style={{
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    color: '#0d9488',
                    fontSize: '16px',
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    margin: '0 0 20px 0',
                    fontFamily: isAr ? 'Cairo' : 'Inter',
                  }}
                >
                  {category}
                </div>
              )}
              {renderFormattedText(displayTitle, 52, 700, '#0d111d', 960, 20, true)}
              {renderFormattedText(displayDescription, 22, 400, '#334155', 960, 0, false)}
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
                  fontFamily: isAr ? 'Cairo' : 'Inter',
                }}
              >
                shuru.sa
              </span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
