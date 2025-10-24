package server

import (
    "net/http"
    "os"
    "path/filepath"
)

// uiDir resolves the UI directory on disk. It tries common locations for
// local dev (repo path) and container runtime (/ui).
func (s *Server) uiDir() string {
    // Allow override via env
    if v := os.Getenv("UI_DIR"); v != "" {
        if info, err := os.Stat(v); err == nil && info.IsDir() {
            return v
        }
    }
    // Try common locations and relative to executable path
    exe, _ := os.Executable()
    exeDir := filepath.Dir(exe)
    candidates := []string{
        "/ui",
        filepath.Join(exeDir, "ui"),
        filepath.Join(exeDir, "../ui"),
        filepath.Join(exeDir, "../../services/suggestions/ui"),
        // prioritize local ui next to current working directory (e.g. cmd/ui)
        "./ui",
        "ui",
        // repo-relative (when running from repo root)
        "./services/suggestions/ui",
        "services/suggestions/ui",
        // fallbacks: parent dirs
        "../ui",
        "../../ui",
    }
    for _, p := range candidates {
        if info, err := os.Stat(p); err == nil && info.IsDir() {
            return p
        }
    }
    return ""
}

// getUIIndex serves the top-level UI page at /ui from disk.
func (s *Server) getUIIndex(w http.ResponseWriter, r *http.Request) {
    dir := s.uiDir()
    if dir == "" {
        http.Error(w, "UI not found", http.StatusNotFound)
        return
    }
    http.ServeFile(w, r, filepath.Join(dir, "index.html"))
}

// serveUI serves any static asset under /ui/ from disk.
func (s *Server) serveUI(w http.ResponseWriter, r *http.Request) {
    dir := s.uiDir()
    if dir == "" {
        http.NotFound(w, r)
        return
    }
    http.StripPrefix("/ui/", http.FileServer(http.Dir(dir))).ServeHTTP(w, r)
}
