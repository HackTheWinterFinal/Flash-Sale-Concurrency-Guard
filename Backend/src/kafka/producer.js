// kafka/producer.js
const kafka = require("../config/kafka");
const producer = kafka.producer();

(async () => await producer.connect())();

exports.publish = async (topic, payload) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
};
