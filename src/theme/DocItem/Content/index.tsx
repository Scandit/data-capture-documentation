import React from 'react';
import { useLocation } from '@docusaurus/router';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';

import SkillsCallout from '@site/src/components/SkillsCallout';
import skillsData from '@site/src/data/skills.json';
import { parseSdksRoute } from '@site/src/components/utils/frameworks';
import { frameworkFromPath } from '@site/src/constants/frameworks';
import { isOnFallbackDenylist } from '@site/src/components/SkillsCallout/routes';

type Props = WrapperProps<typeof ContentType>;

const KNOWN_PRODUCTS = new Set(Object.keys(skillsData.products));



export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const route = parseSdksRoute(pathname);
  const isKnownProductPage = !!route.product && KNOWN_PRODUCTS.has(route.product);
  // Frameworks with no Agent Skills page — never show the callout there.
  // Resolved through the registry rather than by prefix: this was a
  // startsWith() over ['/sdks/titanium/', '/sdks/linux/'], which a docs-version
  // segment defeats, so /next/sdks/titanium/ and /7.6.14/sdks/linux/ showed the
  // Agent Skills banner on frameworks that have no Agent Skills at all.
  const routeFramework = frameworkFromPath(pathname);
  const isSkillLessFramework = !!routeFramework && !routeFramework.agentSkills;

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
