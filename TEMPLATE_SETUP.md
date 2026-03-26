# Template Setup Guide

Welcome! This guide will help you get started with your new project based on this template.

## 🎯 First-Time Setup

### 1. Update Project Information

After creating your project from this template, update the following files:

#### `package.json`
```json
{
  "name": "your-project-name",
  "version": "0.1.0",
  "description": "Your project description",
  ...
}
```

#### `README.md`
- Update the title and description
- Add your project-specific features
- Update repository URLs
- Add your license information

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
# NEXT_PUBLIC_API_URL=https://api.example.com
# DATABASE_URL=your-database-url
# API_KEY=your-api-key
```

**Note:** Never commit `.env.local` to version control (already in `.gitignore`)

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## 🌍 Internationalization Setup

### Adding New Languages

1. **Create translation file:**
   ```bash
   # Example: Adding French
   cp messages/en.json messages/fr.json
   ```

2. **Translate content in `messages/fr.json`:**
   ```json
   {
     "HomePage": {
       "title": "Bienvenue",
       "description": "Votre description"
     }
   }
   ```

3. **Update locale config in `src/lib/i18n.ts`:**
   ```typescript
   export const locales = ['en', 'ar', 'fr'] as const;
   export const defaultLocale: Locale = 'en';
   ```

4. **Update middleware** (if you have custom middleware configuration)

### Removing Languages

To remove a language (e.g., Arabic):

1. Delete `messages/ar.json`
2. Remove 'ar' from locales array in `src/lib/i18n.ts`
3. Update your components if they reference specific locales

## 🎨 Styling & Theming

### Customizing Colors

Edit your CSS variables in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    /* Add your custom colors */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* Add your dark mode colors */
  }
}
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc.
```

Browse all components: [ui.shadcn.com](https://ui.shadcn.com)

## 📁 Project Structure Customization

### Adding New Routes

Create new folders in `src/app/`:

```bash
# Example: Adding a blog
mkdir -p src/app/blog
touch src/app/blog/page.tsx
```

### Removing Template Routes

If you don't need the pre-built routes, delete them:

```bash
# Example: Removing unused routes
rm -rf src/app/analyzer
rm -rf src/app/generator
rm -rf src/app/knowledge-base
rm -rf src/app/strategy
```

## 🔧 Configuration Files

### TypeScript (`tsconfig.json`)
- Path aliases are pre-configured (`@/*` → `src/*`)
- Adjust compiler options as needed

### ESLint (`eslint.config.mjs`)
- Extends Next.js recommended config
- Add custom rules as needed

### Tailwind CSS (`postcss.config.mjs`, `components.json`)
- Using Tailwind CSS v4
- shadcn/ui configured with default theme

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `package.json` with your project info
- [ ] Set up environment variables on your hosting platform
- [ ] Test build locally: `npm run build && npm start`
- [ ] Configure domain and DNS settings
- [ ] Set up analytics (optional)
- [ ] Configure error tracking (optional)
- [ ] Test all language versions
- [ ] Test light/dark mode switching
- [ ] Verify RTL layouts (if using Arabic or other RTL languages)

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure environment variables
5. Deploy!

### Other Platforms

This template works with:
- **Netlify**: Add `netlify.toml` if needed
- **Docker**: Create `Dockerfile` for containerization
- **AWS/GCP**: Use their Next.js deployment guides

## 📦 Adding Features

### Database Integration

1. Install your preferred database client:
   ```bash
   npm install @prisma/client  # Prisma
   # or
   npm install mongoose        # MongoDB
   ```

2. Set up schema and migrations
3. Add database URL to `.env.local`

### Authentication

Popular options:
- **NextAuth.js**: `npm install next-auth`
- **Clerk**: `npm install @clerk/nextjs`
- **Supabase Auth**: `npm install @supabase/supabase-js`

### API Routes

Create API endpoints in `src/app/api/`:

```typescript
// src/app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World' });
}
```

## 🧪 Testing (Optional)

Add testing libraries:

```bash
# Jest + React Testing Library
npm install -D jest @testing-library/react @testing-library/jest-dom
# Playwright for E2E
npm install -D @playwright/test
```

## 📝 Git Workflow

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push

# Use conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

## 🆘 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
PORT=3001 npm run dev
```

### Type Errors

```bash
# Regenerate types
npx next build
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/)

## 💡 Tips

1. **Keep translations in sync**: Use a tool like `i18n-unused` to find unused keys
2. **Optimize images**: Use `next/image` for automatic optimization
3. **Code splitting**: Use dynamic imports for large components
4. **Monitor bundle size**: Run `npm run build` and check the output
5. **Use TypeScript**: Take advantage of type safety throughout your app

---

**Questions or Issues?**
Feel free to open an issue in the original template repository or check the documentation links above.

Happy coding! 🚀
