import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'insight'; // 'hero' | 'insight'
    let title = searchParams.get('title') || '';
    let description = searchParams.get('description') || '';
    let cta1 = searchParams.get('cta1') || '';
    let cta2 = searchParams.get('cta2') || '';
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
      title = 'Shuru';
    }

    // Load Strapi Header Logo or Local Logo fallback
    let logoBase64: string | null = null;
    if (logoUrl) {
      logoBase64 = await fetchImageAsBase64(logoUrl);
    }

    let localIconBase64: string | null = null;
    try {
      if (!logoBase64) {
        const logoPath = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
      }

      const iconPath = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png');
      if (fs.existsSync(iconPath)) {
        const iconBuffer = fs.readFileSync(iconPath);
        localIconBase64 = `data:image/png;base64,${iconBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.error('Failed to load local brand logo/icon assets:', e);
    }

    const cleanText = (str: string | null | undefined) =>
      str ? str.replace(/\s+/g, ' ').trim() : '';

    const displayTitle = cleanText(title);
    const displayDescription = cleanText(description);
    const displayCta1 = cleanText(cta1);
    const displayCta2 = cleanText(cta2);

    // Fetch Cairo/Inter fonts
    const fonts = await getFonts();

    // Render Hero Section Template
    if (type === 'hero') {
      return new ImageResponse(
        (
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '1200px',
              height: '630px',
              backgroundColor: '#f8fafc',
              fontFamily: isAr ? 'Cairo' : 'Inter',
              direction: isAr ? 'rtl' : 'ltr',
              overflow: 'hidden',
            }}
          >
            {/* Soft Radial Glow Top-Center */}
            <div
              style={{
                position: 'absolute',
                top: '-200px',
                left: '250px',
                width: '700px',
                height: '700px',
                borderRadius: '350px',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0) 70%)',
              }}
            />

            {/* Soft Radial Glow Bottom-Corner */}
            <div
              style={{
                position: 'absolute',
                bottom: '-200px',
                right: '-150px',
                width: '700px',
                height: '700px',
                borderRadius: '350px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%)',
              }}
            />

            {/* Subtle Brand Icon Watermark */}
            {localIconBase64 && (
              <img
                src={localIconBase64}
                alt="Watermark Icon"
                style={{
                  position: 'absolute',
                  width: '380px',
                  height: '380px',
                  bottom: '-40px',
                  ...(isAr ? { left: '-40px' } : { right: '-40px' }),
                  opacity: 0.04,
                }}
              />
            )}

            {/* Container */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                padding: '60px 80px',
                alignItems: 'flex-start',
              }}
            >
              {/* Header: Logo */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                }}
              >
                {logoBase64 ? (
                  <img
                    src={logoBase64}
                    alt="Header Logo"
                    style={{
                      height: '54px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {isAr ? 'شورى' : 'Shuru'}
                  </span>
                )}
              </div>

              {/* Main Content (Title, Subtitle & CTA Buttons) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  margin: 'auto 0',
                }}
              >
                <h1
                  style={{
                    fontSize: '52px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 16px 0',
                    lineHeight: 1.2,
                    textAlign: isAr ? 'right' : 'left',
                    maxWidth: '1040px',
                  }}
                >
                  {displayTitle}
                </h1>

                {description ? (
                  <p
                    style={{
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#475569',
                      margin: '0 0 32px 0',
                      lineHeight: 1.5,
                      maxWidth: '920px',
                      textAlign: isAr ? 'right' : 'left',
                    }}
                  >
                    {displayDescription}
                  </p>
                ) : null}

                {/* CTA Buttons preview */}
                {(cta1 || cta2) && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    {cta1 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 700,
                          padding: '14px 32px',
                          borderRadius: '9999px',
                        }}
                      >
                        {displayCta1}
                      </div>
                    ) : null}

                    {cta2 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #cbd5e1',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          color: '#334155',
                          fontSize: '18px',
                          fontWeight: 700,
                          padding: '14px 30px',
                          borderRadius: '9999px',
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'flex-start',
                }}
              >
                <div style={{ width: '16px', height: '2px', backgroundColor: '#0d9488' }} />
                <span
                  style={{
                    fontSize: '18px',
                    color: '#64748b',
                    fontWeight: 700,
                  }}
                >
                  shuru.sa
                </span>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'Inter',
              data: fonts.interRegular,
              weight: 400,
              style: 'normal',
            },
            {
              name: 'Inter',
              data: fonts.interBold,
              weight: 700,
              style: 'normal',
            },
            {
              name: 'Cairo',
              data: fonts.cairoRegular,
              weight: 400,
              style: 'normal',
            },
            {
              name: 'Cairo',
              data: fonts.cairoBold,
              weight: 700,
              style: 'normal',
            },
          ],
        }
      );
    }

    // Render Insights Template
    return new ImageResponse(
      (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            backgroundColor: '#f6f6f6',
            fontFamily: isAr ? 'Cairo' : 'Inter',
            direction: isAr ? 'rtl' : 'ltr',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Cyan/Teal Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '700px',
              height: '700px',
              borderRadius: '350px',
              background: 'radial-gradient(#14b8a614 0%, #14b8a600 70%)',
            }}
          />

          {/* Bottom-Left Violet Radial Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-150px',
              width: '700px',
              height: '700px',
              borderRadius: '350px',
              background: 'radial-gradient(#8b5cf60d 0%, #8b5cf600 70%)',
            }}
          />

          {/* Faint Brand Icon Watermark in bottom corner */}
          {localIconBase64 && (
            <img
              src={localIconBase64}
              alt="Watermark Icon"
              style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                bottom: '40px',
                opacity: 0.05,
                ...(isAr ? { left: '40px' } : { right: '40px' }),
              }}
            />
          )}

          {/* Inner border overlay */}
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
            }}
          />

          {/* Decorative Horizontal Architectural Line */}
          <svg
            width="1152px"
            height="1px"
            style={{
              position: 'absolute',
              top: '155px',
              left: '24px',
            }}
          >
            <defs>
              <linearGradient id="horizontal-fade" x1={isAr ? "1" : "0"} y1="0" x2={isAr ? "0" : "1"} y2="0">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="1152" y2="0" stroke="url(#horizontal-fade)" strokeWidth="1" />
          </svg>

          {/* Decorative Vertical Architectural Line */}
          <svg
            width="1px"
            height="582px"
            style={{
              position: 'absolute',
              top: '24px',
              ...(isAr ? { right: '310px' } : { left: '310px' }),
            }}
          >
            <defs>
              <linearGradient id="vertical-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="0" y2="582" stroke="url(#vertical-fade)" strokeWidth="1" />
          </svg>

          {/* Crosshair at intersection */}
          <div
            style={{
              position: 'absolute',
              top: '151px',
              width: '9px',
              height: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(isAr ? { right: '306px' } : { left: '306px' }),
            }}
          >
            <div style={{ position: 'absolute', width: '9px', height: '1px', backgroundColor: '#14b8a64d' }} />
            <div style={{ position: 'absolute', width: '1px', height: '9px', backgroundColor: '#14b8a64d' }} />
          </div>

          {/* Main Layout Container */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: '70px 80px',
              alignItems: 'flex-start',
            }}
          >
            {/* Header: Logo */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
                alignSelf: 'flex-start',
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
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0d111d',
                  }}
                >
                  {isAr ? 'شورى' : 'Shuru'}
                </span>
              )}
            </div>

            {/* Body: Title and Description */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
                margin: 'auto 0',
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 700,
                  color: '#0d111d',
                  margin: '0 0 20px 0',
                  lineHeight: 1.25,
                  textAlign: isAr ? 'right' : 'left',
                }}
              >
                {displayTitle}
              </h1>
              {description ? (
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 400,
                    color: '#334155',
                    margin: '0',
                    lineHeight: 1.5,
                    maxWidth: '900px',
                    textAlign: isAr ? 'right' : 'left',
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
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ width: '16px', height: '2px', backgroundColor: '#14b8a6' }} />
              <span
                style={{
                  fontSize: '18px',
                  color: '#475569',
                  fontWeight: 700,
                }}
              >
                shuru.sa
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fonts.interRegular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fonts.interBold,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Cairo',
            data: fonts.cairoRegular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Cairo',
            data: fonts.cairoBold,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
