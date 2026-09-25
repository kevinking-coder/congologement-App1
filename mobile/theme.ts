// theme.ts
import { vars } from "nativewind";

export interface ThemeFonts {
  heading: { family: string; weights: Record<string, string> };
  body: { family: string; weights: Record<string, string> };
  mono: { family: string; weights: Record<string, string> };
}

export const themeFonts: ThemeFonts = {
  heading: {
    family: 'Inter',
    weights: { normal: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' },
  },
  body: {
    family: 'Inter',
    weights: { normal: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold' },
  },
  mono: {
    family: 'JetBrainsMono',
    weights: { normal: 'JetBrainsMono_400Regular', medium: 'JetBrainsMono_500Medium' },
  },
};

// Congo Logement palette — deep navy primary, warm gold accent, red for warnings, light background
export const lightTheme = vars({
  "--radius": "12",

  "--background": "248 249 251",
  "--foreground": "16 30 50",

  "--card": "255 255 255",
  "--card-foreground": "16 30 50",

  "--popover": "255 255 255",
  "--popover-foreground": "16 30 50",

  "--primary": "11 28 50",          // deep navy
  "--primary-foreground": "245 247 250",

  "--secondary": "231 236 243",
  "--secondary-foreground": "16 30 50",

  "--muted": "233 238 245",
  "--muted-foreground": "106 121 140",

  "--accent": "184 134 11",         // warm gold
  "--accent-foreground": "255 250 235",

  "--destructive": "190 38 48",     // red — used sparingly

  "--border": "226 231 238",
  "--input": "226 231 238",
  "--ring": "184 134 11",

  "--chart-1": "11 28 50",
  "--chart-2": "184 134 11",
  "--chart-3": "190 38 48",
  "--chart-4": "46 125 50",
  "--chart-5": "120 90 30",

  "--sidebar": "248 249 251",
  "--sidebar-foreground": "16 30 50",
  "--sidebar-primary": "11 28 50",
  "--sidebar-primary-foreground": "245 247 250",
  "--sidebar-accent": "184 134 11",
  "--sidebar-accent-foreground": "255 250 235",
  "--sidebar-border": "226 231 238",
  "--sidebar-ring": "184 134 11",
});

export const darkTheme = vars({
  "--radius": "12",

  "--background": "9 21 38",
  "--foreground": "232 239 246",

  "--card": "16 31 52",
  "--card-foreground": "232 239 246",

  "--popover": "16 31 52",
  "--popover-foreground": "232 239 246",

  "--primary": "24 46 74",
  "--primary-foreground": "232 239 246",

  "--secondary": "22 42 66",
  "--secondary-foreground": "232 239 246",

  "--muted": "22 42 66",
  "--muted-foreground": "140 158 178",

  "--accent": "212 160 40",
  "--accent-foreground": "20 30 45",

  "--destructive": "220 70 78",

  "--border": "28 50 76",
  "--input": "28 50 76",
  "--ring": "212 160 40",

  "--chart-1": "212 160 40",
  "--chart-2": "24 46 74",
  "--chart-3": "220 70 78",
  "--chart-4": "60 150 60",
  "--chart-5": "160 120 50",

  "--sidebar": "9 21 38",
  "--sidebar-foreground": "232 239 246",
  "--sidebar-primary": "24 46 74",
  "--sidebar-primary-foreground": "232 239 246",
  "--sidebar-accent": "212 160 40",
  "--sidebar-accent-foreground": "20 30 45",
  "--sidebar-border": "28 50 76",
  "--sidebar-ring": "212 160 40",
});
