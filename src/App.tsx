import { useState } from "react";

import { AppProvider, markStarted, useAppContext } from "@/contexts/AppContext";
import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Dashboard } from "@/components/Dashboard";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { Landing } from "@/components/landing/Landing";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <AppProvider>
        <Routes />
      </AppProvider>
    </ThemeProvider>
  );
}

function Routes() {
  const { state, dispatch } = useAppContext();
  const [createOpen, setCreateOpen] = useState(false);

  if (state.route === "home") {
    return (
      <Landing
        onStart={() => {
          markStarted();
          dispatch({ type: "SET_ROUTE", payload: { route: "today" } });
        }}
      />
    );
  }

  return (
    <Container>
      <Header onCreateRequest={() => setCreateOpen(true)} />
      <Dashboard onCreateRequest={() => setCreateOpen(true)} />
      <CreateHabitDialog open={createOpen} onOpenChange={setCreateOpen} />
    </Container>
  );
}

export default App;
