import { bundledThemes, ThemeRegistration, BundledTheme } from 'shiki';

const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const themes = Object.keys(bundledThemes);

async function getBundledColors() {
  const colors = await Promise.all(
    themes.map(async (themeId) => {
      const themeColors = (await bundledThemes[themeId as BundledTheme]()).default.colors;
      return [themeId, getColors(getTokens(themeColors))];
    })
  );

  return Object.fromEntries(colors);
}

function getTokens(colors: ThemeRegistration['colors']) {
  const fg = colors?.foreground || colors?.['editor.foreground'];
  const bg = colors?.background || colors?.['editor.background'];
  const btnFg =
    colors?.['button.foreground'] || colors?.['badge.foreground'] || colors?.['menu.foreground'];
  const btnBg =
    colors?.['button.background'] || colors?.['badge.background'] || colors?.['menu.background'];

  return {
    fg,
    bg,
    btnFg: btnFg || bg,
    btnBg: btnBg || fg,
  };
}

function getColors(tokens: ReturnType<typeof getTokens>) {
  return {
    fg: hexToRgb(tokens.fg),
    bg: hexToRgb(tokens.bg),
    btnFg: hexToRgb(tokens.btnFg),
    btnBg: hexToRgb(tokens.btnBg),
  };
}

function hexToRgb(hex?: string) {
  if (!hex) return undefined;
  // handle alpha in hex
  if (hex.length === 5) hex = hex.substring(0, 4);
  if (hex.length === 9) hex = hex.substring(0, 7);

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export const bundledColors = {
  andromeeda: {
    fg: '213 206 217',
    bg: '35 38 46',
    btnFg: '32 35 43',
    btnBg: '0 232 197',
  },
  'aurora-x': {
    fg: '87 109 175',
    bg: '7 9 15',
    btnFg: '7 9 15',
    btnBg: '134 165 255',
  },
  'ayu-dark': {
    fg: '86 91 102',
    bg: '11 14 20',
    btnFg: '11 14 20',
    btnBg: '230 180 80',
  },
  'catppuccin-frappe': {
    fg: '198 208 245',
    bg: '48 52 70',
    btnFg: '35 38 52',
    btnBg: '202 158 230',
  },
  'catppuccin-latte': {
    fg: '76 79 105',
    bg: '239 241 245',
    btnFg: '220 224 232',
    btnBg: '136 57 239',
  },
  'catppuccin-macchiato': {
    fg: '202 211 245',
    bg: '36 39 58',
    btnFg: '24 25 38',
    btnBg: '198 160 246',
  },
  'catppuccin-mocha': {
    fg: '205 214 244',
    bg: '30 30 46',
    btnFg: '17 17 27',
    btnBg: '203 166 247',
  },
  'dark-plus': {
    fg: '212 212 212',
    bg: '30 30 30',
    btnFg: '204 204 204',
    btnBg: '37 37 38',
  },
  dracula: {
    fg: '248 248 242',
    bg: '40 42 54',
    btnFg: '248 248 242',
    btnBg: '68 71 90',
  },
  'dracula-soft': {
    fg: '246 246 244',
    bg: '40 42 54',
    btnFg: '246 246 244',
    btnBg: '68 71 90',
  },
  'github-dark': {
    fg: '209 213 218',
    bg: '36 41 46',
    btnFg: '220 255 228',
    btnBg: '23 111 44',
  },
  'github-dark-dimmed': {
    fg: '173 186 199',
    bg: '34 39 46',
    btnFg: '255 255 255',
    btnBg: '52 125 57',
  },
  'github-light': {
    fg: '68 77 86',
    bg: '255 255 255',
    btnFg: '255 255 255',
    btnBg: '21 151 57',
  },
  'light-plus': {
    fg: '0 0 0',
    bg: '255 255 255',
    btnFg: '255 255 255',
    btnBg: '0 0 0',
  },
  'material-theme': {
    fg: '238 255 255',
    bg: '38 50 56',
    btnFg: '255 255 255',
    btnBg: '128 203 196',
  },
  'material-theme-darker': {
    fg: '238 255 255',
    bg: '33 33 33',
    btnFg: '255 255 255',
    btnBg: '97 97 97',
  },
  'material-theme-lighter': {
    fg: '144 164 174',
    bg: '250 250 250',
    btnFg: '255 255 255',
    btnBg: '128 203 196',
  },
  'material-theme-ocean': {
    fg: '186 190 216',
    bg: '15 17 26',
    btnFg: '255 255 255',
    btnBg: '113 124 180',
  },
  'material-theme-palenight': {
    fg: '186 190 216',
    bg: '41 45 62',
    btnFg: '255 255 255',
    btnBg: '113 124 180',
  },
  'min-dark': {
    fg: '136 136 136',
    bg: '31 31 31',
    btnFg: '193 193 193',
    btnBg: '51 51 51',
  },
  'min-light': {
    fg: '117 117 117',
    bg: '255 255 255',
    btnFg: '97 97 97',
    btnBg: '117 117 117',
  },
  monokai: {
    fg: '248 248 242',
    bg: '39 40 34',
    btnFg: '248 248 242',
    btnBg: '117 113 94',
  },
  'night-owl': {
    fg: '214 222 235',
    bg: '1 22 39',
    btnFg: '255 255 255',
    btnBg: '126 87 194',
  },
  nord: {
    fg: '216 222 233',
    bg: '46 52 64',
    btnFg: '46 52 64',
    btnBg: '136 192 208',
  },
  'one-dark-pro': {
    fg: '171 178 191',
    bg: '40 44 52',
    btnFg: '171 178 191',
    btnBg: '64 71 84',
  },
  poimandres: {
    fg: '166 172 205',
    bg: '27 30 40',
    btnFg: '255 255 255',
    btnBg: '48 51 64',
  },
  red: {
    fg: '248 248 248',
    bg: '57 0 0',
    btnFg: '57 0 0',
    btnBg: '136 51 51',
  },
  'rose-pine': {
    fg: '224 222 244',
    bg: '25 23 36',
    btnFg: '25 23 36',
    btnBg: '235 188 186',
  },
  'rose-pine-dawn': {
    fg: '87 82 121',
    bg: '250 244 237',
    btnFg: '250 244 237',
    btnBg: '215 130 126',
  },
  'rose-pine-moon': {
    fg: '224 222 244',
    bg: '35 33 54',
    btnFg: '35 33 54',
    btnBg: '234 154 151',
  },
  'slack-dark': {
    fg: '230 230 230',
    bg: '34 34 34',
    btnFg: '255 255 255',
    btnBg: '0 119 181',
  },
  'slack-ochin': {
    fg: '97 97 97',
    bg: '255 255 255',
    btnFg: '255 255 255',
    btnBg: '71 86 99',
  },
  'solarized-dark': {
    fg: '131 148 150',
    bg: '0 43 54',
    btnFg: '0 43 54',
    btnBg: '42 161 152',
  },
  'solarized-light': {
    fg: '101 123 131',
    bg: '253 246 227',
    btnFg: '253 246 227',
    btnBg: '172 157 87',
  },
  'synthwave-84': {
    fg: '255 255 255',
    bg: '38 35 53',
    btnFg: '255 255 255',
    btnBg: '97 77 133',
  },
  'tokyo-night': {
    fg: '120 124 153',
    bg: '26 27 38',
    btnFg: '255 255 255',
    btnBg: '61 89 161',
  },
  vesper: {
    fg: '255 255 255',
    bg: '16 16 16',
    btnFg: '0 0 0',
    btnBg: '255 199 153',
  },
  'vitesse-black': {
    fg: '219 215 202',
    bg: '0 0 0',
    btnFg: '0 0 0',
    btnBg: '77 147 117',
  },
  'vitesse-dark': {
    fg: '219 215 202',
    bg: '18 18 18',
    btnFg: '18 18 18',
    btnBg: '77 147 117',
  },
  'vitesse-light': {
    fg: '57 58 52',
    bg: '255 255 255',
    btnFg: '255 255 255',
    btnBg: '28 107 72',
  },
};
