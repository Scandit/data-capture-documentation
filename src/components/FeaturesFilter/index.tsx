import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Feature, Section, IntegrationPath, CrossProductFeature, FRAMEWORKS, PRODUCTS, INTEGRATION_PATHS, FRAMEWORK_KEYS, PRODUCT_KEYS, INTEGRATION_PATH_KEYS } from './types';
import productsData from '@site/src/data/products.json';
import featuresData from '@site/src/data/features.json';

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

  // Load product data from JSON and convert to sections
  const loadProductSections = (): Section[] => {
    return productsData.map((product: any) => {
      // Define integration paths based on product
      const integrationPaths: IntegrationPath[] = [];
      
      if (product.key === 'sparkscan') {
        integrationPaths.push({ type: 'Pre-built Component', label: 'SDK with prebuild components' });
      } else if (product.key === 'matrixscan-count' || product.key === 'matrixscan-find') {
        integrationPaths.push(
          { type: 'Pre-built Component', label: 'SDK with prebuild components' },
          { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
        );
      } else if (product.key === 'smart-label-capture') {
        integrationPaths.push(
          { type: 'Custom SDK', label: 'SDK without prebuild components' },
          { type: 'Pre-built Component', label: 'Pre-built Validation Flow' },
          { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
        );
      } else if (product.key === 'matrixscan-batch') {
        integrationPaths.push(
          { type: 'Custom SDK', label: 'SDK without prebuild components' },
          { type: 'No-Code', label: 'Scandit Express (No-Code)', url: 'https://docs.scandit.com/hosted/express/overview/' }
        );
      } else {
        integrationPaths.push({ type: 'Custom SDK', label: 'SDK without prebuild components' });
      }

      // Create main SDK feature
      const mainFeature: Feature = {
        name: `${product.name} SDK`,
        description: product.key === 'sparkscan' 
          ? 'Pre-built scanning interface with customizable UI'
          : product.key === 'smart-label-capture'
          ? 'SDK without prebuild components for building fully customized label capture experiences, or use the pre-built Validation Flow for rapid deployment'
          : `Main SDK for ${product.name.toLowerCase()}`,
        category: product.name,
        frameworks: product.frameworks
      };

      return {
        title: product.name,
        description: product.description,
        integrationPaths,
        features: [mainFeature],
        isCollapsed: false
      };
    });
  };

  // Transform cross-product features into product sections
  const transformFeaturesToSections = (): Section[] => {
    const sectionsMap = new Map<string, Section>();
    
    // Initialize with product sections from JSON
    const productSections = loadProductSections();
    productSections.forEach(section => {
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

        // Add section headings based on product type
        const getSectionHeading = (sectionTitle: string) => {
          if (sectionTitle === 'SparkScan' || sectionTitle === 'Barcode Capture') {
            return { showHeading: index === 0, heading: 'Single Barcode Scanning' };
          } else if (sectionTitle.includes('MatrixScan')) {
            const matrixScanProducts = ['MatrixScan Batch', 'MatrixScan AR', 'MatrixScan Count', 'MatrixScan Find', 'MatrixScan Pick'];
            const currentIndex = matrixScanProducts.indexOf(sectionTitle);
            return { showHeading: currentIndex === 0, heading: 'Multi Barcode Scanning (MatrixScan)' };
          } else if (sectionTitle === 'Smart Label Capture' || sectionTitle === 'ID Capture') {
            const advancedFeatures = ['Smart Label Capture', 'ID Capture'];
            const currentIndex = advancedFeatures.indexOf(sectionTitle);
            return { showHeading: currentIndex === 0, heading: 'OCR Capable Scanning' };
          } else if (sectionTitle === 'Parser' || sectionTitle === 'Barcode Generator') {
            const productComponents = ['Parser', 'Barcode Generator'];
            const currentIndex = productComponents.indexOf(sectionTitle);
            return { showHeading: currentIndex === 0, heading: 'Components' };
          }
          return { showHeading: false, heading: '' };
        };

        const { showHeading, heading } = getSectionHeading(section.title);

        return (
          <div key={index}>
            {showHeading && (
              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionHeadingTitle}>{heading}</h2>
              </div>
            )}
            <div className={styles.productSection}>
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
                                </a>
                              );
                            }
                            
                            return (
                              <div key={framework.key} className={styles.frameworkItem}>
                                <span className={styles.frameworkName}>{framework.name}</span>
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
                                  </a>
                                );
                              }
                              
                              return (
                                <div key={framework.key} className={styles.frameworkItem}>
                                  <span className={styles.frameworkName}>{framework.name}</span>
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
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesFilter;
