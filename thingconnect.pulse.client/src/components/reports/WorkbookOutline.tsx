import { Box, Card, HStack, Table, Text, VStack } from '@chakra-ui/react';
import { FileSpreadsheet } from 'lucide-react';
import type { ReportInterval } from '@/api/services/report.service';
import { addDays, fromDateInput, periodLabels } from './reportFormat';

interface WorkbookOutlineProps {
  from: string;
  to: string;
  interval: ReportInterval;
  endpoints: { name: string; group: string }[];
}

const PERIOD_METRICS = ['Uptime %', 'Downtime', 'Events', 'RTT'];
const TOTAL_METRICS = [...PERIOD_METRICS, 'MTTR', 'MTBF', 'Longest', 'Coverage'];
const HOUR_COLUMNS = ['00:00', '01:00', '02:00', '…', '23:00', 'Day'];

// Uptime traffic-light sample pattern, so the sketch hints at the workbook's colouring.
const UPTIME_SAMPLE = ['green', 'green', 'orange', 'green', 'red'];

type Column = { key: string; label: string; gap?: boolean; total?: boolean };

function SheetTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <Box
      px={3}
      py={1.5}
      fontSize='sm'
      borderWidth='1px'
      borderBottomWidth={active ? '0' : '1px'}
      borderTopRadius='md'
      bg={active ? 'bg.panel' : 'bg.muted'}
      color={active ? 'fg' : 'fg.muted'}
      fontWeight={active ? 'semibold' : 'normal'}
      whiteSpace='nowrap'
      mb='-1px'
      position='relative'
      _before={
        active
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              h: '2px',
              bg: 'green.solid',
            }
          : undefined
      }
    >
      {label}
    </Box>
  );
}

/** Shaded placeholder where a value will be — keeps the sketch readable without fake numbers. */
function ValueBar({ palette, width = '70%' }: { palette?: string; width?: string }) {
  return (
    <Box
      h='2.5'
      w={width}
      mx='auto'
      borderRadius='full'
      bg={palette ? `${palette}.muted` : 'bg.emphasized'}
    />
  );
}

