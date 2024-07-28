package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/mux"
)

var (
	kafkaBroker = "localhost:9092"
	topic       = "video-views"
)

type ViewEvent struct {
	UserID    string    `json:"user_id"`
	VideoID   string    `json:"video_id"`
	OwnerID   string    `json:"owner_id"`
	Timestamp time.Time `json:"timestamp"`
}

var producer *kafka.Producer

func main() {
	var err error
	producer, err = kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBroker})
	if err != nil {
		log.Fatalf("failed to create producer: %s", err)
	}
	defer producer.Close()

	r := mux.NewRouter()
	r.HandleFunc("/add-view", addViewHandler).Methods("POST")

	http.Handle("/", r)
	log.Println("Server started on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func addViewHandler(w http.ResponseWriter, r *http.Request) {
	var event ViewEvent
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	event.Timestamp = time.Now()

	msg, err := json.Marshal(event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	kafkaMsg := kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Key:            []byte(event.VideoID),
		Value:          msg,
	}

	producer.Produce(&kafkaMsg, nil)
	producer.Flush(1)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Successfully produced event: %+v\n", event)
}
