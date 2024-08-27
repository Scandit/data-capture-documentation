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
  plugins: ["docusaurus-plugin-sass"],

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