/** A small, readable mock of the sheet the selected options will produce. */
export function WorkbookOutline({ from, to, interval, endpoints }: WorkbookOutlineProps) {
  const firstGroup = endpoints[0]?.group;
  const groupEndpoints = endpoints.filter(e => e.group === firstGroup).slice(0, 2);
  const otherGroups = new Set(endpoints.map(e => e.group)).size - (firstGroup ? 1 : 0);

  const isHourly = interval === 'hour';
  const labels = isHourly ? [] : periodLabels(from, to, interval);
  const periodColumns: Column[] = (
    labels.length > 3 ? [0, 1, -1, labels.length - 1] : labels.map((_, i) => i)
  ).map(i => (i < 0 ? { key: 'gap', label: '…', gap: true } : { key: `p${i}`, label: labels[i] }));
  const columns: Column[] = [...periodColumns, { key: 'total', label: 'Total', total: true }];

  const dayFormat = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const hourlyDates = [0, 1, 2]
    .map(d => addDays(fromDateInput(from), d))
    .filter(d => d <= fromDateInput(to))
    .map(d => dayFormat.format(d));

  const rows: { key: string; name: string; kind: 'overall' | 'group' | 'endpoint' }[] = [
    { key: 'all', name: 'All endpoints', kind: 'overall' },
    ...(firstGroup ? [{ key: 'g', name: firstGroup, kind: 'group' as const }] : []),
    ...groupEndpoints.map((e, i) => ({ key: `e${i}`, name: e.name, kind: 'endpoint' as const })),
  ];

  const headerBg = { base: 'blue.50', _dark: 'blue.950' };
  const totalBg = { base: 'blue.100', _dark: 'blue.900' };

  return (
    <Card.Root size='sm' data-testid='workbook-outline'>
      <Card.Header>
        <HStack gap={2}>
          <FileSpreadsheet size={18} />
          <Text fontWeight='semibold'>What's in the workbook</Text>
        </HStack>
      </Card.Header>
      <Card.Body>
        <VStack align='stretch' gap={3}>
          <Box>
            <HStack gap={1} overflowX='auto' px={1}>
              <SheetTab label='Summary' />
              {isHourly ? (
                <>
                  <SheetTab label='All endpoints' active />
                  {endpoints.slice(0, 2).map(e => (
                    <SheetTab key={e.name} label={e.name} />
                  ))}
                  {endpoints.length > 2 && (
                    <Text fontSize='sm' color='fg.muted' px={2} whiteSpace='nowrap'>
                      +{endpoints.length - 2} more sheets
                    </Text>
                  )}
                </>
              ) : (
                <SheetTab label='Availability' active />
              )}
            </HStack>

            <Box borderWidth='1px' borderRadius='md' borderTopLeftRadius={0} overflowX='auto'>
              {isHourly ? (
                <Table.Root size='sm' showColumnBorder>
                  <Table.Header>
                    <Table.Row bg={headerBg}>
                      <Table.ColumnHeader minW='36'>Uptime %</Table.ColumnHeader>
                      {HOUR_COLUMNS.map(h => (
                        <Table.ColumnHeader
                          key={h}
                          textAlign='center'
                          bg={h === 'Day' ? totalBg : undefined}
                          color={h === '…' ? 'fg.muted' : undefined}
                        >
                          {h}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {hourlyDates.map((date, r) => (
                      <Table.Row key={date}>
                        <Table.Cell fontWeight='medium' whiteSpace='nowrap'>
                          {date}
                        </Table.Cell>
                        {HOUR_COLUMNS.map((h, c) => (
                          <Table.Cell key={h} minW='16'>
                            {h === '…' ? (
                              <Text textAlign='center' color='fg.muted'>
                                …
                              </Text>
                            ) : (
                              <ValueBar palette={UPTIME_SAMPLE[(r + c) % UPTIME_SAMPLE.length]} />
                            )}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              ) : (
                <Table.Root size='sm' showColumnBorder>
                  <Table.Header>
                    <Table.Row bg={headerBg}>
                      <Table.ColumnHeader rowSpan={2} minW='44' verticalAlign='bottom'>
                        Endpoint
                      </Table.ColumnHeader>
                      {columns.map(col => (
                        <Table.ColumnHeader
                          key={col.key}
                          colSpan={
                            col.gap ? 1 : col.total ? TOTAL_METRICS.length : PERIOD_METRICS.length
                          }
                          rowSpan={col.gap ? 2 : 1}
                          textAlign='center'
                          whiteSpace='nowrap'
                          bg={col.total ? totalBg : undefined}
                          color={col.gap ? 'fg.muted' : undefined}
                        >
                          {col.label}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                    <Table.Row bg={headerBg}>
                      {columns
                        .filter(col => !col.gap)
                        .flatMap(col =>
                          (col.total ? TOTAL_METRICS : PERIOD_METRICS).map(m => (
                            <Table.ColumnHeader
                              key={`${col.key}-${m}`}
                              textAlign='center'
                              fontSize='xs'
                              fontWeight='medium'
                              color='fg.muted'
                              whiteSpace='nowrap'
                              bg={col.total ? totalBg : undefined}
                            >
                              {m}
                            </Table.ColumnHeader>
                          ))
                        )}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {rows.map((row, r) => (
                      <Table.Row
                        key={row.key}
                        bg={row.kind === 'endpoint' ? undefined : 'bg.muted'}
                      >
                        <Table.Cell
                          fontWeight={row.kind === 'endpoint' ? 'normal' : 'semibold'}
                          pl={row.kind === 'endpoint' ? 6 : 3}
                          whiteSpace='nowrap'
                        >
                          {row.name}
                        </Table.Cell>
                        {columns.flatMap(col =>
                          col.gap
                            ? [
                                <Table.Cell
                                  key={`${row.key}-gap`}
                                  color='fg.muted'
                                  textAlign='center'
                                >
                                  …
                                </Table.Cell>,
                              ]
                            : (col.total ? TOTAL_METRICS : PERIOD_METRICS).map((m, c) => (
                                <Table.Cell key={`${row.key}-${col.key}-${m}`} minW='16'>
                                  <ValueBar
                                    palette={
                                      c === 0
                                        ? UPTIME_SAMPLE[(r + col.key.length) % UPTIME_SAMPLE.length]
                                        : undefined
                                    }
                                    width={c === 0 ? '75%' : '50%'}
                                  />
                                </Table.Cell>
                              ))
                        )}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Box>
          </Box>

          <Text fontSize='sm' color='fg.muted'>
            {isHourly
              ? `One sheet per endpoint (${endpoints.length}) plus all endpoints combined: a row per date, a column per hour and a Day total — with tables for uptime, downtime, down events and response time.`
              : `${labels.length} ${labels.length === 1 ? 'column block' : 'column blocks'} plus a Total. Rows: all endpoints, then each group's subtotal and its endpoints${otherGroups > 0 ? ` (${otherGroups} more ${otherGroups === 1 ? 'group' : 'groups'} below)` : ''}.`}{' '}
            Uptime cells are coloured green / amber / red. The <b>Summary</b> sheet adds the
            headline KPIs, uptime by group and the 10 least available endpoints.
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
