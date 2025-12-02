import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import { FeatureListProps, Feature, Product, FilteredFeature } from './types';

// Import data files
import productsData from '@site/src/data/products.json';
import featuresData from '@site/src/data/features.json';

// Framework mapping for context detection - matches FRAMEWORKS from types.ts
const FRAMEWORK_MAPPING: { [key: string]: string } = {
  'ios': 'iOS',
  'android': 'Android',
  'cordova': 'Cordova',
  'react-native': 'React Native',
  'flutter': 'Flutter',
  'capacitor': 'Capacitor',
  'titanium': 'Titanium',
  'web': 'Web',
  'net-ios': '.NET iOS',
  'net-android': '.NET Android'
};

// Function to render description with inline code formatting
const renderDescription = (description: string) => {
  // Convert backticks to inline code elements
  const parts = description.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const FeatureList: React.FC<FeatureListProps> = ({
  product,
  framework,
  category,
  tag,
  displayMode = 'list',
  showFrameworks = true,
  className = ''
}) => {
  const { siteConfig } = useDocusaurusContext();
  const [filteredFeatures, setFilteredFeatures] = useState<FilteredFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detect framework from page context if not provided
  const detectFramework = (): string | undefined => {
    if (framework) return framework;
    
    // Try to detect from URL path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const frameworkMatch = path.match(/\/sdks\/([^\/]+)\//);
      if (frameworkMatch) {
        const frameworkKey = frameworkMatch[1];
        return FRAMEWORK_MAPPING[frameworkKey] || frameworkKey;
      }
    }
    
    return undefined;
  };

  // Filter features based on props
  const filterFeatures = (): FilteredFeature[] => {
    const detectedFramework = detectFramework();
    const currentFramework = framework || detectedFramework;
    
    return featuresData
      .filter((feature: Feature) => {
        // Filter by product
        if (feature.product !== product) return false;
        
        // Filter by category
        if (category && feature.category !== category) return false;
        
        // Filter by tag
        if (tag && feature.tag !== tag) return false;
        
        // Filter by framework availability if framework is specified
        if (currentFramework) {
          const frameworkInfo = feature.frameworks[currentFramework];
          if (!frameworkInfo || frameworkInfo.version === 'n/a') {
            return false; // Don't show features not available for this framework
          }
        }
        
        return true;
      })
      .map((feature: Feature) => {
        const isAvailable = currentFramework 
          ? feature.frameworks[currentFramework] && feature.frameworks[currentFramework].version !== 'n/a'
          : true;
        
        return {
          ...feature,
          isAvailable
        };
      });
  };

  // Group features by tag for better organization
  const groupFeaturesByTag = (features: FilteredFeature[]) => {
    const grouped = features.reduce((acc, feature) => {
      const tagKey = feature.tag || 'Other';
      if (!acc[tagKey]) {
        acc[tagKey] = [];
      }
      acc[tagKey].push(feature);
      return acc;
    }, {} as Record<string, FilteredFeature[]>);
    
    return grouped;
  };

  // Initialize filtered features
  useEffect(() => {
    const filtered = filterFeatures();
    setFilteredFeatures(filtered);
    setIsLoading(false);
  }, [product, framework, category, tag]);

  if (isLoading) {
    return <div className={styles.loading}>Loading features...</div>;
  }

  if (filteredFeatures.length === 0) {
    return (
      <div className={`${styles.noFeatures} ${className}`}>
        No features found matching the specified criteria.
      </div>
    );
  }

  // Get the API URL for the current framework
  const getCurrentFrameworkUrl = (feature: FilteredFeature): string | null => {
    const detectedFramework = detectFramework();
    const currentFramework = framework || detectedFramework;
    
    if (currentFramework && feature.frameworks[currentFramework]) {
      const frameworkInfo = feature.frameworks[currentFramework];
      return frameworkInfo.apiUrl || null;
    }
    return null;
  };

  // Render feature item
  const renderFeatureItem = (feature: FilteredFeature, isCompact = false) => {
    const apiUrl = getCurrentFrameworkUrl(feature);
    
    return (
      <div key={feature.name} className={`${styles.featureItem} ${isCompact ? styles.featureItemCompact : ''}`}>
        <div className={styles.featureHeader}>
          {apiUrl ? (
            <a 
              href={apiUrl} 
              className={styles.featureName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {feature.name}
            </a>
          ) : (
            <h4 className={styles.featureName}>{feature.name}</h4>
          )}
        </div>
        <div className={styles.featureDescription}>
          {renderDescription(feature.description)}
        </div>
      </div>
    );
  };

  // Render table view
  const renderTableView = () => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Description</th>
          {showFrameworks && <th>Available Frameworks</th>}
        </tr>
      </thead>
      <tbody>
        {filteredFeatures.map((feature) => {
          const apiUrl = getCurrentFrameworkUrl(feature);
          return (
            <tr key={feature.name}>
              <td>
                {apiUrl ? (
                  <a 
                    href={apiUrl} 
                    className={styles.featureName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {feature.name}
                  </a>
                ) : (
                  <strong>{feature.name}</strong>
                )}
              </td>
              <td>
                {renderDescription(feature.description)}
              </td>
              {showFrameworks && (
                <td>
                  <div className={styles.frameworkList}>
                    {Object.entries(feature.frameworks)
                      .filter(([, info]) => info.version !== 'n/a')
                      .map(([frameworkName, frameworkInfo]) => (
                        <a
                          key={frameworkName}
                          href={frameworkInfo.apiUrl}
                          className={styles.frameworkItem}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {frameworkName} v{frameworkInfo.version}
                        </a>
                      ))}
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  // Render grouped view (by tag)
  const renderGroupedView = () => {
    const groupedFeatures = groupFeaturesByTag(filteredFeatures);
    const isCompact = displayMode === 'compact';
    
    return (
      <div className={className}>
        {Object.entries(groupedFeatures).map(([tagName, features]) => (
          <div key={tagName}>
            {tagName !== 'Other' && (
              <div className={styles.tagHeader}>
                <h4 className={styles.tagTitle}>{tagName}</h4>
              </div>
            )}
            {features.map((feature) => renderFeatureItem(feature, isCompact))}
          </div>
        ))}
      </div>
    );
  };

  // Main render
  if (displayMode === 'table') {
    return (
      <div className={className}>
        {renderTableView()}
      </div>
    );
  }

  if (displayMode === 'compact') {
    return (
      <div className={`${styles.featureListCompact} ${className}`}>
        {filteredFeatures.map((feature) => renderFeatureItem(feature, true))}
      </div>
    );
  }

  // Default list view with grouping
  return (
    <div className={`${styles.featureList} ${className}`}>
      {renderGroupedView()}
    </div>
  );
};

export default FeatureList;
