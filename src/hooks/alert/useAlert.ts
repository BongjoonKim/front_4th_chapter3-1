import {useRef, useState} from "react";
import {Event} from "../../types.ts";

export default function useAlert() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  return {
    isOverlapDialogOpen, setIsOverlapDialogOpen,
    overlappingEvents, setOverlappingEvents,
    cancelRef,
  }
}