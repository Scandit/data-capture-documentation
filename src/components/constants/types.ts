import { ReactElement } from "react";
import { BarcodeScanning, IDScanning, LabelScanning } from "./scanningEnums";

export interface CardType {
  isActive: boolean;
  link: string;
  name: string;
  text: string;
  icon: ReactElement;
}

export interface FrameworkCardType {
  framework: string;
  icon: JSX.Element;
  barcodeScanning: BarcodeScanning[];
  IDScanning?: IDScanning[];
  labelScanning?: LabelScanning[];
  hasChildren?: boolean;
  additional?: FrameworkCardType[];
  link?: string;
}
