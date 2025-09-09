import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ThingConnect Pulse',
  tagline: 'Network Availability Monitoring for Manufacturing Sites',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.thingconnect.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/pulse/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'MachDatum', // Usually your GitHub org/user name.
  projectName: 'ThingConnect.Pulse', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at the root instead of /docs/
          // Enable edit links to GitHub
          editUrl: 'https://github.com/MachDatum/ThingConnect.Pulse/tree/master/website/',
        },
        blog: false, // Disable blog for user manual site
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/thingconnect-social-card.jpg',
    navbar: {
      title: 'ThingConnect Pulse',
      logo: {
        alt: 'ThingConnect Pulse Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'userManualSidebar',
          position: 'left',
          label: 'User Manual',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          href: 'https://github.com/MachDatum/ThingConnect.Pulse',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://thingconnect.io',
          label: 'ThingConnect.io',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'User Manual',
              to: '/user-manual',
            },
            {
              label: 'API Reference',
              to: '/api',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/MachDatum/ThingConnect.Pulse/issues',
            },
            {
              label: 'Support Portal',
              href: 'https://thingconnect.io/support',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'ThingConnect.io',
              href: 'https://thingconnect.io',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/MachDatum/ThingConnect.Pulse',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MachDatum, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
