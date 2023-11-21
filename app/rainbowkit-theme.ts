import { Theme, darkTheme } from "@rainbow-me/rainbowkit";

export const rainbowkitTheme: Theme = {
  ...darkTheme(),
  blurs: {
    modalOverlay: "blur(4px)",
  },
  colors: {
    ...darkTheme().colors,
    modalBackground:
      "radial-gradient(100% 100% at 100% 100%, #1a1d0e 0%, #000000 100%)",
    modalBorder: "rgba(255,255,255,0.1)",
    accentColor: "#c3ff00",
    accentColorForeground: "#000000",
    modalBackdrop: "rgba(0,0,0,0.8)",
  },
  radii: {
    ...darkTheme().radii,
    modal: "8px",
    menuButton: "6px",
    actionButton: "6px",
    connectButton: "6px",
  },
  fonts: {
    ...darkTheme().fonts,
    body: "Inter",
  },
};
