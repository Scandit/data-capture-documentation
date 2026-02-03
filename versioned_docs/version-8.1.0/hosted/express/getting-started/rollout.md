---
description: "For production use, Scandit Express is typically distributed via a mobile device management (MDM) or enterprise mobility management (EMM) system. This page will guide you rolling out Scandit Express using such a system for either Android or iOS.                                                              "

sidebar_label: 'Rollout via MDM/EMM'
displayed_sidebar: expressSidebar
sidebar_position: 2
framework: express
keywords:
  - express
---

# Production Rollout

For production use, Scandit Express is typically distributed via a mobile device management (MDM) or enterprise mobility management (EMM) system. This page will guide you rolling out Scandit Express using such a system for either Android or iOS.

This involves adding Scandit Express to your MDM/EMM solution's app catalog, and setting the project code to synchronize the Scandit Express configuration automatically to all devices.

:::note
The screenshots in this guide are from MobileIron Cloud. However, these instructions apply to MDM/EMM solutions from most vendors.
:::

## iOS

You can distribute Scandit Express directly from the Apple App Store. Search for "Scandit Express" in the admin console of your EMM/MDM solution and add it to your app catalog.

![Add Express to App Catalog](/img/express/rollout_ios_1.png)

### Set the Project Code

To automatically synchronize your Scandit Express configuration with Scandit, you need to set the project code in the management console of your MDM/EMM solution. Once set, your users won't have to manually activate Scandit Express via QR code. Configuration changes are also automatically distributed to all devices.

1. Login to your [Scandit Dashboard](https://ssl.scandit.com/).

2. Click on your project card.

3. From the Project dashboard, click the **Copy Project Code** link.

4. In your MDM system, paste this value in the **iOS Managed App Configuration** section.

![Add Project Code](/img/express/rollout_ios_2.png)

:::note
If your MDM system requires an AppConfig configuration, you can generate one [here](https://appconfig.jamfresearch.com/generator) by selecting Scandit Express as: `com.scandit.KeyboardWedge2/current`.
:::

### 3rd-Party Instructions

This section provides links to the relevant sections of the documentation for popular MDM/EMM solutions:

| Solution | Links |
|:---------|:------|
| MobileIron Cloud | [App Catalog](http://mi.extendedhelp.mobileiron.com/45/all/en/desktop/App_Catalog.htm), [App Configuration](http://mi.extendedhelp.mobileiron.com/45/all/en/desktop/App_Configuration.htm) |
| VMWare Airwatch | [Add Public Applications from an App Store](https://docs.vmware.com/en/VMware-AirWatch/9.1/vmware-airwatch-guides-91/GUID-AW91-Config_Public_Apps_WS1.html) |

## Android

Scandit Express for Android supports MDM/EMM deployment via [Android Managed Configurations](https://developer.android.com/work/managed-configurations).

:::warning
Please note that Scandit Express might not be compatible with some Android for Work configurations (e.g. 3rd-party keyboards such as Scandit Express can typically not be installed in a work profile).

Scandit recommends setting Android devices as either ["fully managed"](https://support.google.com/work/android/answer/9562029?hl=en&ref_topic=9563482&sjid=2353681360583047853-EU) and ["dedicated devices"](https://support.google.com/work/android/answer/9560920?hl=en&ref_topic=9563482&sjid=2353681360583047853-EU).
:::

You can distribute Scandit Express directly from the Google Play Store. Search for "Scandit Express" in the admin console for your EMM/MDM solution and add it to your app catalog.

![Add Express to App Catalog](/img/express/rollout_android_1.png)

### Set the Project Code

To automatically synchronize your Scandit Express configuration with Scandit, you need to set the project code in the management console of your MDM/EMM solution. Once set, your users won't have to manually activate Scandit Express via QR code. Configuration changes are also automatically distributed to all devices.

1. Login to your [Scandit Dashboard](https://ssl.scandit.com/).

2. Click on your project card.

3. The Android Scandit Express App specifies the following Application Restriction:
    ```java
    <restriction

       android:key="deploymentCode"

       android:title="Deployment Code"

       android:restrictionType="string"

       android:description="Defines which deployment on scandit.com the installed Scandit Express fetches its configuration and license from."

       android:defaultValue="" />
    ```

4. The `deploymentCode` value needs to be set by the admin of the Managed Configuration to the project code, which can be obtained on the Scandit Express Dashboard by clicking the **Copy Project Code** link.

5. In your MDM system, paste this value in the **Manage Configurations** section.

![Add Project Code](/img/express/rollout_android_2.png)

### 3rd-Party Instructions

This section provides links to the relevant sections of the documentation for popular MDM/EMM solutions:

| Solution | Links |
|:---------|:------|
| MobileIron Cloud | [App Catalog](http://mi.extendedhelp.mobileiron.com/45/all/en/desktop/App_Catalog.htm), [App Configuration](http://mi.extendedhelp.mobileiron.com/45/all/en/desktop/App_Configuration.htm) |
| VMWare Airwatch | [Add Public Applications from an App Store](https://docs.vmware.com/en/VMware-AirWatch/9.1/vmware-airwatch-guides-91/GUID-AW91-Config_Public_Apps_WS1.html) |
| IMB MaaS 360 | [Adding a Google Play App to the App Catalog](https://www.ibm.com/support/knowledgecenter/en/SS8H2S/com.ibm.mc.doc/pag_source/tasks/pag_apps_add_google_play.htm) |
| SOTI MobiControl | [Adding an Google Play Store Application to an Application Catalog Rule](http://www.soti.net/mc/help/v13/en/Content/Web/Rules/Plus/Plus_Web_ApplicationCatalog.htm#Play_Store_Apps) |

## Updating Configuration

To update the configuration of Scandit Express on all devices, simply change the configuration in the Scandit Dashboard. The new configuration will be automatically distributed to all devices.

Scandit Express automatically updates the license and configuration when restarted, but if you need to force a reload:

1. Open the user menu in the top right corner of the Scandit Express app.

![Open User Menu](/img/express/user_menu.png)

2. Tap on **Refresh Project**.

![Refresh Project](/img/express/refresh_project.png)