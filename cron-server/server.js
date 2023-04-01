// Require the modules
import PocketBase from 'pocketbase';
import cron from 'node-cron';
import express from 'express';
import eventsource from 'eventsource';
import webPush from 'web-push';
import { fetchVapidDetails } from './retrieve-vapid-details.js'

global.EventSource = eventsource;

//const vapidKeys = webPush.generateVAPIDKeys();

const { subject, publicKey, privateKey } = await fetchVapidDetails();
webPush.setVapidDetails(
    subject,
    publicKey,
    privateKey
);


// Create an express app
const app = express();

// Get the environment variables
const cronExpression = process.env.CRON_EXPRESSION || '*/20 * * * * *';
const pbBaseUrl = process.env.PB_URL || 'http://127.0.0.1:8080';

const pb = new PocketBase(pbBaseUrl);

// Define a cron job
cron.schedule(cronExpression, async () => {
    try {
        // Get subscriber data from the pocketbase
        const data = await pb.collection('subscriptions').getList(1, 20, {
            filter: ''
        });
        console.info(`Sending notifications to ${data.items.length} users`);
        data.items.forEach(subscription => {
            webPush
                .sendNotification(data.items[0], '{"title":"My Push","body":"my body"}', { TTL: '1000' })
                .then(function () {
                    console.log("Success");
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    } catch (error) {
        // Handle any errors
        console.error(error);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});