import { AppProvider } from "./contexts/AppContext";
import { Container } from "./components/Container";
import { Header } from "./components/Header";

function App() {
  return (
    <AppProvider>
      <Container>
        <Header />
      </Container>
    </AppProvider>
  );
}

export default App;
