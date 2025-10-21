package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"llm-your-business/services/scheduler/internal/config"
	"llm-your-business/services/scheduler/internal/db"
	"llm-your-business/services/scheduler/internal/handlers"
	"llm-your-business/services/scheduler/internal/kafka"
	schedpkg "llm-your-business/services/scheduler/internal/scheduler"
)

func main() {
	// Root context with graceful shutdown
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	// MongoDB (optional, disabled by default)
	var (
		h           *handlers.Handlers
		mongoClient *db.Client
	)
	if cfg.DBEnabled {
		mc, err := db.NewClient(ctx, cfg.MongoURI, cfg.MongoDatabase)
		if err != nil {
			log.Fatalf("mongodb connect error: %v", err)
		}
		defer func() {
			shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			if err := mc.Disconnect(shutdownCtx); err != nil {
				log.Printf("mongodb disconnect error: %v", err)
			}
		}()
		mongoClient = mc
		// DB is connected for readiness, but handlers do not persist yet.
		h = handlers.New()
	} else {
		h = handlers.New()
	}

	// Kafka producer (available for handlers or future publishing)
	producer, err := kafka.NewProducer(cfg)
	if err != nil {
		log.Fatalf("kafka producer init error: %v", err)
	}
	defer func() {
		_ = producer.Close(context.Background())
	}()

    // Scheduler service packs common deps for future scheduling logic
    schedulerSvc := schedpkg.New(producer, mongoClient, cfg)
    go func() {
        if err := schedulerSvc.Start(ctx); err != nil && err != context.Canceled {
            log.Printf("scheduler service stopped with error: %v", err)
            cancel()
        }
    }()

	consumer, err := kafka.NewConsumer(cfg, h)
	if err != nil {
		log.Fatalf("kafka consumer init error: %v", err)
	}

	// Start consuming in background
	go func() {
		if err := consumer.Start(ctx); err != nil {
			log.Printf("kafka consumer stopped with error: %v", err)
			cancel()
		}
	}()

	// Block until signal
	<-ctx.Done()

	// Best-effort close (Start observes ctx cancellation)
	_ = consumer.Close(context.Background())

	// small delay to flush logs when running via Docker
	_ = os.Stderr.Sync()
	time.Sleep(100 * time.Millisecond)
}
