<template>
    <div class="leadsPage">
        <page-heading heading="Leads Queue" />

        <div class="content-wrapper">
            <div class="timer-container">
                <div class="time-container">
                    <span class="timeLabel">Time remaining:</span>
                    <span v-if="!isNaN(sessionTimerMinutes)" class="time">{{
                        sessionTimerString
                    }}</span>
                </div>
                <app-button
                    classes="btn btn-orange"
                    text="Refresh"
                    @click.native="updateSessionStartDateTime"
                />
            </div>

            <!-- Leads Cards -->
            <div class="leadCards-container">
                <!-- Leads Today -->
                <div class="leadCard">
                    <h2 class="cardHeading">Leads Today</h2>
                    <div class="cardText leads">
                        <span class="text"
                            >All Zones: {{ leadAnalytics.leadCountToday }}</span
                        >
                    </div>
                </div>
                <!-- Leads Yesterday -->
                <div class="leadCard">
                    <h2 class="cardHeading">Leads Yesterday</h2>
                    <div class="cardText leads">
                        <span class="text"
                            >All Zones:
                            {{ leadAnalytics.leadCountYesterday }}</span
                        >
                    </div>
                </div>
                <!-- Web Lead Queue -->
                <div class="leadCard">
                    <h2 class="cardHeading">
                        <app-tooltip
                            icon-position="right"
                            tip-margin-bottom="6.5rem"
                            tip-text-color="#08485c"
                            tip-text="Your position is your place in the region lead queue made up of other loan officers in your region."
                        />
                        Your Position
                    </h2>
                    <div v-if="webLeadQueue" class="cardText position">
                        <span class="text">
                            {{ webLeadQueue.queuePosition }} of
                            {{ webLeadQueue.queueTotal }}
                        </span>
                    </div>
                    <app-button
                        v-else
                        classes="btn btn-white"
                        :text="
                            stateQueuesShowing ? 'Hide Queues' : 'Show Queues'
                        "
                        @click.native="stateQueuesShowing = !stateQueuesShowing"
                    />
                </div>
            </div>

            <!-- Consumer Direct Queues -->
            <div
                v-if="stateQueuesShowing"
                class="consumerDirectQueue-container"
            >
                <div
                    v-for="queue in consumerDirectQueues"
                    :key="queue.zoneNumber"
                    class="leadCard"
                >
                    <h2 class="cardHeading">{{ queue.zoneName }}</h2>
                    <div class="cardText position">
                        <span class="text"
                            >{{ queue.queuePosition }} /
                            {{ queue.queueTotal }}</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Lead Received Modal -->
        <app-modal
            ref="leadReceivedModal"
            class="leadReceivedModal"
            width="45rem"
            :is-loading="requestIsProcessing"
            :show="availableLeadModalShowing"
            :show-close-button="false"
            @close="availableLeadModalShowing = false"
        >
            <template v-slot:header>
                <h2 class="modalHeading">You have received a new lead!</h2>
                <span
                    v-if="leadOfferedInterval != null"
                    class="leadOfferedTimer"
                    >{{ leadOfferedTimerString }}</span
                >
            </template>

            <template v-slot:body>
                <p v-if="!availableLeadAccepted" class="bodyCopy">
                    Accept the lead to see contact details.
                </p>
                <div v-if="availableLeadAccepted" class="lead-details">
                    <p class="loanNumber">
                        {{ loQueueData[0].lead.loanNumber }}
                    </p>
                    <p>{{ loQueueData[0].lead.borrowerName }}</p>
                    <p>{{ loQueueData[0].lead.borrowerEmail }}</p>
                    <p>{{ loQueueData[0].lead.borrowerPhone }}</p>
                    <p class="bottomCopy">
                        You now have access to the file detailed above in the
                        Encompass Prospects folder. Act now to connect with this
                        customer!
                    </p>
                </div>

                <app-button
                    v-if="availableLeadAccepted"
                    text="Log out"
                    classes="btn btn-orange logOut"
                    @click.native="redirectToLogin"
                />
            </template>

            <template v-if="!availableLeadAccepted" v-slot:footer>
                <div class="controls">
                    <app-button
                        text="Accept"
                        classes="btn btn-green"
                        @click.native="acceptDeclineLead(true)"
                    />
                    <app-button
                        text="Decline"
                        classes="btn btn-red"
                        @click.native="acceptDeclineLead(false)"
                    />
                </div>
            </template>
        </app-modal>

        <!-- Page Info Modal -->
        <app-modal
            ref="pageInfoModal"
            class="pageInfoModal"
            width="45rem"
            :clickaway="true"
            :show="infoModalShowing"
            :show-close-button="true"
            @close="$emit('close-info-modal')"
        >
            <template v-slot:header>
                <h2 class="modalHeading">About Ruoff Leads</h2>
            </template>

            <template v-slot:body>
                <p class="bodyCopy">
                    Welcome to the Ruoff Leads site. Keep this page open for
                    your opportunity to receive a web lead. The leads are
                    assigned by matching the subject property Zip code to the
                    associated Region. Currently we are only allowing the
                    assignment of one lead per day. If you fail to act on your
                    lead in two hours it will be reassigned to the next Loan
                    Officer in the queue and you will not be able to receive
                    another lead for the day.
                </p>
            </template>
        </app-modal>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import api from "@/api";

