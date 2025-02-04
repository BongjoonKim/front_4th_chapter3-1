import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay, Button, Text
} from "@chakra-ui/react";
import useAlert from "../../hooks/alert/useAlert.ts";
import {useEventOperations} from "../../hooks/useEventOperations.ts";
import {useAtom, useAtomValue} from "jotai";
import {
  categoryAtom,
  dateAtom, descriptionAtom,
  editingEventAtom,
  endTimeAtom, isOverlapDialogOpenAtom, isRepeatingAtom, locationAtom,
  notificationTimeAtom, overlappingEventsAtom, repeatEndDateAtom, repeatIntervalAtom, repeatTypeAtom,
  startTimeAtom,
  titleAtom
} from "../../stores/stores.ts";
import {useRef} from "react";

export default function ScheduleAlert() {
  const title = useAtomValue(titleAtom);
  const date = useAtomValue(dateAtom);
  const startTime = useAtomValue(startTimeAtom);
  const endTime = useAtomValue(endTimeAtom);
  const description = useAtomValue(descriptionAtom);
  const location = useAtomValue(locationAtom);
  const category = useAtomValue(categoryAtom);
  const isRepeating = useAtomValue(isRepeatingAtom);
  const repeatType = useAtomValue(repeatTypeAtom);
  const repeatInterval = useAtomValue(repeatIntervalAtom);
  const repeatEndDate = useAtomValue(repeatEndDateAtom);
  const notificationTime = useAtomValue(notificationTimeAtom);
  const [editingEvent, setEditingEvent] = useAtom(editingEventAtom);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useAtom(isOverlapDialogOpenAtom);
  const [overlappingEvents, setOverlappingEvents] = useAtom(overlappingEventsAtom);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  
  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsOverlapDialogOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>
          
          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>
          
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setIsOverlapDialogOpen(false);
                saveEvent({
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
                });
              }}
              ml={3}
            >
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}