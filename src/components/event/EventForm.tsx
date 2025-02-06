import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Button,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';

interface EventFormProps {
  formData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    isRepeating: boolean;
    repeatType: string;
    repeatInterval: number;
    repeatEndDate: string;
    notificationTime: number;
  };
  onSubmit: () => void;
  onChange: (field: string, value: any) => void;
  isEditing: boolean;
  startTimeError?: string;
  endTimeError?: string;
}

export const EventForm = ({
  formData,
  onSubmit,
  onChange,
  isEditing,
  startTimeError,
  endTimeError,
}: EventFormProps) => {
  const categories = ['업무', '개인', '가족', '기타'];
  const repeatTypes = ['daily', 'weekly', 'monthly'];
  const notificationOptions = [
    { value: 0, label: '알림 없음' },
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 30, label: '30분 전' },
    { value: 60, label: '1시간 전' },
  ];

  return (
    <VStack spacing={4} align='stretch' p={4} borderWidth={1} borderRadius='lg'>
      <FormControl isRequired isInvalid={!formData.title}>
        <FormLabel>제목</FormLabel>
        <Input
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder='일정 제목'
          aria-label='제목'
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>날짜</FormLabel>
        <Input
          type='date'
          value={formData.date}
          onChange={(e) => onChange('date', e.target.value)}
          aria-label='날짜'
        />
      </FormControl>

      <FormControl isRequired isInvalid={!!startTimeError}>
        <FormLabel>시작 시간</FormLabel>
        <Input
          type='time'
          value={formData.startTime}
          onChange={(e) => onChange('startTime', e.target.value)}
          aria-label='시작 시간'
        />
        {startTimeError && <FormErrorMessage>{startTimeError}</FormErrorMessage>}
      </FormControl>

      <FormControl isRequired isInvalid={!!endTimeError}>
        <FormLabel>종료 시간</FormLabel>
        <Input
          type='time'
          value={formData.endTime}
          onChange={(e) => onChange('endTime', e.target.value)}
          aria-label='종료 시간'
        />
        {endTimeError && <FormErrorMessage>{endTimeError}</FormErrorMessage>}
      </FormControl>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder='일정 설명'
          aria-label='설명'
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
          placeholder='위치'
          aria-label='위치'
        />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          aria-label='카테고리'
        >
          <option value=''>선택하세요</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Checkbox
          isChecked={formData.isRepeating}
          onChange={(e) => onChange('isRepeating', e.target.checked)}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      {formData.isRepeating && (
        <>
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={formData.repeatType}
              onChange={(e) => onChange('repeatType', e.target.value)}
            >
              {repeatTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'daily' ? '매일' : type === 'weekly' ? '매주' : '매월'}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>반복 간격</FormLabel>
            <NumberInput
              value={formData.repeatInterval}
              onChange={(_, value) => onChange('repeatInterval', value)}
              min={1}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>반복 종료일</FormLabel>
            <Input
              type='date'
              value={formData.repeatEndDate}
              onChange={(e) => onChange('repeatEndDate', e.target.value)}
            />
          </FormControl>
        </>
      )}

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={formData.notificationTime}
          onChange={(e) => onChange('notificationTime', Number(e.target.value))}
          aria-label='알림 설정'
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button colorScheme='blue' onClick={onSubmit} data-testid='event-submit-button'>
        {isEditing ? '수정하기' : '추가하기'}
      </Button>
    </VStack>
  );
};
