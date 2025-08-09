import { Box, Heading, Stack, Button } from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import { Tooltip } from '@/components/ui/tooltip'
import _ from 'lodash'

const ThemeShowcasePage = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const colorFamilies = ['blue', 'red', 'green', 'yellow', 'teal', 'purple', 'neutral']

  return (
    <Box maxW="900px" mx="auto" p="6">
      <Stack direction="column" gap="6">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb="3">
            Color Palette
          </Heading>
          <Button onClick={toggleColorMode} size="sm">
            {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>
        </Box>

        {/* Color Grid - Columns like screenshot */}
        <Box>
          <Box display="flex" gap="1" justifyContent="center">
            {colorFamilies.map((family) => (
              <Box key={family} display="flex" flexDirection="column" gap="1">
                {_.range(100, 1000, 100).map((value) => (
                  <Tooltip key={value} content={`$${family}.${value}`}>
                    <Box
                      w="8"
                      h="6"
                      bg={`${family}.${value}`}
                      cursor="pointer"
                      border="1px solid"
                      borderColor="transparent"
                      _dark={{ borderColor: 'whiteAlpha.100' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export default ThemeShowcasePage
