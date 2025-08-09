import { Image, type ImageProps } from '@chakra-ui/react'
import ThingConnectLogo from '../../assets/ThingConnect Logo.svg'
import ThingConnectIcon from '../../assets/ThingConnect Icon.svg'

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  variant?: 'full' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: { full: '30px', icon: '24px' },
  md: { full: '40px', icon: '32px' },
  lg: { full: '50px', icon: '40px' },
  xl: { full: '60px', icon: '48px' },
}

export function Logo({ variant = 'full', size = 'md', ...props }: LogoProps) {
  const logoSrc = variant === 'full' ? ThingConnectLogo : ThingConnectIcon
  const logoAlt = variant === 'full' ? 'ThingConnect Logo' : 'ThingConnect'
  const logoHeight = sizeMap[size][variant]

  return (
    <Image
      src={logoSrc}
      alt={logoAlt}
      height={logoHeight}
      width={variant === 'full' ? 'auto' : logoHeight}
      {...props}
    />
  )
}
