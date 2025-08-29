"use client"

import {
  Box,
  Flex,
  Stack,
  Text,
  IconButton,
  Portal,
  Tooltip,
  Badge,
} from "@chakra-ui/react"
import * as React from "react"
import { createContext, useContext } from "react"
import { LuChevronLeft, LuChevronRight, LuChevronDown } from "react-icons/lu"

// Context for sidebar state management
interface SidebarContextValue {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  activeItem: string | null
  setActiveItem: (item: string | null) => void
  openGroups: Set<string>
  toggleGroup: (groupId: string) => void
  isMobile: boolean
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("Sidebar components must be used within Sidebar.Root")
  }
  return context
}

// Sidebar Root - Context Provider and State Management
export interface SidebarRootProps {
  children: React.ReactNode
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultActiveItem?: string
  activeItem?: string
  onActiveItemChange?: (item: string | null) => void
}

export const SidebarRoot = React.forwardRef<HTMLDivElement, SidebarRootProps>(
  function SidebarRoot(props, ref) {
    const {
      children,
      defaultExpanded = true,
      expanded: controlledExpanded,
      onExpandedChange,
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
      defaultActiveItem,
      activeItem: controlledActiveItem,
      onActiveItemChange,
      ...rest
    } = props

    // State management
    const [expandedState, setExpandedState] = React.useState(defaultExpanded)
    const [openState, setOpenState] = React.useState(defaultOpen)
    const [activeItemState, setActiveItemState] = React.useState(defaultActiveItem || null)
    const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set())

    // Responsive detection
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 768px)")
      const handler = () => setIsMobile(mediaQuery.matches)
      
      handler()
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }, [])

    // Persistence
    React.useEffect(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sidebar-expanded")
        if (stored !== null && controlledExpanded === undefined) {
          setExpandedState(JSON.parse(stored))
        }
      }
    }, [controlledExpanded])

    React.useEffect(() => {
      if (typeof window !== "undefined" && controlledExpanded === undefined) {
        localStorage.setItem("sidebar-expanded", JSON.stringify(expandedState))
      }
    }, [expandedState, controlledExpanded])

    // Controlled vs uncontrolled
    const expanded = controlledExpanded !== undefined ? controlledExpanded : expandedState
    const open = controlledOpen !== undefined ? controlledOpen : openState
    const activeItem = controlledActiveItem !== undefined ? controlledActiveItem : activeItemState

    const setExpanded = React.useCallback(
      (newExpanded: boolean) => {
        if (controlledExpanded === undefined) {
          setExpandedState(newExpanded)
        }
        onExpandedChange?.(newExpanded)
      },
      [controlledExpanded, onExpandedChange]
    )

    const setOpen = React.useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setOpenState(newOpen)
        }
        onOpenChange?.(newOpen)
      },
      [controlledOpen, onOpenChange]
    )

    const setActiveItem = React.useCallback(
      (newItem: string | null) => {
        if (controlledActiveItem === undefined) {
          setActiveItemState(newItem)
        }
        onActiveItemChange?.(newItem)
      },
      [controlledActiveItem, onActiveItemChange]
    )

    const toggleGroup = React.useCallback((groupId: string) => {
      setOpenGroups(prev => {
        const next = new Set(prev)
        if (next.has(groupId)) {
          next.delete(groupId)
        } else {
          // Accordion behavior - close others
          next.clear()
          next.add(groupId)
        }
        return next
      })
    }, [])

    const contextValue: SidebarContextValue = {
      expanded,
      setExpanded,
      activeItem,
      setActiveItem,
      openGroups,
      toggleGroup,
      isMobile,
      open,
      setOpen,
    }

    return (
      <SidebarContext.Provider value={contextValue}>
        <Box ref={ref} {...rest}>
          {children}
        </Box>
      </SidebarContext.Provider>
    )
  }
)

// Sidebar Container - Main wrapper with responsive behavior
export interface SidebarContainerProps {
  children: React.ReactNode
}

