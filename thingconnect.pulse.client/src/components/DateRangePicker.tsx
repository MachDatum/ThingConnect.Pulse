import { useState } from 'react'
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react'
import { Calendar } from 'lucide-react'

export interface DateRange {
  from: string
  to: string
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (dateRange: DateRange) => void
  disabled?: boolean
}

export function DateRangePicker({ value, onChange, disabled = false }: DateRangePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      from: event.target.value
    })
  }

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      to: event.target.value
    })
  }

  const setQuickRange = (hours: number) => {
    const now = new Date()
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000)
    
    onChange({
      from: formatDateForInput(from),
      to: formatDateForInput(now)
    })
  }

  const formatDateForInput = (date: Date): string => {
    // Format for HTML datetime-local input: YYYY-MM-DDTHH:MM
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const formatDisplayDate = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return ''
    
    const date = new Date(dateTimeLocal)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box>
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        size="sm"
      >
        <Calendar size={16} />
        {value.from && value.to 
          ? `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`
          : 'Select date range'
        }
      </Button>

      {isExpanded && (
        <Box
          position="absolute"
          zIndex="dropdown"
          mt={1}
          p={4}
          bg="white"
          border="1px"
          borderColor="gray.200"
          _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
          borderRadius="md"
          shadow="lg"
          minW="320px"
        >
          <VStack gap={4} align="stretch">
            <Text fontWeight="semibold" fontSize="sm">
              Select Date Range
            </Text>

            {/* Quick Range Buttons */}
            <HStack gap={2} flexWrap="wrap">
              <Button size="xs" variant="outline" onClick={() => setQuickRange(1)}>
                Last Hour
              </Button>
              <Button size="xs" variant="outline" onClick={() => setQuickRange(24)}>
                Last 24h
              </Button>
              <Button size="xs" variant="outline" onClick={() => setQuickRange(24 * 7)}>
                Last Week
              </Button>
              <Button size="xs" variant="outline" onClick={() => setQuickRange(24 * 30)}>
                Last Month
              </Button>
            </HStack>

            {/* Date Inputs */}
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600" _dark={{ color: 'gray.400' }}>
                  From
                </Text>
                <Input
                  type="datetime-local"
                  value={value.from}
                  onChange={handleFromChange}
                  size="sm"
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.600" _dark={{ color: 'gray.400' }}>
                  To
                </Text>
                <Input
                  type="datetime-local"
                  value={value.to}
                  onChange={handleToChange}
                  size="sm"
                />
              </Box>
            </VStack>

            {/* Actions */}
            <HStack justify="flex-end" gap={2}>
              <Button size="xs" variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
              <Button size="xs" colorPalette="blue" onClick={() => setIsExpanded(false)}>
                Apply
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  )
}