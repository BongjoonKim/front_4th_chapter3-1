import {formatDate, formatMonth, getEventsForDay, getWeekDates, getWeeksAtMonth} from "../../../utils/dateUtils.ts";
import {Box, Heading, HStack, Table, Tbody, Td, Text, Th, Thead, Tr, VStack} from "@chakra-ui/react";
import {BellIcon} from "@chakra-ui/icons";
import {useCalendarView} from "../../../hooks/useCalendarView.ts";
import {weekDays} from "../../../utils/constants.ts";
import {useSearch} from "../../../hooks/useSearch.ts";
import {useEventOperations} from "../../../hooks/useEventOperations.ts";
import {useNotifications} from "../../../hooks/useNotifications.ts";
import {useAtom} from "jotai";
import {editingEventAtom} from "../../../stores/stores.ts";

export default function MonthCalendar() {
  const { currentDate, view, holidays } = useCalendarView();
  const [editingEvent, setEditingEvent] = useAtom(editingEventAtom);
  const { events } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  const { notifiedEvents } = useNotifications(events);
  const { filteredEvents } = useSearch(events, currentDate, view);
  const weeks = getWeeksAtMonth(currentDate);
  
  
  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {weekDays.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {weeks.map((week, weekIndex) => (
            <Tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateString = day ? formatDate(currentDate, day) : '';
                const holiday = holidays[dateString];
                
                return (
                  <Td
                    key={dayIndex}
                    height="100px"
                    verticalAlign="top"
                    width="14.28%"
                    position="relative"
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(filteredEvents, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          return (
                            <Box
                              key={event.id}
                              p={1}
                              my={1}
                              bg={isNotified ? 'red.100' : 'gray.100'}
                              borderRadius="md"
                              fontWeight={isNotified ? 'bold' : 'normal'}
                              color={isNotified ? 'red.500' : 'inherit'}
                            >
                              <HStack spacing={1}>
                                {isNotified && <BellIcon />}
                                <Text fontSize="sm" noOfLines={1}>
                                  {event.title}
                                </Text>
                              </HStack>
                            </Box>
                          );
                        })}
                      </>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  )
}