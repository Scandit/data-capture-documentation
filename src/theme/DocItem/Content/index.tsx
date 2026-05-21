import React from 'react';
import { useLocation } from '@docusaurus/router';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';

import SkillsCallout from '@site/src/components/SkillsCallout';
import { parseSdksRoute } from '@site/src/components/utils/frameworks';
import { isOnFallbackDenylist } from '@site/src/components/SkillsCallout/routes';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const route = parseSdksRoute(pathname);

  let callout: JSX.Element | null;
  if (route.product) {
    callout = <SkillsCallout variant="product" />;
  } else if (isOnFallbackDenylist(pathname)) {
    callout = null;
  } else {
    callout = <SkillsCallout variant="fallback" />;
  }

  return (
    <>
      {callout}
      <Content {...props} />
    </>
  );
}
