package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

var (
	kafkaBroker = "localhost:9092"
	inputTopic  = "video-views"
	outputTopic = "filtered-views"
)

type ViewEvent struct {
	UserID    string    `json:"user_id"`
	VideoID   string    `json:"video_id"`
	OwnerID   string    `json:"owner_id"`
	Timestamp time.Time `json:"timestamp"`
}

func main() {
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBroker,
		"group.id":          "filter-group",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("failed to create consumer: %s", err)
	}
	defer consumer.Close()

	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBroker})
	if err != nil {
		log.Fatalf("failed to create producer: %s", err)
	}
	defer producer.Close()

	consumer.SubscribeTopics([]string{inputTopic}, nil)

	for {
		msg, err := consumer.ReadMessage(-1)
		if err != nil {
			log.Printf("consumer error: %v (%v)\n", err, msg)
			continue
		}

		var event ViewEvent
		json.Unmarshal(msg.Value, &event)

		if event.UserID == event.OwnerID {
			log.Println("Filtered out own view:", event)
			continue
		}

		filteredMsg := kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &outputTopic, Partition: kafka.PartitionAny},
			Key:            msg.Key,
			Value:          msg.Value,
		}

		producer.Produce(&filteredMsg, nil)
		fmt.Printf("Filtered view: %v\n", event)
	}
}
