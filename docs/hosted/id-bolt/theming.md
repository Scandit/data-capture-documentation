---
description: "ID Bolt allows comprehensive customization of its visual appearance to match your brand identity. Use the `theme` option when creating an ID Bolt session to customize colors, dimensions, and other visual elements.                                                                    "

sidebar_label: "Theming"
title: "Theming"
displayed_sidebar: boltSidebar
toc_max_heading_level: 4
framework: bolt
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
      background: "#ffffff",
    },
    dimensions: {
      radiusButton: "8px",
    },
  },
});
```

## Color Customization

The `colors` object allows you to define colors for various UI elements:

| Property                               | Type     | Description                                                                   | Since |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------- | ----- |
| `primary`                              | `string` | Primary color used throughout the interface                                   | 1.1   |
| `image`                                | `string` | Color used for image-related elements                                         | 1.1   |
| `background`                           | `string` | Main popup background color                                                   | 1.1   |
| `backgroundSecondary`                  | `string` | Secondary background color for surfaces                                       | 1.1   |
| `backgroundInverse`                    | `string` | Inverse background color                                                      | 1.1   |
| `backgroundScannerPlaceholder`         | `string` | Background color for scanner placeholder                                      | 1.8   |
| `textPrimary`                          | `string` | Primary text color                                                            | 1.1   |
| `textSecondary`                        | `string` | Secondary text color                                                          | 1.1   |
| `textTertiary`                         | `string` | Tertiary text color                                                           | 1.1   |
| `textInverse`                          | `string` | Inverse text color                                                            | 1.1   |
| `textScannerPlaceholder`               | `string` | Text color for scanner placeholder                                            | 1.8   |
| `success`                              | `string` | Color for success states                                                      | 1.1   |
| `error`                                | `string` | Color for error states                                                        | 1.1   |
| `warning`                              | `string` | Color for warning states                                                      | 1.1   |
| `info`                                 | `string` | Color for informational states                                                | 1.1   |
| `buttonBackground`                     | `string` | Background color for buttons                                                  | 1.1   |
| `buttonText`                           | `string` | Text color for buttons                                                        | 1.1   |
| `buttonBorder`                         | `string` | Border color for buttons                                                      | 1.1   |
| `buttonBackgroundDisabled`             | `string` | Background color for disabled buttons                                         | 1.1   |
| `buttonBorderDisabled`                 | `string` | Border color for disabled buttons                                             | 1.1   |
| `buttonTextDisabled`                   | `string` | Text color for disabled buttons                                               | 1.1   |
| `connectionStatusConnectingBackground` | `string` | Background color for connection status pills in connecting/waiting state      | 1.8   |
| `connectionStatusConnectingText`       | `string` | Text color for connection status pills in connecting/waiting state            | 1.8   |
| `connectionStatusSuccessBackground`    | `string` | Background color for connection status pills in success state                 | 1.8   |
| `connectionStatusSuccessText`          | `string` | Text color for connection status pills in success state                       | 1.8   |
| `connectionStatusErrorBackground`      | `string` | Background color for connection status pills in error/failed state            | 1.8   |
| `connectionStatusErrorText`            | `string` | Text color for connection status pills in error/failed state                  | 1.8   |
| `headerButtons`                        | `string` | Color for the header back and close buttons (when not in their white variant) | 1.8   |
| `divider`                              | `string` | Color for divider lines, such as the one on the QR code page                  | 1.8   |

## Dimension Customization

The `dimensions` object allows you to customize sizes and spacing:

| Property       | Type     | Description                 | Since |
| -------------- | -------- | --------------------------- | ----- |
| `radiusPopup`  | `string` | Border radius for the popup | 1.1   |
| `radiusButton` | `string` | Border radius for buttons   | 1.1   |
| `radiusCard`   | `string` | Border radius for cards     | 1.1   |

All values are string and must be valid CSS dimension expressions. E.g. "12px".

## Image Customization

Available since version `1.8`.

The `images` object allows you to customize the images used in key screens:

```ts
const theme = {
  images: {
    welcome: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    flowCompleted: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...",
    acceptedId: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  },
};
```

### Image Properties

| Property        | Type     | Description                                                                          | Since |
| --------------- | -------- | ------------------------------------------------------------------------------------ | ----- |
| `welcome`       | `string` | Image displayed on the welcome screen, both on Desktop as well as hand-over          | 1.8   |
| `flowCompleted` | `string` | Image displayed on the completion screen in hand-over flow                           | 1.8   |
| `acceptedId`    | `string` | Image displayed as a placeholder for an accepted image, when picture is not captured | 1.8   |

### Image Requirements

- Format: PNG, JPEG, SVG, or WebP (must be provided as data URLs with appropriate mime types)
- Maximum size: 50KB per image (size of the base64 data URL)
- Data URL format: Must start with one of the following prefixes:
  - `data:image/png`
  - `data:image/jpeg`
  - `data:image/svg+xml`
  - `data:image/webp`

## Font Customization

Available since version `1.8`.

The `fonts` object allows you to customize the fonts used in the interface:

```ts
const theme = {
  fonts: {
    primary: {
      normal: "data:font/woff2;base64,d09GMgABAAAAAAT...",
      semibold: "data:font/woff2;base64,d09GMgABAAAAAAU...",
      bold: "data:font/woff2;base64,d09GMgABAAAAAAV...",
    },
  },
};
```

### Font Properties

| Property           | Type     | Description                 | Since |
| ------------------ | -------- | --------------------------- | ----- |
| `primary.normal`   | `string` | Regular font weight (400)   | 1.8   |
| `primary.semibold` | `string` | Semi-bold font weight (600) | 1.8   |
| `primary.bold`     | `string` | Bold font weight (700)      | 1.8   |

### Font Requirements

- Format: WOFF2, WOFF, TTF, or OTF (must be provided as data URLs)
- Maximum size: 100KB per font file (size of the base64 data url)
- Data URL format: Must start with appropriate mime type prefixes (e.g., `data:font/woff2`, `data:font/woff`)

## Style Overrides

Available since version `1.9`.

The `styleOverrides` object allows you to apply custom CSS to specific UI elements:

```ts
const theme = {
  styleOverrides: {
    button: `
      .bolt-button {
        display: block;
        width: 100%;
        padding: 12px 24px;
        background-color: #fcb700;
        color: #000000;
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        line-height: 1.5;
        text-decoration: none;
        border: none;
        cursor: pointer;
        box-sizing: border-box;
        border-radius: 0;
        box-shadow: none;
        transition: background-color 0.2s ease-in-out;
      }

      .bolt-button:hover,
      .bolt-button:focus {
        background-color: #e0a800;
        outline: none;
      }
    `,
    link: `
      .bolt-link {
        text-decoration: none;
        border-bottom: 1px dotted currentColor;
      }
      .bolt-link:hover {
        border-bottom: 1px solid currentColor;
      }
    `,
    title: `
      .bolt-title {
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `,
  },
};
```

### Available Style Override Properties

| Property | Type     | Description            | Since |
| -------- | -------- | ---------------------- | ----- |
| `button` | `string` | CSS styles for buttons | 1.9   |
| `link`   | `string` | CSS styles for links   | 1.9   |
| `title`  | `string` | CSS styles for titles  | 1.9   |

#### CSS class names

Use the `.bolt-button`, `.bolt-link` and `.bolt-title` selectors for the styling rule. You can also create additional rules for pseudo-states like `.bolt-button:hover` etc.
When a style override is specified, the element is rendered in its own shadow-DOM, with the provided style sheet attached.

The element will have many more CSS classes attached, but since it is rendered in a shadow DOM, these don't have an effect, unless you choose to use them in the style-override.

#### Shadow DOM

When a style override is specified, the component is rendered in a shadow DOM. This means that none of the default styles of ID Bolt apply to the component anymore. Therefore, make sure to specify all relevant styles.

#### Used HTML elements

Not all buttons use the `<button>` HTML element. Certain buttons in the UI are `<a>` links stylized as a button. Therefore, make sure to also add `display: flex` or `display: block`, as well as rules such as `text-decoration` to your style sheet.

:::tip
Always make sure to thoroughly test the full ID Bolt flow when you customize the styles, to make sure the result is as expected on all screens.
:::

## Popup Container Customization

Available since version `1.9`.

You can apply additional styling to the ID Bolt popup container directly from your application's CSS. This is particularly useful for customizing the popup's outer appearance like adding a box shadow:

```css
/* In your application's CSS */
idbolt-pop-up::part(container) {
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.2);
}
```

Note that this approach only affects the popup container itself and not elements inside the popup. For customizing the internal elements, use the Theme API described above.
