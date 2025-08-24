import { Box } from '@chakra-ui/react'
import type { SparklinePoint } from '@/api/types'

interface MiniSparklineProps {
  data: SparklinePoint[]
  width?: number
  height?: number
}

export function MiniSparkline({ data, width = 80, height = 20 }: MiniSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <Box w={width} h={height} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="sm" />
    )
  }

  // Create points for the SVG path
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width
    const y = point.s === 'u' ? height * 0.2 : height * 0.8 // Up points near top, down points near bottom
    return `${x},${y}`
  }).join(' ')

  return (
    <Box w={width} h={height}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <rect width={width} height={height} fill="transparent" />
        
        {/* Status line */}
        <polyline
          points={points}
          fill="none"
          stroke={data[data.length - 1]?.s === 'u' ? '#10B981' : '#EF4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Status dots */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * width
          const y = point.s === 'u' ? height * 0.2 : height * 0.8
          return (
            <circle
              key={`${point.ts}-${index}`}
              cx={x}
              cy={y}
              r="1.5"
              fill={point.s === 'u' ? '#10B981' : '#EF4444'}
            />
          )
        })}
      </svg>
    </Box>
  )
}