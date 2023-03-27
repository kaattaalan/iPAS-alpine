let deferredPrompt;

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
