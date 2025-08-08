import { Box, BoxProps } from "@chakra-ui/react"
import { ReactNode } from "react"

export interface CardProps extends BoxProps {
  children: ReactNode
  variant?: 'elevated' | 'outline' | 'ghost'
}

export function Card({ 
  children, 
  variant = 'elevated', 
  ...props 
}: CardProps) {
  const variantStyles = {
    elevated: {
      boxShadow: 'md',
      borderWidth: '1px',
      borderColor: 'transparent'
    },
    outline: {
      boxShadow: 'none',
      borderWidth: '1px',
      borderColor: 'border.default'
    },
    ghost: {
      boxShadow: 'none',
      borderWidth: '0',
      bg: 'transparent'
    }
  }[variant]

  return (
    <Box 
      borderRadius="md"
      p="4"
      {...variantStyles}
      {...props}
    >
      {children}
    </Box>
  )
}