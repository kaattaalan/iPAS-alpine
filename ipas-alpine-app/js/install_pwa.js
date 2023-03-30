let deferredPrompt;
let savedSubscription;

function installHandler(event) {
    // Prevent the default browser prompt
    event.preventDefault();
    // Save the event so it can be triggered later
    deferredPrompt = event;
    // Show the install prompt
    const installPrompt = document.getElementById('install-prompt');
    installPrompt.style.display = 'block';
}


function installPWA() {
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
        const installPrompt = document.getElementById('install-prompt');
        installPrompt.style.display = 'none';
    });
};

function promptNotifications(addNotificationSubscription, pbClient) {
    Notification.requestPermission().then((result) => {
        if (result === "granted") {
            console.log("Notification granted");
            //subscribing to notifications
            navigator.serviceWorker.ready
                .then(function (registration) {
                    // Use the PushManager to get the user's subscription to the push service.
                    return registration.pushManager.getSubscription()
                        .then(async function (subscription) {
                            // If a subscription was found, return it.
                            if (subscription) {
                                return subscription;
                            }

                            // Get the server's public key
                            const response = await fetch('./vapidPublicKey');
                            const vapidPublicKey = await response.text();
                            // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
                            // urlBase64ToUint8Array() is defined in /tools.js
                            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                            // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
                            // send notifications that don't have a visible effect for the user).
                            return registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: convertedVapidKey
                            });
                        });
                }).then(function (subscription) {
                    //save subscription somewhere
                    //savedSubscription = subscription;
                    addNotificationSubscription(subscription, pbClient);
                });
        }
    });
}

// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
