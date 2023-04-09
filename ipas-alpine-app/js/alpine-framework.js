
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            //Add install button if not yet installed
            window.addEventListener('beforeinstallprompt', installHandler);
        }, function (err) {
            // registration failed
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

document.addEventListener('alpine:init', () => {
    Alpine.data('lists', () => ({
        // pocketbase client
        client: null,

        // login / signup
        showLogin: false,
        showSignup: false,
        email: null,
        password: null,
        passwordConfirm: null,
        loginMessage: null,
        signupMessage: null,

        //days list
        userDay: {},
        weekDayList: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        // lists data
        lists: [],
        newListName: '',
        selectedList: null,

        // items data
        items: null,
        newItem: null,

        async init() {

            //construct baseurl
            const baseUrl = `${window.location.protocol}//${window.location.host}/`;

            // initialize pocketbase
            this.client = new PocketBase(`${baseUrl}`);

            //Set headers for ngrock
            this.client.beforeSend = function (url, options) {
                options.headers = Object.assign({}, options.headers, {
                    'ngrok-skip-browser-warning': 'true',
                });

                return { url, options };
            }

            // capture invalid token
            this.client.afterSend = function (response, data) {
                if (response.status === 401) {
                    this.showLogin = true;
                }
                return data;
            }

            // if user is not logged in, show login / signup page
            if (!window.localStorage.getItem('pocketbase_auth')) {
                this.showLogin = true;
                return;
            }

            // resume session
            const auth = JSON.parse(window.localStorage.getItem('pocketbase_auth'));
            this.client.authStore.save(auth.token, auth.model);

            // fetch todo lists
            if (auth) {
                await this.getDays();
            }

        },

        // login
        async login() {
            try {
                const user = await this.client.collection('users').authWithPassword(this.email, this.password)
                this.getDays()
                this.showLogin = false
                this.email = ''
                this.password = ''
            } catch (err) {
                this.loginMessage = err.data.message
            }
        },

        // signup
        async signup() {
            try {
                const user = await this.client.collection('users').create({
                    email: this.email,
                    password: this.password,
                    passwordConfirm: this.passwordConfirm
                })
                this.email = ''
                this.password = ''
                this.passwordConfirm = ''
                this.showSignup = false;
                this.loginMessage = 'Success! Please, login.'
            } catch (err) {
                this.signupMessage = err.data.message
                if (err.data.data.email) this.signupMessage += ` Email: ${err.data.data.email.message}`
                if (err.data.data.password) this.signupMessage += ` Password: ${err.data.data.password.message}`
                if (err.data.data.passwordConfirm) this.signupMessage += ` Password Confirm: ${err.data.data.passwordConfirm.message}`
            }
        },

        // logout
        async logout() {
            this.client.authStore.clear()
            this.showLogin = true
        },

        async getDays() {
            try {
                this.userDay = await this.client.collection('user_days')
                    .getFirstListItem(`user.id = '${this.client.authStore.baseModel.id}'`);
            } catch (err) {
                this.userDay =
                    await this.client.collection('user_days').create({
                        user: this.client.authStore.baseModel.id,
                        selected_days: {
                            1: false,
                            2: false,
                            3: false,
                            4: false,
                            5: false,
                        }
                    });
            }
        },

        async updateDays() {
            try {
                await this.client.collection('user_days').update(this.userDay.id, this.userDay)
            } catch (err) {
                console.log('ERR', err)
            }
        },

        async getNextWeekday() { return (new Date().getDay() % 6) + 1; },

        //PWA related methods
        async requestPermission() {
            Notification.requestPermission().then(status => {
                this.permission = status;
                if (status === 'granted') {
                    console.debug("Granted notification permissions")
                    this.subscribe();
                }
            })
        },
        async subscribe() {
            //fetch data needed for the subscription object
            userId = await this.client.authStore.baseModel.id;
            deviceId = "";
            userAgent = navigator.userAgent;
            // Get the service worker registration
            navigator.serviceWorker.ready.then(reg => {
                // Get the push manager subscription
                reg.pushManager.getSubscription().then(sub => {
                    // If there is no subscription, create one
                    if (sub === null) {
                        // Get the server's public key
                        fetchVapidKey().then(pubKey => {
                            // Create a new subscription
                            reg.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: pubKey
                            }).then(newSub => {
                                console.debug("Subscribed to notifications")
                                //deep copying sub object to add device related ids
                                const currentSub = JSON.parse(JSON.stringify(newSub));
                                // Add device details and Send the subscription object to the database
                                const idSub = { ...currentSub, userId: userId, userAgent: userAgent };
                                this.client.collection('subscriptions').create(idSub).catch((error) => {
                                    if (error.status == '400') {
                                        console.debug("Error subscibing to notifications");
                                    }
                                });
                            });
                        });
                    } else {
                        sub.unsubscribe().then(success => {
                            if (success) {
                                //TODO: find out a way to delete subscription here
                                console.debug('Unsubscribed successfully');
                            } else {
                                console.error('Unsubscribe failed');
                            }
                        });
                    }
                });
            });
        }
    }))
})