export default {
    name: "Leads",
    components: {
        "app-button": () => import("@/components/AppButton"),
        "page-heading": () => import("@/components/Layout/PageHeading"),
        "app-modal": () => import("@/components/AppModal"),
        "app-tooltip": () => import("@/components/AppTooltip"),
    },
    props: {
        infoModalShowing: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // api data dumps
            leadAnalytics: {},
            loQueueData: [],

            // timers
            leadOfferedInterval: undefined,
            leadOfferedExpirationTime: undefined,
            leadOfferedTimer: undefined,

            sessionTimerInterval: undefined,
            sessionExpirationTime: undefined,
            sessionTimer: undefined,

            dataPollingInterval: undefined,

            // local state
            pageInfoModalShowing: true,
            availableLeadModalShowing: false,
            availableLeadAccepted: null,
            requestIsProcessing: false,
            stateQueuesShowing: false,
            restartSessionProcessing: false,
            getCurrentTimeRetries: 0,
            syncQueueDataRetries: 0,

            // constants
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    },

    computed: {
        ...mapState(["userProfile"]),
        // session timer
        sessionTimerMinutes() {
            return Math.floor(this.sessionTimer / 60);
        },
        sessionTimerSeconds() {
            const seconds = Math.floor(this.sessionTimer % 60);
            if (seconds < 10) {
                return `0${seconds}`;
            }
            return seconds;
        },
        sessionTimerString() {
            return `${this.sessionTimerMinutes}:${this.sessionTimerSeconds}`;
        },
        // lead offered timer
        leadOfferedStart() {
            return this.loQueueData[0].leadOfferedDateTime;
        },
        leadOfferedTimerMinutes() {
            return Math.floor((this.leadOfferedTimer / 60) % 60);
        },
        leadOfferedTimerSeconds() {
            const seconds = Math.floor(this.leadOfferedTimer % 60);
            if (seconds < 10) {
                return `0${seconds}`;
            }
            return seconds;
        },
        leadOfferedTimerString() {
            return `${this.leadOfferedTimerMinutes}:${this.leadOfferedTimerSeconds}`;
        },
        // Queue Cards
        consumerDirectQueues() {
            if (this.loQueueData.length > 0) {
                return this.loQueueData.filter(
                    (queue) => queue.zoneNumber > 20
                );
            }
            return [];
        },
        webLeadQueue() {
            if (this.loQueueData.length > 0) {
                return this.loQueueData.find((queue) => queue.zoneNumber < 20);
            }
            return false;
        },
    },

    watch: {
        // react to timer's expiring
        sessionTimer(value) {
            if (value && value <= 0) {
                this.redirectToLogin();
                // notify the user that their session expired
                this.$notify({
                    group: "bottom-left",
                    title: "Session Expired",
                    text: "Your queue session has expired. Please log in to re-enter the queue.",
                    type: "error",
                });
            }
        },
        leadOfferedTimer(value) {
            if (value && value <= 0) {
                // decline the lead and send to login because offer expired
                this.acceptDeclineLead(false, true);
                // notify the user that their lead offer has expired
                this.$notify({
                    group: "bottom-left",
                    title: "Lead Offer Expired",
                    text: "Your 10-minute lead offer timer has expired. Please log in to re-enter the queue.",
                    type: "error",
                });
            }
        },
    },

    methods: {
        ...mapActions(["setsessionStart", "logOut"]),

        // fetch & getters
        fetchLoQueueData() {
            const { encompassID } =
                this.userProfile.session.impersonatedLO != null
                    ? this.userProfile.session.impersonatedLO
                    : this.userProfile.session;
            api.leads
                .fetchLoanOfficerQueueData(encompassID)
                .then((response) => {
                    this.syncQueueDataRetries = 0;
                    this.loQueueData = response.data;
                    // check sessionStart timestamp, if different resync timer with new timestamp
                    if (
                        Math.trunc(
                            new Date(
                                this.userProfile.session.sessionStartDateTime
                            ) / 1000
                        ) !=
                        Math.trunc(
                            new Date(
                                this.loQueueData[0].sessionStartDateTime.split(
                                    "."
                                )[0]
                            ) / 1000
                        )
                    ) {
                        this.setsessionStart(
                            this.loQueueData[0].sessionStartDateTime
                        );
                        this.loadSessionStartTimestamp();
                        this.$notify({
                            group: "top-center",
                            title: "Session Refreshed",
                            text: "Your session was refreshed from another device.",
                            type: "success",
                        });
                    }
                    // check for offered lead & handle
                    const lead = this.loQueueData.find(
                        (queue) => queue.isLeadOffered
                    );
                    if (lead) {
                        if (lead.leadOfferedDateTime !== null) {
                            this.availableLeadModalShowing = true;
                            this.startLeadOfferedTimer();
                        }
                    }
                })
                .catch((error) => {
                    let errorText;
                    if (error?.response?.status == 400) {
                        errorText = error.response.data;
                        this.handleSyncQueueDataFailure(errorText);
                    } else if (this.syncQueueDataRetries < 3) {
                        this.syncQueueDataRetries++;
                    } else {
                        this.handleSyncQueueDataFailure(errorText);
                    }
                });
        },

        startDataPolling() {
            // poll the data needed for the page
            clearInterval(this.dataPollingInterval);
            this.dataPollingInterval = setInterval(() => {
                this.fetchLoQueueData();
            }, 15000);
        },

        getCurrentTime() {
            if (this.timezone) {
                // useing Time API endpoint on RuoffAPI
                return api.leads
                    .fetchCurrentDatetime(this.timezone)
                    .then((response) => {
                        let now = response.data.ISO8601;
                        now = Math.trunc(new Date(now).getTime() / 1000);
                        this.getCurrentTimeRetries = 0;
                        return now;
                    })
                    .catch(() => {
                        if (this.getCurrentTimeRetries < 3) {
                            setTimeout(() => {
                                this.getCurrentTime();
                                this.getCurrentTimeRetries++;
                            }, 1000);
                        }
                    });
            } else {
                this.$notify({
                    group: "bottom-left",
                    title: "Request Failed",
                    text: "Failed to retrieve time zone.",
                    type: "error",
                });
                this.redirectToLogin();
            }
        },

        // data mutations
        async updateSessionStartDateTime() {
            if (!this.restartSessionProcessing) {
                this.restartSessionProcessing = true;
                api.leads
                    .updateSessionStartDateTime(this.userProfile.session)
                    .then(async (response) => {
                        this.restartSessionProcessing = false;
                        const { sessionStartDateTime } = response.data;
                        await this.setsessionStart(sessionStartDateTime);
                        this.loadSessionStartTimestamp();
                    })
                    .catch(() => {
                        this.restartSessionProcessing = false;
                    });
            }
        },

        acceptDeclineLead(isAccepted, isExpired = false) {
            this.requestIsProcessing = true;
            // stop our timer intervals
            clearInterval(this.sessionTimerInterval);
            clearInterval(this.dataPollingInterval);
            clearInterval(this.leadOfferedInterval);
            // make the API request
            api.leads
                .acceptOrDeclineLead({
                    session: this.userProfile.session,
                    loanNumber: this.loQueueData[0].lead.loanNumber,
                    isAccepted,
                    isExpired,
                })
                .then(async () => {
                    this.requestIsProcessing = false;
                    if (isAccepted) {
                        this.availableLeadAccepted = true;
                    } else {
                        // lead was declined
                        this.$router.push("/login");
                    }
                })
                .catch((error) => {
                    this.requestIsProcessing = false;
                    this.logOut(this.userProfile.session);
                    let errorText;
                    if (error?.response?.status == 400) {
                        errorText = error.response.data;
                    }
                    this.$notify({
                        group: "bottom-left",
                        title: "Request Failed",
                        text:
                            errorText ||
                            "There was a problem accepting the lead. Please log in and try again.",
                        type: "error",
                    });
                    this.$router.push("/login");
                });
        },

        // triggers
        openLeadReceivedModal() {
            if (this.availableLeadAccepted === null) {
                this.availableLeadModalShowing = true;
                clearInterval(this.sessionTimerInterval);
            }
        },

        async redirectToLogin() {
            if (this.$router.currentRoute.path !== "/login") {
                await this.logOut(this.userProfile.session);
                // stop our timer intervals
                clearInterval(this.sessionTimerInterval);
                clearInterval(this.dataPollingInterval);
                clearInterval(this.leadOfferedInterval);
                clearInterval(this.timerDriftCheckInterval);
                this.$router.push("/login");
            }
        },

        handleSyncQueueDataFailure(errorText) {
            this.syncQueueDataRetries = 0;
            this.$notify({
                group: "bottom-left",
                title: "Request Failed",
                text:
                    errorText ||
                    "Failed to fetch queue data. This could have been a network issue or your session ended from another source.",
                type: "error",
            });
            this.redirectToLogin();
        },

        startTimerDriftCheck() {
            clearInterval(this.timerDriftCheckInterval);
            let lastTime = new Date().getTime();
            this.timerDriftCheckInterval = setInterval(() => {
                var currentTime = new Date().getTime();
                if (currentTime > lastTime + 2000 * 2) {
                    // Just woke up or significant drift so restart intervals if they are running
                    if (this.sessionTimerInterval) {
                        this.startSessionTimer();
                    }
                    if (this.leadOfferedInterval) {
                        setTimeout(() => {
                            this.startLeadOfferedTimer();
                        }, 2000);
                    }
                }
                lastTime = currentTime;
            }, 2000);
        },

        async startSessionTimer() {
            clearInterval(this.sessionTimerInterval);
            const now = await this.getCurrentTime();
            if (now) {
                const expirationTime = Math.trunc(
                    this.sessionExpirationTime / 1000
                );
                this.sessionTimer = expirationTime - now;
                this.sessionTimerInterval = setInterval(() => {
                    this.sessionTimer -= 1;
                }, 1000);

                if (!this.timerDriftCheckInterval) {
                    this.startTimerDriftCheck();
                }
            } else {
                // we didnt get a proper response back from getCurrentTime(), wait 1 second and try again
                setTimeout(() => {
                    this.startSessionTimer();
                }, 1000);
            }
        },

        async loadSessionStartTimestamp() {
            let timestamp;
            await api.leads
                .convertToTimezone({
                    timestamp: this.userProfile.session.sessionStartDateTime,
                    timezone: this.timezone,
                })
                .then((response) => {
                    timestamp = new Date(response.data.ISO8601);
                })
                .catch(() => {});
            this.sessionExpirationTime = timestamp.setMinutes(
                timestamp.getMinutes() + 60
            );
            this.startSessionTimer();
        },

        async startLeadOfferedTimer() {
            // stop polling so we dont get conflicting data while waiting for accept/decline
            clearInterval(this.dataPollingInterval);
            // stop our session timer so user doesnt get booted to login before making a decision
            clearInterval(this.sessionTimerInterval);
            clearInterval(this.leadOfferedInterval);

            // fire up the lead offered timer
            let timestamp;
            await api.leads
                .convertToTimezone({
                    timestamp: this.leadOfferedStart,
                    timezone: this.timezone,
                })
                .then((response) => {
                    timestamp = new Date(response.data.ISO8601);
                })
                .catch(() => {});
            this.leadOfferedExpirationTime = timestamp.setMinutes(
                timestamp.getMinutes() + 10
            );
            const expirationTime = Math.trunc(
                this.leadOfferedExpirationTime / 1000
            );
            const now = await this.getCurrentTime();
            this.leadOfferedTimer = expirationTime - now;
            this.leadOfferedInterval = setInterval(() => {
                this.leadOfferedTimer -= 1;
            }, 1000);

            if (!this.timerDriftCheckInterval) {
                this.startTimerDriftCheck();
            }
        },
    },

    async mounted() {
        /*
         *  Determine if we are starting the queue for the logged in user (LOA who can originate)
         *  or an LO that they assist
         */
        const { impersonatedLO } = this.userProfile.session;
        // get the ID
        const id =
            impersonatedLO !== null
                ? impersonatedLO.encompassID
                : this.userProfile.session.encompassID;

        await api.leads.addLoanOfficerToQueue(id).catch((error) => {
            // redirect them to login if add to queue fails, because they cant get a lead now
            let errorText;
            if (error?.response?.status == 400) {
                errorText = error.response.data;
            }
            this.$notify({
                group: "bottom-left",
                title: "Request Failed",
                text:
                    errorText ||
                    "The system failed to add you to the lead queue. Please log in and try again or contact the help desk",
                type: "error",
            });
            this.$router.push("/login");
        });
        // only start timer if we have the session data
        this.loadSessionStartTimestamp();
        this.fetchLoQueueData();
        this.startDataPolling();
        // fetch the data needed for the page
        api.leads
            .fetchLeadAnalytics()
            .then((response) => {
                if (response) {
                    this.leadAnalytics = response.data;
                }
            })
            .catch(() => {});
    },

    beforeDestroy() {
        // stop our timer intervals
        clearInterval(this.sessionTimerInterval);
        clearInterval(this.dataPollingInterval);
        clearInterval(this.leadOfferedInterval);
        clearInterval(this.timerDriftCheckInterval);
    },
};
</script>

