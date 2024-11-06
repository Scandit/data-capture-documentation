import { ReactElement } from "react";
import { BarcodeScanning, IDScanning } from "./scanningEnums";

export interface CardType {
  isActive: boolean;
  link: string;
  name: string;
  text: string;
  icon: ReactElement;
}

export interface CardGroupType {
  cards: CardType[];
  groupName?: string;
}

export interface FrameworkCardType {
  framework: string;
  icon: JSX.Element;
  barcodeScanning: BarcodeScanning[];
  IDScanning?: IDScanning[];
  hasChildren?: boolean;
  additional?: FrameworkCardType[];
  link?: string;
}
