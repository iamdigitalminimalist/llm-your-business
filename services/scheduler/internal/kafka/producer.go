package kafka

import (
    "context"
    "encoding/json"
    "fmt"
    "sync"
    "time"

    kafka "github.com/segmentio/kafka-go"

    "llm-your-business/schemas/events"
    "llm-your-business/services/scheduler/internal/config"
    "llm-your-business/services/scheduler/internal/topics"
)

type Producer struct {
	brokers []string
	dialer  *kafka.Dialer

	mu      sync.RWMutex
	writers map[string]*kafka.Writer
}

func NewProducer(cfg *config.Config) (*Producer, error) {
	d := &kafka.Dialer{
		Timeout:   10 * time.Second,
		DualStack: true,
		ClientID:  cfg.KafkaClientID,
	}
	return &Producer{
		brokers: cfg.KafkaBrokers,
		dialer:  d,
		writers: make(map[string]*kafka.Writer),
	}, nil
}

func (p *Producer) getWriter(topic string) *kafka.Writer {
	p.mu.RLock()
	w := p.writers[topic]
	p.mu.RUnlock()
	if w != nil {
		return w
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	// double check
	if w = p.writers[topic]; w != nil {
		return w
	}
	w = &kafka.Writer{
		Addr:         kafka.TCP(p.brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll,
		Async:        false,
		BatchTimeout: 50 * time.Millisecond,
	}
	p.writers[topic] = w
	return w
}

func (p *Producer) Publish(ctx context.Context, topic string, key, value []byte) error {
    w := p.getWriter(topic)
    msg := kafka.Message{Key: key, Value: value, Time: time.Now()}
    return w.WriteMessages(ctx, msg)
}

// PublishObjectiveManifest marshals and publishes an ObjectiveManifest event
// to the appropriate Kafka topic.
func (p *Producer) PublishObjectiveManifest(ctx context.Context, evt events.ObjectiveManifestV1Json) error {
    payload, err := json.Marshal(evt)
    if err != nil {
        return fmt.Errorf("marshal ObjectiveManifest: %w", err)
    }
    key := []byte(evt.Meta.ExecutionId)
    return p.Publish(ctx, topics.TopicObjectiveManifest, key, payload)
}

// PublishObjectiveManifestRaw publishes a pre-serialized manifest payload
// with the provided execution ID as the message key.
func (p *Producer) PublishObjectiveManifestRaw(ctx context.Context, executionID string, payload []byte) error {
    return p.Publish(ctx, topics.TopicObjectiveManifest, []byte(executionID), payload)
}

// PublishObjectiveExecutionQuestion marshals and publishes an
// ObjectiveExecutionQuestion event to the appropriate Kafka topic.
func (p *Producer) PublishObjectiveExecutionQuestion(ctx context.Context, evt events.ObjectiveExecutionQuestionV1Json) error {
    payload, err := json.Marshal(evt)
    if err != nil {
        return fmt.Errorf("marshal ObjectiveExecutionQuestion: %w", err)
    }
    key := []byte(evt.Meta.ExecutionId)
    return p.Publish(ctx, topics.TopicObjectiveExecutionQuestion, key, payload)
}

func (p *Producer) Close(ctx context.Context) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	var firstErr error
	for t, w := range p.writers {
		_ = t // silence linter about unused variable t
		if err := w.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}
