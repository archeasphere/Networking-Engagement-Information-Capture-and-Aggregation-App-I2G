"use strict";

import * as React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import useLatestCallback from 'use-latest-callback';
import { DrawerProgressContext } from "../utils/DrawerProgressContext.js";
import { getDrawerWidth } from "../utils/getDrawerWidth.js";
import { useFakeSharedValue } from "../utils/useFakeSharedValue.js";
import { Overlay } from './Overlay';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Drawer({
  layout: customLayout,
  direction = 'ltr',
  drawerPosition = direction === 'rtl' ? 'right' : 'left',
  drawerStyle,
  drawerType = 'front',
  onClose,
  onTransitionStart,
  onTransitionEnd,
  open,
  overlayStyle,
  overlayAccessibilityLabel,
  renderDrawerContent,
  children,
  style
}) {
  const windowDimensions = useWindowDimensions();
  const layout = customLayout ?? windowDimensions;
  const drawerWidth = getDrawerWidth({
    layout,
    drawerStyle
  });
  const progress = useFakeSharedValue(open ? 1 : 0);
  React.useEffect(() => {
    progress.value = open ? 1 : 0;
  }, [open, progress]);
  const drawerRef = React.useRef(null);
  const onTransitionStartLatest = useLatestCallback(() => {
    onTransitionStart?.(open === false);
  });
  const onTransitionEndLatest = useLatestCallback(() => {
    onTransitionEnd?.(open === false);
  });
  React.useEffect(() => {
    const element = drawerRef.current;
    element?.addEventListener('transitionstart', onTransitionStartLatest);
    element?.addEventListener('transitionend', onTransitionEndLatest);
    return () => {
      element?.removeEventListener('transitionstart', onTransitionStartLatest);
      element?.removeEventListener('transitionend', onTransitionEndLatest);
    };
  }, [onTransitionEndLatest, onTransitionStartLatest]);
  const isOpen = drawerType === 'permanent' ? true : open;
  const isRight = drawerPosition === 'right';
  let translateX = 0;

  // The drawer stays in place at open position when `drawerType` is `back`
  if (open || drawerType === 'back') {
    if (direction === 'rtl') {
      translateX = drawerPosition === 'left' ? drawerWidth - layout.width : 0;
    } else {
      translateX = drawerPosition === 'left' ? 0 : layout.width - drawerWidth;
    }
  } else {
    if (direction === 'rtl') {
      translateX = drawerPosition === 'left' ? -layout.width : drawerWidth;
    } else {
      translateX = drawerPosition === 'left' ? -drawerWidth : layout.width;
    }
  }
  const drawerAnimatedStyle = drawerType !== 'permanent' ? {
    transition: 'transform 0.3s',
    transform: [{
      translateX
    }]
  } : null;
  const contentAnimatedStyle = drawerType !== 'permanent' ? {
    transition: 'transform 0.3s',
    transform: [{
      translateX: open ?
      // The screen content stays in place when `drawerType` is `front`
      drawerType === 'front' ? 0 : drawerWidth * (drawerPosition === 'left' ? 1 : -1) : 0
    }]
  } : null;
  return /*#__PURE__*/_jsx(View, {
    style: [styles.container, style],
    children: /*#__PURE__*/_jsx(DrawerProgressContext.Provider, {
      value: progress,
      children: /*#__PURE__*/_jsxs(View, {
        style: [styles.main, {
          flexDirection: drawerType === 'permanent' ? isRight && direction === 'ltr' || !isRight && direction === 'rtl' ? 'row' : 'row-reverse' : 'row'
        }],
        children: [/*#__PURE__*/_jsxs(View, {
          style: [styles.content, contentAnimatedStyle],
          children: [/*#__PURE__*/_jsx(View, {
            accessibilityElementsHidden: isOpen && drawerType !== 'permanent',
            importantForAccessibility: isOpen && drawerType !== 'permanent' ? 'no-hide-descendants' : 'auto',
            style: styles.content,
            children: children
          }), drawerType !== 'permanent' ? /*#__PURE__*/_jsx(Overlay, {
            open: open,
            progress: progress,
            onPress: () => onClose(),
            style: overlayStyle,
            accessibilityLabel: overlayAccessibilityLabel
          }) : null]
        }), /*#__PURE__*/_jsx(View, {
          ref: drawerRef,
          style: [styles.drawer, {
            width: drawerWidth,
            position: drawerType === 'permanent' ? 'relative' : 'absolute',
            zIndex: drawerType === 'back' ? -1 : 0
          }, drawerAnimatedStyle, drawerStyle],
          children: renderDrawerContent()
        })]
      })
    })
  });
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  drawer: {
    top: 0,
    bottom: 0,
    maxWidth: '100%',
    backgroundColor: 'white'
  },
  content: {
    flex: 1
  },
  main: {
    flex: 1
  }
});
//# sourceMappingURL=Drawer.js.map