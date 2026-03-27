export const Colors = {
  primary: '#5D4E37',
  primaryLight: '#8B7355',
  primaryDark: '#3D3225',
  
  background: '#FAF7F2',
  backgroundDark: '#F0EBE3',
  surface: '#FFFFFF',
  surfaceElevated: '#FDFCFA',
  
  quiet: '#4A7C59',
  quietLight: '#7CB08A',
  quietBg: '#E8F5E9',
  
  medium: '#D4A574',
  mediumLight: '#E5C9A8',
  mediumBg: '#FFF8E1',
  
  loud: '#C75B39',
  loudLight: '#E08B6D',
  loudBg: '#FFEBEE',
  
  text: '#2C2416',
  textSecondary: '#6B5D4D',
  textTertiary: '#9C8B78',
  textLight: '#B5A899',
  
  border: '#E8E2D9',
  borderLight: '#F0EBE3',
  
  overlay: 'rgba(44, 36, 22, 0.5)',
  
  white: '#FFFFFF',
  black: '#000000',
  
  star: '#F5B041',
  
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8E2D9',
  tabBarActive: '#5D4E37',
  tabBarInactive: '#9C8B78',
};

export const NoiseColors = {
  0: Colors.quiet,
  1: Colors.medium,
  2: Colors.loud,
} as const;

export const NoiseBgColors = {
  0: Colors.quietBg,
  1: Colors.mediumBg,
  2: Colors.loudBg,
} as const;

export default Colors;
