import { EventHubProducerClient } from '@azure/event-hubs';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTION_STRING;
const eventHubName = process.env.EVENT_HUB_NAME;

const main = async () => {
  const producer = new EventHubProducerClient(connectionString, eventHubName);

  const batch = await producer.createBatch();
  batch.tryAdd({ body: 'First event' });
  batch.tryAdd({ body: 'Second event' });
  batch.tryAdd({ body: 'Third event' });

  await producer.sendBatch(batch);
  await producer.close();

  console.log('Batch sent.');
};

main().catch((err) => {
  console.log(`An error occurred: ${err}`);
});
