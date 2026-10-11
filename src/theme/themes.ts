// Theme tokens for Pomodoro. Values match the design mockup.
// Device tokens colour the overlay; UI tokens colour the settings window and menus.

export type ThemeName = 'Lilac' | 'Mint' | 'Peach' | 'Starlight';

export interface Theme {
  name: ThemeName;
  // Device
  shell: string;    // egg body
  edge: string;     // shell outline, bottom lip, bezel outline
  bezel: string;    // frame around the screen; also the UI surface colour
  btn: string;      // round button fill; primary button fill in settings
  btnEdge: string;  // round button outline
  btnInk: string;   // icon or label colour on a button
  // Screen
  sky: string;      // screen background
  ground: string;   // strip the pet stands on
  ink: string;      // timer digits, mode label, session pips
  accent: string;   // progress line on the ground strip
  // UI (settings window, menus) on the `bezel` surface
  text: string;     // primary text
  sub: string;      // section headings, input borders
  soft: string;     // selected or hovered fill, dividers
  mark: string;     // checkbox, radio and slider accent; selected tile border
}

export const themes: Record<ThemeName, Theme> = {
  Lilac: {
    name: 'Lilac',
    shell: '#CDB8F6', edge: '#9A80D8', bezel: '#FFF6FC',
    btn: '#F9A1CF', btnEdge: '#D45F9C', btnInk: '#5A2348',
    sky: '#FBEFFF', ground: '#D9C2F7', ink: '#4B3A78', accent: '#C2559A',
    text: '#4B3A78', sub: '#6E5E99', soft: '#EBDDFB', mark: '#C2559A',
  },
  Mint: {
    name: 'Mint',
    shell: '#B8EBD4', edge: '#6FBF9F', bezel: '#FBFFF8',
    btn: '#FFE08A', btnEdge: '#D9A93A', btnInk: '#5A4410',
    sky: '#EFFBF1', ground: '#BFE8C6', ink: '#2F5A4A', accent: '#23896A',
    text: '#2F5A4A', sub: '#4B7868', soft: '#D9F3E1', mark: '#23896A',
  },
  Peach: {
    name: 'Peach',
    shell: '#FFD0B8', edge: '#E89A78', bezel: '#FFFBF4',
    btn: '#A9DDF2', btnEdge: '#5FA9C9', btnInk: '#1F4A5E',
    sky: '#FFF4E6', ground: '#FFD9B0', ink: '#6B3F2A', accent: '#D9663A',
    text: '#6B3F2A', sub: '#8A5A42', soft: '#FFE6CF', mark: '#C8552B',
  },
  Starlight: {
    name: 'Starlight',
    shell: '#B9CFF7', edge: '#7C98DA', bezel: '#F6F9FF',
    btn: '#FFC2DD', btnEdge: '#E07FAE', btnInk: '#6A2449',
    sky: '#2E2A66', ground: '#46408F', ink: '#FFF1B5', accent: '#8EE3D9',
    text: '#2E2A66', sub: '#55528F', soft: '#DDE8FB', mark: '#5B6FD6',
  },
};

export const defaultTheme: ThemeName = 'Lilac';
