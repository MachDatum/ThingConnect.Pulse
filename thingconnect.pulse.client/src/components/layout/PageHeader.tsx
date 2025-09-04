import {
  Box,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbRoot,
  BreadcrumbSeparator,
  Flex,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { BreadcrumbLink } from '../ui/breadcrumb';
import { Link as RouterLink } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: (string | null | undefined)[];
  tos?: string[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumbs, tos }: PageHeaderProps) {
  const getLink = (index: number) => {
    if (tos?.[index] !== undefined) return tos[index];
    return breadcrumbs?.slice(0, index + 1).join('/') ?? '';
  };

  return (
    <Box mt={3} w={'full'} pb='2' top={0} minH='48px' data-testid='page-header'>
      <Flex direction={'column'} w={'full'} gap={1}>
        {breadcrumbs && (
          <BreadcrumbRoot>
            <BreadcrumbList>
              {breadcrumbs?.map((p, index) =>
                p ? (
                  <BreadcrumbItem key={p}>
                    <BreadcrumbLink
                      asChild
                      _focus={{ boxShadow: 'none' }} // 🔹 remove focus border
                      _hover={{ textDecoration: 'underline' }} // 🔹 underline on hover
                      _active={{ textDecoration: 'underline' }} // 🔹 keep underline when clicked
                    >
                      <RouterLink to={'/' + getLink(index)}>{p}</RouterLink>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator hidden={index === breadcrumbs.length - 1} ml={1}>
                      {' '}
                      /{' '}
                    </BreadcrumbSeparator>
                  </BreadcrumbItem>
                ) : null
              )}
            </BreadcrumbList>
          </BreadcrumbRoot>
        )}
        <Flex direction='row' alignItems='center' gap={2}>
          <HStack flex={1}>
            <Heading size='2xl' data-testid='page-title'>
              {title}
            </Heading>
          </HStack>
          {actions && <HStack mb={'-22px'}>{actions}</HStack>}
        </Flex>
        {description && (
          <Text fontSize='sm' data-testid='page-description'>
            {description}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
