import { HStack, Box } from "@chakra-ui/react";
import type { SparklinePoint } from "@/api/types";

const TrendBlocks = ({ data }: { data: SparklinePoint[] }) => {
  // Limit to last 24 points (2 minutes of data)
  const displayData = data.slice(-24);

  return (
    <HStack gap={1}>
      {displayData.map((point, idx) => (
        <Box
          key={idx}
          w="3"
          h="5"
          borderRadius="sm"
          bg={point.s === "d" ? "red.500" : "green.500"}
        />
      ))}
    </HStack>
  );
};

export default TrendBlocks;