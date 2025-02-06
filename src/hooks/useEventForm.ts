import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';
import {useAtom} from "jotai/index";
import {
  categoryAtom,
  dateAtom,
  descriptionAtom,
  editingEventAtom,
  endTimeAtom, isRepeatingAtom,
  locationAtom, notificationTimeAtom, repeatEndDateAtom, repeatIntervalAtom, repeatTypeAtom,
  startTimeAtom, timeErrorAtom,
  titleAtom
} from "../stores/stores.ts";

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

// 더 이상 사용하지 않는 훅입니다.
export const useEventForm = (initialEvent?: Event) => {
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

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    editEvent,
  };
};
