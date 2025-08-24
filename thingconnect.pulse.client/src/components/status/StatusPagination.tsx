import { HStack, Text, Button, Box, NativeSelect } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageMeta } from '@/api/types'

interface StatusPaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function StatusPagination({ meta, onPageChange, onPageSizeChange }: StatusPaginationProps) {
  const { page, pageSize, total } = meta
  const totalPages = Math.ceil(total / pageSize)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value)
    onPageSizeChange(newSize)
    // Reset to page 1 when changing page size
    if (page > 1) {
      onPageChange(1)
    }
  }

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <HStack justify="space-between" align="center" data-testid="status-pagination">
      {/* Results info */}
      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
        Showing {startItem}-{endItem} of {total} endpoints
      </Text>

      <HStack gap={4}>
        {/* Page size selector */}
        <HStack gap={2} align="center">
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            Show:
          </Text>
          <Box minW="20">
            <NativeSelect.Root size="sm" data-testid="page-size-selector">
              <NativeSelect.Field
                value={pageSize.toString()}
                onChange={(e) => handlePageSizeChange(e.target.value)}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
        </HStack>

        {/* Page navigation */}
        <HStack gap={2}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            data-testid="prev-page"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <HStack gap={1} px={2}>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Page {page} of {totalPages}
            </Text>
          </HStack>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            data-testid="next-page"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </HStack>
      </HStack>
    </HStack>
  )
}