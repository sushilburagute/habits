/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from "react";

export type Theme = "light" | "dark";
export type Route = "home" | "today" | "week" | "overall";

export type AppState = {
  theme: Theme;
  route: Route;
};

type AppAction =
  | { type: "TOGGLE_THEME" }
  | { type: "SET_ROUTE"; payload: { route: "today" | "week" | "overall" | "home" } };

const initialState: AppState = {
  theme: "light",
  route: "today",
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "SET_ROUTE":
      return state.route === action.payload.route
        ? state
        : { ...state, route: action.payload.route };
    default:
      return state;
  }
}

interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextProps {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
