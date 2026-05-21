import React from 'react';
import { useLocation } from '@docusaurus/router';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';

import SkillsCallout from '@site/src/components/SkillsCallout';
import skillsData from '@site/src/data/skills.json';
import { parseSdksRoute } from '@site/src/components/utils/frameworks';
import { isOnFallbackDenylist } from '@site/src/components/SkillsCallout/routes';

type Props = WrapperProps<typeof ContentType>;

const KNOWN_PRODUCTS = new Set(Object.keys(skillsData.products));

export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const route = parseSdksRoute(pathname);
  const isKnownProductPage = !!route.product && KNOWN_PRODUCTS.has(route.product);

  let callout: JSX.Element | null;
  if (isKnownProductPage) {
    callout = <SkillsCallout variant="product" />;
  } else if (isOnFallbackDenylist(pathname)) {
    callout = null;
  } else {
    callout = <SkillsCallout variant="shared" />;
  }

  return (
    <>
      {callout}
      <Content {...props} />
    </>
  );
}
