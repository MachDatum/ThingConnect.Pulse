import { 
  Input as ChakraInput, 
  InputProps as ChakraInputProps, 
  FormControl, 
  FormLabel, 
  FormErrorMessage 
} from "@chakra-ui/react"
import { forwardRef } from "react"

export interface InputProps extends ChakraInputProps {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <FormControl isInvalid={!!error}>
        {label && <FormLabel>{label}</FormLabel>}
        <ChakraInput 
          ref={ref}
          {...props}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    )
  }
)