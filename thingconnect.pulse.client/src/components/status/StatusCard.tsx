import { Text, Badge, HStack, VStack, Card } from '@chakra-ui/react';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { LiveStatusItem } from '@/api/types';

interface StatusCardProps {
  item: LiveStatusItem;
}

export function StatusCard({ item }: StatusCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      case 'flapping':
        return 'yellow';
      case 'service':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatRTT = (rttMs?: number | null) => {
    if (rttMs == null) return '-';
    return `${rttMs}ms`;
  };

  const formatLastChange = (lastChangeTs: string) => {
    try {
      return formatDistanceToNow(new Date(lastChangeTs), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleClick = () => {
    void navigate(`/endpoints/${item.endpoint.id}`);
  };

  return (
    <Card.Root
      cursor='pointer'
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
        borderColor: 'blue.200',
        _dark: { borderColor: 'blue.600' },
      }}
      onClick={handleClick}
      data-testid={`status-card-${item.endpoint.id}`}
      transition='all 0.2s'
      size='sm'
      minHeight='120px'
      minWidth={{ base: '280px', md: '300px' }}
    >
      <Card.Body
        p={{ base: 3, md: 4 }}
        minHeight='44px'
        _active={{
          transform: 'scale(0.98)',
        }}
      >
        <VStack align='stretch' gap={3}>
          {/* Header with status and name */}
          <HStack justify='space-between' align='start'>
            <VStack align='start' gap={1} flex='1'>
              <Text fontWeight='semibold' fontSize='sm' data-testid='card-endpoint-name'>
                {item.endpoint.name}
              </Text>
              <Text fontSize='xs' color='gray.600' _dark={{ color: 'gray.400' }}>
                {item.endpoint.group.name}
              </Text>
            </VStack>

            <Badge
              colorPalette={getStatusColor(item.currentState.status)}
              variant='subtle'
              textTransform='uppercase'
              fontSize='xs'
              data-testid={`card-status-badge-${item.currentState.status}`}
              minHeight='20px'
              px={2}
            >
              {item.currentState.status}
            </Badge>
          </HStack>

          {/* Host and RTT */}
          <HStack justify='space-between' align='center'>
            <HStack gap={1} flex='1'>
              <Text fontFamily='mono' fontSize='xs' data-testid='card-endpoint-host'>
                {item.endpoint.host}
              </Text>
              {item.endpoint.port && (
                <Text fontSize='xs' color='gray.500'>
                  :{item.endpoint.port}
                </Text>
              )}
            </HStack>

            <Text
              fontFamily='mono'
              fontSize='xs'
              color={item.currentState.rttMs ? 'inherit' : 'gray.400'}
              data-testid='card-endpoint-rtt'
            >
              {formatRTT(item.currentState.rttMs)}
            </Text>
          </HStack>

          {/* Sparkline and last change */}
          <HStack justify='space-between' align='center'>
            <MiniSparkline data={item.sparkline} width={60} height={16} />
            <Text fontSize='xs' color='gray.500'>
              {formatLastChange(item.lastChangeTs)}
            </Text>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
