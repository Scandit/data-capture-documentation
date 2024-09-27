import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import * as dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env file


const config: Config = {
  title: "Scandit Developer Documentation",
  tagline:
    "Developer Guides, API References, and Code Samples for building with Scandit Smart Data Capture",
  favicon: "img/sdk_icon.png",

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
        redirects: [
          {
            to: '/sdks/ios/add-sdk',
            from: ['/data-capture-sdk/ios', '/data-capture-sdk/ios/add-sdk.html'],
          },
          {
            to: '/sdks/android/add-sdk',
            from: ['/data-capture-sdk/android', '/data-capture-sdk/android/add-sdk.html'],
          },
          {
            to: '/sdks/web/add-sdk',
            from: ['/data-capture-sdk/web', '/data-capture-sdk/web/add-sdk.html'],
          },
          {
            to: '/sdks/cordova/add-sdk',
            from: ['/data-capture-sdk/cordova', '/data-capture-sdk/cordova/add-sdk.html'],
          },
          {
            to: '/sdks/react-native/add-sdk',
            from: ['/data-capture-sdk/react-native', '/data-capture-sdk/react-native/add-sdk.html'],
          },
          {
            to: '/sdks/flutter/add-sdk',
            from: ['/data-capture-sdk/flutter', '/data-capture-sdk/flutter/add-sdk.html'],
          },
          {
            to: '/sdks/capacitor/add-sdk',
            from: ['/data-capture-sdk/capacitor', '/data-capture-sdk/capacitor/add-sdk.html'],
          },
          {
            to: '/sdks/titanium/add-sdk',
            from: ['/data-capture-sdk/titanium', '/data-capture-sdk/titanium/add-sdk.html'],
          },
          {
            to: '/sdks/xamarin/ios/add-sdk',
            from: ['/data-capture-sdk/xamarin.ios', '/data-capture-sdk/xamarin.ios/add-sdk.html'],
          },
          {
            to: '/sdks/xamarin/android/add-sdk',
            from: ['/data-capture-sdk/xamarin.android', '/data-capture-sdk/xamarin.android/add-sdk.html'],
          },
          {
            to: '/sdks/xamarin/forms/add-sdk',
            from: ['/data-capture-sdk/xamarin.forms', '/data-capture-sdk/xamarin.forms/add-sdk.html'],
          },
          {
            to: '/sdks/net/ios/add-sdk',
            from: ['/data-capture-sdk/dotnet.ios', '/data-capture-sdk/dotnet.ios/add-sdk.html'],
          },
          {
            to: '/sdks/net/android/add-sdk',
            from: ['/data-capture-sdk/dotnet.android', '/data-capture-sdk/dotnet.android/add-sdk.html'],
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
              '/data-capture-sdk/dotnet.android/requirements.html'
            ],
          },     
      ],
    },
  ],
  "docusaurus-plugin-sass",
],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.ts"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/Scandit/data-capture-documentation/edit/main",
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
        },
        blog: false,
        gtag: {
          trackingID: 'G-TXJZRPJJ0T',
        },
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
          type: "dropdown",
          position: "left",
          label: "SDKs",
          items: [
            {
              type: "doc",
              label: "iOS",
              sidebarId: "iosSidebar",
              docId: "sdks/ios/add-sdk",
            },
            {
              type: "doc",
              label: "Android",
              sidebarId: "androidSidebar",
              docId: "sdks/android/add-sdk",
            },
            {
              type: "doc",
              label: "Web",
              sidebarId: "webSidebar",
              docId: "sdks/web/add-sdk",
            },
            {
              type: "doc",
              label: "Cordova",
              sidebarId: "cordovaSidebar",
              docId: "sdks/cordova/add-sdk",
            },
            {
              type: "doc",
              label: "React Native",
              sidebarId: "reactnativeSidebar",
              docId: "sdks/react-native/add-sdk",
            },
            {
              type: "doc",
              label: "Flutter",
              sidebarId: "flutterSidebar",
              docId: "sdks/flutter/add-sdk",
            },
            {
              type: "doc",
              label: "Capacitor",
              sidebarId: "capacitorSidebar",
              docId: "sdks/capacitor/add-sdk",
            },
            {
              type: "doc",
              label: "Titanium",
              sidebarId: "titaniumSidebar",
              docId: "sdks/titanium/add-sdk",
            },
            {
              type: "doc",
              label: "Xamarin iOS",
              sidebarId: "xamarinIosSidebar",
              docId: "sdks/xamarin/ios/add-sdk",
            },
            {
              type: "doc",
              label: "Xamarin Android",
              sidebarId: "xamarinAndroidSidebar",
              docId: "sdks/xamarin/android/add-sdk",
            },
            {
              type: "doc",
              label: "Xamarin Forms",
              sidebarId: "xamarinFormsSidebar",
              docId: "sdks/xamarin/forms/add-sdk",
            },
            {
              type: "doc",
              label: ".NET iOS",
              sidebarId: "netIosSidebar",
              docId: "sdks/net/ios/add-sdk",
            },
            {
              type: "doc",
              label: ".NET Android",
              sidebarId: "netAndroidSidebar",
              docId: "sdks/net/android/add-sdk",
            },
          ],
        },
//        {
//          type: "dropdown",
//          sidebarId: "hostedSidebar",
//          position: "left",
//          label: "Hosted Solutions",
//          items: [
//            {
//              type: "doc",
//              label: "ID Bolt",
//              docId: "hosted/id-bolt/overview",
//            },
//            {
//              type: "doc",
//              label: "Scandit Express",
//              docId: "hosted/express/overview",
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
      copyright: `Copyright © ${new Date().getFullYear()} Scandit`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['javascript', 'java', 'bash', 'c', 'csharp', 'dart', 'http', 'json', 'ruby'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
