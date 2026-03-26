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