export const SidebarContainer = React.forwardRef<HTMLDivElement, SidebarContainerProps>(
  function SidebarContainer(props, ref) {
    const { children, ...rest } = props
    const { expanded, isMobile, open } = useSidebar()

    if (isMobile) {
      return (
        <Portal>
          <Box
            ref={ref}
            position="fixed"
            top="0"
            left="0"
            height="100vh"
            width={open ? "280px" : "0"}
            bg="bg.subtle"
            borderRight="1px solid"
            borderColor="border.subtle"
            zIndex="modal"
            overflow="hidden"
            transition="width 0.3s ease"
            {...rest}
          >
            {children}
          </Box>
        </Portal>
      )
    }

    return (
      <Box
        ref={ref}
        position="fixed"
        top="0"
        left="0"
        height="100vh"
        width={expanded ? "240px" : "64px"}
        bg="bg.subtle"
        borderRight="1px solid"
        borderColor="border.subtle"
        zIndex="docked"
        transition="width 0.3s ease"
        {...rest}
      >
        {children}
      </Box>
    )
  }
)

// Sidebar Header - Logo and collapse toggle
export interface SidebarHeaderProps {
  children?: React.ReactNode
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader(props, ref) {
    const { children, ...rest } = props
    const { expanded, setExpanded, isMobile, setOpen } = useSidebar()

    return (
      <Flex
        ref={ref}
        align="center"
        justify="space-between"
        p="4"
        borderBottom="1px solid"
        borderColor="border.subtle"
        minH="64px"
        {...rest}
      >
        {children}
        <IconButton
          size="sm"
          variant="ghost"
          onClick={() => isMobile ? setOpen(false) : setExpanded(!expanded)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isMobile ? <LuChevronLeft /> : expanded ? <LuChevronLeft /> : <LuChevronRight />}
        </IconButton>
      </Flex>
    )
  }
)

// Sidebar Body - Scrollable content area
export interface SidebarBodyProps {
  children: React.ReactNode
}

export const SidebarBody = React.forwardRef<HTMLDivElement, SidebarBodyProps>(
  function SidebarBody(props, ref) {
    const { children, ...rest } = props

    return (
      <Box
        ref={ref}
        flex="1"
        overflowY="auto"
        py="2"
        {...rest}
      >
        {children}
      </Box>
    )
  }
)

// Sidebar Section - Logical grouping
export interface SidebarSectionProps {
  children: React.ReactNode
  title?: string
}

export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  function SidebarSection(props, ref) {
    const { children, title, ...rest } = props
    const { expanded } = useSidebar()

    return (
      <Box ref={ref} mb="6" {...rest}>
        {title && expanded && (
          <Text
            px="4"
            mb="2"
            fontSize="xs"
            fontWeight="medium"
            textTransform="uppercase"
            color="fg.muted"
            letterSpacing="wide"
          >
            {title}
          </Text>
        )}
        <Stack gap="1">
          {children}
        </Stack>
      </Box>
    )
  }
)

// Sidebar Item - Individual navigation item
export interface SidebarItemProps {
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: string | number
  active?: boolean
  disabled?: boolean
  href?: string
  onClick?: () => void
  id?: string
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  function SidebarItem(props, ref) {
    const { children, icon, badge, active, disabled, href, onClick, id, ...rest } = props
    const { expanded, activeItem, setActiveItem } = useSidebar()

    const isActive = active !== undefined ? active : (id && activeItem === id)

    const handleClick = () => {
      if (disabled) return
      
      if (id) {
        setActiveItem(id)
      }
      onClick?.()
    }

    const itemContent = (
      <Flex
        as={href ? "a" : "button"}
        ref={ref}
        align="center"
        gap="3"
        px="3"
        py="2"
        mx="2"
        rounded="md"
        minH="36px"
        width="calc(100% - 16px)"
        href={href}
        onClick={handleClick}
        disabled={disabled}
        bg={isActive ? "colorPalette.subtle" : "transparent"}
        color={isActive ? "colorPalette.fg" : disabled ? "fg.disabled" : "fg"}
        borderLeft={isActive ? "3px solid" : "3px solid transparent"}
        borderColor={isActive ? "colorPalette.solid" : "transparent"}
        cursor={disabled ? "not-allowed" : "pointer"}
        transition="all 0.2s ease"
        _hover={
          disabled
            ? {}
            : {
                bg: isActive ? "colorPalette.subtle" : "bg.subtle",
              }
        }
        {...rest}
      >
        {icon && (
          <Box flexShrink={0} fontSize="lg">
            {icon}
          </Box>
        )}
        {expanded && (
          <>
            <Text flex="1" textAlign="left" truncate>
              {children}
            </Text>
            {badge && (
              <Badge size="sm" variant="subtle" colorPalette="gray">
                {badge}
              </Badge>
            )}
          </>
        )}
      </Flex>
    )

    if (!expanded && icon) {
      return (
        <Tooltip content={children} positioning={{ placement: "right" }}>
          {itemContent}
        </Tooltip>
      )
    }

    return itemContent
  }
)

