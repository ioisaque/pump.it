declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
    athenas: Palette["primary"];
    quinzel: Palette["primary"];
    emoji: Palette["primary"];
    master: Palette["primary"];
    telecom: Palette["primary"];
    black: Palette["primary"];
    white: Palette["primary"];
  }

  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
    athenas?: PaletteOptions["primary"];
    quinzel?: PaletteOptions["primary"];
    emoji?: PaletteOptions["primary"];
    master?: PaletteOptions["primary"];
    telecom?: PaletteOptions["primary"];
    black?: PaletteOptions["primary"];
    white?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true;
    athenas: true;
    quinzel: true;
    emoji: true;
    master: true;
    telecom: true;
    black: true;
    white: true;
  }
}

declare module "@mui/material/TextField" {
  interface TextFieldPropsColorOverrides {
    neutral: true;
    athenas: true;
    quinzel: true;
    emoji: true;
    master: true;
    telecom: true;
    black: true;
    white: true;
  }
}
declare module "@mui/material/Pagination" {
  interface PaginationPropsColorOverrides {
    info: true;
    success: true;
    warning: true;
    neutral: true;
    athenas: true;
    quinzel: true;
    emoji: true;
    master: true;
    telecom: true;
    black: true;
    white: true;
  }
}

/** Brand blue (`#0076F3`) — not legacy `#0d47a1`. */
export const primary = {
  light: "#90caf9",
  main: "#0076F3",
  dark: "#133d63",
  contrastText: "#FFF",
};

/** Brand red accent — buttons / GridTable default in lists. */
export const secondary = {
  light: "#f7797b",
  main: "#FF5356",
  dark: "#d03537",
  contrastText: "#FFF",
};

export const neutral = {
  light: "#89a4c7",
  main: "#64748B",
  dark: "#384250",
  contrastText: "#FFF",
};

export const error = {
  light: "#f7797b",
  main: "#f9142a",
  dark: "#900000",
  contrastText: "#FFF",
};

export const success = {
  light: "#25d366",
  main: "#33CC66",
  dark: "#28a745",
  contrastText: "#FFF",
};

export const warning = {
  light: "#FFE91F",
  main: "#FFD22B",
  dark: "#FFC600",
  contrastText: "#FFF",
};

export const info = {
  light: "#90caf9",
  main: "#0076F3",
  dark: "#133d63",
  contrastText: "#FFF",
};

export const quinzel = {
  main: "#9900CC",
  contrastText: "#FFF",
};

export const athenas = {
  main: "#f36700",
  contrastText: "#FFF",
};

export const emoji = {
  main: "#8b4513",
  contrastText: "#FFF",
};

export const master = {
  main: "#133d63",
  contrastText: "#FFF",
};

export const telecom = {
  main: "#5292b1",
  contrastText: "#FFF",
};

export const black = {
  light: "#000",
  main: "#000",
  dark: "#000",
  contrastText: "#FFF",
};

export const white = {
  light: "#fff",
  main: "#fff",
  dark: "#fff",
  contrastText: "#000",
};
