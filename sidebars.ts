import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure

  // But you can create a sidebar manually

  sdcSidebar: [
    {
      type: "category",
      label: "Scandit Smart Data Capture",
      items: [
        "barcode-scanning",
        "id-scanning",
        "core-concepts",
        "features-by-framework",
        "system-requirements",
        {
          type: "category",
          label: "Supported Symbologies and IDs",
          collapsed: false,
          items: [
            "barcode-symbologies",
            "symbology-properties",
            "extension-codes",
            "scanning-composite-codes",
            "id-documents",
          ],
        },
      {
    type: 'category',
					label: 'Migration Guides',
          collapsed: true,
					items: [
            'migrate-5-to-6',
          ]
				},
			],},
  ],

  boltSidebar: [
    {
      type: "category",
      label: "ID Bolt",
      items: [
        "hosted/id-bolt/overview",
        "hosted/id-bolt/getting-started",
        "hosted/id-bolt/api",
        {
          type: "link",
          label: "Try the Demo",
          href: "https://id-travel.demos.scandit.com/",
        },
      ],
    },
  ],

  iosSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for iOS",
      collapsed: false,
      items: ["sdks/ios/add-sdk", "sdks/ios/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/ios/sparkscan/intro",
                "sdks/ios/sparkscan/get-started",
                "sdks/ios/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/ios/barcode-capture/get-started",
              ],
            },
            {
              type: "category",
              label: "Barcode Selection",
              items: [
                "sdks/ios/barcode-selection/intro",
                "sdks/ios/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: "category",
              label: "MatrixScan Count",
              items: [
                "sdks/ios/matrixscan-count/intro",
                "sdks/ios/matrixscan-count/get-started",
                "sdks/ios/matrixscan-count/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan Find",
              items: [
                "sdks/ios/matrixscan-find/intro",
                "sdks/ios/matrixscan-find/get-started",
                "sdks/ios/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "Label Capture",
              items: [
                "sdks/ios/label-capture/get-started",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/ios/matrixscan/intro",
                "sdks/ios/matrixscan/get-started",
//                "sdks/ios/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/ios/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/ios/id-capture/intro",
            "sdks/ios/id-capture/get-started",
            "sdks/ios/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/ios/id-validate/intro",
            "sdks/ios/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/ios/parser/get-started"],
        },
        {
          type: "doc",
          id: "sdks/ios/barcode-generator",
          label: "Barcode Generator",
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/ios/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/ios/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/ios/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditLabelCapture",
          href: "https://docs.scandit.com/data-capture-sdk/ios/label-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/ios/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/ios/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/ios/release-notes",
    },
  ],

  androidSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Android",
      collapsed: false,
      items: ["sdks/android/add-sdk", "sdks/android/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/android/sparkscan/intro",
                "sdks/android/sparkscan/get-started",
                "sdks/android/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/android/barcode-capture/get-started",
              ],
            },
            {
              type: "category",
              label: "Barcode Selection",
              items: [
                "sdks/android/barcode-selection/intro",
                "sdks/android/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: "category",
              label: "MatrixScan Count",
              items: [
                "sdks/android/matrixscan-count/intro",
                "sdks/android/matrixscan-count/get-started",
                "sdks/android/matrixscan-count/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan Find",
              items: [
                "sdks/android/matrixscan-find/intro",
                "sdks/android/matrixscan-find/get-started",
                "sdks/android/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "Label Capture",
              items: [
                "sdks/android/label-capture/get-started",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/android/matrixscan/intro",
                "sdks/android/matrixscan/get-started",
//                "sdks/android/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/android/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/android/id-capture/intro",
            "sdks/android/id-capture/get-started",
            "sdks/android/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/android/id-validate/intro",
            "sdks/android/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/android/parser/get-started"],
        },
        {
          type: "doc",
          id: "sdks/android/barcode-generator",
          label: "Barcode Generator",
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/android/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/android/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/android/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditLabelCapture",
          href: "https://docs.scandit.com/data-capture-sdk/android/label-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/android/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/android/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/android/release-notes",
    },
  ],

  webSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Web",
      collapsed: false,
      items: ["sdks/web/add-sdk", "sdks/web/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/web/sparkscan/intro",
                "sdks/web/sparkscan/get-started",
                "sdks/web/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/web/barcode-capture/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: "category",
              label: "MatrixScan Find",
              items: [
                "sdks/web/matrixscan-find/intro",
                "sdks/web/matrixscan-find/get-started",
                "sdks/web/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/web/matrixscan/intro",
                "sdks/web/matrixscan/get-started",
//               "sdks/web/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/web/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/web/id-capture/intro",
            "sdks/web/id-capture/get-started",
            "sdks/web/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/web/id-validate/intro",
            "sdks/web/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/web/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/web/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/web/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/web/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/web/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/web/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/web/release-notes",
    },
  ],

  cordovaSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Cordova",
      collapsed: false,
      items: ["sdks/cordova/add-sdk", "sdks/cordova/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/cordova/sparkscan/intro",
                "sdks/cordova/sparkscan/get-started",
                "sdks/cordova/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/cordova/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/cordova/barcode-selection/intro",
                "sdks/cordova/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/cordova/matrixscan/intro",
                "sdks/cordova/matrixscan/get-started",
//                "sdks/cordova/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/cordova/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/cordova/id-capture/intro",
            "sdks/cordova/id-capture/get-started",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/cordova/id-validate/intro",
            "sdks/cordova/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/cordova/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/cordova/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/cordova/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/cordova/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/cordova/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/cordova/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/cordova/release-notes",
    },
  ],

  reactnativeSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for React Native",
      collapsed: false,
      items: ["sdks/react-native/add-sdk", "sdks/react-native/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/react-native/sparkscan/intro",
                "sdks/react-native/sparkscan/get-started",
                "sdks/react-native/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/react-native/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/react-native/barcode-selection/intro",
                "sdks/react-native/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/react-native/matrixscan-count/intro",
                "sdks/react-native/matrixscan-count/get-started",
                "sdks/react-native/matrixscan-count/advanced",
              ],
            },
            {
              type: 'category',
              label: 'MatrixScan Find',
              items: [
                "sdks/react-native/matrixscan-find/intro",
                "sdks/react-native/matrixscan-find/get-started",
                "sdks/react-native/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "Label Capture",
              items: [
                "sdks/react-native/label-capture/get-started",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/react-native/matrixscan/intro",
                "sdks/react-native/matrixscan/get-started",
   //             "sdks/react-native/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/react-native/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/react-native/id-capture/intro",
            "sdks/react-native/id-capture/get-started",
            "sdks/react-native/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/react-native/id-validate/intro",
            "sdks/react-native/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/react-native/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditLabelCapture",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/label-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/react-native/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/react-native/release-notes",
    },
  ],

  flutterSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Flutter",
      collapsed: false,
      items: ["sdks/flutter/add-sdk", "sdks/flutter/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/flutter/sparkscan/intro",
                "sdks/flutter/sparkscan/get-started",
                "sdks/flutter/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/flutter/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/flutter/barcode-selection/intro",
                "sdks/flutter/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/flutter/matrixscan-count/intro",
                "sdks/flutter/matrixscan-count/get-started",
                "sdks/flutter/matrixscan-count/advanced",
              ],
            },
            {
              type: 'category',
              label: 'MatrixScan Find',
              items: [
                "sdks/flutter/matrixscan-find/intro",
                "sdks/flutter/matrixscan-find/get-started",
                "sdks/flutter/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/flutter/matrixscan/intro",
                "sdks/flutter/matrixscan/get-started",
   //             "sdks/flutter/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/flutter/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/flutter/id-capture/intro",
            "sdks/flutter/id-capture/get-started",
            "sdks/flutter/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/flutter/id-validate/intro",
            "sdks/flutter/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/flutter/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/flutter/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/flutter/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/flutter/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/flutter/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/flutter/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/flutter/release-notes",
    },
  ],

  capacitorSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Capacitor",
      collapsed: false,
      items: ["sdks/capacitor/add-sdk", "sdks/capacitor/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/capacitor/sparkscan/intro",
                "sdks/capacitor/sparkscan/get-started",
                "sdks/capacitor/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/capacitor/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/capacitor/barcode-selection/intro",
                "sdks/capacitor/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/capacitor/matrixscan-count/intro",
                "sdks/capacitor/matrixscan-count/get-started",
                "sdks/capacitor/matrixscan-count/advanced",
              ],
            },
            {
              type: 'category',
              label: 'MatrixScan Find',
              items: [
                "sdks/capacitor/matrixscan-find/intro",
                "sdks/capacitor/matrixscan-find/get-started",
                "sdks/capacitor/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/capacitor/matrixscan/intro",
                "sdks/capacitor/matrixscan/get-started",
  //              "sdks/capacitor/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/capacitor/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/capacitor/id-capture/intro",
            "sdks/capacitor/id-capture/get-started",
            "sdks/capacitor/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/capacitor/id-validate/intro",
            "sdks/capacitor/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/capacitor/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/capacitor/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/capacitor/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/capacitor/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/capacitor/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/capacitor/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/capacitor/release-notes",
    },
  ],

  titaniumSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Titanium",
      collapsed: false,
      items: ["sdks/titanium/add-sdk", "sdks/titanium/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: "category",
              label: "Barcode Capture API",
              items: [
                "sdks/titanium/barcode-capture/get-started",
                "sdks/titanium/barcode-capture/configure-barcode-symbologies",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/titanium/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/titanium/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/titanium/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/titanium/release-notes",
    },
  ],

  xamarinIosSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Xamarin iOS",
      collapsed: false,
      items: ["sdks/xamarin/ios/add-sdk", "sdks/xamarin/ios/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/xamarin/ios/sparkscan/intro",
                "sdks/xamarin/ios/sparkscan/get-started",
                "sdks/xamarin/ios/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/xamarin/ios/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/xamarin/ios/barcode-selection/intro",
                "sdks/xamarin/ios/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/xamarin/ios/matrixscan-count/intro",
                "sdks/xamarin/ios/matrixscan-count/get-started",
                "sdks/xamarin/ios/matrixscan-count/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/xamarin/ios/matrixscan/intro",
                "sdks/xamarin/ios/matrixscan/get-started",
  //             "sdks/xamarin/ios/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/xamarin/ios/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/xamarin/ios/id-capture/intro",
            "sdks/xamarin/ios/id-capture/get-started",
            "sdks/xamarin/ios/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/xamarin/ios/id-validate/intro",
            "sdks/xamarin/ios/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/xamarin/ios/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.ios/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.ios/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.ios/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.ios/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.ios/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/xamarin/ios/release-notes",
    },
  ],

  xamarinAndroidSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Xamarin Android",
      collapsed: false,
      items: ["sdks/xamarin/android/add-sdk", "sdks/xamarin/android/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/xamarin/android/sparkscan/intro",
                "sdks/xamarin/android/sparkscan/get-started",
                "sdks/xamarin/android/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/xamarin/android/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/xamarin/android/barcode-selection/intro",
                "sdks/xamarin/android/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/xamarin/android/matrixscan-count/intro",
                "sdks/xamarin/android/matrixscan-count/get-started",
                "sdks/xamarin/android/matrixscan-count/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/xamarin/android/matrixscan/intro",
                "sdks/xamarin/android/matrixscan/get-started",
  //              "sdks/xamarin/android/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/xamarin/android/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/xamarin/android/id-capture/intro",
            "sdks/xamarin/android/id-capture/get-started",
            "sdks/xamarin/android/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/xamarin/android/id-validate/intro",
            "sdks/xamarin/android/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/xamarin/android/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.android/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.android/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.android/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.android/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.android/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/xamarin/android/release-notes",
    },
  ],

  xamarinFormsSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for Xamarin Forms",
      collapsed: false,
      items: ["sdks/xamarin/forms/add-sdk", "sdks/xamarin/forms/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/xamarin/forms/sparkscan/intro",
                "sdks/xamarin/forms/sparkscan/get-started",
                "sdks/xamarin/forms/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/xamarin/forms/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/xamarin/forms/barcode-selection/intro",
                "sdks/xamarin/forms/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/xamarin/forms/matrixscan-count/intro",
                "sdks/xamarin/forms/matrixscan-count/get-started",
                "sdks/xamarin/forms/matrixscan-count/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/xamarin/forms/matrixscan/intro",
                "sdks/xamarin/forms/matrixscan/get-started",
  //              "sdks/xamarin/forms/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/xamarin/forms/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/xamarin/forms/id-capture/intro",
            "sdks/xamarin/forms/id-capture/get-started",
            "sdks/xamarin/forms/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/xamarin/forms/id-validate/intro",
            "sdks/xamarin/forms/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/xamarin/forms/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.forms/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.forms/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.forms/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.forms/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/xamarin.forms/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/xamarin/forms/release-notes",
    },
  ],

  netIosSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for .NET iOS",
      collapsed: false,
      items: ["sdks/net/ios/add-sdk", "sdks/net/ios/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/net/ios/sparkscan/intro",
                "sdks/net/ios/sparkscan/get-started",
                "sdks/net/ios/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/net/ios/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/net/ios/barcode-selection/intro",
                "sdks/net/ios/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/net/ios/matrixscan-count/intro",
                "sdks/net/ios/matrixscan-count/get-started",
                "sdks/net/ios/matrixscan-count/advanced",
              ],
            },
            {
              type: 'category',
              label: 'MatrixScan Find',
              items: [
                "sdks/net/ios/matrixscan-find/intro",
                "sdks/net/ios/matrixscan-find/get-started",
                "sdks/net/ios/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/net/ios/matrixscan/intro",
                "sdks/net/ios/matrixscan/get-started",
  //              "sdks/net/ios/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/net/ios/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/net/ios/id-capture/intro",
            "sdks/net/ios/id-capture/get-started",
            "sdks/net/ios/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/net/ios/id-validate/intro",
            "sdks/net/ios/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/net/ios/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.ios/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.ios/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.ios/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.ios/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.ios/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/net/ios/release-notes",
    },
  ],

  netAndroidSidebar: [
    {
      type: "category",
      label: "Data Capture SDK for .NET Android",
      collapsed: false,
      items: ["sdks/net/android/add-sdk", "sdks/net/android/samples"],
    },
    {
      type: "category",
      label: "Barcode Scanning",
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Single Scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'SparkScan',
              items: [
                "sdks/net/android/sparkscan/intro",
                "sdks/net/android/sparkscan/get-started",
                "sdks/net/android/sparkscan/advanced",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Capture API',
              items: [
                "sdks/net/android/barcode-capture/get-started",
              ],
            },
            {
              type: 'category',
              label: 'Barcode Selection',
              items: [
                "sdks/net/android/barcode-selection/intro",
                "sdks/net/android/barcode-selection/get-started",
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Multi-scanning',
          collapsed: false,
          items: [
            {
              type: 'category',
              label: 'MatrixScan Count',
              items: [
                "sdks/net/android/matrixscan-count/intro",
                "sdks/net/android/matrixscan-count/get-started",
                "sdks/net/android/matrixscan-count/advanced",
              ],
            },
            {
              type: 'category',
              label: 'MatrixScan Find',
              items: [
                "sdks/net/android/matrixscan-find/intro",
                "sdks/net/android/matrixscan-find/get-started",
                "sdks/net/android/matrixscan-find/advanced",
              ],
            },
            {
              type: "category",
              label: "MatrixScan API",
              items: [
                "sdks/net/android/matrixscan/intro",
                "sdks/net/android/matrixscan/get-started",
   //             "sdks/net/android/matrixscan/advanced",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "sdks/net/android/barcode-capture/configure-barcode-symbologies",
          label: "Configure Barcode Symbologies",
        }, 
      ],
    },
    {
      type: "category",
      label: "ID Scanning",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "ID Capture",
          items: [
            "sdks/net/android/id-capture/intro",
            "sdks/net/android/id-capture/get-started",
            "sdks/net/android/id-capture/advanced",
          ],
        },
        {
          type: "category",
          label: "ID Validate",
          items: [
            "sdks/net/android/id-validate/intro",
            "sdks/net/android/id-validate/get-started",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Additional Functionalities",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Parser",
          items: ["sdks/net/android/parser/get-started"],
        },
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        {
          type: "link",
          label: "ScanditCaptureCore",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.android/core/api.html",
        },
        {
          type: "link",
          label: "ScanditBarcodeCapture",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.android/barcode-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditIdCapture",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.android/id-capture/api.html",
        },
        {
          type: "link",
          label: "ScanditParser",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.android/parser/api.html",
        },
        {
          type: "link",
          label: "Index",
          href: "https://docs.scandit.com/data-capture-sdk/dotnet.android/genindex.html",
        },
      ],
    },
    {
      type: "doc",
      label: "Release Notes",
      id: "sdks/net/android/release-notes",
    },
  ],
};

export default sidebars;
