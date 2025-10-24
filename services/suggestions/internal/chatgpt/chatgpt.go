package chatgpt

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

// Client is a minimal OpenAI Responses API client.
type Client struct {
	http               *http.Client
	apiKey             string
	baseURL            string // e.g. https://api.openai.com
	defaultModel       string
	defaultTemperature float32
}

// InitOptions configures Client initialization.
type InitOptions struct {
	APIKey       string
	BaseURL      string
	HTTPClient   *http.Client
	DefaultModel string
	Temperature  float32
}

// Init wires the dependencies and configuration.
func (c *Client) Init(opts InitOptions) error {
	if strings.TrimSpace(opts.APIKey) == "" {
		return errors.New("chatgpt: missing API key")
	}
	c.apiKey = opts.APIKey
	if opts.HTTPClient != nil {
		c.http = opts.HTTPClient
	} else {
		c.http = http.DefaultClient
	}
	if opts.BaseURL == "" {
		c.baseURL = "https://api.openai.com"
	} else {
		c.baseURL = strings.TrimRight(opts.BaseURL, "/")
	}
	if opts.DefaultModel != "" {
		c.defaultModel = opts.DefaultModel
	} else {
		c.defaultModel = "gpt-4o-mini"
	}
	if opts.Temperature > 0 {
		c.defaultTemperature = opts.Temperature
	} else {
		c.defaultTemperature = 0.3
	}
	return nil
}

// Message represents a single chat-like message.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Responses API payloads
type inputContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type inputMessage struct {
	Role    string         `json:"role"`
	Content []inputContent `json:"content"`
}

type responsesRequest struct {
	Model           string            `json:"model"`
	Input           []inputMessage    `json:"input"`
	Temperature     float32           `json:"temperature,omitempty"`
	MaxOutputTokens int               `json:"max_output_tokens,omitempty"`
	Metadata        map[string]string `json:"metadata,omitempty"`
}

type responsesResponse struct {
	Output []struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
	OutputText string `json:"output_text"`
	// Fallbacks for providers that still mimic choices
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
		Text string `json:"text"`
	} `json:"choices"`
	Usage struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
		TotalTokens  int `json:"total_tokens"`
	} `json:"usage"`
}

// Chat runs a chat completion and returns the assistant content.
type Usage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
	TotalTokens  int `json:"total_tokens"`
}

func (c *Client) Chat(ctx context.Context, messages []Message, model string, temperature float32, maxTokens int) (string, Usage, error) {
	return c.ChatWithCache(ctx, messages, model, temperature, maxTokens, "")
}

