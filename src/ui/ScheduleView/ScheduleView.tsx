import {Heading, HStack, IconButton, Select, VStack} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";
import {MonthCalendar, WeekCalendar} from "./calendar";
import {useCalendarView} from "../../hooks/useCalendarView.ts";

export default function ScheduleView() {
  
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      
      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate('next')}
        />
      </HStack>
      
      {/*{view === 'week' && renderWeekView()}*/}
      {view === 'week' && <WeekCalendar />}
      {/*{view === 'month' && renderMonthView()}*/}
      {view === 'month' && <MonthCalendar />}
    </VStack>
  )
}