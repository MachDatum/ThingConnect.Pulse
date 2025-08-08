import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react"

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ 
  variant = 'primary', 
  children, 
  ...props 
}: ButtonProps) {
  const variantProps = {
    primary: {
      colorPalette: 'blue',
      variant: 'solid'
    },
    secondary: {
      colorPalette: 'gray',
      variant: 'outline'
    },
    danger: {
      colorPalette: 'red',
      variant: 'solid'
    }
  }[variant]

  return (
    <ChakraButton 
      {...variantProps}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}