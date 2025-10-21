package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"

	kafka "github.com/segmentio/kafka-go"

	"llm-your-business/schemas/events"
	"llm-your-business/services/scheduler/internal/config"
	"llm-your-business/services/scheduler/internal/handlers"
	"llm-your-business/services/scheduler/internal/topics"
)

type Consumer struct {
	readers  []*kafka.Reader
	handlers *handlers.Handlers
}

func NewConsumer(cfg *config.Config, h *handlers.Handlers) (*Consumer, error) {
	if len(cfg.KafkaTopics) == 0 {
		return nil, fmt.Errorf("no Kafka topics configured")
	}

	readers := make([]*kafka.Reader, 0, len(cfg.KafkaTopics))

	for _, topic := range cfg.KafkaTopics {
		r := kafka.NewReader(kafka.ReaderConfig{
			Brokers:               cfg.KafkaBrokers,
			GroupID:               cfg.KafkaGroupID,
			Topic:                 strings.TrimSpace(topic),
			StartOffset:           kafka.LastOffset,
			HeartbeatInterval:     0,
			WatchPartitionChanges: true,
			// Min/MaxBytes and other tuning can be added later
		})
		readers = append(readers, r)
	}

	return &Consumer{readers: readers, handlers: h}, nil
}

func (c *Consumer) Close(ctx context.Context) error {
	var firstErr error
	for _, r := range c.readers {
		if err := r.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}

func (c *Consumer) Start(ctx context.Context) error {
	var wg sync.WaitGroup
	errs := make(chan error, len(c.readers))

	for _, r := range c.readers {
		reader := r
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := c.consumeLoop(ctx, reader); err != nil {
				errs <- err
			}
		}()
	}

	// Wait until any reader returns an error or context is canceled
	go func() { wg.Wait(); close(errs) }()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errs:
		return err
	}
}

func (c *Consumer) consumeLoop(ctx context.Context, r *kafka.Reader) error {
	topic := r.Config().Topic
	log.Printf("kafka consumer started: topic=%s", topic)
	defer log.Printf("kafka consumer stopped: topic=%s", topic)

	for {
		m, err := r.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return nil
			}
			return fmt.Errorf("read message: %w", err)
		}

		if err := c.dispatch(ctx, topic, m.Value); err != nil {
			// For now, log and continue; depending on requirements, consider DLQ
			log.Printf("dispatch error: topic=%s err=%v", topic, err)
		}
	}
}

func (c *Consumer) dispatch(ctx context.Context, topic string, payload []byte) error {
	switch topic {
	case topics.TopicObjectiveExecutionQuestion:
		var evt events.ObjectiveExecutionQuestionV1Json
		if err := json.Unmarshal(payload, &evt); err != nil {
			return fmt.Errorf("decode question: %w", err)
		}
		return c.handlers.HandleObjectiveExecutionQuestion(ctx, evt)
	case topics.TopicObjectiveExecutionAnswer:
		var evt events.ObjectiveExecutionAnswerV1Json
		if err := json.Unmarshal(payload, &evt); err != nil {
			return fmt.Errorf("decode answer: %w", err)
		}
		return c.handlers.HandleObjectiveExecutionAnswer(ctx, evt)
	case topics.TopicObjectiveDatapoint:
		var evt events.ObjectiveDatapointV1Json
		if err := json.Unmarshal(payload, &evt); err != nil {
			return fmt.Errorf("decode datapoint: %w", err)
		}
		return c.handlers.HandleObjectiveDatapoint(ctx, evt)
	case topics.TopicObjectiveManifest:
		var evt events.ObjectiveManifestV1Json
		if err := json.Unmarshal(payload, &evt); err != nil {
			return fmt.Errorf("decode manifest: %w", err)
		}
		return c.handlers.HandleObjectiveManifest(ctx, evt)
	default:
		// Unknown topic: try to identify by presence of fields if topic mapping is custom
		// Fallback: just log and ignore
		log.Printf("unknown topic; skipping: %s", topic)
		return nil
	}
}
