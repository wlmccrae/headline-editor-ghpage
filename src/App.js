import { BrowserRouter } from 'react-router-dom';
import MainPage from './components/MainPage';
import Footer from './components/Footer';
import './App.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

function App() {
  const theme = extendTheme({
    colors: {
      brand: {
        100: "#08276b",  // Text: Deep Sapphire Tint 0%
        200: "#e6e9f0",  // Background: Deep Sapphire Tint 90%
        300: "#ffffff",  // Standard white
      },
    },
  })

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <MainPage />
        <Footer />
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
