import { IconButton, Tooltip } from '@chakra-ui/react';
import { HelpCircle } from 'lucide-react';

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
        variant="ghost"
        colorScheme="blue"
        onClick={handleHelpClick}
        icon={<HelpCircle size={16} />}
        _hover={{ bg: 'blue.50', _dark: { bg: 'blue.900' } }}
      />
    </Tooltip>
  );
}