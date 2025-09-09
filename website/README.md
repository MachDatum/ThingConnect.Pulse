# ThingConnect Pulse Documentation

This directory contains the documentation website for ThingConnect Pulse, built with [Docusaurus](https://docusaurus.io/).

## 🏗️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve built site locally
npm run serve
```

### Available Scripts

- `npm start` - Start development server (hot reload)
- `npm run build` - Build static site for production
- `npm run serve` - Serve production build locally
- `npm run clear` - Clear Docusaurus cache
- `npm run typecheck` - TypeScript type checking

## 📚 Content Structure

```
docs/
├── intro.md                    # Landing page
├── getting-started/            # Installation and setup
├── user-guide/                 # User documentation
├── admin/                      # Administration guides  
├── advanced/                   # Advanced topics
└── api/                        # API reference
```

## 🚀 Deployment

### Automatic Deployment

Documentation is automatically deployed when changes are pushed to the `main` branch:

- **GitHub Pages**: Deployed to `gh-pages` branch
- **Custom Domain**: Available at https://docs.thingconnect.io/pulse/

### Manual Deployment

#### GitHub Pages

```bash
# Build and deploy to GitHub Pages
npm run build
GIT_USER=<GITHUB_USERNAME> npm run deploy
```

#### Alternative Hosting

The documentation can also be deployed to:
- **Netlify**: Connect GitHub repository for automatic deployments
- **Vercel**: Deploy with `vercel --prod`
- **AWS S3**: Static website hosting with CloudFront CDN

## 🔧 Configuration

### Main Configuration Files

- `docusaurus.config.ts` - Main Docusaurus configuration
- `sidebars.ts` - Sidebar navigation structure
- `deploy.config.js` - Deployment configuration

### Customization

- `src/css/custom.css` - Custom styles with ThingConnect branding
- `static/` - Static assets (images, icons, etc.)

## 📖 Writing Documentation

### Frontmatter

Each markdown file should include frontmatter:

```markdown
---
sidebar_position: 1
title: Page Title
description: Page description for SEO
---

# Page Content
```

### Cross-references

```markdown
# Link to other pages
[Dashboard Guide](../user-guide/dashboard)
[API Overview](../api/overview)
```

## 🎨 Branding

The site uses ThingConnect branding:

- **Primary Color**: #076bb3 (ThingConnect Blue)
- **Logo**: `static/img/logo.svg`
- **Favicon**: `static/img/favicon.ico`

## 🤝 Contributing

1. Fork the repository
2. Create documentation in `website/docs/`
3. Test locally with `npm start`
4. Submit pull request

For questions or support, please open an issue in the main repository.
