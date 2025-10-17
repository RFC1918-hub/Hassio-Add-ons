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
  Textarea,
  Checkbox,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import axios from 'axios';
import debounce from 'lodash/debounce';

// Use relative URL for API calls (same domain as frontend)
// This will work for both localhost and production
const API_URL = window.location.origin;

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);
  const [onsongContent, setOnsongContent] = useState('');
  const [sendingToDrive, setSendingToDrive] = useState(false);
  const [worshipchordsUrl, setWorshipchordsUrl] = useState('');
  const [loadingWorshipchords, setLoadingWorshipchords] = useState(false);
  const [manualSong, setManualSong] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualRequiresAutomation, setManualRequiresAutomation] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
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

  const handleGetWorshipchords = async () => {
    if (!worshipchordsUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a worshipchords.com URL',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!worshipchordsUrl.includes('worshipchords.com')) {
      toast({
        title: 'Error',
        description: 'URL must be from worshipchords.com',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoadingWorshipchords(true);
      const response = await axios.post(`${API_URL}/worshipchords`, { url: worshipchordsUrl });

      // Parse the response to extract song info
      // Format: Line 1 = Song Title, Line 2 = Artist, Line 3 = Key/Tempo info
      const lines = response.data.split('\n');
      let song = 'Unknown Song';
      let artist = 'Unknown Artist';

      // Extract song title (first non-empty line)
      if (lines.length > 0 && lines[0].trim()) {
        song = lines[0].trim();
      }

      // Extract artist (second non-empty line, skip if it's "Key:" or "Tempo:")
      if (lines.length > 1 && lines[1].trim() &&
          !lines[1].startsWith('Key:') && !lines[1].startsWith('Tempo:')) {
        artist = lines[1].trim();
      }

      // Create a unique ID from the URL for tracking
      const id = 'wc-' + worshipchordsUrl.split('/').filter(Boolean).pop().replace('-chords', '');

      setSelectedTab({ song, artist, id, url: worshipchordsUrl });
      setOnsongContent(response.data);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error getting worshipchords format',
        description: typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || error.message || 'Failed to get worshipchords format',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingWorshipchords(false);
    }
  };

  const handleManualSubmission = async () => {
    if (!manualContent) {
      toast({
        title: 'Error',
        description: 'Please enter chord content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmittingManual(true);
      const id = 'manual-' + Date.now();

      // Use "Unknown" for empty song/artist fields
      const song = manualSong.trim() || 'Unknown Song';
      const artist = manualArtist.trim() || 'Unknown Artist';

      await axios.post(`${API_URL}/send-to-drive`, {
        content: manualContent,
        song: song,
        artist: artist,
        id: id,
        isManualSubmission: true,
        requiresAutomation: manualRequiresAutomation,
      });

      toast({
        title: 'Success',
        description: 'Manual submission sent successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clear the form
      setManualSong('');
      setManualArtist('');
      setManualContent('');
      setManualRequiresAutomation(false);
    } catch (error) {
      toast({
        title: 'Error submitting',
        description: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to submit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Heading color="gray.100">Chord Scraper</Heading>

        <Tabs colorScheme="purple" variant="enclosed">
          <TabList>
            <Tab>Ultimate Guitar</Tab>
            <Tab>Worshipchords</Tab>
            <Tab>Manual Submission</Tab>
          </TabList>

          <TabPanels>
            {/* Ultimate Guitar Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Search for a song..."
                  size="lg"
                  value={searchTerm}
                  onChange={handleSearch}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: 'purple.500' }}
                  _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                />

                {loading && (
                  <Box textAlign="center" py={8}>
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
              </VStack>
            </TabPanel>

            {/* Worshipchords Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Input
                    placeholder="Paste worshipchords.com URL..."
                    size="lg"
                    value={worshipchordsUrl}
                    onChange={(e) => setWorshipchordsUrl(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'blue.500' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  />
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleGetWorshipchords}
                    isLoading={loadingWorshipchords}
                    loadingText="Fetching..."
                    minW="150px"
                  >
                    Get Chords
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.400">
                  Example: https://worshipchords.com/none-like-jehovah-chords/
                </Text>
              </VStack>
            </TabPanel>

            {/* Manual Submission Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.400">
                  Submit raw chord text directly. Song and artist are optional (will default to "Unknown").
                </Text>
                <Input
                  placeholder="Song Title (optional)"
                  size="lg"
                  value={manualSong}
                  onChange={(e) => setManualSong(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: 'green.500' }}
                  _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
                />
                <Input
                  placeholder="Artist Name (optional)"
                  size="lg"
                  value={manualArtist}
                  onChange={(e) => setManualArtist(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: 'green.500' }}
                  _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
                />
                <Textarea
                  placeholder="Paste or type the raw chord content here..."
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: 'green.500' }}
                  _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
                  minH="300px"
                  fontFamily="mono"
                  fontSize="sm"
                />
                <Checkbox
                  isChecked={manualRequiresAutomation}
                  onChange={(e) => setManualRequiresAutomation(e.target.checked)}
                  colorScheme="green"
                >
                  <Text color="gray.300">Requires additional automation/processing</Text>
                </Checkbox>
                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={handleManualSubmission}
                  isLoading={submittingManual}
                  loadingText="Submitting..."
                >
                  Submit to Google Drive
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

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
