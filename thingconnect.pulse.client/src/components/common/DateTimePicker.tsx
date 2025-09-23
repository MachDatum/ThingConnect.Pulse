import { Box, Input } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './.css/DatePicker.css';

export interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DateTimePicker = ({ value, onChange, placeholder, disabled }: DateTimeInputProps) => {
  const dateValue = value ? new Date(value) : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      onChange('');
    }
  };

  return (
    <Box w='full'>
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        showTimeSelect
        timeIntervals={15}
        dateFormat='MMM d, yyyy h:mm aa'
        customInput={<Input w='full' placeholder={placeholder} disabled={disabled} />}
      />
    </Box>
  );
};
