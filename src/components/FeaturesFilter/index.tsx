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
      isCollapsed: false,
      features: [
        {
          name: 'Barcode Capture SDK',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        },
        {
          name: 'Extension Codes',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': '6.5',
            'Android': '6.5',
            'Cordova': '6.5',
            'React Native': '6.5',
            'Xamarin iOS': '6.5',
            'Xamarin Android': '6.5',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        },
        {
          name: 'Composite Codes',
          category: 'Barcode Capture',
          frameworks: {
            'iOS': '6.6',
            'Android': '6.6',
            'Cordova': '6.6',
            'React Native': '6.6',
            'Xamarin iOS': '6.6',
            'Xamarin Android': '6.6',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        }
      ]
    },
    {
      title: 'SparkScan',
      isCollapsed: false,
      features: [
        {
          name: 'SparkScan Core',
          category: 'SparkScan',
          frameworks: {
            'iOS': '6.15',
            'Android': '6.15',
            'Cordova': '6.23',
            'React Native': '6.16',
            'Xamarin iOS': '6.16',
            'Xamarin Android': '6.16',
            'Xamarin Forms': '6.17',
            'Flutter': '6.20',
            'Capacitor': '6.22',
            'Titanium': 'n/a',
            'Web': '6.21',
            '.NET iOS': '6.22',
            '.NET Android': '6.22'
          }
        }
      ]
    },
    {
      title: 'MatrixScan Batch',
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan Batch SDK',
          category: 'MatrixScan Batch',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        }
      ]
    },
    {
      title: 'MatrixScan AR',
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan AR SDK',
          category: 'MatrixScan AR',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        }
      ]
    },
    {
      title: 'MatrixScan Count',
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan Count SDK',
          category: 'MatrixScan Count',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
          }
        }
      ]
    },
    {
      title: 'MatrixScan Find',
      isCollapsed: false,
      features: [
        {
          name: 'MatrixScan Find SDK',
          category: 'MatrixScan Find',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'MatrixScan Pick',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'Barcode Selection',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'Smart Label Capture',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'Parser',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'Barcode Generator',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
          category: 'ID Capture',
          frameworks: {
            'iOS': '6.0',
            'Android': '6.0',
            'Cordova': '6.1',
            'React Native': '6.5',
            'Xamarin iOS': '6.2',
            'Xamarin Android': '6.2',
            'Xamarin Forms': '6.8',
            'Flutter': '6.7',
            'Capacitor': '6.8',
            'Titanium': '6.8',
            'Web': '6.13',
            '.NET iOS': '6.16',
            '.NET Android': '6.16'
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
        feature.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!hasMatchingFeature) return false;
    }

    // Framework filter
    if (frameworkFilter) {
      const hasFramework = section.features.some(feature => {
        const frameworkName = FRAMEWORKS.find(f => f.key === frameworkFilter)?.name;
        if (!frameworkName) return false;
        const version = feature.frameworks[frameworkName];
        return version && version !== 'n/a';
      });
      if (!hasFramework) return false;
    }

    return true;
  });

  // Filter features within sections
  const getFilteredFeatures = (features: Feature[]) => {
    return features.filter(feature => {
      // Search filter
      if (searchQuery && !feature.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Framework filter
      if (frameworkFilter) {
        const frameworkName = FRAMEWORKS.find(f => f.key === frameworkFilter)?.name;
        if (!frameworkName) return false;
        const version = feature.frameworks[frameworkName];
        return version && version !== 'n/a';
      }

      return true;
    });
  };

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, isCollapsed: !section.isCollapsed } : section
    ));
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

        return (
          <div key={index} className={styles.productSection}>
            <div
              className={`${styles.sectionHeader} ${section.isCollapsed ? styles.collapsed : ''}`}
              onClick={() => toggleSection(index)}
            >
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <span className={styles.sectionToggle}>▼</span>
            </div>
            
            <div className={`${styles.featureGrid} ${section.isCollapsed ? styles.collapsed : ''}`}>
              {filteredFeatures.map((feature, featureIndex) => (
                <div key={featureIndex} className={styles.featureCard}>
                  <h3 className={styles.featureName}>{feature.name}</h3>
                  <div className={styles.frameworkGrid}>
                    {FRAMEWORKS.map(framework => {
                      const version = feature.frameworks[framework.name];
                      return (
                        <div key={framework.key} className={styles.frameworkItem}>
                          <span className={styles.frameworkName}>{framework.name}</span>
                          <span className={`${styles.version} ${version === 'n/a' ? styles.na : styles.available}`}>
                            {version || 'n/a'}
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
  );
};

export default FeaturesFilter;
