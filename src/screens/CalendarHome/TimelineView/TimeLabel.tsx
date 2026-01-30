import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../../utils/colors';
import {formatTimeLabel} from '../../../utils/dateUtils';

interface TimeLabelProps {
  hour: number;
  withSpace?: boolean;
}

export function TimeLabel({hour, withSpace = false}: TimeLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{formatTimeLabel(hour, withSpace)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.hourHeight,
    width: LAYOUT.timeLabelWidth,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: -6,
  },
  text: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: -6,
  },
});
