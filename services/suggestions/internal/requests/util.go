package requests

import (
    "fmt"
    "reflect"
    "strings"
)

// structJSONFormat creates a JSON-shaped guidance string for a struct type.
// It uses field names (or json tag if present) and basic scalar type labels.
func structJSONFormat(t reflect.Type) string {
	if t.Kind() == reflect.Pointer {
		t = t.Elem()
	}
	if t.Kind() != reflect.Struct {
		return "{}"
	}
	var b strings.Builder
	b.WriteString("{\n")
	printed := 0
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		// Skip unexported
		if f.PkgPath != "" {
			continue
		}
		name := f.Tag.Get("json")
		if name == "" || name == "-" {
			name = f.Name
		} else if idx := strings.Index(name, ","); idx >= 0 {
			name = name[:idx]
		}
		typeLabel := fieldTypeLabel(f.Type)
		if printed > 0 {
			b.WriteString(",\n")
		}
		b.WriteString(fmt.Sprintf("  \"%s\": \"%s\"", name, typeLabel))
		printed++
	}
	if printed > 0 {
		b.WriteString("\n")
	}
	b.WriteString("}")
	return b.String()
}

// fieldTypeLabel returns a concise label for types for prompt examples.
func fieldTypeLabel(t reflect.Type) string {
	if t.Kind() == reflect.Pointer {
		t = t.Elem()
	}
	switch t.Kind() {
	case reflect.String:
		if t.Name() != "" && t.Name() != "string" {
			return t.Name()
		}
		return "string"
	case reflect.Int, reflect.Int64, reflect.Int32, reflect.Int16, reflect.Int8:
		return "int"
	case reflect.Uint, reflect.Uint64, reflect.Uint32, reflect.Uint16, reflect.Uint8:
		return "uint"
	case reflect.Float32, reflect.Float64:
		return "float"
	case reflect.Bool:
		return "bool"
	case reflect.Slice:
		return "[]" + fieldTypeLabel(t.Elem())
	case reflect.Struct:
		if t.PkgPath() != "" && t.Name() != "" {
			return t.Name()
		}
		return "object"
	default:
		if t.Name() != "" {
			return t.Name()
		}
		return t.Kind().String()
	}
}

// normalizeJSON tries to coerce an LLM response into valid JSON by:
// - removing Markdown code fences
// - extracting the first balanced JSON object/array
// If wantArray is true, it prefers extracting an array; otherwise an object.
func normalizeJSON(s string, wantArray bool) string {
    s = strings.TrimSpace(s)
    // Strip markdown code fences if present
    s = stripCodeFences(s)
    s = strings.TrimSpace(s)
    if wantArray {
        if strings.HasPrefix(s, "[") {
            return s
        }
        if arr := extractBalanced(s, '[', ']'); arr != "" {
            return arr
        }
    } else {
        if strings.HasPrefix(s, "{") {
            return s
        }
        if obj := extractBalanced(s, '{', '}'); obj != "" {
            return obj
        }
    }
    return s
}

func stripCodeFences(s string) string {
    t := strings.TrimSpace(s)
    if !strings.Contains(t, "```") {
        return s
    }
    // Try to take the first fenced block if present
    start := strings.Index(t, "```")
    if start >= 0 {
        rest := t[start+3:]
        // Optional language tag until newline
        if i := strings.IndexByte(rest, '\n'); i >= 0 {
            rest = rest[i+1:]
        } else {
            // No newline, return original without change
            return s
        }
        // Find closing fence
        if end := strings.Index(rest, "```"); end >= 0 {
            return rest[:end]
        }
        // If no closing, fall through
    }
    // Fallback: remove all fences tokens
    t = strings.ReplaceAll(t, "```json", "")
    t = strings.ReplaceAll(t, "```JSON", "")
    t = strings.ReplaceAll(t, "```", "")
    return t
}

// extractBalanced returns the first balanced {..} or [..] block starting from the first startRune.
func extractBalanced(s string, startRune, endRune rune) string {
    // Find first occurrence
    start := strings.IndexRune(s, startRune)
    if start < 0 {
        return ""
    }
    depth := 0
    inString := false
    escaped := false
    for i, r := range s[start:] {
        if inString {
            if escaped {
                escaped = false
                continue
            }
            if r == '\\' {
                escaped = true
                continue
            }
            if r == '"' {
                inString = false
            }
            continue
        }
        switch r {
        case '"':
            inString = true
        case startRune:
            depth++
        case endRune:
            depth--
            if depth == 0 {
                // Include up to current rune
                return s[start : start+i+1]
            }
        }
    }
    return ""
}
