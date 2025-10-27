import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Feature, Section, FRAMEWORKS, PRODUCTS, FRAMEWORK_KEYS, PRODUCT_KEYS } from './types';

const FeaturesFilter: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pre-defined data structure with only the requested product tabs
  const featuresData: Section[] = [
    {
      title: 'Barcode Capture',
      description: 'Core barcode scanning functionality for all platforms',
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
            'Xamarin iOS': { version: '6.2', apiUrl: '/sdks/xamarin/barcode-capture/get-started' },
            'Xamarin Android': { version: '6.2', apiUrl: '/sdks/xamarin/barcode-capture/get-started' },
            'Xamarin Forms': { version: '6.8', apiUrl: '/sdks/xamarin/barcode-capture/get-started' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/barcode-capture/get-started' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/barcode-capture/get-started' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/barcode-capture/get-started' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/barcode-capture/get-started' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/barcode-capture/get-started' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/barcode-capture/get-started' }
          }
        },
        {
          name: 'Extension Codes',
          description: 'Support for additional barcode symbologies and extensions',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': { version: '6.5', apiUrl: '/sdks/ios/extension-codes/' },
            'Android': { version: '6.5', apiUrl: '/sdks/android/extension-codes/' },
            'Cordova': { version: '6.5', apiUrl: '/sdks/cordova/extension-codes/' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/extension-codes/' },
            'Xamarin iOS': { version: '6.5', apiUrl: '/sdks/xamarin/extension-codes/' },
            'Xamarin Android': { version: '6.5', apiUrl: '/sdks/xamarin/extension-codes/' },
            'Xamarin Forms': { version: '6.8', apiUrl: '/sdks/xamarin/extension-codes/' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/extension-codes/' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/extension-codes/' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/extension-codes/' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/extension-codes/' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/extension-codes/' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/extension-codes/' }
          }
        },
        {
          name: 'Composite Codes',
          description: 'Support for composite barcode scanning (GS1 DataBar, etc.)',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': { version: '6.6', apiUrl: '/sdks/ios/composite-codes/' },
            'Android': { version: '6.6', apiUrl: '/sdks/android/composite-codes/' },
            'Cordova': { version: '6.6', apiUrl: '/sdks/cordova/composite-codes/' },
            'React Native': { version: '6.6', apiUrl: '/sdks/react-native/composite-codes/' },
            'Xamarin iOS': { version: '6.6', apiUrl: '/sdks/xamarin/composite-codes/' },
            'Xamarin Android': { version: '6.6', apiUrl: '/sdks/xamarin/composite-codes/' },
            'Xamarin Forms': { version: '6.8', apiUrl: '/sdks/xamarin/composite-codes/' },
            'Flutter': { version: '6.7', apiUrl: '/sdks/flutter/composite-codes/' },
            'Capacitor': { version: '6.8', apiUrl: '/sdks/capacitor/composite-codes/' },
            'Titanium': { version: '6.8', apiUrl: '/sdks/titanium/composite-codes/' },
            'Web': { version: '6.13', apiUrl: '/sdks/web/composite-codes/' },
            '.NET iOS': { version: '6.16', apiUrl: '/sdks/net/ios/composite-codes/' },
            '.NET Android': { version: '6.16', apiUrl: '/sdks/net/android/composite-codes/' }
          }
        }
      ]
    },
    {
      title: 'SparkScan',
      description: 'Ready-to-use barcode scanning UI component',
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
            'Xamarin iOS': { version: '6.16', apiUrl: '/sdks/xamarin/sparkscan/intro' },
            'Xamarin Android': { version: '6.16', apiUrl: '/sdks/xamarin/sparkscan/intro' },
            'Xamarin Forms': { version: '6.17', apiUrl: '/sdks/xamarin/sparkscan/intro' },
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
      description: 'Batch scanning for multiple barcodes in a single frame',
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
            'Xamarin iOS': { version: '6.2', apiUrl: '/sdks/xamarin/matrixscan/intro' },
            'Xamarin Android': { version: '6.2', apiUrl: '/sdks/xamarin/matrixscan/intro' },
            'Xamarin Forms': { version: '6.8', apiUrl: '/sdks/xamarin/matrixscan/intro' },
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
      description: 'Augmented reality barcode scanning with visual overlays',
      features: [
        {
          name: 'MatrixScan AR SDK',
          description: 'AR-powered scanning with real-time visual feedback',
          category: 'MatrixScan AR',
          frameworks: {
            'iOS': { version: 'n/a', apiUrl: '/sdks/ios/matrixscan-ar/intro' },
            'Android': { version: 'n/a', apiUrl: '/sdks/android/matrixscan-ar/intro' },
            'Cordova': { version: 'n/a', apiUrl: '/sdks/cordova/matrixscan-ar/intro' },
            'React Native': { version: 'n/a', apiUrl: '/sdks/react-native/matrixscan-ar/intro' },
            'Xamarin iOS': { version: 'n/a', apiUrl: '/sdks/xamarin/matrixscan-ar/intro' },
            'Xamarin Android': { version: 'n/a', apiUrl: '/sdks/xamarin/matrixscan-ar/intro' },
            'Xamarin Forms': { version: 'n/a', apiUrl: '/sdks/xamarin/matrixscan-ar/intro' },
            'Flutter': { version: 'n/a', apiUrl: '/sdks/flutter/matrixscan-ar/intro' },
            'Capacitor': { version: 'n/a', apiUrl: '/sdks/capacitor/matrixscan-ar/intro' },
            'Titanium': { version: 'n/a' },
            'Web': { version: 'n/a', apiUrl: '/sdks/web/matrixscan-ar/intro' },
            '.NET iOS': { version: 'n/a', apiUrl: '/sdks/net/ios/matrixscan-ar/intro' },
            '.NET Android': { version: 'n/a', apiUrl: '/sdks/net/android/matrixscan-ar/intro' }
          }
        }
      ]
    },
    {
      title: 'MatrixScan Count',
      description: 'Count multiple barcodes with visual feedback',
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
            'Xamarin iOS': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-count/intro' },
            'Xamarin Android': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-count/intro' },
            'Xamarin Forms': { version: '6.11', apiUrl: '/sdks/xamarin/matrixscan-count/intro' },
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
      description: 'Find specific barcodes in a field of view',
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
            'Xamarin iOS': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-find/intro' },
            'Xamarin Android': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-find/intro' },
            'Xamarin Forms': { version: '6.11', apiUrl: '/sdks/xamarin/matrixscan-find/intro' },
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
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan Pick SDK',
          description: 'Pick and select specific barcodes from multiple detected codes',
          category: 'MatrixScan Pick',
          frameworks: {
            'iOS': { version: '6.9', apiUrl: '/sdks/ios/matrixscan-pick/intro' },
            'Android': { version: '6.9', apiUrl: '/sdks/android/matrixscan-pick/intro' },
            'Cordova': { version: '6.10', apiUrl: '/sdks/cordova/matrixscan-pick/intro' },
            'React Native': { version: '6.10', apiUrl: '/sdks/react-native/matrixscan-pick/intro' },
            'Xamarin iOS': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-pick/intro' },
            'Xamarin Android': { version: '6.10', apiUrl: '/sdks/xamarin/matrixscan-pick/intro' },
            'Xamarin Forms': { version: '6.11', apiUrl: '/sdks/xamarin/matrixscan-pick/intro' },
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
      isCollapsed: false,
      features: [
        {
          name: 'Barcode Selection SDK',
          description: 'Select and manage barcode scanning sessions with user interaction',
          category: 'Barcode Selection',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/barcode-selection/intro' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/barcode-selection/intro' },
            'Cordova': { version: '6.1', apiUrl: '/sdks/cordova/barcode-selection/intro' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/barcode-selection/intro' },
            'Xamarin iOS': { version: '6.2', apiUrl: '/sdks/xamarin/barcode-selection/intro' },
            'Xamarin Android': { version: '6.2', apiUrl: '/sdks/xamarin/barcode-selection/intro' },
            'Xamarin Forms': { version: '6.8', apiUrl: '/sdks/xamarin/barcode-selection/intro' },
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
      isCollapsed: false,
      features: [
        {
          name: 'Smart Label Capture SDK',
          description: 'Capture and process label data with intelligent recognition',
          category: 'Smart Label Capture',
          frameworks: {
            'iOS': { version: '6.0', apiUrl: '/sdks/ios/label-capture/intro' },
            'Android': { version: '6.0', apiUrl: '/sdks/android/label-capture/intro' },
            'Cordova': { version: 'n/a' },
            'React Native': { version: '6.5', apiUrl: '/sdks/react-native/label-capture/intro' },
            'Xamarin iOS': { version: 'n/a' },
            'Xamarin Android': { version: 'n/a' },
            'Xamarin Forms': { version: 'n/a' },
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
            'Xamarin iOS': { version: '6.5', apiUrl: '/sdks/xamarin/parser/get-started' },
            'Xamarin Android': { version: '6.5', apiUrl: '/sdks/xamarin/parser/get-started' },
            'Xamarin Forms': { version: '6.9', apiUrl: '/sdks/xamarin/parser/get-started' },
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
            'Xamarin iOS': { version: 'n/a' },
            'Xamarin Android': { version: 'n/a' },
            'Xamarin Forms': { version: 'n/a' },
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
            'Xamarin iOS': { version: '6.9', apiUrl: '/sdks/xamarin/id-capture/intro' },
            'Xamarin Android': { version: '6.9', apiUrl: '/sdks/xamarin/id-capture/intro' },
            'Xamarin Forms': { version: '6.10', apiUrl: '/sdks/xamarin/id-capture/intro' },
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

  // Initialize data on mount
  useEffect(() => {
    setSections(featuresData);
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

    // Search filter
    if (searchQuery) {
      const hasMatchingFeature = section.features.some(feature =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (feature.description && feature.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (!hasMatchingFeature) return false;
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
      // Search filter
      if (searchQuery && 
          !feature.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(feature.description && feature.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }

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

  const clearFilters = () => {
    setFrameworkFilter('');
    setProductFilter('');
    setSearchQuery('');
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
            <label htmlFor="search" className={styles.filterLabel}>
              Search:
            </label>
            <input
              type="search"
              id="search"
              className={styles.filterSearch}
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
            <div className={styles.sectionHeader}>
              <div className={styles.sectionContent}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionDescription}>{section.description}</p>
              </div>
              
              {/* Product Availability */}
              <div className={styles.productAvailability}>
                <div className={styles.frameworkList}>
                  {FRAMEWORKS
                    .filter(framework => !frameworkFilter || framework.key === frameworkFilter)
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
                          <span className={`${styles.version} ${styles.na}`}>
                            {frameworkData?.version || 'n/a'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            {/* Additional Features */}
            {additionalFeatures.length > 0 && (
              <div className={styles.featureList}>
                {additionalFeatures.map((feature, featureIndex) => (
                  <div key={featureIndex} className={styles.featureItem}>
                    <div className={styles.featureContent}>
                      <h3 className={styles.featureName}>{feature.name}</h3>
                      <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                    <div className={styles.frameworkList}>
                      {FRAMEWORKS
                        .filter(framework => !frameworkFilter || framework.key === frameworkFilter)
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
                              <span className={`${styles.version} ${styles.na}`}>
                                {frameworkData?.version || 'n/a'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesFilter;
