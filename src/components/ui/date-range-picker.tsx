import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar02Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  label?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateRangePicker({ startDate, endDate, onChange, label = 'Select Date Range' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize calendar view to the start date if available, otherwise today
  const initDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initDate.getMonth());

  // Temporary selection state during modal open
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  const getDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const list: (number | null)[] = [];

    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      list.push(null);
    }

    // Days in month
    for (let i = 1; i <= daysInMonth; i++) {
      list.push(i);
    }

    return list;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayPress = (day: number | null) => {
    if (day === null) return;
    const clickedDateStr = formatDateString(currentYear, currentMonth, day);

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedDateStr);
      setTempEnd('');
    } else {
      const start = new Date(tempStart);
      const clicked = new Date(clickedDateStr);

      if (clicked < start) {
        // Reset start date if clicked earlier than current start
        setTempStart(clickedDateStr);
      } else {
        setTempEnd(clickedDateStr);
      }
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onChange(tempStart, tempEnd);
      setIsOpen(false);
    }
  };

  const handleOpen = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    const d = startDate ? new Date(startDate) : new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setIsOpen(true);
  };

  // Helper to check range status
  const getDayStatus = (day: number | null) => {
    if (!day) return 'empty';
    const currentStr = formatDateString(currentYear, currentMonth, day);

    if (tempStart === currentStr && tempEnd === currentStr) return 'both';
    if (tempStart === currentStr) return 'start';
    if (tempEnd === currentStr) return 'end';

    if (tempStart && tempEnd) {
      const cur = new Date(currentStr);
      const start = new Date(tempStart);
      const end = new Date(tempEnd);
      if (cur > start && cur < end) return 'range';
    }

    return 'none';
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysList = getDays();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triggerBtn}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <HugeiconsIcon icon={Calendar02Icon} size={18} color={Colors.oxblood} strokeWidth={2} />
        <View style={styles.triggerTextContainer}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerValue}>
            {startDate ? formatDisplayDate(startDate) : 'Start Date'}  ➔  {endDate ? formatDisplayDate(endDate) : 'End Date'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Date Range</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)} activeOpacity={0.7}>
                <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.oxblood} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Current Range Bar */}
            <View style={styles.rangePreviewRow}>
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>START DATE</Text>
                <Text style={styles.previewValueText}>{tempStart ? formatDisplayDate(tempStart) : 'Not Selected'}</Text>
              </View>
              <View style={styles.previewSeparator}>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="rgba(63,3,11,0.3)" />
              </View>
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>END DATE</Text>
                <Text style={styles.previewValueText}>{tempEnd ? formatDisplayDate(tempEnd) : 'Not Selected'}</Text>
              </View>
            </View>

            {/* Calendar Controls */}
            <View style={styles.calendarControls}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={Colors.oxblood} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={Colors.oxblood} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Day Header Row */}
            <View style={styles.daysHeaderRow}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={styles.dayHeaderCell}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {daysList.map((day, i) => {
                const status = getDayStatus(day);
                const isSelected = status === 'start' || status === 'end' || status === 'both';
                const isRange = status === 'range';

                return (
                  <TouchableOpacity
                    key={i}
                    disabled={day === null}
                    onPress={() => handleDayPress(day)}
                    style={[
                      styles.dayCell,
                      isRange && styles.dayCellRange,
                      isSelected && styles.dayCellSelected,
                      status === 'start' && styles.dayCellStart,
                      status === 'end' && styles.dayCellEnd,
                    ]}
                    activeOpacity={0.7}
                  >
                    {day !== null && (
                      <Text style={[
                        styles.dayCellText,
                        isRange && styles.dayCellTextRange,
                        isSelected && styles.dayCellTextSelected,
                      ]}>
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              disabled={!tempStart || !tempEnd}
              style={[styles.applyBtn, (!tempStart || !tempEnd) && styles.applyBtnDisabled]}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    ...Shadow.card,
  },
  triggerTextContainer: { flex: 1, gap: 2 },
  triggerLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(63,3,11,0.45)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  triggerValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,10,12,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.creamLite,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangePreviewRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    marginBottom: 16,
  },
  previewBox: { flex: 1, alignItems: 'center' },
  previewLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(63,3,11,0.4)',
    fontWeight: '700',
    marginBottom: 2,
  },
  previewValueText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '700',
  },
  previewSeparator: { paddingHorizontal: 8 },
  calendarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  monthLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.oxblood,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeaderCell: {
    width: 40,
    textAlign: 'center',
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(63,3,11,0.4)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 4,
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayCellSelected: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.md,
  },
  dayCellStart: {
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
  },
  dayCellEnd: {
    borderTopRightRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  dayCellRange: {
    backgroundColor: 'rgba(180,106,116,0.18)',
    borderRadius: 0,
  },
  dayCellText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    color: Colors.ink,
  },
  dayCellTextRange: {
    color: Colors.oxblood,
    fontWeight: '600',
  },
  dayCellTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(63,3,11,0.2)',
  },
  applyBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
