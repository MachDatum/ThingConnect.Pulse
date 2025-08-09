import { defineTokens } from '@chakra-ui/react'

export const colors = defineTokens.colors({
  whiteAlpha: {
    '50': {
      value: 'rgba(255, 255, 255, 0.04)',
    },
    '100': {
      value: 'rgba(255, 255, 255, 0.06)',
    },
    '200': {
      value: 'rgba(255, 255, 255, 0.08)',
    },
    '300': {
      value: 'rgba(255, 255, 255, 0.16)',
    },
    '400': {
      value: 'rgba(255, 255, 255, 0.24)',
    },
    '500': {
      value: 'rgba(255, 255, 255, 0.36)',
    },
    '600': {
      value: 'rgba(255, 255, 255, 0.48)',
    },
    '700': {
      value: 'rgba(255, 255, 255, 0.64)',
    },
    '800': {
      value: 'rgba(255, 255, 255, 0.80)',
    },
    '900': {
      value: 'rgba(255, 255, 255, 0.92)',
    },
    '950': {
      value: 'rgba(255, 255, 255, 0.95)',
    },
  },
  blackAlpha: {
    '50': {
      value: 'rgba(0, 0, 0, 0.04)',
    },
    '100': {
      value: 'rgba(0, 0, 0, 0.06)',
    },
    '200': {
      value: 'rgba(0, 0, 0, 0.08)',
    },
    '300': {
      value: 'rgba(0, 0, 0, 0.16)',
    },
    '400': {
      value: 'rgba(0, 0, 0, 0.24)',
    },
    '500': {
      value: 'rgba(0, 0, 0, 0.36)',
    },
    '600': {
      value: 'rgba(0, 0, 0, 0.48)',
    },
    '700': {
      value: 'rgba(0, 0, 0, 0.64)',
    },
    '800': {
      value: 'rgba(0, 0, 0, 0.80)',
    },
    '900': {
      value: 'rgba(0, 0, 0, 0.92)',
    },
    '950': {
      value: 'rgba(0, 0, 0, 0.95)',
    },
  },
  gray: {
    '100': {
      value: '#F7F8F9',
    },
    '150': {
      value: '#F5F6F7',
    },
    '200': {
      value: '#F1F2F4',
    },
    '250': {
      value: '#BFC1C4',
    },
    '300': {
      value: '#DCDFE4',
    },
    '350': {
      value: '#A9ABAF',
    },
    '400': {
      value: '#B3B9C4',
    },
    '450': {
      value: '#8C8F97',
    },
    '500': {
      value: '#596773',
    },
    '550': {
      value: '#7E8188',
    },
    '600': {
      value: '#454F59',
    },
    '650': {
      value: '#505258',
    },
    '700': {
      value: '#38414A',
    },
    '750': {
      value: '#242528',
    },
    '800': {
      value: '#22272B',
    },
    '900': {
      value: '#161A1D',
    },
    '1000': {
      value: '#101214',
    },
  },
  red: {
    '100': {
      value: '#FFECEB',
    },
    '200': {
      value: '#FFD5D2',
    },
    '300': {
      value: '#FD9891',
    },
    '400': {
      value: '#F87168',
    },
    '500': {
      value: '#F15B50',
    },
    '600': {
      value: '#E2483D',
    },
    '650': {
      value: '#C9372C',
    },
    '700': {
      value: '#991919',
    },
    '800': {
      value: '#AE2E24',
    },
    '900': {
      value: '#5D1F1A',
    },
    '1000': {
      value: '#42221F',
    },
  },
  orange: {
    '100': {
      value: '#FFF3EB',
    },
    '200': {
      value: '#FEDEC8',
    },
    '300': {
      value: '#FEC195',
    },
    '400': {
      value: '#FEA362',
    },
    '500': {
      value: '#F38A3F',
    },
    '600': {
      value: '#E56910',
    },
    '700': {
      value: '#C25100',
    },
    '800': {
      value: '#A54800',
    },
    '900': {
      value: '#702E00',
    },
    '1000': {
      value: '#38291E',
    },
  },
  yellow: {
    '100': {
      value: '#FFF7D6',
    },
    '200': {
      value: '#F8E6A0',
    },
    '300': {
      value: '#F5CD47',
    },
    '350': {
      value: '#FBC828',
    },
    '400': {
      value: '#E2B203',
    },
    '500': {
      value: '#CF9F02',
    },
    '600': {
      value: '#B38600',
    },
    '700': {
      value: '#946F00',
    },
    '800': {
      value: '#7F5F01',
    },
    '900': {
      value: '#533F04',
    },
    '1000': {
      value: '#332E1B',
    },
  },
  lime: {
    '100': {
      value: '#EFFFD6',
    },
    '200': {
      value: '#D3F1A7',
    },
    '300': {
      value: '#B3DF72',
    },
    '400': {
      value: '#94C748',
    },
    '500': {
      value: '#82B536',
    },
    '600': {
      value: '#6A9A23',
    },
    '700': {
      value: '#5B7F24',
    },
    '800': {
      value: '#4C6B1F',
    },
    '900': {
      value: '#37471F',
    },
    '1000': {
      value: '#28311B',
    },
  },
  green: {
    '100': {
      value: '#DCFFF1',
    },
    '200': {
      value: '#BAF3DB',
    },
    '300': {
      value: '#7EE2B8',
    },
    '400': {
      value: '#4BCE97',
    },
    '500': {
      value: '#2ABB7F',
    },
    '600': {
      value: '#22A06B',
    },
    '700': {
      value: '#1F845A',
    },
    '800': {
      value: '#216E4E',
    },
    '900': {
      value: '#164B35',
    },
    '1000': {
      value: '#1C3329',
    },
  },
  teal: {
    '100': {
      value: '#E7F9FF',
    },
    '200': {
      value: '#C6EDFB',
    },
    '300': {
      value: '#9DD9EE',
    },
    '400': {
      value: '#6CC3E0',
    },
    '500': {
      value: '#42B2D7',
    },
    '600': {
      value: '#2898BD',
    },
    '700': {
      value: '#227D9B',
    },
    '800': {
      value: '#206A83',
    },
    '900': {
      value: '#164555',
    },
    '1000': {
      value: '#1E3137',
    },
  },
  blue: {
    '100': {
      value: '#E9F2FF',
    },
    '200': {
      value: '#CCE0FF',
    },
    '300': {
      value: '#85B8FF',
    },
    '325': {
      value: '#8FB8F6',
    },
    '375': {
      value: '#669DF1',
    },
    '400': {
      value: '#579DFF',
    },
    '450': {
      value: '#4688EC',
    },
    '500': {
      value: '#388BFF',
    },
    '600': {
      value: '#1D7AFC',
    },
    '700': {
      value: '#0C66E4',
    },
    '725': {
      value: '#1868DB',
    },
    '775': {
      value: '#1558BC',
    },
    '800': {
      value: '#0055CC',
    },
    '900': {
      value: '#09326C',
    },
    '1000': {
      value: '#1C2B41',
    },
  },
  purple: {
    '100': {
      value: '#F3F0FF',
    },
    '200': {
      value: '#DFD8FD',
    },
    '300': {
      value: '#B8ACF6',
    },
    '400': {
      value: '#9F8FEF',
    },
    '500': {
      value: '#8F7EE7',
    },
    '600': {
      value: '#8270DB',
    },
    '700': {
      value: '#6E5DC6',
    },
    '800': {
      value: '#5E4DB2',
    },
    '900': {
      value: '#352C63',
    },
    '1000': {
      value: '#2B273F',
    },
  },
  magenta: {
    '100': {
      value: '#FFECF8',
    },
    '200': {
      value: '#FDD0EC',
    },
    '300': {
      value: '#F797D2',
    },
    '400': {
      value: '#E774BB',
    },
    '500': {
      value: '#DA62AC',
    },
    '600': {
      value: '#CD519D',
    },
    '700': {
      value: '#AE4787',
    },
    '800': {
      value: '#943D73',
    },
    '900': {
      value: '#50253F',
    },
    '1000': {
      value: '#3D2232',
    },
  },
  neutrals: {
    '0': {
      value: '#FFFFFF',
    },
    '100': {
      value: '#F7F8F9',
    },
    '200': {
      value: '#F1F2F4',
    },
    '300': {
      value: '#DCDFE4',
    },
    '400': {
      value: '#B3B9C4',
    },
    '500': {
      value: '#8590A2',
    },
    '600': {
      value: '#758195',
    },
    '700': {
      value: '#626F86',
    },
    '800': {
      value: '#44546F',
    },
    '900': {
      value: '#2C3E5D',
    },
    '1000': {
      value: '#172B4D',
    },
    '1100': {
      value: '#091E42',
    },
    '100A': {
      value: '#091E4208',
    },
    '200A': {
      value: '#091E420F',
    },
    '300A': {
      value: '#091E4224',
    },
    '400A': {
      value: '#091E424F',
    },
    '500A': {
      value: '#091E427D',
    },
  },
  darkneutrals: {
    '-100': {
      value: '#101214',
    },
    '0': {
      value: '#161A1D',
    },
    '100': {
      value: '#1D2125',
    },
    '200': {
      value: '#22272B',
    },
    '250': {
      value: '#282E33',
    },
    '300': {
      value: '#2C333A',
    },
    '350': {
      value: '#38414A',
    },
    '400': {
      value: '#454F59',
    },
    '500': {
      value: '#596773',
    },
    '600': {
      value: '#738496',
    },
    '700': {
      value: '#8C9BAB',
    },
    '800': {
      value: '#9FADBC',
    },
    '900': {
      value: '#B6C2CF',
    },
    '1000': {
      value: '#C7D1DB',
    },
    '1100': {
      value: '#DEE4EA',
    },
    '-100A': {
      value: '#03040442',
    },
    '100A': {
      value: '#BCD6F00A',
    },
    '200A': {
      value: '#A1BDD914',
    },
    '250A': {
      value: '#C8E1F91A',
    },
    '300A': {
      value: '#A6C5E229',
    },
    '350A': {
      value: '#C3DEFE33',
    },
    '400A': {
      value: '#BFDBF847',
    },
    '500A': {
      value: '#9BB4CA80',
    },
  },
})
