---
sidebar_label: 'Theming'
title: 'Theming'
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
tags: [bolt]
keywords:
  - bolt
  - theming
  - customization
---

# Theming

ID Bolt allows comprehensive customization of its visual appearance to match your brand identity. Use the `theme` option when creating an ID Bolt session to customize colors, dimensions, and other visual elements.

```ts
const idBoltSession = IdBoltSession.create(ID_BOLT_URL, {
  // other options...
  theme: {
    colors: {
      primary: "#0070f3",
      background: "#ffffff"
    },
    dimensions: {
      radiusButton: "8px"
    }
  }
});
```

## Color Customization

The `colors` object allows you to define colors for various UI elements:

| Property | Type | Description |
|----------|------|-------------|
| `primary` | `string` | Primary color used throughout the interface |
| `image` | `string` | Color used for image-related elements |
| `background` | `string` | Main popup background color |
| `backgroundSecondary` | `string` | Secondary background color for surfaces |
| `backgroundInverse` | `string` | Inverse background color |
| `backgroundScannerPlaceholder` | `string` | Background color for scanner placeholder |
| `textPrimary` | `string` | Primary text color |
| `textSecondary` | `string` | Secondary text color |
| `textTertiary` | `string` | Tertiary text color |
| `textInverse` | `string` | Inverse text color |
| `textScannerPlaceholder` | `string` | Text color for scanner placeholder |
| `success` | `string` | Color for success states |
| `error` | `string` | Color for error states |
| `warning` | `string` | Color for warning states |
| `info` | `string` | Color for informational states |
| `buttonBackground` | `string` | Background color for buttons |
| `buttonText` | `string` | Text color for buttons |
| `buttonBorder` | `string` | Border color for buttons |
| `buttonBackgroundDisabled` | `string` | Background color for disabled buttons |
| `buttonBorderDisabled` | `string` | Border color for disabled buttons |
| `buttonTextDisabled` | `string` | Text color for disabled buttons |
| `connectionStatusConnectingBackground` | `string` | Background color for connection status pills in connecting/waiting state |
| `connectionStatusConnectingText` | `string` | Text color for connection status pills in connecting/waiting state |
| `connectionStatusSuccessBackground` | `string` | Background color for connection status pills in success state |
| `connectionStatusSuccessText` | `string` | Text color for connection status pills in success state |
| `connectionStatusErrorBackground` | `string` | Background color for connection status pills in error/failed state |
| `connectionStatusErrorText` | `string` | Text color for connection status pills in error/failed state |
| `headerButtons` | `string` | Color for the header back and close buttons (when not in their white variant) |
| `divider` | `string` | Color for divider lines, such as the one on the QR code page |

## Dimension Customization

The `dimensions` object allows you to customize sizes and spacing:

| Property | Type | Description |
|----------|------|-------------|
| `radiusPopup` | `string` | Border radius for the popup |
| `radiusButton` | `string` | Border radius for buttons |
| `radiusCard` | `string` | Border radius for cards |

All values are string and must be valid CSS dimension expressions. E.g. "12px".

## Image Customization

The `images` object allows you to customize the images used in key screens:

```ts
const theme = {
  images: {
    welcome: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    flowCompleted: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...",
    acceptedId: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
  }
};
```

### Image Properties

| Property | Type | Description |
|----------|------|-------------|
| `welcome` | `string` |  Image displayed on the welcome screen, both on Desktop as well as hand-over |
| `flowCompleted` | `string` | Image displayed on the completion screen in hand-over flow |
| `acceptedId` | `string` | Image displayed as a placeholder for an accepted image, when picture is not captured |

### Image Requirements

- Format: PNG, JPEG, SVG, or WebP (must be provided as data URLs with appropriate mime types)
- Maximum size: 50KB per image (size of the base64 data URL)
- Data URL format: Must start with one of the following prefixes:
  - `data:image/png`
  - `data:image/jpeg`
  - `data:image/svg+xml`
  - `data:image/webp`

## Font Customization

The `fonts` object allows you to customize the fonts used in the interface:

```ts
const theme = {
  fonts: {
    primary: {
      normal: "data:font/woff2;base64,d09GMgABAAAAAAT...",
      semibold: "data:font/woff2;base64,d09GMgABAAAAAAU...",
      bold: "data:font/woff2;base64,d09GMgABAAAAAAV..."
    }
  }
};
```

### Font Properties

| Property | Type | Description |
|----------|------|-------------|
| `primary.normal` | `string` | Regular font weight (400) |
| `primary.semibold` | `string` | Semi-bold font weight (600) |
| `primary.bold` | `string` | Bold font weight (700) |

### Font Requirements

- Format: WOFF2, WOFF, TTF, or OTF (must be provided as data URLs)
- Maximum size: 100KB per font file (size of the base64 data url)
- Data URL format: Must start with appropriate mime type prefixes (e.g., `data:font/woff2`, `data:font/woff`)
