import {Box, FormControl, FormLabel, HStack, IconButton, Input, Text, VStack} from "@chakra-ui/react";
import {BellIcon, DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {notificationOptions} from "../../utils/constants.ts";
import {useSearch} from "../../hooks/useSearch.ts";
import {useCalendarView} from "../../hooks/useCalendarView.ts";
import {useAtom} from "jotai/index";
import {Event} from "../../types.ts";
import {editingEventAtom, eventsAtom, notifiedEventsAtom} from "../../stores/stores.ts";
import {useEventOperations} from "../../hooks/useEventOperations.ts";
import {useEventForm} from "../../hooks/useEventForm.ts";
import useSchedule from "../../hooks/schedule/useSchedule.ts";

export default function ScheduleList() {
  const [events, setEvents] = useAtom<Event[]>(eventsAtom);
  const [notifiedEvents, setNotifiedEvents] = useAtom(notifiedEventsAtom);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const [editingEvent, setEditingEvent] = useAtom(editingEventAtom);
  const {  deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  const {editEvent} = useSchedule();
  
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>
      
      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%" data-testid={`event-item-${event.id}`}>
            <HStack justifyContent="space-between">
              <VStack align="start">
                <HStack>
                  {notifiedEvents.includes(event.id) && <BellIcon data-testid={`event-bell-icon-${event.id}`} color="red.500" />}
                  <Text
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    data-testid={`event-title-${event.id}`}
                    color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                  >
                    {event.title}
                  </Text>
                </HStack>
                <Text>{event.date}</Text>
                <Text>
                  {event.startTime} - {event.endTime}
                </Text>
                <Text>{event.description}</Text>
                <Text>{event.location}</Text>
                <Text>카테고리: {event.category}</Text>
                {event.repeat.type !== 'none' && (
                  <Text>
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Text>
                )}
                <Text>
                  알림:{' '}
                  {
                    notificationOptions.find(
                      (option) => option.value === event.notificationTime
                    )?.label
                  }
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Edit event"
                  data-testid={`edit-button-${event.id}`}
                  icon={<EditIcon />}
                  onClick={() => editEvent(event)}
                />
                <IconButton
                  aria-label="Delete event"
                  icon={<DeleteIcon />}
                  onClick={() => deleteEvent(event.id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  )
}