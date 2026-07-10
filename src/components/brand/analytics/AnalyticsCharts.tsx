import { Colors, FontFamily } from '@/constants/brand';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

export interface Segment {
  label: string;
  value: number;
  color: string;
}

/** Donut chart with a centered total and a legend. Pure react-native-svg (no chart lib). */
export function DonutChart({
  data,
  centerLabel = 'Total',
  size = 150,
  strokeWidth = 24,
}: {
  data: Segment[];
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.donutRow}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {total === 0 ? (
            <Circle cx={cx} cy={cy} r={radius} stroke="rgba(63,3,11,0.08)" strokeWidth={strokeWidth} fill="none" />
          ) : (
            data.map((d, i) => {
              if (d.value <= 0) return null;
              const dash = (d.value / total) * circ;
              const el = (
                <Circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  stroke={d.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return el;
            })
          )}
        </G>
        <SvgText x={cx} y={cy - 2} fontSize={24} fontWeight="700" fill={Colors.ink} textAnchor="middle">
          {total}
        </SvgText>
        <SvgText x={cx} y={cy + 15} fontSize={10} fill="rgba(63,3,11,0.5)" textAnchor="middle">
          {centerLabel}
        </SvgText>
      </Svg>

      <View style={styles.legend}>
        {data.length === 0 ? (
          <Text style={styles.legendEmpty}>No campaigns yet</Text>
        ) : (
          data.map((d, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: d.color }]} />
              <Text style={styles.legendLabel}>{d.label}</Text>
              <Text style={styles.legendValue}>{d.value}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

/** Filled area + line chart for a small time series (e.g. campaigns per month). */
export function TrendAreaChart({
  points,
  labels,
  width,
  height = 150,
  color = Colors.oxblood,
}: {
  points: number[];
  labels: string[];
  width: number;
  height?: number;
  color?: string;
}) {
  const padX = 10;
  const padTop = 16;
  const padBottom = 24;
  const chartW = Math.max(0, width - padX * 2);
  const chartH = Math.max(0, height - padTop - padBottom);
  const maxV = Math.max(...points, 1);
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW;

  const coords = points.map((v, i) => ({
    x: padX + i * stepX,
    y: padTop + chartH - (v / maxV) * chartH,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`
      : '';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.28} />
          <Stop offset="1" stopColor={color} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>

      {/* baseline */}
      <Line x1={padX} y1={padTop + chartH} x2={padX + chartW} y2={padTop + chartH} stroke="rgba(63,3,11,0.08)" strokeWidth={1} />

      {areaPath ? <Path d={areaPath} fill="url(#trendFill)" /> : null}
      {linePath ? <Path d={linePath} stroke={color} strokeWidth={2} fill="none" /> : null}

      {coords.map((c, i) => (
        <G key={i}>
          <Circle cx={c.x} cy={c.y} r={3} fill={color} />
          <SvgText x={c.x} y={c.y - 8} fontSize={9} fill="rgba(63,3,11,0.55)" textAnchor="middle">
            {points[i]}
          </SvgText>
          <SvgText x={c.x} y={height - 6} fontSize={9} fill="rgba(63,3,11,0.45)" textAnchor="middle">
            {labels[i]}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

/** Vertical bar chart for per-item values (e.g. per-campaign budget). */
export function BudgetBarChart({
  data,
  width,
  height = 170,
  color = Colors.oxblood,
  valuePrefix = '',
  formatValue,
}: {
  data: { label: string; value: number }[];
  width: number;
  height?: number;
  color?: string;
  valuePrefix?: string;
  formatValue?: (v: number) => string;
}) {
  const padTop = 18;
  const padBottom = 22;
  const chartH = Math.max(0, height - padTop - padBottom);
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const n = Math.max(data.length, 1);
  const slot = width / n;
  const barW = Math.min(28, slot * 0.5);
  const fmt = (v: number) => (formatValue ? formatValue(v) : `${valuePrefix}${v.toLocaleString()}`);

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const h = (d.value / maxV) * chartH;
        const x = i * slot + slot / 2 - barW / 2;
        const y = padTop + (chartH - h);
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4} fill={color} opacity={0.9} />
            <SvgText x={x + barW / 2} y={y - 5} fontSize={8.5} fontWeight="700" fill={Colors.oxblood} textAnchor="middle">
              {fmt(d.value)}
            </SvgText>
            <SvgText x={x + barW / 2} y={height - 6} fontSize={9} fill="rgba(63,3,11,0.5)" textAnchor="middle">
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    flex: 1,
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: Colors.ink,
  },
  legendValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.6)',
  },
  legendEmpty: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.4)',
  },
});
