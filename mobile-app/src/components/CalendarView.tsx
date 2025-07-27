import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isSameMonth,
  isToday,
  parseISO
} from 'date-fns';
import { GlassCard } from './GlassCard';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'booking' | 'appointment';
  status?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventPress?: (event: CalendarEvent) => void;
  selectedDate?: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onDateSelect,
  onEventPress,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const handleDatePress = (date: Date) => {
    onDateSelect?.(date);
  };

  const handleEventPress = (event: CalendarEvent) => {
    onEventPress?.(event);
  };

  const getEventColor = (event: CalendarEvent) => {
    switch (event.type) {
      case 'booking':
        return event.status === 'completed' ? Colors.success : Colors.primary;
      case 'appointment':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const renderWeekDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.weekDaysContainer}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDay = (date: Date, index: number) => {
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);
    const dayEvents = getEventsForDate(date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayContainer,
          !isCurrentMonth && styles.otherMonthDay,
          isSelected && styles.selectedDay,
          isCurrentDay && styles.todayDay,
        ]}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.otherMonthDayText,
            isSelected && styles.selectedDayText,
            isCurrentDay && styles.todayDayText,
          ]}
        >
          {format(date, 'd')}
        </Text>
        
        {dayEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {dayEvents.slice(0, 3).map((event, eventIndex) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventDot,
                  { backgroundColor: getEventColor(event) }
                ]}
                onPress={() => handleEventPress(event)}
              />
            ))}
            {dayEvents.length > 3 && (
              <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCalendar = () => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarContainer}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekContainer}>
            {week.map((day, dayIndex) => renderDay(day, weekIndex * 7 + dayIndex))}
          </View>
        ))}
      </View>
    );
  };

  const renderEventsForSelectedDate = () => {
    if (!selectedDate) return null;

    const selectedEvents = getEventsForDate(selectedDate);
    
    if (selectedEvents.length === 0) {
      return (
        <View style={styles.selectedDateEvents}>
          <Text style={styles.selectedDateTitle}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          <Text style={styles.noEventsText}>No events for this date</Text>
        </View>
      );
    }

    return (
      <View style={styles.selectedDateEvents}>
        <Text style={styles.selectedDateTitle}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {selectedEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() => handleEventPress(event)}
            >
              <View
                style={[
                  styles.eventIndicator,
                  { backgroundColor: getEventColor(event) }
                ]}
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventType}>
                  {event.type === 'booking' ? 'Pet Transport' : 'Vet Appointment'}
                  {event.status && ` • ${event.status}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {renderWeekDays()}
      {renderCalendar()}
      
      {selectedDate && renderEventsForSelectedDate()}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },

  navigationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  monthTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.sm,
  },

  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },

  weekDayText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    color: Colors.textSecondary,
  },

  calendarContainer: {
    marginBottom: Layout.spacing.lg,
  },

  weekContainer: {
    flexDirection: 'row',
  },

  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
    position: 'relative',
  },

  otherMonthDay: {
    opacity: 0.3,
  },

  selectedDay: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  todayDay: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  dayText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    fontWeight: Fonts.mediumWeight,
  },

  otherMonthDayText: {
    color: Colors.textSecondary,
  },

  selectedDayText: {
    color: Colors.primary,
    fontWeight: Fonts.bold,
  },

  todayDayText: {
    color: Colors.primary,
    fontWeight: Fonts.bold,
  },

  eventsContainer: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },

  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },

  moreEventsText: {
    fontFamily: Fonts.primary,
    fontSize: 8,
    color: Colors.textSecondary,
    marginLeft: 2,
  },

  selectedDateEvents: {
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingTop: Layout.spacing.md,
  },

  selectedDateTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },

  noEventsText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  eventsList: {
    maxHeight: 150,
  },

  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.sm,
    marginBottom: Layout.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  eventIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Layout.spacing.sm,
  },

  eventDetails: {
    flex: 1,
  },

  eventTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
  },

  eventType: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});