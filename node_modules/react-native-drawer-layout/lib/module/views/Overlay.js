"use strict";

import { Pressable, StyleSheet, View } from 'react-native';
import { jsx as _jsx } from "react/jsx-runtime";
export function Overlay({
  open,
  onPress,
  style,
  accessibilityLabel = 'Close drawer',
  ...rest
}) {
  return /*#__PURE__*/_jsx(View, {
    ...rest,
    style: [styles.overlay, {
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none'
    }, style],
    accessibilityElementsHidden: !open,
    importantForAccessibility: open ? 'auto' : 'no-hide-descendants',
    children: /*#__PURE__*/_jsx(Pressable, {
      onPress: onPress,
      style: [styles.pressable, {
        pointerEvents: open ? 'auto' : 'none'
      }],
      accessibilityRole: "button",
      accessibilityLabel: accessibilityLabel
    })
  });
}
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // Disable touch highlight on mobile Safari.
    // WebkitTapHighlightColor must be used outside of StyleSheet.create because react-native-web will omit the property.
    // @ts-expect-error: WebkitTapHighlightColor is web only
    WebkitTapHighlightColor: 'transparent',
    transition: 'opacity 0.3s'
  },
  pressable: {
    flex: 1
  }
});
//# sourceMappingURL=Overlay.js.map