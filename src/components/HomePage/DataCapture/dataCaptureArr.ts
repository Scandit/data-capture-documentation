const releaseNotesPath: Record<string, string> = {
  ios: "/sdks/ios/release-notes",
  android: "/sdks/android/release-notes",
  web: "/sdks/web/release-notes",
  react: "/sdks/react-native/release-notes",
  cordova: "/sdks/cordova/release-notes",
  flutter: "/sdks/flutter/release-notes",
  capacitor: "/sdks/capacitor/release-notes",
  titanium: "/sdks/titanium/release-notes",
  linux: "/sdks/linux/release-notes",
  netIos: "/sdks/net/ios/release-notes",
  netAndroid: "/sdks/net/android/release-notes",
};

const samplesRepo: Record<string, string> = {
  ios: "https://github.com/Scandit/datacapture-ios-samples",
  android: "https://github.com/Scandit/datacapture-android-samples",
  web: "https://github.com/Scandit/datacapture-web-samples",
  react: "https://github.com/Scandit/datacapture-react-native-samples",
  cordova: "https://github.com/Scandit/datacapture-cordova-samples",
  flutter: "https://github.com/Scandit/datacapture-flutter-samples",
  capacitor: "https://github.com/Scandit/datacapture-capacitor-samples",
  titanium: "https://github.com/Scandit/datacapture-titanium-samples",
  netIos: "https://github.com/Scandit/datacapture-dotnet-samples",
  netAndroid: "https://github.com/Scandit/datacapture-dotnet-samples",
};

const SCANDIT_GITHUB = "https://github.com/Scandit";

export function createDataCaptureArr(framework: string) {
  return [
    {
      title: "Release Notes",
      link: releaseNotesPath[framework] ?? releaseNotesPath.web,
    },
    {
      title: "System Requirements",
      link: "/system-requirements",
    },
    {
      title: "Sample Apps on GitHub",
      link: samplesRepo[framework] ?? SCANDIT_GITHUB,
    },
    {
      title: "Barcode Symbologies",
      link: "/barcode-symbologies",
    },
    {
      title: "Supported ID Documents",
      link: "/id-documents",
    },
    {
      title: "Supported Labels",
      link: "/label-definitions",
    },
  ];
}
