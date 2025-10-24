module llm-your-business/services/scheduler

go 1.23

require (
    github.com/segmentio/kafka-go v0.4.46
    go.mongodb.org/mongo-driver v1.13.1
)

replace llm-your-business/schemas => ../../schemas/go
replace llm-your-business/services/go/models => ../go/models
