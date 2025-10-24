package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "llm-your-business/services/suggestions/internal/chatgpt"
    "llm-your-business/services/suggestions/internal/config"
    "llm-your-business/services/suggestions/internal/requests"
    "llm-your-business/services/suggestions/internal/server"
)

func main() {
	// Graceful shutdown context
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	// Initialize ChatGPT connector
	cg := &chatgpt.Client{}
	if err := cg.Init(chatgpt.InitOptions{
		APIKey:       cfg.OpenAIAPIKey,
		BaseURL:      cfg.OpenAIBaseURL,
		HTTPClient:   &http.Client{Timeout: 60 * time.Second},
		DefaultModel: cfg.OpenAIModel,
		Temperature:  config.Temperature,
	}); err != nil {
		log.Fatalf("chatgpt init error: %v", err)
	}

    // High-level requests wrapper and HTTP server
    reqs := requests.New(cg)
    srv := server.New(server.Options{ChatGPT: cg, Requests: reqs})

	httpSrv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           srv.Router(),
		ReadTimeout:       15 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	go func() {
		log.Printf("suggestions service listening on :%s", cfg.Port)
		if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http server error: %v", err)
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpSrv.Shutdown(shutdownCtx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}

	_ = os.Stderr.Sync()
	time.Sleep(50 * time.Millisecond)
}
