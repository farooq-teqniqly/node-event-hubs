import { EventHubConsumerClient } from '@azure/event-hubs';
import { ContainerClient } from '@azure/storage-blob';
import { BlobCheckpointStore } from '@azure/eventhubs-checkpointstore-blob';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTION_STRING;
const eventHubName = process.env.EVENT_HUB_NAME;
const consumerGroup = process.env.CONSUMER_GROUP;
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
const containerName = process.env.CONTAINER_NAME;
const runForMs = process.env.RUN_FOR_MS;

const main = async () => {
  const containerClient = new ContainerClient(
    storageConnectionString,
    containerName
  );

  const checkPointStore = new BlobCheckpointStore(containerClient);
  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    connectionString,
    eventHubName,
    checkPointStore
  );

  const subscription = consumerClient.subscribe({
    processEvents: async (events, context) => {
      if (events.length === 0) {
        console.log(
          'No events received in this interval. Waiting for the next interval.'
        );
        return;
      }

      for (const event of events) {
        console.log(
          `Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`
        );
      }

      await context.updateCheckpoint(events[events.length - 1]);
    },
    processError: async (err, _) => {
      console.log(`Error : ${err}`);
    },
  });

  await new Promise((resolve) => {
    setTimeout(async () => {
      await subscription.close();
      await consumerClient.close();
      resolve();
    }, runForMs);
  });
};

main().catch((err) => {
  console.log(`An error occurred: ${err}`);
});
