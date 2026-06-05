export const Colors = {
  oxblood: '#3f030b',
  oxbloodDeep: '#2a0207',
  oxblood2: '#5a1018',
  cream: '#e8d8cc',
  creamLite: '#f4ece4',
  creamDk: '#dcc7b8',
  rose: '#b46a74',
  roseDeep: '#8d4750',
  roseSoft: '#d8a7ad',
  ink: '#2a0207',
  white: '#ffffff',
  green: '#2a7a5a',
  gold: '#f3c969',
} as const;

export const Gradients = {
  rose: ['#c97e87', '#b46a74', '#8d4750'] as const,
  oxblood: ['#5a1018', '#3f030b', '#2a0207'] as const,
  roseLight: ['#d8a7ad', '#b46a74'] as const,
  instagram: ['#e1306c', '#c13584', '#405de6'] as const,
};

export const FontFamily = {
  serif: 'BodoniModa_700Bold',
  serifItalic: 'BodoniModa_500Medium_Italic',
  sans: 'Montserrat_700Bold',
  sansMedium: 'Montserrat_500Medium',
  sansRegular: 'Montserrat_400Regular',
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: {
    shadowColor: Colors.oxblood,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
