export const getColorCode = (colorName: string): string => {
  const trimmed = colorName.trim().toLowerCase()
  
  // If it's already a hex or rgb code
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) {
    return trimmed
  }

  // Common crochet yarn color mappings
  const colorMap: Record<string, string> = {
    yellow: '#FACC15',
    'light yellow': '#FEF08A',
    pink: '#F472B6',
    'baby pink': '#FBCFE8',
    'dusty pink': '#DB2777',
    purple: '#A855F7',
    'light purple': '#E9D5FF',
    violet: '#7C3AED',
    red: '#EF4444',
    crimson: '#991B1B',
    blue: '#3B82F6',
    'sky blue': '#38BDF8',
    'navy blue': '#1E3A8A',
    green: '#22C55E',
    'sage green': '#86EFAC',
    mint: '#6EE7B7',
    white: '#FFFFFF',
    offwhite: '#FAFAF9',
    cream: '#FEF3C7',
    beige: '#F59E0B',
    brown: '#78350F',
    black: '#18181B',
    gray: '#6B7280',
    orange: '#FB923C',
    peach: '#FFEDD5',
  }

  return colorMap[trimmed] || trimmed
}