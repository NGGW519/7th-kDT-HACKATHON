// components/RadarChart.js
import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

const labels = ['활동성', '사회성', '적응력', '도전성', '연대감']; // 항목
const maxValue = 5; // 최대 점수
const radius = 80;
const center = 130;
const angle = (2 * Math.PI) / labels.length;

export default function RadarChart({ scores }) {
  const points = scores.map((v, i) => {
    const x = center + radius * (v / maxValue) * Math.sin(i * angle);
    const y = center - radius * (v / maxValue) * Math.cos(i * angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View>
      <Svg height="320" width="320">
        {/* 다각형 배경선 */}
        {[1, 2, 3, 4, 5].map(level => {
          const polygon = labels.map((_, i) => {
            const x = center + (radius * (level / maxValue)) * Math.sin(i * angle);
            const y = center - (radius * (level / maxValue)) * Math.cos(i * angle);
            return `${x},${y}`;
          }).join(' ');
          return (
            <Polygon
              key={level}
              points={polygon}
              stroke="#ccc"
              strokeWidth="1"
              fill="none"
            />
          );
        })}

        {/* 축선 */}
        {labels.map((label, i) => {
          const x = center + radius * Math.sin(i * angle);
          const y = center - radius * Math.cos(i * angle);
          return (
            <Line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#aaa"
            />
          );
        })}

        {/* 점수 다각형 */}
        <Polygon
          points={points}
          fill="rgba(255, 99, 132, 0.4)"
          stroke="red"
          strokeWidth="2"
        />

        {/* 레이블 */}
        {labels.map((label, i) => {
          const x = center + (radius + 18) * Math.sin(i * angle);
          const y = center - (radius + 18) * Math.cos(i * angle);
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              fontSize="10"
              textAnchor="middle"
              fill="#333"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}