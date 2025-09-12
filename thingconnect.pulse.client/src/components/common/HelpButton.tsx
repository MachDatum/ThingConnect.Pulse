import { IconButton } from '@chakra-ui/react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

interface HelpButtonProps {
  helpUrl: string;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpButton({ helpUrl, tooltip = 'View Help', size = 'sm' }: HelpButtonProps) {
  const handleHelpClick = () => {
    window.open(helpUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip content={tooltip}>
      <IconButton
        aria-label={tooltip}
        size={size}
        variant='ghost'
        colorPalette='blue'
        onClick={handleHelpClick}
        _hover={{ bg: 'blue.50', _dark: { bg: 'blue.900' } }}
      >
        <HelpCircle size={16} />
      </IconButton>
    </Tooltip>
  );
}
