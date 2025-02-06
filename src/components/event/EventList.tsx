import { EditIcon, DeleteIcon, BellIcon } from '@chakra-ui/icons';
import {
  VStack,
  Box,
  Text,
  HStack,
  IconButton,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';

import { Event } from '@/types';

interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const EventList = ({
  events,
  notifiedEvents,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
}: EventListProps) => (
  <VStack data-testid='event-list' w='500px' h='full' overflowY='auto'>
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        placeholder='검색어를 입력하세요'
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FormControl>

    {events.length === 0 ? (
      <Text>검색 결과가 없습니다.</Text>
    ) : (
      events.map((event) => (
        <Box key={event.id} borderWidth={1} borderRadius='lg' p={3} width='100%'>
          <HStack justifyContent='space-between'>
            <VStack align='start'>
              <HStack>
                {notifiedEvents.includes(event.id) && <BellIcon color='red.500' />}
                <Text
                  fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
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
            </VStack>
            <HStack>
              <IconButton
                aria-label='Edit event'
                icon={<EditIcon />}
                onClick={() => onEdit(event)}
              />
              <IconButton
                aria-label='Delete event'
                icon={<DeleteIcon />}
                onClick={() => onDelete(event.id)}
              />
            </HStack>
          </HStack>
        </Box>
      ))
    )}
  </VStack>
);