// ChatWithCache is like Chat but attaches a prompt_cache_key for caching.
func (c *Client) ChatWithCache(ctx context.Context, messages []Message, model string, temperature float32, maxTokens int, cacheKey string) (string, Usage, error) {
	if model == "" {
		model = c.defaultModel
	}
	var in []inputMessage
	for _, m := range messages {
		in = append(in, inputMessage{
			Role:    m.Role,
			Content: []inputContent{{Type: "input_text", Text: m.Content}},
		})
	}
	var reqBody responsesRequest
	if model == "gpt-5" {
		reqBody = responsesRequest{
			Model:           model,
			Input:           in,
			MaxOutputTokens: maxTokens,
		}
	} else {
		reqBody = responsesRequest{
			Model:           model,
			Input:           in,
			Temperature:     temperature,
			MaxOutputTokens: maxTokens,
		}
	}

	// Build cache key from system-role messages only, ignoring user data
	var sysBuf strings.Builder
	for _, m := range messages {
		if strings.EqualFold(m.Role, "system") {
			if sysBuf.Len() > 0 {
				sysBuf.WriteString("\n")
			}
			sysBuf.WriteString(m.Content)
		}
	}
	sysText := sysBuf.String()
	if strings.TrimSpace(sysText) == "" {
		sysText = "default-system"
	}
	if reqBody.Metadata == nil {
		reqBody.Metadata = map[string]string{}
	}
	reqBody.Metadata["prompt_cache_key"] = makePromptKey("system", sysText)
	// Log the outgoing request (sanitized)
	logReq := struct {
		Model           string            `json:"model"`
		Temperature     float32           `json:"temperature"`
		MaxOutputTokens int               `json:"max_output_tokens"`
		Metadata        map[string]string `json:"metadata,omitempty"`
		Messages        []Message         `json:"messages"`
	}{
		Model:           reqBody.Model,
		Temperature:     reqBody.Temperature,
		MaxOutputTokens: reqBody.MaxOutputTokens,
		Metadata:        reqBody.Metadata,
		Messages:        make([]Message, 0, len(messages)),
	}
	for _, m := range messages {
		// Truncate content to avoid oversized logs
		logReq.Messages = append(logReq.Messages, Message{Role: m.Role, Content: truncateForLog(m.Content, 2000)})
	}
	if data, err := json.Marshal(logReq); err == nil {
		log.Printf("chatgpt request: %s", data)
	}

	buf, err := json.Marshal(reqBody)
	if err != nil {
		return "", Usage{}, fmt.Errorf("marshal request: %w", err)
	}

	url := c.baseURL + "/v1/responses"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return "", Usage{}, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return "", Usage{}, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		// Log error response body
		log.Printf("chatgpt error response (%d): %s", resp.StatusCode, truncateForLog(string(b), 4000))
		return "", Usage{}, fmt.Errorf("openai status %d: %s", resp.StatusCode, string(b))
	}
	// Read full body to allow logging
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", Usage{}, fmt.Errorf("read response: %w", err)
	}
	log.Printf("chatgpt response raw: %s", truncateForLog(string(bodyBytes), 4000))
	var out responsesResponse
	if err := json.Unmarshal(bodyBytes, &out); err != nil {
		return "", Usage{}, fmt.Errorf("decode response: %w", err)
	}
	if s := strings.TrimSpace(out.OutputText); s != "" {
		return s, Usage(out.Usage), nil
	}
	for _, msg := range out.Output {
		for _, c := range msg.Content {
			if t := strings.TrimSpace(c.Text); t != "" {
				return t, Usage(out.Usage), nil
			}
		}
	}
	if len(out.Choices) > 0 {
		if t := strings.TrimSpace(out.Choices[0].Text); t != "" {
			return t, Usage(out.Usage), nil
		}
		if ct := strings.TrimSpace(out.Choices[0].Message.Content); ct != "" {
			return ct, Usage(out.Usage), nil
		}
	}
	return "", Usage(out.Usage), errors.New("openai responses: no output text")
}

// Ask is a convenience wrapper for a single-prompt interaction.
func (c *Client) Ask(ctx context.Context, prompt string, model string) (string, Usage, error) {
	msgs := []Message{
		{Role: "user", Content: prompt},
	}
	return c.ChatWithCache(ctx, msgs, model, 0.7, 0, makePromptKey("ask", prompt))
}

// makePromptKey builds a stable short cache key.
func makePromptKey(kind string, data string) string {
	// simple deterministic hash to keep key length small
	sum := sha256.Sum256([]byte(kind + "|" + data))
	// first 16 hex chars are enough
	return kind + ":v1:" + fmt.Sprintf("%x", sum)[:16]
}

// truncateForLog returns s truncated to maxLen with an ellipsis marker if truncated.
func truncateForLog(s string, maxLen int) string {
	if maxLen <= 0 {
		return ""
	}
	if len(s) <= maxLen {
		return s
	}
	if maxLen <= 3 {
		return s[:maxLen]
	}
	return s[:maxLen-3] + "..."
}

// SuggestForObjective crafts a prompt for an objective and requests suggestions.
// The returned string is model-generated text; callers decide on structure.
func (c *Client) SuggestForObjective(ctx context.Context, obj interface{}, model string) (string, Usage, error) {
	sys := Message{Role: "system", Content: "You are an assistant that generates actionable marketing suggestions."}
	user := Message{Role: "user", Content: "Given the following objective as JSON, generate a concise set of suggestions. JSON:"}
	payload, _ := json.Marshal(obj)
	user.Content = user.Content + "\n" + string(payload)
	return c.ChatWithCache(ctx, []Message{sys, user}, model, 0.6, 0, "")
}

// AnswerForQuestion asks the model to answer a question in context of persona/language.
func (c *Client) AnswerForQuestion(ctx context.Context, q interface{}, model string) (string, Usage, error) {
	sys := Message{Role: "system", Content: "You answer clearly and directly, respecting given persona and language."}
	user := Message{Role: "user", Content: "Answer the following input, provided as JSON:"}
	payload, _ := json.Marshal(q)
	user.Content = user.Content + "\n" + string(payload)
	return c.ChatWithCache(ctx, []Message{sys, user}, model, 0.7, 0, "")
}
