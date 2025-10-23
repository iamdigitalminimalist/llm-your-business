package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port          string
	OpenAIAPIKey  string
	OpenAIModel   string
	OpenAIBaseURL string
}

// Temperature is the constant temperature used across all ChatGPT requests.
// Adjust once here to change behavior globally.
const Temperature float32 = 0.3

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:          getenv("PORT", "8085"),
		OpenAIAPIKey:  os.Getenv("OPENAI_API_KEY"),
		OpenAIModel:   getenv("OPENAI_MODEL", "gpt-4o-mini"),
		OpenAIBaseURL: getenv("OPENAI_BASE_URL", "https://api.openai.com"),
	}
	if cfg.OpenAIAPIKey == "" {
		// Do not hard fail to allow local testing without external calls,
		// but signal clearly if missing.
		return nil, fmt.Errorf("missing required env OPENAI_API_KEY")
	}
	return cfg, nil
}
