// config/kafka.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "ticketing-app",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

module.exports = kafka;
