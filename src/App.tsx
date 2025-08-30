import { AppProvider } from "./contexts/AppContext";
import { Container } from "./components/Container";
import { Header } from "./components/Header";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Container>
          <Header />
        </Container>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
