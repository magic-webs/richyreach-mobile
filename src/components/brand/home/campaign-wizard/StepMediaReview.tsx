import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Modal, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Colors, FontFamily } from '@/constants/brand';
import { Calendar03Icon, Image01Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { TactileButton } from '@/components/ui/tactile-button';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { useCampaignWizardStore } from '@/store/campaignWizard';

interface StepMediaReviewProps {
  onPublish: () => void;
}

const { width: W } = Dimensions.get('window');

// Date parsing and formatting helpers
const parseDateString = (str: string) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const formatDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDisplayDate = (str: string) => {
  const d = parseDateString(str);
  if (!d) return 'Select Date';
  return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
};

const isDateInPast = (d: Date) => {
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);
  const dZero = new Date(d);
  dZero.setHours(0, 0, 0, 0);
  return dZero < todayZero;
};

// Calendar Range Picker Modal component
interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (start: string, end: string) => void;
  initialStart: string;
  initialEnd: string;
}

function CalendarModal({ visible, onClose, onApply, initialStart, initialEnd }: CalendarModalProps) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  const handleDayPress = (date: Date) => {
    const dateStr = formatDateString(date);
    if (!start || (start && end) || dateStr < start) {
      setStart(dateStr);
      setEnd('');
    } else {
      setEnd(dateStr);
    }
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Show 3 months: current month, next month, and month after next
  const monthsData = [];
  for (let i = 0; i < 3; i++) {
    const m = (currentMonth + i) % 12;
    const y = currentMonth + i > 11 ? currentYear + 1 : currentYear;
    monthsData.push({ year: y, month: m });
  }

  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 6 = Sat
    const days = [];

    // Padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    const tempDate = new Date(year, month, 1);
    while (tempDate.getMonth() === month) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <View>
              <Text style={styles.calendarHeaderTitle}>Select Campaign Dates</Text>
              <Text style={styles.calendarRangeLabel}>
                {start ? formatDisplayDate(start) : 'Start'} to {end ? formatDisplayDate(end) : 'End'}
              </Text>
            </View>
            <TouchableOpacity style={styles.calendarCloseBtn} onPress={onClose}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.oxblood} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Month list */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {monthsData.map(({ year, month }, index) => {
              const days = getMonthDays(year, month);
              return (
                <View key={index} style={styles.monthSection}>
                  <Text style={styles.monthName}>{monthsLong[month]} {year}</Text>

                  {/* Weekday labels */}
                  <View style={styles.weekdayRow}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
                      <Text key={w} style={styles.weekdayText}>{w}</Text>
                    ))}
                  </View>

                  {/* Days grid */}
                  <View style={styles.daysGrid}>
                    {days.map((day, dIdx) => {
                      if (!day) {
                        return <View key={dIdx} style={styles.dayCellEmpty} />;
                      }

                      const dateStr = formatDateString(day);
                      const isPast = isDateInPast(day);
                      const isStart = dateStr === start;
                      const isEnd = dateStr === end;
                      const isInRange = start && end && dateStr > start && dateStr < end;

                      return (
                        <TouchableOpacity
                          key={dIdx}
                          disabled={isPast}
                          activeOpacity={0.8}
                          style={[
                            styles.dayCell,
                            isStart && styles.dayCellStart,
                            isEnd && styles.dayCellEnd,
                            isInRange && styles.dayCellRange,
                            isPast && styles.dayCellDisabled
                          ]}
                          onPress={() => handleDayPress(day)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              (isStart || isEnd) && styles.dayTextSelected,
                              isInRange && styles.dayTextRange,
                              isPast && styles.dayTextDisabled
                            ]}
                          >
                            {day.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.calendarFooter}>
            <TouchableOpacity
              style={[styles.applyBtn, (!start || !end) && styles.applyBtnDisabled]}
              disabled={!start || !end}
              onPress={() => onApply(start, end)}
            >
              <Text style={styles.applyBtnText}>Apply Date Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function StepMediaReview({ onPublish }: StepMediaReviewProps) {
  "use no memo";
  const { updateField } = useCampaignWizardStore();
  const { control, register, setValue, watch, formState: { errors } } = useFormContext();

  useEffect(() => {
    register('startDate', {
      required: 'Start date is required',
      pattern: {
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Start date must be in YYYY-MM-DD format',
      },
    });
    register('endDate', {
      required: 'End date is required',
      pattern: {
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: 'End date must be in YYYY-MM-DD format',
      },
      validate: (val) => {
        const startVal = watch('startDate');
        if (startVal && val && val < startVal) {
          return 'End date must be after start date';
        }
        return true;
      }
    });
    register('applicationDeadline', {
      required: 'Application deadline is required',
      pattern: {
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Application deadline must be in YYYY-MM-DD format',
      },
      validate: (val) => {
        const startVal = watch('startDate');
        if (startVal && val && val > startVal) {
          return 'Application deadline must be before start date';
        }
        return true;
      }
    });
  }, [register]);

  const referenceLinks = watch('referenceLinks');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const applicationDeadline = watch('applicationDeadline');
  const brandName = watch('brandName');
  const campName = watch('campName');
  const campNiche = watch('campNiche');
  const campObjective = watch('campObjective');
  const paymentType = watch('paymentType');
  const campaignBudget = watch('campaignBudget');
  const numCreators = watch('numCreators');
  const campLocationValue = watch('campLocationValue');
  const campLocationType = watch('campLocationType');
  const campaignBannerUri = watch('campaignBannerUri');

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch campaign image templates
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['campaignTemplates'],
    queryFn: async () => {
      const res = await api.campaigns.getTemplates();
      return res || [];
    },
  });

  // Filter templates by selected campaign niche
  const filteredTemplates = templates.filter(
    (t) => t.category?.toLowerCase() === campNiche?.toLowerCase()
  );
  // Fallback to "General" or show all if niche matches nothing
  const templatesToShow = filteredTemplates.length > 0
    ? filteredTemplates
    : templates.filter((t) => t.category?.toLowerCase() === 'general').length > 0
      ? templates.filter((t) => t.category?.toLowerCase() === 'general')
      : templates;

  const totalBudget = parseInt(campaignBudget) || 0;
  const creators = parseInt(numCreators) || 1;
  const platformFee = totalBudget > 0 ? 1000 : 0;
  const netPayout = Math.max(0, totalBudget - platformFee);
  const costPerCreatorCalculated = creators > 0 ? Math.floor(netPayout / creators) : 0;

  const handleBack = () => {
    updateField('createStep', 4);
  };

  const pickImage = async (field: 'campaignBannerUri') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setValue(field, result.assets[0].uri, { shouldValidate: true });
    }
  };

  const clearImage = (field: 'campaignBannerUri') => {
    setValue(field, null, { shouldValidate: true });
  };

  const handleApplyDates = (start: string, end: string) => {
    setValue('startDate', start, { shouldValidate: true });
    setValue('endDate', end, { shouldValidate: true });

    // Auto set application deadline to 2 days before the start date
    const startD = parseDateString(start);
    if (startD) {
      startD.setDate(startD.getDate() - 2);
      setValue('applicationDeadline', formatDateString(startD), { shouldValidate: true });
    }
    setCalendarOpen(false);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Media Guidelines & Links</Text>

        {/* Campaign Banner Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Campaign Banner Image</Text>

          {campaignBannerUri && (
            <View style={[styles.imagePreviewContainer, { marginBottom: 12 }]}>
              <Image source={{ uri: campaignBannerUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.clearImageBtn} onPress={() => clearImage('campaignBannerUri')}>
                <HugeiconsIcon icon={Cancel01Icon} size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
            {/* Device Picker Card */}
            <TouchableOpacity
              style={[styles.templateCard, styles.devicePickerCard]}
              onPress={() => pickImage('campaignBannerUri')}
              activeOpacity={0.8}
            >
              <HugeiconsIcon icon={Image01Icon} size={20} color={Colors.roseDeep} />
              <Text style={styles.devicePickerText}>Upload custom</Text>
            </TouchableOpacity>

            {/* Template Cards */}
            {templatesToShow.map((tmpl) => {
              const active = campaignBannerUri === tmpl.imageUrl;
              return (
                <TouchableOpacity
                  key={tmpl.id}
                  style={[styles.templateCard, active && styles.templateCardActive]}
                  onPress={() => setValue('campaignBannerUri', tmpl.imageUrl, { shouldValidate: true })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: tmpl.imageUrl }} style={styles.templateImage} />
                  {active && (
                    <View style={styles.activeOverlay}>
                      <Text style={styles.activeCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Reference Video / Post URL</Text>
          <Controller
            control={control}
            name="referenceLinks"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.formInput}
                placeholder="https://instagram.com/p/..."
                placeholderTextColor="rgba(63,3,11,0.35)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>

      {/* Campaign Timeline section with Range Calendar select */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Campaign Timeline Dates *</Text>

        <TouchableOpacity
          style={[
            styles.dateRangePickerBtn,
            (errors.startDate || errors.endDate || errors.applicationDeadline) && styles.dateRangePickerBtnError
          ]}
          activeOpacity={0.85}
          onPress={() => setCalendarOpen(true)}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={18} color={Colors.oxblood} />
          <View style={styles.dateRangeTextWrapper}>
            <Text style={styles.dateRangePlaceholder}>Start Date - End Date</Text>
            <Text style={styles.dateRangeValue}>
              {startDate ? formatDisplayDate(startDate) : 'Start'} — {endDate ? formatDisplayDate(endDate) : 'End'}
            </Text>
          </View>
        </TouchableOpacity>

        {errors.startDate && <Text style={styles.errorText}>{errors.startDate.message as string}</Text>}
        {errors.endDate && <Text style={styles.errorText}>{errors.endDate.message as string}</Text>}

        {startDate && (
          <View style={styles.autoDeadlineRow}>
            <Text style={styles.autoDeadlineLabel}>Application Deadline</Text>
            <Text style={styles.autoDeadlineValue}>
              {formatDisplayDate(applicationDeadline)} (Auto-set: 2 days before campaign start)
            </Text>
          </View>
        )}
        {errors.applicationDeadline && <Text style={styles.errorText}>{errors.applicationDeadline.message as string}</Text>}
      </View>

      {/* Brief Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Campaign Summary Preview</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Brand Name</Text>
          <Text style={styles.summaryValue}>{brandName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Campaign Title</Text>
          <Text style={styles.summaryValue}>{campName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Niche & Objective</Text>
          <Text style={styles.summaryValue}>{campNiche} · {campObjective}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Type</Text>
          <Text style={styles.summaryValue}>{paymentType}</Text>
        </View>
        {paymentType !== 'Barter' && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.summaryValue}>₹{totalBudget.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee (Deducted)</Text>
              <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>-₹{platformFee.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Creators Payout</Text>
              <Text style={styles.summaryValue}>₹{netPayout.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Est. Pay per Creator</Text>
              <Text style={[styles.summaryValue, { color: Colors.oxblood, fontWeight: '700' }]}>₹{costPerCreatorCalculated.toLocaleString('en-IN')}</Text>
            </View>
          </>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Target Location</Text>
          <Text style={styles.summaryValue}>{campLocationValue || campLocationType}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <TactileButton
          text="Back"
          onPress={handleBack}
          icon="arrowLeft"
          iconPosition="left"
          variant="secondary"
        />
        <TactileButton
          onPress={onPublish}
          text="Publish Campaign"
          icon="arrow"
          iconPosition="right"
          variant="primary"
        />
      </View>

      <CalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        initialStart={startDate}
        initialEnd={endDate}
        onApply={handleApplyDates}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: 6,
    marginBottom: 6,
  },
  formLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 10.5,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    fontSize: 14,
    color: Colors.ink,
    fontFamily: FontFamily.sansMedium,
  },
  imagePickerBtn: {
    backgroundColor: 'rgba(63,3,11,0.03)',
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
  },
  imagePreviewContainer: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: 'rgba(63,3,11,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  sectionHeader: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.oxblood,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
    paddingBottom: 4,
  },
  dateRangePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    gap: 12,
  },
  dateRangeTextWrapper: {
    flex: 1,
  },
  dateRangePlaceholder: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRangeValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
    marginTop: 2,
  },
  autoDeadlineRow: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  autoDeadlineLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    color: Colors.roseDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  autoDeadlineValue: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Colors.oxblood,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: 'rgba(63,3,11,0.04)',
    borderRadius: 14,
    padding: 12,
  },
  summaryTitle: {
    fontFamily: FontFamily.serif,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12.5,
    color: 'rgba(63,3,11,0.55)',
  },
  summaryValue: {
    fontFamily: FontFamily.sans,
    fontSize: 12.5,
    color: Colors.oxblood,
    textAlign: 'right',
  },
  bottomRow: {
    justifyContent: 'space-between',
    width: "auto",
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  // Custom Range Calendar Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: Colors.creamLite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.08)',
  },
  calendarHeaderTitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  calendarRangeLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.roseDeep,
    marginTop: 2,
  },
  calendarCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  monthName: {
    fontFamily: FontFamily.serif,
    fontSize: 16,
    color: Colors.oxblood,
    marginBottom: 10,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: 'rgba(63,3,11,0.4)',
    width: (W - 40) / 7,
    textAlign: 'center',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (W - 40) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  dayCellEmpty: {
    width: (W - 40) / 7,
    height: 40,
    marginVertical: 2,
  },
  dayCellStart: {
    backgroundColor: Colors.oxblood,
    borderRadius: 8,
  },
  dayCellEnd: {
    backgroundColor: Colors.oxblood,
    borderRadius: 8,
  },
  dayCellRange: {
    backgroundColor: 'rgba(180, 106, 116, 0.15)',
    borderRadius: 0,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextRange: {
    color: Colors.oxblood,
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: 'rgba(63,3,11,0.3)',
  },
  calendarFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(63,3,11,0.08)',
  },
  applyBtn: {
    backgroundColor: Colors.oxblood,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(63,3,11,0.2)',
  },
  applyBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  dateRangePickerBtnError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    fontFamily: FontFamily.sansMedium,
    marginTop: 4,
    marginBottom: 4,
  },
  templatesScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  templateCard: {
    width: 100,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63,3,11,0.08)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  templateCardActive: {
    borderColor: Colors.oxblood,
    borderWidth: 2,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  devicePickerCard: {
    borderStyle: 'dashed',
    borderColor: Colors.roseDeep,
    gap: 4,
  },
  devicePickerText: {
    fontSize: 9.5,
    fontFamily: FontFamily.sansMedium,
    color: Colors.roseDeep,
    textAlign: 'center',
  },
  activeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(180, 106, 116, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCheck: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