<style lang="scss" scoped>
.leadsPage {
    min-height: calc(100vh - 113px);
}

.content-wrapper {
    padding: 12rem 4rem 6rem;
    max-width: 1200px;
    margin: 0 auto;
    @include breakpoint(tablet-land) {
        padding-top: 2rem;
    }
}

.timer-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 0 6rem 6rem;
    font-size: 2.5rem;
    font-weight: 600;
    color: $blueGreen;
    @include breakpoint(tablet-land) {
        margin-top: 6rem;
    }
    @include breakpoint(tablet-port) {
        font-size: 2rem;
    }
    @include breakpoint(mobile) {
        margin: 4rem 0;
        flex-direction: column;
    }
    .time-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-bottom: 1rem;
        span {
            display: inline-block;
        }
        .timeLabel {
            margin-bottom: 4px;
        }
        .time {
            color: $blueGreen;
            margin: 0 0 0 1rem;
        }
    }
    .btn {
        margin-left: 2rem;
        width: 13rem;
        @include breakpoint(mobile) {
            margin: 2rem 0 0;
        }
    }
}

.leadCards-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6rem;
    @include breakpoint(tablet-land) {
        flex-direction: column;
        align-items: center;
    }
}

.consumerDirectQueue-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .leadCard {
        margin: 0 2rem 2rem;
        min-width: 20rem;
    }
}

