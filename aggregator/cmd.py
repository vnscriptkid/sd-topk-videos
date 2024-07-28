from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, window
from pyspark.sql.types import StringType, StructType, StructField, TimestampType

# Initialize Spark session
spark = SparkSession.builder \
    .appName("KafkaSparkStream") \
    .getOrCreate()

# Kafka configuration
kafka_bootstrap_servers = "kafka1:19092"

df = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", kafka_bootstrap_servers) \
        .option("startingOffsets", "earliest") \
        .option("subscribe", "filtered-views") \
        .load()

# Select the 'value' field and cast it to string
value_df = df.select(col("value").cast("string"))

# Define the schema of the value if it's in JSON format
schema = StructType([
    StructField("user_id", StringType(), True),
    StructField("video_id", StringType(), True),
    StructField("timestamp", TimestampType(), True)
])

# Parse the JSON string into a DataFrame with the defined schema
parsed_df = value_df.withColumn("value", from_json(col("value"), schema))

# Extract fields from the nested 'value' column
extracted_df = parsed_df.select(
    col("value.user_id").alias("user_id"),
    col("value.video_id").alias("video_id"),
    col("value.timestamp").alias("timestamp")
)

# Define the aggregation for hourly, daily, and weekly windows
hourly_view_count = extracted_df \
    .withWatermark("timestamp", "1 hour") \
    .groupBy(window(extracted_df.timestamp, "1 hour"), extracted_df.video_id) \
    .count() \
    .selectExpr("window.start as start_time", "window.end as end_time", "video_id", "count as view_count")

# PostgreSQL connection properties
pg_url = "jdbc:postgresql://pg:5432/postgres"
pg_properties = {
    "user": "postgres",
    "password": "123456",
    "driver": "org.postgresql.Driver"
}

def upsert_to_pg(df, epoch_id):
    # Generate a unique temporary table name for each batch
    temp_table_name = f"hourly_views_temp_{epoch_id}"

    # Drop the temporary table if it exists
    drop_temp_table_query = f"DROP TABLE IF EXISTS \"{temp_table_name}\" CASCADE"

    connection = None
    try:
        # Establish connection to PostgreSQL
        connection = spark._sc._gateway.jvm.java.sql.DriverManager.getConnection(pg_url, pg_properties["user"], pg_properties["password"])
        statement = connection.createStatement()
        statement.executeUpdate(drop_temp_table_query)
        print(f"Dropped table: {temp_table_name}")
    except Exception as e:
        print(f"Error dropping temporary table: {e}")
    finally:
        if connection:
            connection.close()

    # Write to a temporary table with a unique name
    df.write \
        .format("jdbc") \
        .option("url", pg_url) \
        .option("dbtable", f'"{temp_table_name}"') \
        .option("user", pg_properties["user"]) \
        .option("password", pg_properties["password"]) \
        .option("driver", pg_properties["driver"]) \
        .mode("overwrite") \
        .save()
    
    # Perform the upsert using Spark SQL
    temp_df = spark.read.jdbc(pg_url, f'"{temp_table_name}"', properties=pg_properties)
    temp_df.createOrReplaceTempView(temp_table_name)

    # Execute the upsert using raw SQL
    upsert_query = f"""
    INSERT INTO "hourly_views" (start_time, end_time, video_id, view_count)
    SELECT start_time, end_time, video_id, view_count FROM "{temp_table_name}"
    ON CONFLICT (start_time, end_time, video_id)
    DO UPDATE SET view_count = EXCLUDED.view_count
    """

    # Use the JDBC connection to execute the upsert query
    try:
        connection = spark._sc._gateway.jvm.java.sql.DriverManager.getConnection(pg_url, pg_properties["user"], pg_properties["password"])
        statement = connection.createStatement()
        statement.executeUpdate(upsert_query)
    except Exception as e:
        print(f"Error executing query: {e}")
    finally:
        if connection:
            connection.close()

    # Drop the temporary table after upsert
    try:
        connection = spark._sc._gateway.jvm.java.sql.DriverManager.getConnection(pg_url, pg_properties["user"], pg_properties["password"])
        statement = connection.createStatement()
        statement.executeUpdate(drop_temp_table_query)
        print(f"Dropped table after upsert: {temp_table_name}")
    except Exception as e:
        print(f"Error dropping temporary table after upsert: {e}")
    finally:
        if connection:
            connection.close()


# Start the streaming queries and write the results to PostgreSQL
query_hourly = hourly_view_count \
    .writeStream \
    .foreachBatch(upsert_to_pg) \
    .outputMode("update") \
    .start()

# Await termination
query_hourly.awaitTermination()
