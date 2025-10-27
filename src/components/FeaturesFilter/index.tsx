import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Feature, Section, IntegrationPath, CrossProductFeature, FRAMEWORKS, PRODUCTS, INTEGRATION_PATHS, FRAMEWORK_KEYS, PRODUCT_KEYS, INTEGRATION_PATH_KEYS } from './types';

const FeaturesFilter: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [integrationPathFilter, setIntegrationPathFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Cross-product features organized by category
  const crossProductFeatures: CrossProductFeature[] = [
    // Smart Features Category
    {
      name: 'Smart Scan Intention',
      description: 'Automatically detects the barcode a user wants to scan using advanced AI algorithms that analyze environment and target characteristics. Reduces unwanted scans by up to 100%.',
      category: 'Smart Features',
      availableInProducts: [
        { productKey: 'barcode-capture', notes: 'Available' },
        { productKey: 'sparkscan', notes: 'Enabled by default' }
      ],
      frameworks: {
        'iOS': { version: '7.0', apiUrl: '/sdks/ios/barcode-capture/advanced#smart-scan-intention' },
        'Android': { version: '7.0', apiUrl: '/sdks/android/barcode-capture/advanced#smart-scan-intention' },
        'Cordova': { version: '7.0', apiUrl: '/sdks/cordova/barcode-capture/advanced#smart-scan-intention' },
        'React Native': { version: '7.0', apiUrl: '/sdks/react-native/barcode-capture/advanced#smart-scan-intention' },
        'Flutter': { version: '7.0', apiUrl: '/sdks/flutter/barcode-capture/advanced#smart-scan-intention' },
        'Capacitor': { version: '7.0', apiUrl: '/sdks/capacitor/barcode-capture/advanced#smart-scan-intention' },
        'Titanium': { version: 'n/a' },
        'Web': { version: '7.0', apiUrl: '/sdks/web/barcode-capture/advanced#smart-scan-intention' },
        '.NET iOS': { version: '7.0', apiUrl: '/sdks/net/ios/barcode-capture/advanced#smart-scan-intention' },
        '.NET Android': { version: '7.0', apiUrl: '/sdks/net/android/barcode-capture/advanced#smart-scan-intention' }
      }
    },
    {
      name: 'Smart Scan Selection',
      description: 'Intelligently selects the most relevant barcode when multiple codes are in close proximity, improving accuracy in dense scanning environments.',
      category: 'Smart Features',
      availableInProducts: [
        { productKey: 'sparkscan', notes: 'Available' }
      ],
      frameworks: {
        'iOS': { version: '7.0', apiUrl: '/sdks/ios/sparkscan/advanced#smart-scan-selection' },
        'Android': { version: '7.0', apiUrl: '/sdks/android/sparkscan/advanced#smart-scan-selection' },
        'Cordova': { version: '7.0', apiUrl: '/sdks/cordova/sparkscan/advanced#smart-scan-selection' },
        'React Native': { version: '7.0', apiUrl: '/sdks/react-native/sparkscan/advanced#smart-scan-selection' },
        'Flutter': { version: '7.0', apiUrl: '/sdks/flutter/sparkscan/advanced#smart-scan-selection' },
        'Capacitor': { version: '7.0', apiUrl: '/sdks/capacitor/sparkscan/advanced#smart-scan-selection' },
        'Titanium': { version: 'n/a' },
        'Web': { version: '7.0', apiUrl: '/sdks/web/sparkscan/advanced#smart-scan-selection' },
        '.NET iOS': { version: '7.0', apiUrl: '/sdks/net/ios/sparkscan/advanced#smart-scan-selection' },
        '.NET Android': { version: '7.0', apiUrl: '/sdks/net/android/sparkscan/advanced#smart-scan-selection' }
      }
    },
    {
      name: 'OCR Fallback',
      description: 'Automatically falls back to OCR when barcode scanning is unsuccessful, ensuring data capture even when barcodes are damaged or unreadable.',
      category: 'Smart Features',
      availableInProducts: [
        { productKey: 'barcode-capture', notes: 'Available' },
        { productKey: 'sparkscan', notes: 'Available' }
      ],
      frameworks: {
        'iOS': { version: '7.0', apiUrl: '/sdks/ios/barcode-capture/advanced#ocr-fallback' },
        'Android': { version: '7.0', apiUrl: '/sdks/android/barcode-capture/advanced#ocr-fallback' },
        'Cordova': { version: 'n/a' },
        'React Native': { version: '7.0', apiUrl: '/sdks/react-native/barcode-capture/advanced#ocr-fallback' },
        'Flutter': { version: '7.2', apiUrl: '/sdks/flutter/barcode-capture/advanced#ocr-fallback' },
        'Capacitor': { version: 'n/a' },
        'Titanium': { version: 'n/a' },
        'Web': { version: '7.2', apiUrl: '/sdks/web/barcode-capture/advanced#ocr-fallback' },
        '.NET iOS': { version: 'n/a' },
        '.NET Android': { version: 'n/a' }
      }
    },
    {
      name: 'Smart Battery Management',
      description: 'Intelligently manages device battery usage during scanning sessions by optimizing camera and processing resources based on scanning conditions and device state.',
      category: 'Smart Features',
      availableInProducts: [
        { productKey: 'barcode-capture', notes: 'Available' },
        { productKey: 'sparkscan', notes: 'Available' }
      ],
      frameworks: {
        'iOS': { version: '7.0', apiUrl: '/sdks/ios/barcode-capture/advanced#smart-battery-management' },
        'Android': { version: '7.0', apiUrl: '/sdks/android/barcode-capture/advanced#smart-battery-management' },
        'Cordova': { version: '7.0', apiUrl: '/sdks/cordova/barcode-capture/advanced#smart-battery-management' },
        'React Native': { version: '7.0', apiUrl: '/sdks/react-native/barcode-capture/advanced#smart-battery-management' },
        'Flutter': { version: '7.0', apiUrl: '/sdks/flutter/barcode-capture/advanced#smart-battery-management' },
        'Capacitor': { version: '7.0', apiUrl: '/sdks/capacitor/barcode-capture/advanced#smart-battery-management' },
        'Titanium': { version: 'n/a' },
        'Web': { version: '7.0', apiUrl: '/sdks/web/barcode-capture/advanced#smart-battery-management' },
        '.NET iOS': { version: '7.0', apiUrl: '/sdks/net/ios/barcode-capture/advanced#smart-battery-management' },
        '.NET Android': { version: '7.0', apiUrl: '/sdks/net/android/barcode-capture/advanced#smart-battery-management' }
      }
    },
    {
      name: 'Smart Duplicate Filter',
      description: 'Automatically filters out duplicate barcodes during scanning sessions, preventing redundant data entry and improving workflow efficiency.',
      category: 'Smart Features',
      availableInProducts: [
        { productKey: 'barcode-capture', notes: 'Available' },
        { productKey: 'sparkscan', notes: 'Available' }
      ],
      frameworks: {
        'iOS': { version: '7.0', apiUrl: '/sdks/ios/barcode-capture/advanced#smart-duplicate-filter' },
        'Android': { version: '7.0', apiUrl: '/sdks/android/barcode-capture/advanced#smart-duplicate-filter' },
        'Cordova': { version: '7.0', apiUrl: '/sdks/cordova/barcode-capture/advanced#smart-duplicate-filter' },
        'React Native': { version: '7.0', apiUrl: '/sdks/react-native/barcode-capture/advanced#smart-duplicate-filter' },
        'Flutter': { version: '7.0', apiUrl: '/sdks/flutter/barcode-capture/advanced#smart-duplicate-filter' },
        'Capacitor': { version: '7.0', apiUrl: '/sdks/capacitor/barcode-capture/advanced#smart-duplicate-filter' },
        'Titanium': { version: 'n/a' },
        'Web': { version: '7.0', apiUrl: '/sdks/web/barcode-capture/advanced#smart-duplicate-filter' },
        '.NET iOS': { version: '7.0', apiUrl: '/sdks/net/ios/barcode-capture/advanced#smart-duplicate-filter' },
        '.NET Android': { version: '7.0', apiUrl: '/sdks/net/android/barcode-capture/advanced#smart-duplicate-filter' }
      }
    }
  ];

  // Pre-defined data structure with only the requested product tabs
  const featuresData: Section[] = [
    {
      title: 'Barcode Capture',
      description: 'The foundational, fully customizable SDK for integrating high-performance single barcode scanning. Offers complete control over UI and scanning experience with unparalleled performance in difficult conditions. Supports 20,000+ smart device models and all major development frameworks.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK Integration' }
      ],
      features: [
        {
          name: 'Barcode Capture SDK',
          description: 'Main SDK for barcode scanning with camera integration',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/barcode-capture/get-started' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/barcode-capture/get-started' },
            'Cordova': { version: '6.1', apiUrl: '/sdks/cordova/barcode-capture/get-started' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/barcode-capture/get-started' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/barcode-capture/get-started' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/barcode-capture/get-started' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/barcode-capture/get-started' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/barcode-capture/get-started' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/barcode-capture/get-started' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/barcode-capture/get-started' }
          }
        },
      ]
    },
    {
      title: 'SparkScan',
      description: 'Pre-built, high-performance barcode scanning component with minimalistic floating UI. Integrates in minutes with just a few lines of code. Features pre-optimized ergonomic UX with continuous scanning, tap-to-scan, and target/selection modes. Includes pre-built buttons to switch to advanced modes like Barcode Count, Find, and Smart Label Capture.',
      integrationPaths: [
        { type: 'Pre-built Component', label: 'Pre-built Component' }
      ],
      features: [
        {
          name: 'SparkScan SDK',
          description: 'Pre-built scanning interface with customizable UI',
          category: 'SparkScan',
          frameworks: {
            'iOS': { version: '6.15', apiUrl: '/sdks/ios/sparkscan/intro' },
            'Android': { version: '6.15', apiUrl: '/sdks/android/sparkscan/intro' },
            'Cordova': { version: '6.23', apiUrl: '/sdks/cordova/sparkscan/intro' },
            'React Native': { version: '6.16', apiUrl: '/sdks/react-native/sparkscan/intro' },
            'Flutter': { version: '6.20', apiUrl: '/sdks/flutter/sparkscan/intro' },
            'Capacitor': { version: '6.22', apiUrl: '/sdks/capacitor/sparkscan/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: '6.21', apiUrl: '/sdks/web/sparkscan/intro' },
            '.NET iOS': { version: '6.22', apiUrl: '/sdks/net/ios/sparkscan/intro' },
            '.NET Android': { version: '6.22', apiUrl: '/sdks/net/android/sparkscan/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan Batch',
      description: 'Locate, track, and decode multiple barcodes simultaneously in the camera view. Ideal for scan-intensive workflows where the goal is to capture a list of all items present—perfect for proof of delivery, high-volume receiving, and accelerating packing processes. Massively accelerates workflows compared to single scanning.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' },
        { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
      ],
      features: [
        {
          name: 'MatrixScan Batch SDK',
          description: 'Scan multiple barcodes simultaneously with batch processing',
          category: 'MatrixScan Batch',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/matrixscan/intro' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/matrixscan/intro' },
            'Cordova': { version: '6.1', apiUrl: '/sdks/cordova/matrixscan/intro' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/matrixscan/intro' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/matrixscan/intro' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/matrixscan/intro' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/matrixscan/intro' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/matrixscan/intro' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/matrixscan/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/matrixscan/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan AR',
      description: 'Highly customizable SDK combining high-speed multiple barcode scanning with custom AR overlays. Display real-time contextual information, graphics, or interactive elements on physical items in the live camera view. Ideal for stock levels, sorting instructions, or creating interactive experiences. Offers maximum flexibility and customization.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' }
      ],
      features: [
        {
          name: 'MatrixScan AR SDK',
          description: 'AR-powered scanning with real-time visual feedback',
          category: 'MatrixScan AR',
          frameworks: {
            'iOS': { version: '7.1', apiUrl: '/sdks/ios/matrixscan-ar/intro' },
            'Android': { version: '7.1', apiUrl: '/sdks/android/matrixscan-ar/intro' },
            'Cordova': { version: 'n/a' },
            'React Native': { version: '7.1', apiUrl: '/sdks/react-native/matrixscan-ar/intro' },
            'Flutter': { version: '7.1', apiUrl: '/sdks/flutter/matrixscan-ar/intro' },
            'Capacitor': { version: 'n/a' },
            'Titanium': { version: 'n/a' },
            'Web': { version: '7.1', apiUrl: '/sdks/web/matrixscan-ar/intro' },
            '.NET iOS': { version: '7.1', apiUrl: '/sdks/net/ios/matrixscan-ar/intro' },
            '.NET Android': { version: '7.1', apiUrl: '/sdks/net/android/matrixscan-ar/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan Count',
      description: 'Pre-built scan-and-count solution that scans multiple items at once and verifies against expected lists or manifests. Speeds up counting workflows by up to 10x with intuitive AR feedback that makes accuracy effortless. Perfect for automating inventory management, receiving goods, cycle counting, and full stock takes.',
      integrationPaths: [
        { type: 'Pre-built Component', label: 'Pre-built Component' },
        { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
      ],
      features: [
        {
          name: 'MatrixScan Count SDK',
          description: 'Count and track multiple barcodes in real-time',
          category: 'MatrixScan Count',
          frameworks: {
            'iOS': { version: '6.9', apiUrl: '/sdks/ios/matrixscan-count/intro' },
            'Android': { version: '6.9', apiUrl: '/sdks/android/matrixscan-count/intro' },
            'Cordova': { version: '6.10', apiUrl: '/sdks/cordova/matrixscan-count/intro' },
            'React Native': { version: '6.10', apiUrl: '/sdks/react-native/matrixscan-count/intro' },
            'Flutter': { version: '6.10', apiUrl: '/sdks/flutter/matrixscan-count/intro' },
            'Capacitor': { version: '6.12', apiUrl: '/sdks/capacitor/matrixscan-count/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: 'n/a' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/matrixscan-count/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/matrixscan-count/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan Find',
      description: 'Pre-built AR component that helps users instantly locate specific items from a predefined list in visually crowded environments. Perfect for in-store order picking (click-and-collect), finding customer parcels at PUDO points, or locating specific baggage. The fastest way to deploy a "search and find" feature with an out-of-the-box UI.',
      integrationPaths: [
        { type: 'Pre-built Component', label: 'Pre-built Component' },
        { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
      ],
      features: [
        {
          name: 'MatrixScan Find SDK',
          description: 'Locate and highlight specific barcodes',
          category: 'MatrixScan Find',
          frameworks: {
            'iOS': { version: '6.9', apiUrl: '/sdks/ios/matrixscan-find/intro' },
            'Android': { version: '6.9', apiUrl: '/sdks/android/matrixscan-find/intro' },
            'Cordova': { version: '6.10', apiUrl: '/sdks/cordova/matrixscan-find/intro' },
            'React Native': { version: '6.10', apiUrl: '/sdks/react-native/matrixscan-find/intro' },
            'Flutter': { version: '6.10', apiUrl: '/sdks/flutter/matrixscan-find/intro' },
            'Capacitor': { version: '6.12', apiUrl: '/sdks/capacitor/matrixscan-find/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: 'n/a' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/matrixscan-find/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/matrixscan-find/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan Pick',
      description: 'AR-guided workflow solution that transforms complex multi-item tasks into visual, interactive checklists. Uses distinct AR icons to assign tasks and track completion. Eliminates errors and guesswork by visually guiding users through bulk tasks like receiving with exception handling, guided restocking, and staging area audits.',
      integrationPaths: [
        { type: 'Pre-built Component', label: 'Pre-built Component' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan Pick SDK',
          description: 'Pre-built but highly customizable UI for sophisticated AR-guided workflows',
          category: 'MatrixScan Pick',
          frameworks: {
            'iOS': { version: '6.9', apiUrl: '/sdks/ios/matrixscan-pick/intro' },
            'Android': { version: '6.9', apiUrl: '/sdks/android/matrixscan-pick/intro' },
            'Cordova': { version: '6.10', apiUrl: '/sdks/cordova/matrixscan-pick/intro' },
            'React Native': { version: '6.10', apiUrl: '/sdks/react-native/matrixscan-pick/intro' },
            'Flutter': { version: '6.10', apiUrl: '/sdks/flutter/matrixscan-pick/intro' },
            'Capacitor': { version: '6.12', apiUrl: '/sdks/capacitor/matrixscan-pick/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: 'n/a' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/matrixscan-pick/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/matrixscan-pick/intro' }
          }
        }
      ]
    },
    {
      title: 'Barcode Selection',
      description: 'Precisely select one specific barcode among densely packed codes with high accuracy. Perfect when you need to capture a single barcode from labels tightly packed together, such as on shipping manifests or shelves with many item labels.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'Barcode Selection SDK',
          description: 'Select specific barcodes with precision from densely packed areas',
          category: 'Barcode Selection',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/barcode-selection/intro' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/barcode-selection/intro' },
            'Cordova': { version: '6.1', apiUrl: '/sdks/cordova/barcode-selection/intro' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/barcode-selection/intro' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/barcode-selection/intro' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/barcode-selection/intro' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/barcode-selection/intro' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/barcode-selection/intro' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/barcode-selection/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/barcode-selection/intro' }
          }
        }
      ]
    },
    {
      title: 'Smart Label Capture',
      description: 'The ONLY Scandit product with OCR functionality. Simultaneously captures multiple barcodes AND printed text fields (expiry dates, serial/lot numbers, unit prices, weights) from labels in a single scan. Uses a semantic approach—just define what you\'re looking for (e.g., "expiry date") and it works across many label layouts. Drastically reduces manual data entry errors.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' },
        { type: 'Pre-built Component', label: 'Pre-built Validation Flow' },
        { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'Smart Label Capture SDK',
          description: 'Custom SDK for building fully customized label capture experiences, or use the pre-built Validation Flow for rapid deployment',
          category: 'Smart Label Capture',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/label-capture/intro' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/label-capture/intro' },
            'Cordova': { version: 'n/a' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/label-capture/intro' },
            'Flutter': { version: '7.2', apiUrl: '/sdks/flutter/label-capture/intro' },
            'Capacitor': { version: 'n/a' },
            'Titanium': { version: 'n/a' },
            'Web': { version: '7.2', apiUrl: '/sdks/web/label-capture/intro' },
            '.NET iOS': { version: 'n/a' },
            '.NET Android': { version: 'n/a' }
          }
        }
      ]
    },
    {
      title: 'Parser',
      description: 'Extract structured data from encoded barcodes including GS1, AAMVA, HIBC, and other industry-standard formats. Automatically parse complex barcode data into easily usable fields without manual string manipulation.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'Parser SDK',
          description: 'Parse and extract structured data from barcodes',
          category: 'Parser',
          frameworks: {
            'iOS': { version: '6.1', apiUrl: '/sdks/ios/parser/get-started' },
            'Android': { version: '6.1', apiUrl: '/sdks/android/parser/get-started' },
            'Cordova': { version: '6.3', apiUrl: '/sdks/cordova/parser/get-started' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/parser/get-started' },
            'Flutter': { version: '6.10', apiUrl: '/sdks/flutter/parser/get-started' },
            'Capacitor': { version: '6.10', apiUrl: '/sdks/capacitor/parser/get-started' },
            'Titanium': { version: 'n/a' },
            'Web': { version: '6.25', apiUrl: '/sdks/web/parser/get-started' },
            '.NET iOS': { version: '6.22', apiUrl: '/sdks/net/ios/parser/get-started' },
            '.NET Android': { version: '6.21', apiUrl: '/sdks/net/android/parser/get-started' }
          }
        }
      ]
    },
    {
      title: 'Barcode Generator',
      description: 'Programmatically generate high-quality barcodes for various symbologies directly within your application. Create barcodes for printing, display, or digital use without external dependencies.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'Barcode Generator SDK',
          description: 'Generate barcodes programmatically for various symbologies',
          category: 'Barcode Generator',
          frameworks: {
            'iOS': { version: '6.21', apiUrl: '/sdks/ios/barcode-generator/' },
            'Android': { version: '6.21', apiUrl: '/sdks/android/barcode-generator/' },
            'Cordova': { version: '7.0', apiUrl: '/sdks/cordova/barcode-generator/' },
            'React Native': { version: '6.24', apiUrl: '/sdks/react-native/barcode-generator/' },
            'Flutter': { version: '7.2', apiUrl: '/sdks/flutter/barcode-generator/' },
            'Capacitor': { version: '7.0', apiUrl: '/sdks/capacitor/barcode-generator/' },
            'Titanium': { version: 'n/a' },
            'Web': { version: 'n/a' },
            '.NET iOS': { version: 'n/a' },
            '.NET Android': { version: 'n/a' }
          }
        }
      ]
    },
    {
      title: 'ID Capture',
      description: 'Scan and validate identity documents including passports, driver\'s licenses, and national IDs. Extract personal information with OCR and perform verification checks for secure identity validation in onboarding and access control workflows.',
      integrationPaths: [
        { type: 'Custom SDK', label: 'Custom SDK' }
      ],
      isCollapsed: false,
      features: [
        {
          name: 'ID Capture SDK',
          description: 'Capture and process identity documents with OCR and verification',
          category: 'ID Capture',
          frameworks: {
            'iOS': { version: '6.5', apiUrl: '/sdks/ios/id-capture/intro' },
            'Android': { version: '6.5', apiUrl: '/sdks/android/id-capture/intro' },
            'Cordova': { version: '6.6', apiUrl: '/sdks/cordova/id-capture/intro' },
            'React Native': { version: '6.8', apiUrl: '/sdks/react-native/id-capture/intro' },
            'Flutter': { version: '6.11', apiUrl: '/sdks/flutter/id-capture/intro' },
            'Capacitor': { version: '6.14', apiUrl: '/sdks/capacitor/id-capture/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/id-capture/intro' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/id-capture/intro' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/id-capture/intro' }
          }
        }
      ]
    }
  ];

  // Transform cross-product features into product sections
  const transformFeaturesToSections = (): Section[] => {
    const sectionsMap = new Map<string, Section>();
    
    // Initialize with existing product sections
    featuresData.forEach(section => {
      const productKey = PRODUCTS.find(p => p.name === section.title)?.key;
      if (productKey) {
        sectionsMap.set(productKey, { ...section, features: [...section.features] });
      }
    });
    
    // Add cross-product features to relevant product sections
    crossProductFeatures.forEach(crossFeature => {
      crossFeature.availableInProducts.forEach(({ productKey, notes }) => {
        const section = sectionsMap.get(productKey);
        if (section) {
          // Create a Feature object from CrossProductFeature
          const feature: Feature = {
            name: crossFeature.name,
            description: notes ? `${crossFeature.description} (${notes})` : crossFeature.description,
            category: crossFeature.category,
            frameworks: crossFeature.frameworks
          };
          
          // Add feature to the product section
          section.features.push(feature);
        }
      });
    });
    
    return Array.from(sectionsMap.values());
  };

  // Initialize data on mount
  useEffect(() => {
    const transformedSections = transformFeaturesToSections();
    setSections(transformedSections);
    
    // Initialize all sections as collapsed by default
    const initialCollapsed: Record<string, boolean> = {};
    transformedSections.forEach(section => {
      initialCollapsed[section.title] = true;
    });
    setCollapsedSections(initialCollapsed);
    
    setIsLoading(false);
  }, []);

  // Filter sections based on current filters
  const filteredSections = sections.filter(section => {
    // Product filter
    if (productFilter) {
      const sectionKey = PRODUCT_KEYS.find(key => 
        PRODUCTS.find(p => p.key === key)?.name.toLowerCase() === section.title.toLowerCase()
      );
      if (sectionKey !== productFilter) return false;
    }

    // Integration Path filter
    if (integrationPathFilter) {
      if (!section.integrationPaths) return false;
      
      const hasIntegrationPath = section.integrationPaths.some(path => {
        if (integrationPathFilter === 'custom-sdk') {
          return path.type === 'Custom SDK';
        } else if (integrationPathFilter === 'pre-built') {
          return path.type === 'Pre-built Component';
        } else if (integrationPathFilter === 'no-code') {
          return path.type === 'No-Code';
        }
        return false;
      });
      if (!hasIntegrationPath) return false;
    }


    // Framework filter
    if (frameworkFilter) {
      const hasFramework = section.features.some(feature => {
        const frameworkName = FRAMEWORKS.find(f => f.key === frameworkFilter)?.name;
        if (!frameworkName) return false;
        const frameworkData = feature.frameworks[frameworkName];
        return frameworkData && frameworkData.version !== 'n/a';
      });
      if (!hasFramework) return false;
    }

    return true;
  });

  // Filter features within sections
  const getFilteredFeatures = (features: Feature[]) => {
    return features.filter(feature => {
      // Framework filter
      if (frameworkFilter) {
        const frameworkName = FRAMEWORKS.find(f => f.key === frameworkFilter)?.name;
        if (!frameworkName) return false;
        const frameworkData = feature.frameworks[frameworkName];
        return frameworkData && frameworkData.version !== 'n/a';
      }

      return true;
    });
  };

  // Group features by category
  const groupFeaturesByCategory = (features: Feature[]) => {
    const grouped = features.reduce((acc, feature) => {
      const category = feature.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {} as Record<string, Feature[]>);

    return grouped;
  };

  const clearFilters = () => {
    setFrameworkFilter('');
    setProductFilter('');
    setIntegrationPathFilter('');
  };

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };


  if (isLoading) {
    return <div className={styles.loading}></div>;
  }

  return (
    <div>
      {/* Filter Controls */}
      <div className={styles.filters}>
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="framework-filter" className={styles.filterLabel}>
              Framework:
            </label>
            <select
              id="framework-filter"
              className={styles.filterSelect}
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
            >
              <option value="">All Frameworks</option>
              {FRAMEWORKS.map(framework => (
                <option key={framework.key} value={framework.key}>
                  {framework.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="product-filter" className={styles.filterLabel}>
              Product:
            </label>
            <select
              id="product-filter"
              className={styles.filterSelect}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="">All Products</option>
              {PRODUCTS.map(product => (
                <option key={product.key} value={product.key}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="integration-path-filter" className={styles.filterLabel}>
              Integration Path:
            </label>
            <select
              id="integration-path-filter"
              className={styles.filterSelect}
              value={integrationPathFilter}
              onChange={(e) => setIntegrationPathFilter(e.target.value)}
            >
              <option value="">All Paths</option>
              {INTEGRATION_PATHS.map(path => (
                <option key={path.key} value={path.key}>
                  {path.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={styles.clearButton}
            onClick={clearFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Product Sections */}
      {filteredSections.map((section, index) => {
        const filteredFeatures = getFilteredFeatures(section.features);
        
        if (filteredFeatures.length === 0) return null;

        // First feature is the product SDK (availability)
        const productSDK = filteredFeatures[0];
        // Remaining features are additional features
        const additionalFeatures = filteredFeatures.slice(1);

        return (
          <div key={index} className={styles.productSection}>
            <div className={`${styles.sectionHeader} ${collapsedSections[section.title] ? styles.collapsed : ''} ${additionalFeatures.length === 0 ? styles.noCollapseButton : ''}`}>
              <div className={styles.sectionContent}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionDescription}>{section.description}</p>
                
                {/* Integration Paths and Framework Availability Side by Side */}
                <div className={styles.integrationPaths}>
                  {/* Integration Paths - 30% */}
                  <div className={styles.integrationPathsContent}>
                    {section.integrationPaths && section.integrationPaths.length > 0 && (
                      <>
                        <h3 className={styles.availabilityTitle}>Integration Path</h3>
                        <div className={styles.integrationPathsList}>
                          {section.integrationPaths
                            .filter(path => {
                              if (!integrationPathFilter) return true;
                              if (integrationPathFilter === 'custom-sdk') {
                                return path.type === 'Custom SDK';
                              } else if (integrationPathFilter === 'pre-built') {
                                return path.type === 'Pre-built Component';
                              } else if (integrationPathFilter === 'no-code') {
                                return path.type === 'No-Code';
                              }
                              return false;
                            })
                            .map((path, pathIndex) => (
                              path.url ? (
                                <a
                                  key={pathIndex}
                                  href={path.url}
                                  className={styles.integrationPathItem}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {path.label}
                                </a>
                              ) : (
                                <span key={pathIndex} className={styles.integrationPathItem}>
                                  {path.label}
                                </span>
                              )
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Framework Availability - 70% */}
                  <div className={styles.frameworkAvailabilityContent}>
                    <h3 className={styles.availabilityTitle}>Framework Availability</h3>
                    <div className={styles.frameworkList}>
                        {FRAMEWORKS
                          .filter(framework => {
                            if (frameworkFilter && framework.key !== frameworkFilter) return false;
                            const frameworkData = productSDK.frameworks[framework.name];
                            return frameworkData && frameworkData.version !== 'n/a';
                          })
                          .map(framework => {
                            const frameworkData = productSDK.frameworks[framework.name];
                            const isAvailable = frameworkData && frameworkData.version !== 'n/a';
                            
                            if (isAvailable && frameworkData.apiUrl) {
                              return (
                                <a
                                  key={framework.key}
                                  href={frameworkData.apiUrl}
                                  className={styles.frameworkItem}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <span className={styles.frameworkName}>{framework.name}</span>
                                  <span className={`${styles.version} ${styles.versionLink}`}>
                                    {frameworkData.version}
                                  </span>
                                </a>
                              );
                            }
                            
                            return (
                              <div key={framework.key} className={styles.frameworkItem}>
                                <span className={styles.frameworkName}>{framework.name}</span>
                                <span className={styles.version}>
                                  {frameworkData.version}
                                </span>
                              </div>
                            );
                          })}
                    </div>
                  </div>
                </div>
              </div>
              {additionalFeatures.length > 0 && (
                <button 
                  className={styles.collapseButton}
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={!collapsedSections[section.title]}
                  aria-label={collapsedSections[section.title] ? `Expand ${section.title}` : `Collapse ${section.title}`}
                >
                  <span className={styles.collapseIcon}>
                    {collapsedSections[section.title] ? '▶' : '▼'}
                  </span>
                </button>
              )}
            </div>
            
            {/* Additional Features Grouped by Category */}
            {additionalFeatures.length > 0 && (
              <div className={`${styles.featureList} ${collapsedSections[section.title] ? styles.collapsed : ''}`}>
                {Object.entries(groupFeaturesByCategory(additionalFeatures)).map(([category, features]) => {
                  const categoryKey = `${section.title}-${category}`;
                  return (
                    <div key={category} className={styles.categoryGroup}>
                      <div className={styles.categoryHeader}>
                        <h3 className={styles.categoryTitle}>{category}</h3>
                        <button 
                          className={styles.categoryCollapseButton}
                          onClick={() => toggleCategory(categoryKey)}
                          aria-expanded={!collapsedCategories[categoryKey]}
                          aria-label={collapsedCategories[categoryKey] ? `Expand ${category}` : `Collapse ${category}`}
                        >
                          <span className={styles.categoryCollapseIcon}>
                            {collapsedCategories[categoryKey] ? '▶' : '▼'}
                          </span>
                        </button>
                      </div>
                      <div className={`${styles.categoryFeatures} ${collapsedCategories[categoryKey] ? styles.collapsed : ''}`}>
                        {features.map((feature, featureIndex) => (
                      <div key={featureIndex} className={styles.featureItem}>
                        <div className={styles.featureContent}>
                          <h4 className={styles.featureName}>{feature.name}</h4>
                          <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                        <div className={styles.frameworkList}>
                          {FRAMEWORKS
                            .filter(framework => {
                              if (frameworkFilter && framework.key !== frameworkFilter) return false;
                              const frameworkData = feature.frameworks[framework.name];
                              return frameworkData && frameworkData.version !== 'n/a';
                            })
                            .map(framework => {
                              const frameworkData = feature.frameworks[framework.name];
                              const isAvailable = frameworkData && frameworkData.version !== 'n/a';
                              
                              if (isAvailable && frameworkData.apiUrl) {
                                return (
                                  <a
                                    key={framework.key}
                                    href={frameworkData.apiUrl}
                                    className={styles.frameworkItem}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span className={styles.frameworkName}>{framework.name}</span>
                                    <span className={`${styles.version} ${styles.versionLink}`}>
                                      {frameworkData.version}
                                    </span>
                                  </a>
                                );
                              }
                              
                              return (
                                <div key={framework.key} className={styles.frameworkItem}>
                                  <span className={styles.frameworkName}>{framework.name}</span>
                                  <span className={styles.version}>
                                    {frameworkData.version}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesFilter;
