/**
 * @file Contains a single function - {@link boxShadowCss}, which converts
 * {@link BoxShadow} objects into CSS code for the shadow.
 */
/**
 * Generate a CSS style for a box shadow from the provided {@link BoxShadow}
 * object.
 *
 * @param shadow - The settings for the box shadow.
 * @param scale - The scale of the window, 1 by default.
 * @returns The box-shadow CSS string.
 */
export function boxShadowCss(shadow, scale = 1) {
    return `box-shadow: ${shadow.horizontalOffset * scale}px
          ${shadow.verticalOffset * scale}px
          ${shadow.blurOffset * scale}px
          ${shadow.spreadRadius * scale}px
          rgba(0,0,0, ${shadow.opacity / 100})`;
}
