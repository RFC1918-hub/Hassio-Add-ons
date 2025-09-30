import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Badge,
  Card,
  CardBody,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Icon,
} from '@chakra-ui/react';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = 'http://localhost:3000';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);
  const [onsongContent, setOnsongContent] = useState('');
  const [sendingToDrive, setSendingToDrive] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/search?title=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        toast({
          title: 'Error searching',
          description: error.response?.data?.error || 'Failed to search',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleGetOnsong = async (tab) => {
    try {
      setSelectedTab(tab);
      const response = await axios.post(`${API_URL}/onsong`, { id: tab.id });
      setOnsongContent(response.data);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error getting OnSong format',
        description: typeof error.response?.data === 'string' 
          ? error.response.data 
          : error.response?.data?.message || error.message || 'Failed to get OnSong format',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendToGoogleDrive = async () => {
    try {
      setSendingToDrive(true);
      await axios.post(`${API_URL}/send-to-drive`, {
        content: onsongContent,
        song: selectedTab?.song,
        artist: selectedTab?.artist,
        id: selectedTab?.id,
      });
      toast({
        title: 'Success',
        description: 'Sent to Google Drive!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error sending to Google Drive',
        description: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to send to Google Drive',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSendingToDrive(false);
    }
  };

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Heading color="gray.100">Ultimate Guitar Search</Heading>
        <Input
          placeholder="Search for a song..."
          size="lg"
          value={searchTerm}
          onChange={handleSearch}
          bg="gray.800"
          borderColor="gray.600"
          _hover={{ borderColor: 'purple.500' }}
          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
        />

        {loading && (
          <Box textAlign="center">
            <Spinner size="xl" color="purple.500" />
          </Box>
        )}

        <VStack spacing={4} align="stretch">
          {results.map((result) => (
            <Card key={result.id} variant="outline" _hover={{ shadow: 'md' }}>
              <CardBody>
                <Stack spacing={3}>
                  <Heading size="md" color="gray.100">{result.song || 'Unknown Song'}</Heading>
                  <Text color="gray.300">Artist: {result.artist || 'Unknown Artist'}</Text>
                  <Badge colorScheme="purple">{result.type || 'Unknown Type'}</Badge>
                  <Text color="gray.400">Rating: {result.rating ? result.rating.toFixed(2) : 'N/A'}</Text>
                  <Button
                    colorScheme="purple"
                    onClick={() => handleGetOnsong(result)}
                  >
                    Get OnSong Format
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedTab?.song || 'Unknown Song'} - {selectedTab?.artist || 'Unknown Artist'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={handleSendToGoogleDrive}
                  isLoading={sendingToDrive}
                  loadingText="Sending..."
                  leftIcon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.71 3.5L1.15 15l3.41 5.91L11.12 9.36 7.71 3.5M15.41 3.5l-3.41 5.91L15.56 15l6.56-11.5-6.71.001M12 9.36L5.44 20.91h13.12L12 9.36z"/>
                    </svg>
                  }
                >
                  Send to Google Drive
                </Button>
                <Box
                  fontFamily="mono"
                  whiteSpace="pre-wrap"
                  p={4}
                  bg="gray.700"
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.600"
                  maxH="500px"
                  overflowY="auto"
                >
                  {typeof onsongContent === 'string' 
                    ? onsongContent 
                    : JSON.stringify(onsongContent, null, 2)
                  }
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}

export default SearchPage;
