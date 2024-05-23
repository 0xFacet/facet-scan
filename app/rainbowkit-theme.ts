import { Theme, darkTheme } from "@rainbow-me/rainbowkit";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const rainbowkitTheme: Theme = {
  ...darkTheme(),
  blurs: {
    modalOverlay: "blur(4px)",
  },
  colors: {
    ...darkTheme().colors,
    modalBackground: "black",
    modalBorder: "rgba(255,255,255,0.1)",
    accentColor: "#3F19D9",
    accentColorForeground: "white",
    modalBackdrop: "rgba(0,0,0,0.8)",
    actionButtonSecondaryBackground: "transparent",
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
    body: inter.style.fontFamily,
  },
};
