import type { Preview } from '@storybook/react-vite'
import { Provider } from '../src/components/ui/provider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a202c',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <Provider>
        <div style={{ minHeight: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default preview;