import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip, useToast,
  VStack
} from "@chakra-ui/react";
import {getTimeErrorMessage} from "../../utils/timeValidation.ts";
import {categories, notificationOptions} from "../../utils/constants.ts";
import {Event, EventForm, RepeatType} from "../../types.ts";
import {useAtom} from "jotai/index";
import {
  categoryAtom,
  dateAtom, descriptionAtom, editingEventAtom,
  endTimeAtom, eventsAtom, isOverlapDialogOpenAtom, isRepeatingAtom,
  locationAtom, notificationTimeAtom, overlappingEventsAtom, repeatEndDateAtom, repeatIntervalAtom, repeatTypeAtom,
  startTimeAtom,
  timeErrorAtom,
  titleAtom
} from "../../stores/stores.ts";
import {useAtomValue} from "jotai";
import {ChangeEvent, useRef} from "react";
import {findOverlappingEvents} from "../../utils/eventOverlap.ts";
import {useEventOperations} from "../../hooks/useEventOperations.ts";
import useSchedule from "../../hooks/schedule/useSchedule.ts";

export default function ScheduleForm() {
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
  const {
    addOrUpdateEvent,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useSchedule();
  
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>
      
      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>
      
      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>
      
      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>
      
      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>
      
      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>
      
      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>
      
      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
      
      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}
      
      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  )
}