import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { ImageResponse } from 'next/og';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    // 1. Image Resize Mode (using sharp)
    if (imageUrl) {
      // Define allowed hosts for safety checks
      const allowedHosts = [
        'localhost',
        '127.0.0.1',
        'cms.shuru.sa',
        'shuru-bkt.s3.eu-west-3.amazonaws.com',
      ];

      // Read the site URL from environment to allow frontend host requests as well
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl) {
        try {
          const parsedSiteUrl = new URL(siteUrl);
          allowedHosts.push(parsedSiteUrl.hostname);
        } catch (_) {
          // Ignore invalid NEXT_PUBLIC_SITE_URL format
        }
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(imageUrl);
      } catch (_) {
        return new Response('Invalid url parameter', { status: 400 });
      }

      const isHostAllowed = allowedHosts.some(
        (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
      );

      if (!isHostAllowed) {
        return new Response('Host not allowed', { status: 403 });
      }

      // Fetch the original image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return new Response('Failed to fetch original image', { status: 500 });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Resize and crop to exactly 1200x630 using sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 630, {
          fit: 'cover',
          position: 'centre',
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      return new Response(new Uint8Array(optimizedBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Dynamic Branded Card Mode (using next/og ImageResponse)
    const title = searchParams.get('title') || 'Shuru';
    const description = searchParams.get('description') || '';
    const locale = searchParams.get('locale') || 'ar';
    const isAr = locale === 'ar';

    // Fetch Cairo/Inter fonts
    const fonts = await getFonts();

    return new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            backgroundColor: '#0a0b10',
            fontFamily: isAr ? 'Cairo' : 'Inter',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Cyan Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '700px',
              height: '700px',
              borderRadius: '350px',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%)',
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
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%)',
            }}
          />

          {/* Inner glass border overlay */}
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
            }}
          />

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
              direction: isAr ? 'rtl' : 'ltr',
              alignItems: isAr ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Header: Logo and site name */}
            <div
              style={{
                display: 'flex',
                flexDirection: isAr ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: '#ffffff' }} />
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: isAr ? '0px' : '1px',
                }}
              >
                {isAr ? 'شورى' : 'Shuru'}
              </span>
            </div>

            {/* Body: Title and Description */}
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
                  fontSize: '56px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 20px 0',
                  lineHeight: 1.25,
                  textAlign: isAr ? 'right' : 'left',
                }}
              >
                {title}
              </h1>
              {description ? (
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 400,
                    color: '#94a3b8',
                    margin: '0',
                    lineHeight: 1.5,
                    maxWidth: '900px',
                    textAlign: isAr ? 'right' : 'left',
                  }}
                >
                  {description}
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
              }}
            >
              <div style={{ width: '16px', height: '2px', backgroundColor: '#0ea5e9' }} />
              <span
                style={{
                  fontSize: '18px',
                  color: '#64748b',
                  fontWeight: 500,
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
