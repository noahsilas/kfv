import WebSocket, { WebSocketServer } from 'ws';
import { Kafka } from 'kafkajs';

const topics = process.argv.slice(2);
const broker = process.env.KFV_BROKER || 'localhost:9092';

const wss = new WebSocketServer({ port: 8234 });

wss.on('listening', () => {
  console.log('Websocket server is listening');
})

wss.on('connection', function connection(ws) {
  console.log('Websocket connection opened');
  ws.on('message', (data, isBinary) => {
    console.log({ data, isBinary });
  });
});

const kafka = new Kafka({
  clientId: 'kfv',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'kfv-demo' });


async function main() {
  console.log('connecting consumer');
  await consumer.connect();
  console.log('subscribing consumer');
  await consumer.subscribe({ topics });

  console.log('running consumer');
  await consumer.run({
    eachMessage: ({ topic, partition, message, heartbeat, pause }) => {
      console.log({ topic, partition, message })
      const encoded = { ...message, value: message.value.toString() };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ topic, partition, message: encoded, heartbeat, pause }));
        }
      })
    },
  })
}

main();
