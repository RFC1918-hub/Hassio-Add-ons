import React from 'react';
import { ChakraProvider, Box, Container, extendTheme } from '@chakra-ui/react';
import SearchPage from './components/SearchPage';

const darkTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: 'gray.800',
          borderColor: 'gray.700',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'gray.800',
        },
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={darkTheme}>
      <Box minH="100vh" bg="gray.900">
        <Container maxW="container.xl" py={8}>
          <SearchPage />
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
