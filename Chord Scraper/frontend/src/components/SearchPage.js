import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  Paper,
  Divider,
  Textarea,
} from '@mui/material';
import { Search as SearchIcon, CloudUpload, MusicNote, Star } from '@mui/icons-material';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = window.location.origin;

function SearchPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);
  const [onsongContent, setOnsongContent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sendingToDrive, setSendingToDrive] = useState(false);
  const [worshipUrl, setWorshipUrl] = useState('');
  const [loadingWorship, setLoadingWorship] = useState(false);
  const [manualSong, setManualSong] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/search?title=${encodeURIComponent(query)}`);
        // Sort by rating (highest first)
        const sortedResults = response.data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setResults(sortedResults);
      } catch (error) {
        showSnackbar(error.response?.data?.error || 'Failed to search', 'error');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleGetOnsong = async (tab) => {
    try {
      setSelectedTab(tab);
      const response = await axios.post(`${API_URL}/onsong`, { id: tab.id });
      setOnsongContent(response.data);
      setModalOpen(true);
    } catch (error) {
      showSnackbar(
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Failed to get OnSong format',
        'error'
      );
    }
  };

  const handleSendToDrive = async () => {
    try {
      setSendingToDrive(true);
      await axios.post(`${API_URL}/send-to-drive`, {
        content: onsongContent,
        song: selectedTab?.song,
        artist: selectedTab?.artist,
        id: selectedTab?.id,
      });
      showSnackbar('Successfully sent to Google Drive!', 'success');
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || error.response?.data?.message || 'Failed to send to Google Drive',
        'error'
      );
    } finally {
      setSendingToDrive(false);
    }
  };

  const handleGetWorshipchords = async () => {
    if (!worshipUrl) {
      showSnackbar('Please enter a worshipchords.com URL', 'error');
      return;
    }

    if (!worshipUrl.includes('worshipchords.com')) {
      showSnackbar('URL must be from worshipchords.com', 'error');
      return;
    }

    try {
      setLoadingWorship(true);
      const response = await axios.post(`${API_URL}/worshipchords`, { url: worshipUrl });

      const lines = response.data.split('\n');
      let song = 'Unknown Song';
      let artist = 'Unknown Artist';

      if (lines.length > 0 && lines[0].trim()) {
        song = lines[0].trim();
      }

      if (lines.length > 1 && lines[1].trim() &&
          !lines[1].startsWith('Key:') && !lines[1].startsWith('Tempo:')) {
        artist = lines[1].trim();
      }

      const id = 'wc-' + worshipUrl.split('/').filter(Boolean).pop().replace('-chords', '');

      setSelectedTab({ song, artist, id, url: worshipUrl });
      setOnsongContent(response.data);
      setModalOpen(true);
    } catch (error) {
      showSnackbar(
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Failed to get worshipchords format',
        'error'
      );
    } finally {
      setLoadingWorship(false);
    }
  };

  const handleManualSubmission = async () => {
    if (!manualSong.trim()) {
      showSnackbar('Please enter a song title', 'error');
      return;
    }

    if (!manualContent.trim()) {
      showSnackbar('Please enter chord content', 'error');
      return;
    }

    try {
      setSubmittingManual(true);
      const id = 'manual-' + Date.now();
      const song = manualSong.trim();
      const artist = manualArtist.trim() || 'Unknown Artist';

      await axios.post(`${API_URL}/send-to-drive`, {
        content: manualContent,
        song: song,
        artist: artist,
        id: id,
        isManualSubmission: true,
      });

      showSnackbar('Manual submission sent successfully!', 'success');
      setManualSong('');
      setManualArtist('');
      setManualContent('');
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || error.response?.data?.message || 'Failed to submit',
        'error'
      );
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontWeight: 700,
          }}
        >
          <MusicNote sx={{ fontSize: 48 }} />
          Chord Scraper
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Search guitar tabs & worship chords • Convert to OnSong format
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Ultimate Guitar" />
          <Tab label="Worshipchords" />
          <Tab label="Manual Submission" />
        </Tabs>

        {/* Ultimate Guitar Tab */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for a song... (type at least 3 characters)"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 1 }}
            />

            {results.length > 0 && !loading && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                Sorted by highest rating first
              </Typography>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}

            <Stack spacing={2}>
              {results.map((result) => (
                <Card key={result.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {result.song || 'Unknown Song'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Artist: {result.artist || 'Unknown Artist'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                      <Chip label={result.type || 'Unknown'} color="primary" size="small" />
                      <Chip
                        icon={<Star sx={{ fontSize: 18 }} />}
                        label={result.rating ? result.rating.toFixed(2) : 'N/A'}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      onClick={() => handleGetOnsong(result)}
                      fullWidth
                    >
                      Get OnSong Format
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Worshipchords Tab */}
        {tabIndex === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Example: https://worshipchords.com/none-like-jehovah-chords/
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Paste worshipchords.com URL..."
                value={worshipUrl}
                onChange={(e) => setWorshipUrl(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGetWorshipchords}
                disabled={loadingWorship}
                sx={{ minWidth: 150 }}
              >
                {loadingWorship ? <CircularProgress size={24} /> : 'Get Chords'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Manual Submission Tab */}
        {tabIndex === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Submit raw chord text directly. Artist is optional (will default to "Unknown").
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Song Title"
                value={manualSong}
                onChange={(e) => setManualSong(e.target.value)}
              />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Artist Name (optional)"
                value={manualArtist}
                onChange={(e) => setManualArtist(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                placeholder="Paste or type the raw chord content here..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                sx={{ fontFamily: 'monospace' }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={handleManualSubmission}
                disabled={submittingManual}
                startIcon={submittingManual ? <CircularProgress size={20} /> : <CloudUpload />}
              >
                {submittingManual ? 'Submitting...' : 'Submit to Google Drive'}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* OnSong Content Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTab?.song || 'Unknown Song'} - {selectedTab?.artist || 'Unknown Artist'}
        </DialogTitle>
        <DialogContent dividers>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'grey.900',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem',
              maxHeight: '500px',
              overflowY: 'auto',
            }}
          >
            {typeof onsongContent === 'string'
              ? onsongContent
              : JSON.stringify(onsongContent, null, 2)
            }
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSendToDrive}
            disabled={sendingToDrive}
            startIcon={sendingToDrive ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {sendingToDrive ? 'Sending...' : 'Send to Google Drive'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SearchPage;
