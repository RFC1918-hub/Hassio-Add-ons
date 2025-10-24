package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/RFC1918-hub/Hassio-Add-ons/chord-scraper/config"
)

// GoogleDriveHandler returns an HTTP handler that proxies requests to the n8n webhook
func NewGoogleDriveHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Read request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		// Parse request
		var req GoogleDriveRequest
		if err := json.Unmarshal(body, &req); err != nil {
			http.Error(w, "Invalid JSON request", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if req.Content == "" || req.Song == "" || req.Artist == "" || req.ID == "" {
			http.Error(w, "Missing required fields: content, song, artist, id", http.StatusBadRequest)
			return
		}

		// Log submission type
		if req.IsManualSubmission {
			log.Printf("Manual submission detected - Requires automation: %v", req.RequiresAutomation)
			// Format manual submissions with Nashville Number System
			log.Printf("Formatting manual submission with Nashville Number System")
			req.Content = FormatWithNashville(req.Song, req.Artist, "", req.Content)
		}

		log.Printf("Forwarding request to n8n webhook: %s", cfg.WebhookURL)

		// Forward request to n8n webhook
		if err := forwardToWebhook(cfg.WebhookURL, req, w); err != nil {
			log.Printf("Error forwarding to webhook: %v", err)
			// Error response already written by forwardToWebhook
		}
	}
}

// forwardToWebhook sends the request to the n8n webhook and forwards the response
func forwardToWebhook(webhookURL string, req GoogleDriveRequest, w http.ResponseWriter) error {
	// Marshal request to JSON
	reqBody, err := json.Marshal(req)
	if err != nil {
		http.Error(w, "Failed to marshal request", http.StatusInternalServerError)
		return err
	}

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", webhookURL, bytes.NewReader(reqBody))
	if err != nil {
		http.Error(w, "Failed to create webhook request", http.StatusInternalServerError)
		return err
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Execute request
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, "Failed to connect to Google Drive service", http.StatusInternalServerError)
		return err
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read webhook response", http.StatusInternalServerError)
		return err
	}

	log.Printf("n8n webhook response: %d", resp.StatusCode)

	// Handle error responses
	if resp.StatusCode >= 400 {
		var errorMsg string
		if resp.StatusCode == http.StatusNotFound {
			errorMsg = "n8n webhook not found. Please check if the workflow is active and the webhook URL is correct."
		} else {
			errorMsg = "Failed to send to Google Drive"
		}

		// Try to parse response as JSON
		var errorResponse map[string]interface{}
		if json.Unmarshal(respBody, &errorResponse) == nil {
			errorResponse["error"] = errorMsg
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(resp.StatusCode)
			json.NewEncoder(w).Encode(errorResponse)
		} else {
			// Return plain text error
			http.Error(w, errorMsg, resp.StatusCode)
		}
		return nil
	}

	// Forward successful response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)

	return nil
}
