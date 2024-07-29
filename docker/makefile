up:
	docker compose up -d

down:
	docker compose down --remove-orphans --volumes

# simulate one broker goes down
down_broker:
	docker stop kafka1

# simulate one broker goes up
up_broker:
	docker start kafka1

# create a topic video-views
topic_create:
	docker exec -it kafka1 kafka-topics \
		--create \
		--topic video-views \
		--partitions 3 \
		--replication-factor 3 \
		--if-not-exists \
		--bootstrap-server kafka1:19092
	docker exec -it kafka1 kafka-topics \
		--create \
		--topic filtered-views \
		--partitions 3 \
		--replication-factor 3 \
		--if-not-exists \
		--bootstrap-server kafka1:19092

# list all topics
topic_list:
	docker exec -it kafka1 kafka-topics \
		--list \
		--bootstrap-server kafka1:19092

# describe a topic
topic_describe:
	docker exec -it kafka1 kafka-topics \
		--describe \
		--topic $(topic) \
		--bootstrap-server kafka1:19092

# delete a topic user.activity
topic_delete:
	docker exec -it kafka1 kafka-topics \
		--delete \
		--topic $(topic) \
		--bootstrap-server kafka1:19092

# increase the number of partitions of a topic by 1
topic_more_partition:
	docker exec -it kafka1 kafka-topics \
		--alter \
		--topic $(topic) \
		--partitions 4 \
		--bootstrap-server kafka1:19092

# produce message to the topic user.activity
produce:
	docker exec -it kafka1 kafka-console-producer \
		--topic $(topic) \
		--bootstrap-server kafka1:19092

# consume messages from the topic user.activity
# each terminal is one consumer, that belongs to different consumer group
consume:
	docker exec -it kafka1 kafka-console-consumer \
		--topic $(topic) \
		--from-beginning \
		--property print.key=true \
		--property print.partition=true \
		--property print.offset=true \
		--bootstrap-server kafka1:19092

consume_groupa:
	docker exec -it kafka1 kafka-console-consumer \
		--topic user.activity \
		--group group.a \
		--from-beginning \
		--property print.key=true \
		--property print.partition=true \
		--property print.offset=true \
		--bootstrap-server kafka1:19092

consume_groupb:
	docker exec -it kafka1 kafka-console-consumer \
		--topic user.activity \
		--group group.b \
		--from-beginning \
		--property print.key=true \
		--property print.partition=true \
		--property print.offset=true \
		--bootstrap-server kafka1:19092

# list all consumer groups
consumer_groups:
	docker exec -it kafka1 kafka-consumer-groups \
		--list \
		--bootstrap-server kafka1:19092

# describe a consumer group
consumer_groupa:
	docker exec -it kafka1 kafka-consumer-groups \
		--describe \
		--group group.a \
		--bootstrap-server kafka1:19092

# check health of consumer group
consumer_groupa_health:
	docker exec -it kafka1 kafka-consumer-groups \
		--group group.a \
		--describe \
		--state \
		--bootstrap-server kafka1:19092

# check members of consumer group
consumer_groupa_members:
	docker exec -it kafka1 kafka-consumer-groups \
		--group group.a \
		--describe \
		--members \
		--bootstrap-server kafka1:19092

# version of kafka: 7.3.2-ccs
version:
	docker exec -it kafka1 kafka-topics --version

# produce with key: [key,content]
produce_with_key:
	docker exec -it kafka1 kafka-console-producer \
		--topic user.activity \
		--property parse.key=true \
		--property key.separator=, \
		--bootstrap-server kafka1:19092

# viewing all existing consumer groups
consumer_groups_list:
	docker exec -it kafka1 kafka-consumer-groups \
		--list \
		--bootstrap-server kafka1:19092
	
# kafka1
kafka1:
	docker exec -it kafka1 bash

# open at localhost:9002 on browser
# host: zoo1:2181
ui:
	open http://localhost:9002

# psql
psql:
	docker compose exec -it pg psql -U postgres

# redis-cli
redis-cli:
	docker compose exec -it redis redis-cli

# create pg table
pg_create_table:
	docker compose exec pg psql -U postgres -c "CREATE TABLE videos (video_id VARCHAR(255) PRIMARY KEY, views_count BIGINT);"

logs:
	docker compose logs spark-notebook -f

redis:
	docker compose exec redis redis-cli