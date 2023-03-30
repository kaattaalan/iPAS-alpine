// Require the modules
import PocketBase from 'pocketbase';
import cron from 'node-cron';
import express from 'express';
import eventsource from 'eventsource';

global.EventSource = eventsource;

const pb = new PocketBase('http://127.0.0.1:8080');
webPush.setVapidDetails(
    "http://localhost:83/",
    'BAowvn1XG4KKWtSacW1vXLzH8uzZ0Bge2tcett_godT-woE9vXKsDK0BIHfEggJiuRyrRUSmItPwXQE_Oedw9Ek',
    'yGtVIIEcZ2zaszq7oyiHK0AleoAtPbEnvJ8F42gPJL0'
);


// Create an express app
const app = express();

// Get the cron expression from the environment variable
const cronExpression = process.env.CRON_EXPRESSION || '* * * * *';

// Define a cron job
cron.schedule(cronExpression, async () => {
    try {
        // Get some data from the pocketbase
        const data = await pb.collection('item').getList(1, 20, {
            filter: ''
        });
        setTimeout(function () {
            webPush
                .sendNotification(subscription, 'payload', { TTL: '1000' })
                .then(function () {
                    res.sendStatus(201);
                })
                .catch(function (error) {
                    console.log(error);
                    res.sendStatus(500);
                });
        }, req.body.delay * 1000);

        // Do some operations on the data
        // For example, print the number of users
        console.log(`There are ${data.items.length} users in the pocketbase`);

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