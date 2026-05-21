import React from 'react';
import {
  useVersions,
  useActiveDocContext,
} from '@docusaurus/plugin-content-docs/client';
import {useDocsPreferredVersion} from '@docusaurus/theme-common';
import {useDocsVersionCandidates} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

const getVersionMainDoc = (version) =>
  version.docs.find((doc) => doc.id === version.mainDocId);

export default function DocsVersionDropdownNavbarItem({
  mobile,
  docsPluginId,
  dropdownActiveClassDisabled,
  dropdownItemsBefore,
  dropdownItemsAfter,
  ...props
}) {
  const {search, hash, pathname} = useLocation();
  const activeDocContext = useActiveDocContext(docsPluginId);
  const versions = useVersions(docsPluginId);
  const {savePreferredVersionName} = useDocsPreferredVersion(docsPluginId);

  // Check if we're currently viewing Xamarin documentation
  const isViewingXamarin = pathname.includes('/xamarin/');

  // Filter versions for Xamarin - only show 7.6.14 and 6.28.10
  const filteredVersions = isViewingXamarin
    ? versions.filter(version => version.name === '7.6.14' || version.name === '6.28.10')
    : versions;

  // Categorize each version so we can render an inline tag in the dropdown.
  // 'current' = latest stable; add a version name as 'beta' to surface it.
  const VERSION_CATEGORY = {
    current: 'stable',
    '7.6.12': 'legacy',
    '6.28.9': 'legacy',
  };
  const TAG_LABEL = { stable: 'Stable', beta: 'Beta', legacy: 'Legacy' };

  const versionLinks = filteredVersions.map((version) => {
    const versionDoc =
      activeDocContext?.alternateDocVersions[version.name] ??
      getVersionMainDoc(version);
    const category = VERSION_CATEGORY[version.name] || 'legacy';
    return {
      label: (
        <span className="version-link-content">
          <span className="version-link-label">{version.label}</span>
          <span className={`version-tag version-tag-${category}`}>
            {TAG_LABEL[category]}
          </span>
        </span>
      ),
      to: `${versionDoc.path}${search}${hash}`,
      isActive: () => version === activeDocContext?.activeVersion,
      onClick: () => savePreferredVersionName(version.name),
    };
  });

  const sectionHeader = {
    type: 'html',
    value: `<div class="navbar-dropdown-header">SDK Version</div>`,
    className: 'navbar-dropdown-header-item',
  };

  const items = [
    sectionHeader,
    ...dropdownItemsBefore,
    ...versionLinks,
    ...dropdownItemsAfter,
  ];

  const dropdownVersion = useDocsVersionCandidates(docsPluginId)[0];

  // Mobile dropdown is handled a bit differently
  const dropdownLabel =
    mobile && items.length > 1
      ? translate({
          id: 'theme.navbar.mobileVersionsDropdown.label',
          message: 'Versions',
          description:
            'The label for the navbar versions dropdown on mobile view',
        })
      : dropdownVersion.label;
  const dropdownTo =
    mobile && items.length > 1
      ? undefined
      : getVersionMainDoc(dropdownVersion).path;

  // We don't want to render a version dropdown with 0 or 1 item. If we build
  // the site with a single docs version (onlyIncludeVersions: ['1.0.0']),
  // We'd rather render a button instead of a dropdown
  if (items.length <= 1) {
    return (
      <DefaultNavbarItem
        {...props}
        mobile={mobile}
        label={dropdownLabel}
        to={dropdownTo}
        isActive={dropdownActiveClassDisabled ? () => false : undefined}
      />
    );
  }

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={dropdownLabel}
      to={dropdownTo}
      items={items}
      isActive={dropdownActiveClassDisabled ? () => false : undefined}
    />
  );
}
