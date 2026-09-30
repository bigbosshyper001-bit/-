/**
 * Design Tokens for Academic Affairs Management Platform
 * มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
 * 
 * Color System (60 / 30 / 10):
 * - 60% White / Off White: #FFFFFF, #FAFAFC, slate neutrals
 * - 30% Pink / Rose: Primary #D94F87, Deep Rose #B83B6F, Soft Pink #FBE7EF
 * - 10% Semantic Accents:
 *   - Pink: Academic Affairs / Brand
 *   - Purple: Curriculum (#7357B8)
 *   - Teal: Credit / Learning (#168C8C)
 *   - Blue: Information / Data (#3977C8)
 *   - Green: Completed / Approved (#3A9D68)
 *   - Orange: Pending / Warning (#E59A35)
 *   - Red: Critical / Overdue (#D64545)
 */

export const TOKENS = {
  colors: {
    // 60% Canvas & Neutral Surfaces (Soft blush off-white & pure white)
    canvas: '#FFF5F8',
    surface: '#FFFFFF',
    surfaceSubtle: '#FFF0F5',
    border: '#FFDCE8',
    borderSubtle: '#FFF0F5',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',

    // 30% Brand Pink / Magenta (Vibrant MCU Esports tone)
    pink: {
      primary: '#E11463',
      deep: '#C80C54',
      soft: '#FFF0F5',
      hover: '#C80C54',
      subtleBorder: '#FFD0E2',
    },

    // 10% Purpose-Driven Semantic Accents
    accents: {
      purple: {
        base: '#7357B8',
        soft: '#F3EFFF',
        border: '#DACFF6',
        text: '#5B419B',
        label: 'Curriculum / หลักสูตร',
      },
      teal: {
        base: '#168C8C',
        soft: '#E6F6F6',
        border: '#BFE7E7',
        text: '#0E6A6A',
        label: 'Credit & Learning / ธนาคารหน่วยกิต',
      },
      blue: {
        base: '#3977C8',
        soft: '#EDF4FC',
        border: '#BCD5F4',
        text: '#265799',
        label: 'Data & System / ข้อมูลและสารสนเทศ',
      },
      green: {
        base: '#3A9D68',
        soft: '#EAF6F0',
        border: '#C1E6D3',
        text: '#27744B',
        label: 'Approved / ดำเนินการแล้วเสร็จ',
      },
      orange: {
        base: '#E59A35',
        soft: '#FEF5EA',
        border: '#F9DCB4',
        text: '#A36817',
        label: 'Pending / อยู่ระหว่างรอดำเนินการ',
      },
      red: {
        base: '#D64545',
        soft: '#FDEDED',
        border: '#F6BEBE',
        text: '#A32828',
        label: 'Critical / เกินกำหนดหรือเร่งด่วน',
      },
    },
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  typography: {
    fontFamily: "'Noto Sans Thai', 'Plus Jakarta Sans', system-ui, sans-serif",
  },
} as const;

export type SemanticAccent = 'pink' | 'purple' | 'teal' | 'blue' | 'green' | 'orange' | 'red';
