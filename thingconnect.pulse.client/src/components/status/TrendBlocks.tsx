import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import type { SparklinePoint } from "@/api/types";

const TrendBlocks = ({ data }: { data: SparklinePoint[] }) => {
  const maxBlocks = 20;
  const blockPx = 12;
  const gapPx = 4;
  const totalWidth = maxBlocks * blockPx + (maxBlocks - 1) * gapPx;

  const [isSliding, setIsSliding] = useState(false);
  const [showNewData, setShowNewData] = useState(false);
  const lastTsRef = useRef<string | null>(null);

  // last up to maxBlocks
  const recent = useMemo(
    () => (Array.isArray(data) ? data.slice(-maxBlocks) : []),
    [data]
  );

  // always exactly maxBlocks long; earlier slots are null placeholders
  const display = useMemo(() => {
    const padded = new Array<SparklinePoint | null>(maxBlocks).fill(null);
    const start = maxBlocks - recent.length;
    for (let i = 0; i < recent.length; i++) {
      padded[start + i] = recent[i];
    }
    return padded;
  }, [recent]);

  // heartbeat / slide animation trigger when latest timestamp changes
  useEffect(() => {
    const latest = recent.length ? recent[recent.length - 1].ts : null;
    
    if (latest && lastTsRef.current && latest !== lastTsRef.current) {
      setIsSliding(true);
      setShowNewData(false);

      const t1 = setTimeout(() => {
        setShowNewData(true);
        setIsSliding(false);
      }, 500);

      const t2 = setTimeout(() => {
        setShowNewData(false);
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (latest && !lastTsRef.current) {
      setIsSliding(false);
      setShowNewData(false);
    }

    lastTsRef.current = latest;
  }, [recent]);

  // debug log to help spot if parent is sending too many points
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug(
      "[TrendBlocks]",
      "incoming:",
      data.length,
      "recent:",
      recent.length,
      "slots:",
      display.length,
      "lastTs:",
      lastTsRef.current
    );
  }, [data, recent, display]);

  return (
    <Box
      width={`${totalWidth}px`}
      minWidth={`${totalWidth}px`}
      maxWidth={`${totalWidth}px`}
      display="grid"
      gridTemplateColumns={`repeat(${maxBlocks}, ${blockPx}px)`}
      gap={`${gapPx}px`}
      overflow="hidden"
      py="2px"
      pr="2px"
      alignItems="center"
      boxSizing="border-box"
    >
      <style>
        {`
          @keyframes heartbeat {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.1); }
            100% { transform: scale(0.95); }
          }
          @keyframes slideLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-${blockPx + gapPx}px); }
          }
          @keyframes slideIn {
            0% { transform: translateX(${blockPx + gapPx}px) scale(0.1); opacity: 0; }
            50% { transform: translateX(${Math.round((blockPx + gapPx) / 2)}px) scale(0.5); opacity: 0.5; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          .hb { animation: heartbeat 1.5s ease-in-out infinite; will-change: transform; }
          .slide-left { animation: slideLeft 500ms ease-out; will-change: transform; }
          .slide-in { animation: slideIn 500ms ease-out; will-change: transform; }
        `}
      </style>

      {display.map((pt, i) => {
        const isLast = i === display.length - 1;
        const isNew = isLast && showNewData && pt !== null;
        const shouldHb = isLast && !isSliding && pt !== null;
        const cls =
          isSliding && pt !== null ? "slide-left" : isNew ? "slide-in" : shouldHb ? "hb" : undefined;

        const bg = pt === null ? "gray.200" : pt.s === "d" ? "red.500" : "green.500";
        const darkBg = pt === null ? "gray.700" : pt.s === "d" ? "red.600" : "green.600";

        return (
          <Box
            key={`slot-${i}-${pt?.ts ?? "empty"}`}
            w={`${blockPx}px`}
            h="5"
            borderRadius="sm"
            bg={bg}
            _dark={{ bg: darkBg }}
            className={cls}
            transformOrigin="center"
            position="relative"
            zIndex={isLast && pt ? 2 : 1}
          />
        );
      })}
    </Box>
  );
};

export default TrendBlocks;
