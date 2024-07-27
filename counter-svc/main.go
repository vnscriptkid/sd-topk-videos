package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/lib/pq"
)

const (
	kafkaBroker = "localhost:9092"
	topic       = "filtered-views"
	pgConnStr   = "postgres://postgres:123456@localhost:5432/postgres?sslmode=disable"
	batchSize   = 5
)

type ViewEvent struct {
	UserID    string    `json:"user_id"`
	VideoID   string    `json:"video_id"`
	Timestamp time.Time `json:"timestamp"`
}

func main() {
	db, err := sql.Open("postgres", pgConnStr)
	if err != nil {
		log.Fatal("failed to connect to the database:", err)
	}
	defer db.Close()

	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBroker,
		"group.id":          "aggregator-group",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("failed to create consumer: %s", err)
	}
	defer consumer.Close()

	consumer.SubscribeTopics([]string{topic}, nil)

	var viewEvents []ViewEvent

	for {
		msg, err := consumer.ReadMessage(-1)
		if err != nil {
			log.Printf("consumer error: %v (%v)\n", err, msg)
			continue
		}

		var event ViewEvent
		json.Unmarshal(msg.Value, &event)

		viewEvents = append(viewEvents, event)

		if len(viewEvents) >= batchSize {
			batchUpdate(db, viewEvents)
			viewEvents = viewEvents[:0]
		}
	}
}

func batchUpdate(db *sql.DB, events []ViewEvent) {
	if len(events) == 0 {
		return
	}

	// Aggregate views by video_id
	viewCountMap := make(map[string]int)
	for _, event := range events {
		viewCountMap[event.VideoID]++
	}

	query := `INSERT INTO videos (video_id, views_count) VALUES `
	params := []interface{}{}
	i := 1

	for videoID, count := range viewCountMap {
		query += fmt.Sprintf("($%d, $%d),", i, i+1)
		params = append(params, videoID, count)
		i += 2
	}

	query = query[:len(query)-1] // Remove trailing comma
	query += ` ON CONFLICT (video_id) DO UPDATE SET views_count = videos.views_count + EXCLUDED.views_count`

	fmt.Printf("Executing query: %s\n", query)

	_, err := db.Exec(query, params...)
	if err != nil {
		log.Fatalf("failed to execute batch update: %s", err)
	}

	log.Printf("Batch update successful with %d events\n", len(events))
}