.leadCard {
    min-height: 180px;
    width: 30rem;
    padding: 2rem 2rem 3rem;
    background: linear-gradient($lightTeal, $darkTeal);
    border-radius: 5px;
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.3);
    @include breakpoint(ipadPro) {
        width: 22rem;
    }
    @include breakpoint(tablet-land) {
        width: 30rem;
        margin-bottom: 2rem;
    }

    .cardHeading {
        position: relative;
        text-align: center;
        font-weight: 600;
        color: #fff;
        @include breakpoint(ipadPro) {
            font-size: 2.2rem;
        }
        &:after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -1rem;
            height: 2px;
            background-color: rgba(255, 255, 255, 0.432);
            width: 100%;
        }
    }

    .cardText {
        margin: 4rem 0 0 0;
        text-align: center;
        font-size: 2rem;
        color: #fff;
        @include breakpoint(ipadPro) {
            font-size: 1.8rem;
        }
        &.leads {
            margin-top: 5rem;
        }
        &.position {
            font-size: 5rem;
            @include breakpoint(ipadPro) {
                font-size: 4.2rem;
            }
        }
    }

    .btn {
        display: block;
        margin: 4rem auto 0;
    }
}

// Modals
.pageInfoModal {
    ::v-deep {
        .modal__header {
            .modalHeading {
                color: $lightTeal;
            }
        }
        .modal__body {
            margin: 2rem 0 0;
        }
    }
    .bodyCopy {
        color: $darkGray;
        line-height: 1.75;
    }
}

.leadReceivedModal {
    ::v-deep {
        .modal__header {
            display: block;
            text-align: center;
            .modalHeading {
                color: $blueGreen;
            }
            .leadOfferedTimer {
                display: block;
                margin-top: 2rem;
                font-size: 2.6rem;
                font-weight: 600;
                color: $orange;
            }
        }
        .modal__body {
            margin: 2rem 0 0;
        }
    }
    .bodyCopy {
        text-align: center;
        color: $darkGray;
    }
    .lead-details {
        p {
            text-align: center;
            color: $lightTeal;
            font-weight: 500;
            &:not(:last-child) {
                margin-bottom: 1rem;
            }
            &.loanNumber {
                font-weight: 600;
                font-size: 2rem;
            }
            &.bottomCopy {
                margin-top: 2rem;
                color: $blueGreen;
                padding: 0 1rem;
            }
        }
    }
    .controls {
        display: flex;
        justify-content: center;
        margin: 3rem 0 0;
        .btn {
            margin: 0 2rem;
        }
    }
    .btn.logOut {
        width: 15rem;
        margin: 3rem auto 0;
    }
}
</style>
