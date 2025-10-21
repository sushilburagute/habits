import { useState } from "react";

import { AppProvider } from "@/contexts/AppContext";
import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Dashboard } from "@/components/Dashboard";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";

function App() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <AppProvider>
        <Container>
          <Header onCreateRequest={() => setCreateOpen(true)} />
          <Dashboard onCreateRequest={() => setCreateOpen(true)} />
          <CreateHabitDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Container>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
