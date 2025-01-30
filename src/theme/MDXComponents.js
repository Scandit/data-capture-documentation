import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
/** Import built-in Docusaurus components at the global level
 * so we don't have to re-import them in every file
 */
import DocCardList from '@theme/DocCardList';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
// Import custom components, globally as well
import CustomDocCard from '../components/CustomDocCard';
import CustomDocCardsWrapper from '../components/CustomDocCardsWrapper';
import { Android, BarcodeCapture, BarcodeSelection, Cordova, Flutter, Ios, Javascript, MsAr, MsCount, MsFind, Sparkscan, ReactIcon, Capacitor, Xamarin, Bolt, Express, XamarinForms, XamarinIos, XamarinAndroid, NetIos, NetAndroid, Titanium } from '../components/IconComponents';
import ReactPlayer from 'react-player';

// import '../pages/wpwp.css';

export default {
  // Re-use the default mapping
  ...MDXComponents,

  /**
   * Components below are imported within the global scope,
   * meaning you don't have to insert the typical 'import SomeStuff from '/path/to/stuff' line
   * at the top of a Markdown file before being able to use these components
   *  — see https://docusaurus.io/docs/next/markdown-features/react#mdx-component-scope
   */
  DocCardList,
  Tabs,
  TabItem,
  CustomDocCard,
  CustomDocCardsWrapper,
  Sparkscan,
  MsCount,
  MsFind,
  BarcodeSelection,
  BarcodeCapture,
  MsAr,
  Ios,
  Android,
  Javascript,
  Cordova,
  ReactIcon, 
  Flutter,
  Capacitor,
  Xamarin,
  Bolt,
  Express,
  XamarinForms,
  XamarinIos,
  XamarinAndroid,
  NetIos,
  NetAndroid,
  Titanium,
  ReactPlayer,
};
