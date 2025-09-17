import { HStack, Box } from '@chakra-ui/react';
import type { SparklinePoint } from '@/api/types';
import { useEffect, useState, useRef } from 'react';

const TrendBlocks = ({ data }: { data: SparklinePoint[] }) => {
  const maxBlocks = 20;
  const [isSliding, setIsSliding] = useState(false);
  const [showNewData, setShowNewData] = useState(false);
  const lastTimestampRef = useRef<string | null>(null);

  // Take the last 20 points, but maintain order (oldest to newest)
  const recentData = data.slice(-maxBlocks);

  // Create array of 20 blocks, fill empty ones with null
  const displayBlocks = Array(maxBlocks).fill(null).map((_, idx) => {
    const dataIdx = idx - (maxBlocks - recentData.length);
    return dataIdx >= 0 ? recentData[dataIdx] : null;
  });

  // Detect new data by checking if the latest timestamp changed
  useEffect(() => {
    const latestTimestamp = recentData.length > 0 ? recentData[recentData.length - 1]?.ts : null;

    if (latestTimestamp && lastTimestampRef.current && latestTimestamp !== lastTimestampRef.current) {
      // New data detected - trigger slide animation
      setIsSliding(true);
      setShowNewData(false);

      // After slide completes, show the new data
      setTimeout(() => {
        setShowNewData(true);
        setIsSliding(false);
      }, 500);

      // Reset showNewData after slide-in animation completes
      setTimeout(() => {
        setShowNewData(false);
      }, 1000);
    } else if (latestTimestamp && !lastTimestampRef.current) {
      // First load - no animation needed
      setIsSliding(false);
      setShowNewData(false);
    }

    lastTimestampRef.current = latestTimestamp;
  }, [recentData]);

  return (
    <>
      <style>
        {`
          @keyframes heartbeat {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.1); }
            100% { transform: scale(0.95); }
          }
          @keyframes slideLeftGroup {
            0% { transform: translateX(0); }
            100% { transform: translateX(-16px); }
          }
          @keyframes slideInFromRight {
            0% { transform: translateX(16px) scale(0.1); opacity: 0; }
            50% { transform: translateX(8px) scale(0.5); opacity: 0.5; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          .heartbeat-animation {
            animation: heartbeat 1.5s ease-in-out infinite;
          }
          .slide-left-animation {
            animation: slideLeftGroup 500ms ease-out;
          }
          .slide-in-animation {
            animation: slideInFromRight 500ms ease-out;
          }
        `}
      </style>
      <HStack gap={1} alignItems="center" overflow="hidden" py={"2px"} pr={"2px"}>
        {displayBlocks.map((point, idx) => {
          const isLastElement = idx === displayBlocks.length - 1 && point !== null;
          const isEmpty = point === null;
          const isNewElement = isLastElement && showNewData;
          const shouldHeartbeat = isLastElement && !isSliding;


          return (
            <Box
              key={point?.ts || `empty-${idx}`}
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
              className={
                isSliding && !isEmpty
                  ? 'slide-left-animation'
                  : isNewElement
                  ? 'slide-in-animation'
                  : shouldHeartbeat
                  ? 'heartbeat-animation'
                  : undefined
              }
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
