import {useAtom} from "jotai/index";
import {
  categoryAtom,
  dateAtom,
  descriptionAtom, editingEventAtom,
  endTimeAtom, eventsAtom, isOverlapDialogOpenAtom, isRepeatingAtom,
  locationAtom, notificationTimeAtom, overlappingEventsAtom, repeatEndDateAtom, repeatIntervalAtom, repeatTypeAtom,
  startTimeAtom, timeErrorAtom,
  titleAtom
} from "../../stores/stores.ts";
import {Event, EventForm} from "../../types.ts";
import {useToast} from "@chakra-ui/react";
import {useEventOperations} from "../useEventOperations.ts";
import {findOverlappingEvents} from "../../utils/eventOverlap.ts";
import {ChangeEvent} from "react";
import {getTimeErrorMessage} from "../../utils/timeValidation.ts";

export default function useSchedule() {
  const [title, setTitle] = useAtom(titleAtom);
  const [date, setDate] = useAtom(dateAtom);
  const [startTime, setStartTime] = useAtom(startTimeAtom);
  const [endTime, setEndTime] = useAtom(endTimeAtom);
  const [description, setDescription] = useAtom(descriptionAtom);
  const [location, setLocation] = useAtom(locationAtom);
  const [category, setCategory] = useAtom(categoryAtom);
  const [isRepeating, setIsRepeating] = useAtom(isRepeatingAtom);
  const [repeatType, setRepeatType] = useAtom(repeatTypeAtom);
  const [repeatInterval, setRepeatInterval] = useAtom(repeatIntervalAtom);
  const [repeatEndDate, setRepeatEndDate] = useAtom(repeatEndDateAtom);
  const [notificationTime, setNotificationTime] = useAtom(notificationTimeAtom);
  const [editingEvent, setEditingEvent] = useAtom(editingEventAtom);
  const [{ startTimeError, endTimeError }, setTimeError] = useAtom(timeErrorAtom);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useAtom(isOverlapDialogOpenAtom);
  const [overlappingEvents, setOverlappingEvents] = useAtom(overlappingEventsAtom);
  const [events, setEvents] = useAtom<Event[]>(eventsAtom);
  const toast = useToast();
  const { saveEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  
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
    
    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
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
  
  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
  };
  
  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };
  
  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };
  
  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };
  
  return {
    addOrUpdateEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    editEvent,
  }
}