import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function CurvyUnderline({ width = 120, color = '#8d4750' }: { width?: number; color?: string }) {
  return (
    <View style={{ width, height: 12, marginTop: 4, marginBottom: 8, alignSelf: 'center' }}>
      <Svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
        <Path
          d={`M 5,6 Q ${width * 0.28},1.5 ${width * 0.5},6 T ${width - 5},6`}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
