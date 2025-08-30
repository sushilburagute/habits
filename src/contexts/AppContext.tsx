/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from "react";

export type Route = "home" | "today" | "week" | "overall";

export type AppState = {
  route: Route;
};

type AppAction = { type: "SET_ROUTE"; payload: { route: Route } };

const initialState: AppState = {
  route: "today",
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
