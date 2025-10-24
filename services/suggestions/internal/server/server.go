package server

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	models "llm-your-business/services/go/models"
	"llm-your-business/services/suggestions/api"
	"llm-your-business/services/suggestions/internal/chatgpt"
	"llm-your-business/services/suggestions/internal/requests"
)

type Options struct {
	ChatGPT  *chatgpt.Client
	Requests *requests.Suggestions
}

type Server struct {
	cg  *chatgpt.Client
	req *requests.Suggestions
}

func New(opts Options) *Server {
	return &Server{cg: opts.ChatGPT, req: opts.Requests}
}

func (s *Server) Router() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	mux.HandleFunc("/api/suggestions/product-description", s.postProductDescription)
	mux.HandleFunc("/api/suggestions/categories", s.getCategories)
	mux.HandleFunc("/api/suggestions/personas", s.postPersonas)
	mux.HandleFunc("/api/suggestions/questions", s.postQuestions)
	mux.HandleFunc("/api/suggestions/question_types", s.getQuestionTypes)
	mux.HandleFunc("/ui", s.getUIIndex)
	mux.HandleFunc("/ui/", s.serveUI)

	return cors(logging(mux))
}

func (s *Server) postProductDescription(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload api.ProductDescriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if payload.Identifier == "" {
		http.Error(w, "identifier is required", http.StatusBadRequest)
		return
	}

	if s.req == nil {
		http.Error(w, "server misconfigured: requests not initialized", http.StatusInternalServerError)
		return
	}
	prod, usage, err := s.req.GetDescription(r.Context(), payload.Identifier)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"product": prod, "metadata": map[string]any{"usage": usage}})
}

func (s *Server) getCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cats := models.ProductCategoryValues()
	writeJSON(w, http.StatusOK, map[string]any{"categories": cats})
}

func (s *Server) postPersonas(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload api.PersonasRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if s.req == nil {
		http.Error(w, "server misconfigured: requests not initialized", http.StatusInternalServerError)
		return
	}
	// Require a product description in request
	if (payload.Product == models.ProductDescription{}) {
		http.Error(w, "product description is required", http.StatusBadRequest)
		return
	}
	personas, usage, err := s.req.GetPersonas(r.Context(), payload.Product, payload.Count)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"personas": personas, "metadata": map[string]any{"usage": usage}})
}

func (s *Server) postQuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload api.QuestionsRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if s.req == nil {
		http.Error(w, "server misconfigured: requests not initialized", http.StatusInternalServerError)
		return
	}
	if (payload.Product == models.ProductDescription{}) {
		http.Error(w, "product description is required", http.StatusBadRequest)
		return
	}
	questions, usage, err := s.req.GetQuestions(r.Context(), payload.Product, payload.Count, payload.QuestionType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"questions": questions, "metadata": map[string]any{"usage": usage}})
}

// getQuestionTypes returns the available question type catalog (key, title, description).
func (s *Server) getQuestionTypes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Return the catalog from the suggestions service (no internal prompts)
	if s.req == nil {
		http.Error(w, "server misconfigured: requests not initialized", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"types": s.req.QuestionTypeCatalog()})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// logging middleware for minimal request logs
func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

// cors adds permissive CORS headers so the static ui/ page can call the API.
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
