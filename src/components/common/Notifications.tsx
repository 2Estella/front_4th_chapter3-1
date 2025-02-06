import { VStack, Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';

interface NotificationsProps {
  notifications: Array<{ message: string }>;
  onClose: (index: number) => void;
}

export const Notifications = ({ notifications, onClose }: NotificationsProps) => (
  <VStack position='fixed' top={4} right={4} spacing={2} align='flex-end'>
    {notifications.map((notification, index) => (
      <Alert key={index} status='info' variant='solid' width='auto'>
        <AlertIcon />
        <Box flex='1'>
          <AlertTitle fontSize='sm'>{notification.message}</AlertTitle>
        </Box>
        <CloseButton onClick={() => onClose(index)} />
      </Alert>
    ))}
  </VStack>
);
