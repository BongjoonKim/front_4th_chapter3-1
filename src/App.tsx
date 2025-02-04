import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from './utils/dateUtils';
import { findOverlappingEvents } from './utils/eventOverlap';
import { getTimeErrorMessage } from './utils/timeValidation';
import {categories, notificationOptions, weekDays} from "./utils/constants.ts";
import {MonthCalendar, WeekCalendar} from "./ui/ScheduleView/calendar";
import {useAtom} from "jotai/index";
import {isOverlapDialogOpenAtom, overlappingEventsAtom} from "./stores/stores.ts";
import ScheduleAlert from "./ui/dialog/ScheduleAlert.tsx";
import Notification from "./ui/notification/Notification.tsx";
import ScheduleForm from "./ui/ScheduleForm/ScheduleForm.tsx";
import ScheduleView from "./ui/ScheduleView/ScheduleView.tsx";
import ScheduleList from "./ui/ScheduleList/ScheduleList.tsx";



function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <ScheduleForm />

        <ScheduleView />
        
        <ScheduleList />
        
      </Flex>
      <ScheduleAlert />
      <Notification />
    </Box>
  );
}

export default App;
