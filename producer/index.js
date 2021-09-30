import { EventHubProducerClient } from '@azure/event-hubs';
import * as dotenv from 'dotenv';

dotenv.config();

let eventsToSend = parseInt(process.argv[2]);

if (!eventsToSend) {
  eventsToSend = 10;
}

const connectionString = process.env.CONNECTION_STRING;
const eventHubName = process.env.EVENT_HUB_NAME;

const main = async () => {
  const producer = new EventHubProducerClient(connectionString, eventHubName);

  const batch = await producer.createBatch();

  for (let i = 1; i <= eventsToSend; i++) {
    batch.tryAdd({ body: `Event #${i}` });
  }

  await producer.sendBatch(batch);
  await producer.close();

  console.log('Batch sent.');
};

main().catch((err) => {
  console.log(`An error occurred: ${err}`);
});
