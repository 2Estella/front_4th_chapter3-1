import { Box, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { findOverlappingEvents } from './utils/eventOverlap';

import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { Notifications } from '@/components/common/Notifications';
import { OverlapDialog } from '@/components/common/OverlapDialog';
import { EventForm } from '@/components/event/EventForm';
import { EventList } from '@/components/event/EventList';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useEventForm } from '@/hooks/useEventForm';
import { useEventOperations } from '@/hooks/useEventOperations';
import { useNotifications } from '@/hooks/useNotifications';
import { useSearch } from '@/hooks/useSearch';
import { Event } from '@/types';

function App() {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null),
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData = {
      id: editingEvent?.id,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box w='full' h='100vh' m='auto' p={5}>
      <Flex gap={6} h='full'>
        <EventForm
          formData={{
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            isRepeating,
            repeatType,
            repeatInterval,
            repeatEndDate,
            notificationTime,
          }}
          onSubmit={addOrUpdateEvent}
          onChange={(field: string, value: any) => {
            switch (field) {
              case 'startTime':
                handleStartTimeChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                break;
              case 'endTime':
                handleEndTimeChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                break;
              case 'title':
                setTitle(value);
                break;
              case 'date':
                setDate(value);
                break;
              case 'description':
                setDescription(value);
                break;
              case 'location':
                setLocation(value);
                break;
              case 'category':
                setCategory(value);
                break;
              case 'isRepeating':
                setIsRepeating(value);
                break;
              case 'repeatType':
                setRepeatType(value);
                break;
              case 'repeatInterval':
                setRepeatInterval(value);
                break;
              case 'repeatEndDate':
                setRepeatEndDate(value);
                break;
              case 'notificationTime':
                setNotificationTime(value);
                break;
            }
          }}
          isEditing={Boolean(editingEvent)}
          startTimeError={startTimeError || ''}
          endTimeError={endTimeError || ''}
        />

        <Flex flex={1} direction='column' gap={4}>
          <CalendarHeader
            view={view}
            onViewChange={(newView) => setView(newView)}
            onNavigate={navigate}
          />

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
            />
          )}

          <EventList
            events={filteredEvents}
            notifiedEvents={notifiedEvents}
            onEdit={editEvent}
            onDelete={deleteEvent}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </Flex>
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: editingEvent?.id,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            repeat: {
              type: isRepeating ? repeatType : 'none',
              interval: repeatInterval,
              endDate: repeatEndDate || undefined,
            },
            notificationTime,
          });
        }}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
      />

      <Notifications
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </Box>
  );
}

export default App;
