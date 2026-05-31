import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#16a34aFF',
    primaryColorHover: '#22c55eFF',
    primaryColorPressed: '#15803dFF',
    primaryColorSuppl: '#22c55eFF',
    fontFamily: '\'DM Sans\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    fontFamilyMono: '\'Space Mono\', \'JetBrains Mono\', ui-monospace, monospace',
    borderRadius: '8px',
  },
  Menu: {
    itemHeight: '32px',
  },
  Layout: { color: '#f4f6f4' },
  Card: {
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  },
  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#22c55eFF',
    primaryColorHover: '#4ade80FF',
    primaryColorPressed: '#16a34aFF',
    primaryColorSuppl: '#4ade80FF',
    fontFamily: '\'DM Sans\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    fontFamilyMono: '\'Space Mono\', \'JetBrains Mono\', ui-monospace, monospace',
    borderRadius: '8px',
  },

  Notification: {
    color: '#1c2128',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#161b22' },
    },
  },

  Menu: {
    itemHeight: '32px',
    itemTextColorActive: '#22c55e',
    itemIconColorActive: '#22c55e',
    itemTextColorActiveHover: '#4ade80',
    itemIconColorActiveHover: '#4ade80',
  },

  Layout: {
    color: '#0d1117',
    siderColor: '#0d1117',
    siderBorderColor: '#21262d',
  },

  Card: {
    color: '#161b22',
    borderColor: '#21262d',
    borderRadius: '10px',
    boxShadow: 'none',
  },

  Table: {
    tdColor: '#161b22',
    thColor: '#1c2128',
  },
};
