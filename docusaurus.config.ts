import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import * as dotenv from 'dotenv';
import { version } from "react";
dotenv.config();  // Load environment variables from .env file


const config: Config = {
  title: "Scandit Developer Documentation",
  tagline:
    "Developer Guides, API References, and Code Samples for building with Scandit Smart Data Capture",
  favicon: "img/sdk_icon.png",
  trailingSlash: true,

  // Set the production url of your site here
  url: "https://docs.scandit.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.base_url ?? '',

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        createRedirects(existingPath) {
          // Redirect all /sdks/xamarin/* paths to the migration guide
          // Only create redirects when processing the root migrate-7-to-8 page to avoid duplicates
          if (existingPath === '/migrate-7-to-8' || existingPath === '/migrate-7-to-8/') {
            const xamarinPaths = [];
            const platforms = ['ios', 'android', 'forms'];
            const commonPages = [
              '',
              '/add-sdk',
              '/samples',
              '/barcode-capture/get-started',
              '/barcode-capture/configure-barcode-symbologies',
              '/barcode-selection/intro',
              '/barcode-selection/get-started',
              '/id-capture/intro',
              '/id-capture/get-started',
              '/id-capture/advanced',
              '/id-capture/supported-documents',
              '/label-capture/intro',
              '/label-capture/get-started',
              '/label-capture/advanced',
              '/label-capture/label-definitions',
              '/matrixscan/intro',
              '/matrixscan/get-started',
              '/matrixscan/advanced',
              '/matrixscan-count/intro',
              '/matrixscan-count/get-started',
              '/matrixscan-count/advanced',
              '/sparkscan/intro',
              '/sparkscan/get-started',
              '/sparkscan/advanced',
              '/parser/get-started',
              '/single-scanning',
              '/batch-scanning',
              '/release-notes'
            ];
            platforms.forEach(platform => {
              commonPages.forEach(page => {
                xamarinPaths.push(`/sdks/xamarin/${platform}${page}`);
              });
            });
            return xamarinPaths;
          }
          return undefined; // Return undefined when no redirects should be created
        },
        redirects: [
          {
            to: '/sdks/ios/add-sdk',
            from: ['/data-capture-sdk/ios', '/data-capture-sdk/ios/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-ios-samples',
            from: '/data-capture-sdk/ios/samples/run-samples.html'
          },
          {
            to: '/sdks/android/add-sdk',
            from: ['/data-capture-sdk/android', '/data-capture-sdk/android/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-android-samples',
            from: '/data-capture-sdk/android/samples/run-samples.html'
          },
          {
            to: '/sdks/web/add-sdk',
            from: ['/data-capture-sdk/web', '/data-capture-sdk/web/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-web-samples',
            from: '/data-capture-sdk/web/samples/run-samples.html'
          },
          {
            to: '/sdks/cordova/add-sdk',
            from: ['/data-capture-sdk/cordova', '/data-capture-sdk/cordova/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-cordova-samples',
            from: '/data-capture-sdk/cordova/samples/run-samples.html'
          },
          {
            to: '/sdks/react-native/add-sdk',
            from: ['/data-capture-sdk/react-native', '/data-capture-sdk/react-native/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-react-native-samples',
            from: '/data-capture-sdk/react-native/samples/run-samples.html'
          },
          {
            to: '/sdks/flutter/add-sdk',
            from: ['/data-capture-sdk/flutter', '/data-capture-sdk/flutter/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-flutter-samples',
            from: '/data-capture-sdk/flutter/samples/run-samples.html'
          },
          {
            to: '/sdks/capacitor/add-sdk',
            from: ['/data-capture-sdk/capacitor', '/data-capture-sdk/capacitor/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-capacitor-samples',
            from: '/data-capture-sdk/capacitor/samples/run-samples.html'
          },
          {
            to: '/sdks/titanium/add-sdk',
            from: ['/data-capture-sdk/titanium', '/data-capture-sdk/titanium/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-titanium-samples',
            from: '/data-capture-sdk/titanium/samples/run-samples.html'
          },
          {
            to: '/migrate-7-to-8#xamarin-sdk-changes',
            from: [
              '/data-capture-sdk/xamarin.ios',
              '/data-capture-sdk/xamarin.ios/add-sdk.html',
              '/data-capture-sdk/xamarin.ios/samples/run-samples.html',
              '/data-capture-sdk/xamarin.android',
              '/data-capture-sdk/xamarin.android/add-sdk.html',
              '/data-capture-sdk/xamarin.android/samples/run-samples.html',
              '/data-capture-sdk/xamarin.forms',
              '/data-capture-sdk/xamarin.forms/add-sdk.html',
              '/data-capture-sdk/xamarin.forms/samples/run-samples.html'
            ],
          },
          {
            to: '/sdks/net/ios/add-sdk',
            from: ['/data-capture-sdk/dotnet.ios', '/data-capture-sdk/dotnet.ios/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-dotnet-samples/tree/master',
            from: '/data-capture-sdk/dotnet.ios/samples/run-samples.html'
          },
          {
            to: '/sdks/net/android/add-sdk',
            from: ['/data-capture-sdk/dotnet.android', '/data-capture-sdk/dotnet.android/add-sdk.html'],
          },
          {
            to: 'https://github.com/Scandit/datacapture-dotnet-samples/tree/master',
            from: '/data-capture-sdk/dotnet.android/samples/run-samples.html'
          },
          {
            to: '/id-documents',
            from: [
              '/data-capture-sdk/android/id-capture/supported-documents.html',
              '/data-capture-sdk/ios/id-capture/supported-documents.html', 
              '/data-capture-sdk/web/id-capture/supported-documents.html',
              '/data-capture-sdk/cordova/id-capture/supported-documents.html',
              '/data-capture-sdk/react-native/id-capture/supported-documents.html',
              '/data-capture-sdk/flutter/id-capture/supported-documents.html',
              '/data-capture-sdk/capacitor/id-capture/supported-documents.html',
              '/data-capture-sdk/titanium/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.ios/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.android/id-capture/supported-documents.html',
              '/data-capture-sdk/xamarin.forms/id-capture/supported-documents.html',
              '/data-capture-sdk/dotnet.ios/id-capture/supported-documents.html',
              '/data-capture-sdk/dotnet.android/id-capture/supported-documents.html'
            ],
          },
          {
            to: 'system-requirements',
            from: [
              '/data-capture-sdk/android/requirements.html',
              '/data-capture-sdk/ios/requirements.html',
              '/data-capture-sdk/web/requirements.html',
              '/data-capture-sdk/cordova/requirements.html',
              '/data-capture-sdk/react-native/requirements.html',
              '/data-capture-sdk/flutter/requirements.html',
              '/data-capture-sdk/capacitor/requirements.html',
              '/data-capture-sdk/titanium/requirements.html',
              '/data-capture-sdk/xamarin.ios/requirements.html',
              '/data-capture-sdk/xamarin.android/requirements.html',
              '/data-capture-sdk/xamarin.forms/requirements.html',
              '/data-capture-sdk/dotnet.ios/requirements.html',
              '/data-capture-sdk/dotnet.android/requirements.html',
              '/data-capture-sdk/android/requirements.html/system-requirements',
              '/data-capture-sdk/ios/requirements.html/system-requirements',
              '/data-capture-sdk/web/requirements.html/system-requirements',
              '/data-capture-sdk/cordova/requirements.html/system-requirements',
              '/data-capture-sdk/react-native/requirements.html/system-requirements',
              '/data-capture-sdk/flutter/requirements.html/system-requirements',
              '/data-capture-sdk/capacitor/requirements.html/system-requirements',
              '/data-capture-sdk/titanium/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.ios/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.android/requirements.html/system-requirements',
              '/data-capture-sdk/xamarin.forms/requirements.html/system-requirements',
              '/data-capture-sdk/dotnet.ios/requirements.html/system-requirements',
              '/data-capture-sdk/dotnet.android/requirements.html/system-requirements'
            ],
          },
          // Note: Root-level pages (core-concepts, features-by-framework, etc.) already have
          // <Redirect> components in their MDX files, so we don't need redirect plugin entries here.
          // The redirect plugin cannot override existing files, so these redirects are removed.     
      ],
    },
  ],
  "docusaurus-plugin-sass",
  'docusaurus-plugin-llms',
],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.ts"),
          breadcrumbs: true,
          admonitions: {
            keywords: [
              // Admonitions defaults
              "note",
              "tip",
              "info",
              "caution",
              "danger",
            ],
          },
          showLastUpdateTime: false,
          includeCurrentVersion: true,
          lastVersion: "current",
          versions: {
            current: {
              label: '8.1.0',
              banner: 'none',
              badge: false,
            },
            '7.6.6': {
              banner: 'none',
              badge: false,
            },
            '6.28.7': {
              banner: 'none',
              badge: false,
            },
          },
        },
        blog: false,
        googleTagManager: {
          containerId: 'GTM-THQQFD7',
        },
        theme: {
          customCss: "./src/css/custom.scss",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
     announcementBar: {
      id: 'new_version',
      content: 'Scandit Smart Data Capture SDK Version 8 is now available! See the <a href="/migrate-7-to-8">Migration Guide</a> to get started today.',
      backgroundColor: '#065db8',
      textColor: '#f0f0f0',
      isCloseable: false,
     },
    algolia: {
      appId: "RYKD97E6SH",
      apiKey: "8372250579ef3ea82cc637a28e50f73f",
      indexName: "scandit",
      contextualSearch: true,
    },
    image: "img/social-card.jpg",
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      logo: {
        alt: "Scandit Logo",
        src: "img/logo2.png",
        srcDark: "img/logo-dark.svg",
      },
      title: "Docs",
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left',
          dropdownActiveClassDisabled: true,
        },
        {
          type: "dropdown",
          position: "left",
          label: "SDKs",
          items: [
            {
              type: "docsVersion",
              label: "iOS",
              sidebarId: "iosSidebar",
              to: "sdks/ios/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Android",
              sidebarId: "androidSidebar",
              to: "sdks/android/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Web",
              sidebarId: "webSidebar",
              to: "sdks/web/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Cordova",
              sidebarId: "cordovaSidebar",
              to: "sdks/cordova/add-sdk",
            },
            {
              type: "docsVersion",
              label: "React Native",
              sidebarId: "reactnativeSidebar",
              to: "sdks/react-native/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Flutter",
              sidebarId: "flutterSidebar",
              to: "sdks/flutter/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Capacitor",
              sidebarId: "capacitorSidebar",
              to: "sdks/capacitor/add-sdk",
            },
            {
              type: "docsVersion",
              label: "Titanium",
              sidebarId: "titaniumSidebar",
              to: "sdks/titanium/add-sdk",
            },
            {
              type: "docsVersion",
              label: ".NET iOS",
              sidebarId: "netIosSidebar",
              to: "sdks/net/ios/add-sdk",
            },
            {
              type: "docsVersion",
              label: ".NET Android",
              sidebarId: "netAndroidSidebar",
              to: "sdks/net/android/add-sdk",
            },
          ],
        },
//        {
//          type: "docsVersion",
//          label: "ID Bolt",
//          position: "left",
//          to: "hosted/id-bolt/overview",
//        },
//            {
//              type: "docsVersion",
//              label: "Scandit Express",
//              to: "hosted/express/overview",
//            },
//          ],
//        },
        {
          href: "https://ssl.scandit.com/dashboard/sign-in?p=test",
          label: "Log In",
          position: "right",
        },
        {
          href: "https://www.scandit.com/trial/",
          label: "Sign Up",
          position: "right",
        },
        {
          href: "https://github.com/Scandit/",
          label: "Github Samples",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
         {
           title: "Documentation",
           items: [
             {
               label: "Smart Data Capture SDK",
               to: "/",
             },
             {
              label: "Scandit Express",
              to: "/hosted/express/overview",
            },
            {
              label: "ID Bolt",
              to: "/hosted/id-bolt/overview",
            },
           ],
         },
         {
           title: "Community",
           items: [
            {
              label: "GitHub",
              href: "https://github.com/scandit/",
            },
             {
               label: "Stack Overflow",
               href: "https://stackoverflow.com/questions/tagged/scandit",
             },
           ],
         },
         {
           title: "More",
           items: [
             {
               label: "Blog",
               to: "https://www.scandit.com/blog/?_blog_categories=developers",
             },
             {
               label: "Scandit.com",
               href: "https://www.scandit.com/",
             },
           ],
         },
       ],
      copyright: `Copyright © Scandit AG<br>Scandit's products are patent protected. Details at <a href="https://www.scandit.com/patents/" target="_blank" rel="noopener noreferrer">scandit.com/patents</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['javascript', 'java', 'bash', 'c', 'csharp', 'dart', 'http', 'json', 'ruby', 'objectivec', 'kotlin'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
