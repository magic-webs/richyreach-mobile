import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface BookmarkIconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * SavedBookmarkIcon component - represents the active (saved) state.
 * Uses the solid bookmark SVG.
 */
export function SavedBookmarkIcon({ size = 22, color = '#000000', strokeWidth, ...props }: BookmarkIconProps) {
  return (
    <Svg
      viewBox="17 15 66 93"
      width={size}
      height={size}
      fill="none"
      {...props}
    >
      <Path
        d="m68.5 19.102h-37c-4.6992 0-8.5 3.8008-8.5 8.5v46.801c0 2.6016 1.3984 5 3.8008 6 2.1992 0.89844 4.6992 0.5 6.5-1.1016l16.699-17.699 16.699 17.699c1.1992 1.1016 2.6016 1.6016 4.1016 1.6016 0.80078 0 1.6016-0.19922 2.3984-0.5 2.3984-1 3.8984-3.3984 3.8984-6l0.003906-46.801c-0.10156-4.7031-3.9023-8.5-8.6016-8.5z"
        fill={color}
        stroke={strokeWidth ? color : undefined}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

/**
 * UnsavedBookmarkIcon component - represents the non-active (unsaved) state.
 * Uses the outlined bookmark SVG.
 */
export function UnsavedBookmarkIcon({ size = 22, color = '#000000', strokeWidth, ...props }: BookmarkIconProps) {
  return (
    <Svg
      viewBox="0 0 24 30"
      width={size}
      height={size}
      fill="none"
      {...props}
    >
      <Path
        d="M2.25,19.36A3.391,3.391,0,0,0,8.4,21.331l3.4-4.756c.13-.181.278-.181.408,0l3.4,4.756a3.391,3.391,0,0,0,6.15-1.971V5A3.755,3.755,0,0,0,18,1.25H6A3.754,3.754,0,0,0,2.25,5ZM3.75,5A2.252,2.252,0,0,1,6,2.75H18A2.253,2.253,0,0,1,20.25,5V19.36a1.891,1.891,0,0,1-3.43,1.1l-3.4-4.755a1.751,1.751,0,0,0-2.848,0l-3.4,4.755a1.89,1.89,0,0,1-3.429-1.1Z"
        fill={color}
        stroke={strokeWidth ? color : undefined}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