// Sidebar Footer - Bottom section
export interface SidebarFooterProps {
  children: React.ReactNode
}

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter(props, ref) {
    const { children, ...rest } = props

    return (
      <Box
        ref={ref}
        p="4"
        borderTop="1px solid"
        borderColor="border.subtle"
        {...rest}
      >
        {children}
      </Box>
    )
  }
)

// Sidebar Group - Collapsible/expandable section
export interface SidebarGroupProps {
  children: React.ReactNode
  id: string
  defaultOpen?: boolean
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup(props, ref) {
    const { children, id, defaultOpen = false, ...rest } = props
    const { openGroups, toggleGroup } = useSidebar()

    const isOpen = openGroups.has(id)

    React.useEffect(() => {
      if (defaultOpen && !openGroups.has(id)) {
        toggleGroup(id)
      }
    }, [defaultOpen, id, openGroups, toggleGroup])

    return (
      <Box ref={ref} {...rest}>
        {children}
      </Box>
    )
  }
)

// Sidebar Group Trigger - Click target for expand/collapse
export interface SidebarGroupTriggerProps {
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
  groupId: string
}

export const SidebarGroupTrigger = React.forwardRef<HTMLButtonElement, SidebarGroupTriggerProps>(
  function SidebarGroupTrigger(props, ref) {
    const { children, icon, badge, disabled, groupId, ...rest } = props
    const { expanded, openGroups, toggleGroup } = useSidebar()

    const isOpen = openGroups.has(groupId)

    const handleClick = () => {
      if (disabled) return
      toggleGroup(groupId)
    }

    const triggerContent = (
      <Flex
        as="button"
        ref={ref}
        align="center"
        gap="3"
        px="3"
        py="2"
        mx="2"
        rounded="md"
        minH="36px"
        width="calc(100% - 16px)"
        onClick={handleClick}
        disabled={disabled}
        bg="transparent"
        color={disabled ? "fg.disabled" : "fg"}
        cursor={disabled ? "not-allowed" : "pointer"}
        transition="all 0.2s ease"
        _hover={
          disabled
            ? {}
            : {
                bg: "bg.subtle",
              }
        }
        {...rest}
      >
        {icon && (
          <Box flexShrink={0} fontSize="lg">
            {icon}
          </Box>
        )}
        {expanded && (
          <>
            <Text flex="1" textAlign="left" truncate>
              {children}
            </Text>
            {badge && (
              <Badge size="sm" variant="subtle" colorPalette="gray">
                {badge}
              </Badge>
            )}
            <Box
              flexShrink={0}
              transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
              transition="transform 0.2s ease"
            >
              <LuChevronDown />
            </Box>
          </>
        )}
      </Flex>
    )

    if (!expanded && icon) {
      return (
        <Tooltip content={children} positioning={{ placement: "right" }}>
          {triggerContent}
        </Tooltip>
      )
    }

    return triggerContent
  }
)

// Sidebar Group Content - Container for nested items
export interface SidebarGroupContentProps {
  children: React.ReactNode
  groupId: string
}

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  function SidebarGroupContent(props, ref) {
    const { children, groupId, ...rest } = props
    const { openGroups, expanded } = useSidebar()

    const isOpen = openGroups.has(groupId)

    if (!isOpen) return null

    return (
      <Box
        ref={ref}
        pl={expanded ? "6" : "0"}
        py="1"
        overflow="hidden"
        {...rest}
      >
        <Stack gap="1">
          {children}
        </Stack>
      </Box>
    )
  }
)

// Sidebar Overlay - Mobile backdrop
export const SidebarOverlay = React.forwardRef<HTMLDivElement>(
  function SidebarOverlay(props, ref) {
    const { isMobile, open, setOpen } = useSidebar()

    if (!isMobile || !open) return null

    return (
      <Portal>
        <Box
          ref={ref}
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={() => setOpen(false)}
          {...props}
        />
      </Portal>
    )
  }
)

// Export all components
export {
  SidebarRoot as Root,
  SidebarContainer as Container,
  SidebarHeader as Header,
  SidebarBody as Body,
  SidebarSection as Section,
  SidebarItem as Item,
  SidebarGroup as Group,
  SidebarGroupTrigger as GroupTrigger,
  SidebarGroupContent as GroupContent,
  SidebarFooter as Footer,
  SidebarOverlay as Overlay,
}