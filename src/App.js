import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Footer from './components/Footer';
import './App.css';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
