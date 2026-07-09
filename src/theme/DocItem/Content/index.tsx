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

// Frameworks with no Agent Skills at all — never show the callout there.
const SKILL_LESS_FRAMEWORK_PREFIXES = ['/sdks/titanium/', '/sdks/linux/'];

export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const route = parseSdksRoute(pathname);
  const isKnownProductPage = !!route.product && KNOWN_PRODUCTS.has(route.product);
  const isSkillLessFramework = SKILL_LESS_FRAMEWORK_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // ID Bolt docs live under /hosted/, outside the /sdks/ product routes, so
  // the route-driven callout never fires there. Surface its skill explicitly.
  const isIdBoltPage =
    pathname.startsWith('/hosted/id-bolt/') && !isOnFallbackDenylist(pathname);

  let callout: JSX.Element | null;
  if (isSkillLessFramework) {
    callout = null;
  } else if (isIdBoltPage) {
    callout = (
      <SkillsCallout
        variant="skill"
        skillSlug="id-bolt"
        productName="ID Bolt"
        frameworkSlug="web"
        moreInfoUrl="/sdks/web/agent-skills"
      />
    );
  } else if (isKnownProductPage) {
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
