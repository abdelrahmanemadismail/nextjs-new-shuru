# Next.js i18n starter Template

A modern, fully-featured Next.js template with internationalization, dark mode support, RTL layouts, and beautiful UI components.

## ✨ Features

- ⚡ **Next.js 16** - Latest React framework with App Router
- 🌍 **Internationalization (i18n)** - Built-in multi-language support with `next-intl` (English, Arabic)
- 🎨 **shadcn/ui Components** - Beautiful, accessible UI components
- 🌓 **Dark Mode** - Theme switching with `next-themes`
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS v4
- 🔄 **RTL Support** - Full right-to-left layout support for Arabic
- 🧩 **Component Library** - Pre-built components (Button, Dropdown, Direction wrapper)
- 📁 **Organized Structure** - Feature-based routing (analyzer, generator, knowledge-base, strategy, settings)
- 🎯 **TypeScript** - Full type safety
- 🚀 **Ready to Deploy** - Optimized for Vercel deployment

## 📦 Tech Stack

- **Framework**: Next.js 16.1.6 + React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **i18n**: next-intl
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **Linting**: ESLint with Next.js config

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm/bun

### Installation

1. **Use this template** (if on GitHub, click "Use this template" button) or clone:
   ```bash
   git clone <your-repo-url>
   cd next-multi-language-dark-mode-support
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in this project and set:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_READ_ONLY_API_TOKEN=your-strapi-read-only-token
STRAPI_REVALIDATE_SECRET=change-me
```

The app reads from Strapi using a server-only bearer token (`STRAPI_READ_ONLY_API_TOKEN`).

Create the token in Strapi admin:
1. Go to `Settings` -> `API Tokens`.
2. Create a token with `Read-only` type.
3. Copy the token value into `.env.local`.

Token fallback:
- If you already use `STRAPI_API_TOKEN`, the app will accept it as a fallback.

### Strapi Webhook Revalidation

When Global content changes in Strapi, call the Next.js revalidation endpoint so cached metadata is refreshed immediately.

1. In Strapi admin, create a webhook for Global entry events (create/update/delete/publish).
2. Use this URL:
   `http://localhost:3000/api/revalidate`
3. Add header:
   `x-revalidate-secret: <your STRAPI_REVALIDATE_SECRET value>`
4. Send JSON body:
   `{ "model": "global" }`

You can also test manually:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: change-me" \
  -d '{"model":"global"}'
```

5. **First-time setup:**
   See [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) for detailed setup instructions and customization guide.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── home-content.tsx  # Home page content
│   ├── locale-switcher.tsx # Language switcher
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── i18n/                 # Internationalization config
├── lib/                  # Utility functions
└── messages/             # Translation files (en.json, ar.json)
```

## 🌍 Adding New Languages

1. Create a new translation file in `messages/` (e.g., `messages/fr.json`)
2. Update the locale configuration in `src/lib/i18n.ts`
3. Add the new locale to your middleware configuration

## 🎨 Customization

### Theme Colors

Edit your Tailwind configuration or use CSS variables for theme colors.

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

### Updating Translations

Edit translation files in the `messages/` directory:
- `messages/en.json` - English translations
- `messages/ar.json` - Arabic translations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Features Overview

### Internationalization
- Automatic locale detection
- RTL layout support
- Translation management

### Theme System
- Light/Dark mode toggle
- System preference detection
- Persistent theme selection

### UI Components
- Pre-configured shadcn/ui components
- Custom direction wrapper for RTL/LTR
- Locale switcher component
- Responsive navigation

## 🚢 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

### Other Platforms

This template works on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Docker
- Self-hosted

## 📝 License

This template is free to use for personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
