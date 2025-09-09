import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // User Manual Sidebar
  userManualSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/initial-setup',
        'getting-started/first-login',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/dashboard',
        'user-guide/monitoring-endpoints',
        'user-guide/viewing-history',
        'user-guide/configuration',
        'user-guide/user-management',
      ],
    },
    {
      type: 'category',
      label: 'Administration',
      items: [
        'admin/system-settings',
        'admin/backup-restore',
        'admin/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'advanced/yaml-configuration',
        'advanced/custom-probes',
        'advanced/data-retention',
      ],
    },
  ],

  // API Reference Sidebar
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/authentication',
        'api/endpoints',
        'api/monitoring',
        'api/configuration',
      ],
    },
  ],
};

export default sidebars;
