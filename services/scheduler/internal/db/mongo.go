package db

import (
    "context"
    "encoding/json"
    "fmt"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    model "llm-your-business/schemas/model"
)

type Client struct {
    client *mongo.Client
    db     *mongo.Database
}

func NewClient(ctx context.Context, uri, database string) (*Client, error) {
    opts := options.Client().ApplyURI(uri)
    // Reasonable defaults for production-ish behavior
    opts.SetRetryWrites(true)
    opts.SetServerSelectionTimeout(5 * time.Second)
    opts.SetConnectTimeout(5 * time.Second)
    opts.SetSocketTimeout(10 * time.Second)

    c, err := mongo.Connect(ctx, opts)
    if err != nil {
        return nil, fmt.Errorf("mongo connect: %w", err)
    }
    if err := c.Ping(ctx, nil); err != nil {
        _ = c.Disconnect(ctx)
        return nil, fmt.Errorf("mongo ping: %w", err)
    }
    return &Client{client: c, db: c.Database(database)}, nil
}

func (c *Client) Disconnect(ctx context.Context) error { return c.client.Disconnect(ctx) }

// FindActiveObjectives returns active objectives keyed by document ID.
// Values are decoded into the generated model.ObjectiveV1Json type.
func (c *Client) FindActiveObjectives(ctx context.Context) (map[string]model.ObjectiveV1Json, error) {
    filter := bson.M{"$or": []bson.M{{"is_active": true}, {"isActive": true}}}
    cur, err := c.db.Collection("objectives").Find(ctx, filter)
    if err != nil {
        return nil, err
    }
    defer cur.Close(ctx)

    out := make(map[string]model.ObjectiveV1Json, 64)
    for cur.Next(ctx) {
        var raw bson.M
        if err := cur.Decode(&raw); err != nil {
            continue
        }
        // Extract ID
        var id string
        switch v := raw["_id"].(type) {
        case primitive.ObjectID:
            id = v.Hex()
        case string:
            id = v
        }
        if id == "" {
            continue
        }
        // Marshal to JSON then unmarshal into generated struct
        b, err := json.Marshal(raw)
        if err != nil { continue }
        var obj model.ObjectiveV1Json
        if err := json.Unmarshal(b, &obj); err != nil { continue }
        out[id] = obj
    }
    if err := cur.Err(); err != nil { return nil, err }
    return out, nil
}

// FindQuestionsByObjective returns all questions linked to a given objective ID.
func (c *Client) FindQuestionsByObjective(ctx context.Context, objectiveID string) ([]model.QuestionV1Json, error) {
    // Match string or ObjectId reference
    var oid primitive.ObjectID
    var hasOid bool
    if o, err := primitive.ObjectIDFromHex(objectiveID); err == nil {
        oid = o
        hasOid = true
    }
    or := []bson.M{{"objective_id": objectiveID}}
    if hasOid {
        or = append(or, bson.M{"objective_id": oid})
    }
    filter := bson.M{"$or": or}

    cur, err := c.db.Collection("questions").Find(ctx, filter)
    if err != nil { return nil, err }
    defer cur.Close(ctx)

    var out []model.QuestionV1Json
    for cur.Next(ctx) {
        var raw bson.M
        if err := cur.Decode(&raw); err != nil { continue }
        b, err := json.Marshal(raw)
        if err != nil { continue }
        var q model.QuestionV1Json
        if err := json.Unmarshal(b, &q); err != nil { continue }
        out = append(out, q)
    }
    if err := cur.Err(); err != nil { return nil, err }
    return out, nil
}

// RecordObjectiveRun appends a run entry for an objective and updates updated_at.
func (c *Client) RecordObjectiveRun(ctx context.Context, objectiveID string, when time.Time, manifestID string) error {
    var filter bson.M
    if oid, err := primitive.ObjectIDFromHex(objectiveID); err == nil {
        filter = bson.M{"_id": oid}
    } else {
        filter = bson.M{"_id": objectiveID}
    }
    update := bson.M{
        "$push": bson.M{"runs": bson.M{"timestamp": when.UTC(), "manifest_id": manifestID}},
        "$set":  bson.M{"updated_at": when.UTC()},
    }
    opts := options.Update().SetUpsert(true)
    _, err := c.db.Collection("objectives").UpdateOne(ctx, filter, update, opts)
    return err
}

// No new types defined here; we use generated model types instead.
