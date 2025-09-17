import { HStack, Box } from '@chakra-ui/react';
import type { SparklinePoint } from '@/api/types';

const TrendBlocks = ({ data }: { data: SparklinePoint[] }) => {
  const maxBlocks = 20;
  // Take the last 20 points, but maintain order (oldest to newest)
  const recentData = data.slice(-maxBlocks);

  // Create array of 20 blocks, fill empty ones with null
  const displayBlocks = Array(maxBlocks).fill(null).map((_, idx) => {
    const dataIdx = idx - (maxBlocks - recentData.length);
    return dataIdx >= 0 ? recentData[dataIdx] : null;
  });

  return (
    <>
      <style>
        {`
          @keyframes heartbeat {
            0% { transform: scale(0.9); }
            50% { transform: scale(1.10); }
            100% { transform: scale(0.9); }
          }
          .heartbeat-animation {
            animation: heartbeat 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <HStack gap={1} alignItems="center" overflow="hidden" py={"2px"} pr={"2px"}>
        {displayBlocks.map((point, idx) => {
          const isLastElement = idx === displayBlocks.length - 1 && point !== null;
          const isEmpty = point === null;

          return (
            <Box
              key={idx}
              w='3'
              h='5'
              borderRadius='sm'
              bg={isEmpty
                ? 'gray.200'
                : point.s === 'd' ? 'red.500' : 'green.500'
              }
              _dark={{
                bg: isEmpty
                  ? 'gray.700'
                  : point.s === 'd' ? 'red.600' : 'green.600'
              }}
              className={isLastElement ? 'heartbeat-animation' : undefined}
              transformOrigin="center"
              position="relative"
              zIndex={isLastElement ? 2 : 1}
            />
          );
        })}
      </HStack>
    </>
  );
};

export default TrendBlocks;
