package scheduler

import (
    "context"
    "log"
    "time"

    model "llm-your-business/services/go/models"
    "llm-your-business/services/scheduler/internal/config"
    "llm-your-business/services/scheduler/internal/db"
    "llm-your-business/services/scheduler/internal/kafka"
)

// Service holds shared dependencies for scheduling operations.
// It owns no goroutines by default; callers control lifecycle.
type Service struct {
    cfg      *config.Config
    Producer *kafka.Producer
    DB       *db.Client // may be nil when DB is disabled
}

func New(producer *kafka.Producer, dbClient *db.Client, cfg *config.Config) *Service {
    return &Service{cfg: cfg, Producer: producer, DB: dbClient}
}

// Start begins a periodic scan (every 10 minutes) to evaluate whether
// active objectives should be executed today, based on their run_schedule
// and start_date. If not executed yet today, it invokes executeObjective (TBD).
func (s *Service) Start(ctx context.Context) error {
	if s.DB == nil {
		log.Printf("scheduler: DB not configured; skipping background scheduling")
		<-ctx.Done()
		return ctx.Err()
	}

	// Run an immediate tick, then every 10 minutes.
	if err := s.tick(ctx); err != nil && err != context.Canceled {
		log.Printf("scheduler: initial tick error: %v", err)
	}

	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := s.tick(ctx); err != nil && err != context.Canceled {
				log.Printf("scheduler: tick error: %v", err)
			}
		}
	}
}

func (s *Service) tick(ctx context.Context) error {
    objs, err := s.DB.FindActiveObjectives(ctx)
    if err != nil {
        return err
    }
    now := time.Now().UTC()
    for id, obj := range objs {
        if !shouldRunToday(now, obj.StartDate, string(obj.RunSchedule)) {
            continue
        }
        if alreadyExecutedToday(now, obj.Runs) {
            continue
        }

        manifestID, err := s.executeObjective(ctx, id, obj)
        if err != nil {
            log.Printf("scheduler: execute objective error: id=%s err=%v", id, err)
            continue
        }
        // After a successful execution, upsert today's run into the objective document
        if manifestID != "" {
            if err := s.DB.RecordObjectiveRun(ctx, id, now, manifestID); err != nil {
                log.Printf("scheduler: record run error: id=%s err=%v", id, err)
            }
        }
    }
    return nil
}


func shouldRunToday(now, start time.Time, schedule string) bool {
    dn := dateOnly(now)
    ds := dateOnly(start)
    if ds.IsZero() || dn.Before(ds) {
        return false
    }
    switch schedule {
    case "weekly":
        days := int(dn.Sub(ds).Hours() / 24)
        return days%7 == 0
    case "monthly":
        // Run on the same day-of-month as start when possible.
        // If the current month has fewer days than start's day, run on the month's last day.
        wantDay := ds.Day()
        last := lastDayOfMonth(dn).Day()
        if wantDay > last {
            return dn.Day() == last
        }
        return dn.Day() == wantDay
    case "daily":
        fallthrough
    default:
        return true
    }
}

func alreadyExecutedToday(now time.Time, runs []model.ObjectiveV1JsonRunsElem) bool {
    for _, r := range runs {
        if sameDayUTC(now, r.Timestamp) {
            return true
        }
    }
    return false
}

func dateOnly(t time.Time) time.Time { return time.Date(t.UTC().Year(), t.UTC().Month(), t.UTC().Day(), 0, 0, 0, 0, time.UTC) }
func sameDayUTC(a, b time.Time) bool {
    u := a.UTC(); v := b.UTC()
    return u.Year() == v.Year() && u.Month() == v.Month() && u.Day() == v.Day()
}
func lastDayOfMonth(t time.Time) time.Time {
    u := t.UTC()
    firstOfNext := time.Date(u.Year(), u.Month()+1, 1, 0, 0, 0, 0, time.UTC)
    return firstOfNext.Add(-24 * time.Hour)
}

// Close performs best-effort cleanup of owned resources.
// Currently a no-op as ownership is external; included for symmetry.
func (s *Service) Close(ctx context.Context) error { return nil }
