import { BellIcon } from '@chakra-ui/icons';
import {
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  HStack,
} from '@chakra-ui/react';

import { Event } from '@/types';
import { formatWeek, getWeekDates } from '@/utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
}

export const WeekView = ({ currentDate, events, notifiedEvents }: WeekViewProps) => {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid='week-view' align='stretch' w='full' spacing={4}>
      <Heading size='md'>{formatWeek(currentDate)}</Heading>
      <Table variant='simple' w='full'>
        <Thead>
          <Tr>
            {weekDays.map((day) => (
              <Th key={day} width='14.28%'>
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height='100px' verticalAlign='top' width='14.28%'>
                <Text fontWeight='bold'>{date.getDate()}</Text>
                {events
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    const isNotified = notifiedEvents.includes(event.id);
                    return (
                      <Box
                        key={event.id}
                        p={1}
                        my={1}
                        bg={isNotified ? 'red.100' : 'gray.100'}
                        borderRadius='md'
                        fontWeight={isNotified ? 'bold' : 'normal'}
                        color={isNotified ? 'red.500' : 'inherit'}
                      >
                        <HStack spacing={1}>
                          {isNotified && <BellIcon />}
                          <Text fontSize='sm' noOfLines={1}>
                            {event.title}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
