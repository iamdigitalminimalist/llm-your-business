package config

import (
	"errors"
	"os"
	"strings"
)

type Config struct {
	// General
	AppEnv   string
	LogLevel string

	// Kafka
	KafkaBrokers  []string
	KafkaGroupID  string
	KafkaClientID string
	KafkaTopics   []string

	// MongoDB
	DBEnabled     bool
	MongoURI      string
	MongoDatabase string
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func parseBool(s string) (bool, bool) {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "1", "true", "yes", "on":
		return true, true
	case "0", "false", "no", "off":
		return false, true
	case "":
		return false, false
	default:
		return false, true
	}
}

// Load reads configuration from environment variables.
// Required vars: KAFKA_BOOTSTRAP_SERVERS, KAFKA_CONSUMER_GROUP, MONGODB_URI, MONGODB_DATABASE
// Optional: KAFKA_TOPICS (CSV), KAFKA_CLIENT_ID, APP_ENV, LOG_LEVEL
func Load() (*Config, error) {
	cfg := &Config{
		AppEnv:   getenv("APP_ENV", "development"),
		LogLevel: getenv("LOG_LEVEL", "info"),

		KafkaBrokers:  splitCSV(getenv("KAFKA_BOOTSTRAP_SERVERS", "")),
		KafkaGroupID:  getenv("KAFKA_CONSUMER_GROUP", getenv("KAFKA_GROUP_ID", "")),
		KafkaClientID: getenv("KAFKA_CLIENT_ID", "scheduler"),
		KafkaTopics:   splitCSV(getenv("KAFKA_TOPICS", "objective.execution.question,objective.execution.answer,objective.datapoint,objective.manifest")),

		MongoURI:      getenv("MONGODB_URI", getenv("MONGO_URI", "")),
		MongoDatabase: getenv("MONGODB_DATABASE", getenv("MONGO_DATABASE", "")),
	}

	// DB enabled flag (optional). Accept either DB_ENABLED or MONGODB_ENABLED.
	if v, ok := parseBool(os.Getenv("DB_ENABLED")); ok {
		cfg.DBEnabled = v
	} else if v, ok := parseBool(os.Getenv("MONGODB_ENABLED")); ok {
		cfg.DBEnabled = v
	} else {
		cfg.DBEnabled = false
	}

	if len(cfg.KafkaBrokers) == 0 {
		return nil, errors.New("KAFKA_BOOTSTRAP_SERVERS is required")
	}
	if cfg.KafkaGroupID == "" {
		return nil, errors.New("KAFKA_CONSUMER_GROUP is required")
	}
	if cfg.DBEnabled {
		if cfg.MongoURI == "" {
			return nil, errors.New("MONGODB_URI is required when DB_ENABLED=true")
		}
		if cfg.MongoDatabase == "" {
			return nil, errors.New("MONGODB_DATABASE is required when DB_ENABLED=true")
		}
	}

	return cfg, nil
}
