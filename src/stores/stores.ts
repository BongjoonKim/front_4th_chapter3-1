import {atom} from "jotai";
import {Event, RepeatType} from "../types.ts";
import {Notification, TimeErrorRecord} from "../utils/types.ts";

export const editingEventAtom = atom<Event | null>(null);
export const titleAtom = atom<string>('');
export const dateAtom = atom<string>('');
export const startTimeAtom = atom<string>('');
export const endTimeAtom = atom<string>('');
export const descriptionAtom = atom<string>('');
export const locationAtom = atom<string>('');
export const categoryAtom = atom<string>('');
export const isRepeatingAtom = atom<boolean>(false);
export const repeatTypeAtom = atom<RepeatType>('none');
export const repeatIntervalAtom = atom<number>(1);
export const repeatEndDateAtom = atom<string>('');
export const notificationTimeAtom = atom<number>(10);
// 다이얼로그 오픈 상태를 위한 atom
export const isOverlapDialogOpenAtom = atom<boolean>(false);

// 겹치는 이벤트들을 저장하기 위한 atom
export const overlappingEventsAtom = atom<Event[]>([]);
// notifications atom
export const notificationsAtom = atom<Notification[]>([]);

// notifiedEvents atom
export const notifiedEventsAtom = atom<string[]>([]);

export const timeErrorAtom = atom<TimeErrorRecord>({
  startTimeError: null,
  endTimeError: null,
});

export const eventsAtom = atom<Event[]>([]);
export const viewAtom = atom<'week' | 'month'>('month');
export const currentDateAtom = atom<Date>(new Date());
export const holidaysAtom = atom<{ [key: string]: string }>({});