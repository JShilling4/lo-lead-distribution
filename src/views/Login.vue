<template>
    <div class="loginPage">
        <transition name="fadeInOut">
            <!-- Login form -->
            <form v-if="!impersonateContainerShowing" @submit.prevent="preLogin">
                <h1>Leads</h1>
                <div class="form-group">
                    <label for="username">User Name</label>
                    <text-input v-model="username.input" type="text" name="username" />
                    <span v-if="username.error != null" class="errorMessage">{{
                        username.error
                    }}</span>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <text-input v-model="password.input" type="password" name="password" />
                    <span v-if="password.error != null" class="errorMessage">{{
                        password.error
                    }}</span>
                </div>
                <app-button type="submit" class="btn btn-green" text="Log In" />
                <transition name="slide">
                    <div class="error"></div>
                </transition>
            </form>

            <!-- Impersonate form -->
            <form v-else class="impersonate-container">
                <h1>Login as?</h1>

                <div class="form-group">
                    <multi-select
                        v-model="selectedIdentity"
                        :options="localSession.loProfiles"
                        track-by="encompassID"
                        label="fullName"
                        :searchable="false"
                        :show-labels="false"
                        :hide-selected="true"
                        placeholder="Select Person"
                        class="impersonateSelector"
                    />
                    <span v-if="impersonateError != null" class="errorMessage">{{
                        impersonateError
                    }}</span>
                </div>

                <app-button
                    type="button"
                    class="btn btn-green"
                    text="Continue"
                    @click.native="selectImpersonation"
                />
            </form>
        </transition>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import api from "@/api";

export default {
    name: "Login",
    components: {
        "text-input": () => import("@/components/Inputs/TextInput"),
        "app-button": () => import("@/components/AppButton"),
        "multi-select": () => import("@/components/Inputs/Multiselect/Multiselect")
    },
    data() {
        return {
            username: {
                input: "",
                error: null
            },
            password: {
                input: "",
                error: null
            },
            loginIsValid: true,
            impersonateContainerShowing: false,
            localSession: null,
            selectedIdentity: {},
            impersonateError: null
        };
    },
    computed: {
        ...mapState(["userProfile"])
    },
    methods: {
        ...mapActions(["setUserProfile", "setAppLoading", "setSession"]),
        trimString(value) {
            return value.trim();
        },
        validateLogin() {
            this.loginIsValid = true;
            if (this.trimString(this.username.input) === "") {
                this.loginIsValid = false;
                this.username.error = "Please enter your username.";
            } else {
                this.username.error = null;
            }
            if (this.trimString(this.password.input) === "") {
                this.loginIsValid = false;
                this.password.error = "Please enter your password.";
            } else {
                this.password.error = null;
            }
        },
        async preLogin() {
            await this.validateLogin();
            if (this.loginIsValid) {
                this.setAppLoading(true);
                api.auth
                    .login({ userID: this.username.input, password: this.password.input })
                    .then(async response => {
                        const { data } = response;
                        this.setUserProfile(data);
                        // if this user is an LOA, set up the prompt for who they are logging in as
                        if (data.loProfiles.length > 0) {
                            this.localSession = JSON.parse(JSON.stringify({ ...data }));
                            if (this.localSession.canOriginate === true) {
                                this.selectedIdentity = {
                                    encompassID: this.localSession.session.encompassID,
                                    fullName: this.localSession.session.fullName,
                                    activeDirectoryID: this.localSession.session.activeDirectoryID
                                };
                            } else {
                                // dont allow them to login as self if they cant originate
                                this.selectedIdentity = null;
                            }
                            this.impersonateContainerShowing = true;
                        } else {
                            // this.$router.push("/").catch(error => console.log(error));
                            window.location.href = "/";
                        }
                        this.setAppLoading(false);
                    })
                    .catch(error => {
                        let errorText;
                        if (error?.response?.status == 400) {
                            errorText = error.response.data;
                        }
                        this.setAppLoading(false);
                        this.$notify({
                            group: "bottom-left",
                            title: "Login Failed",
                            text:
                                errorText ||
                                "There was a problem logging in. Please try again or contact the help desk.",
                            type: "error"
                        });
                    });
            }
        },

        async selectImpersonation() {
            this.impersonateError = null;
            this.setAppLoading(true);
            // validate lo select input before proceeding
            if (this.selectedIdentity !== null) {
                // if user is logging in as themselves
                if (this.selectedIdentity.encompassID == this.localSession.session.encompassID) {
                    // this.$router.push("/");
                    window.location.href = "/";
                } else {
                    // user is impersonating an LO
                    this.localSession.session.impersonatedLO = this.selectedIdentity;
                    api.auth
                        .setImpersonatedLoanOfficer(this.localSession.session)
                        .then(response => {
                            // tell the API that user is impersonating so session data can be updated
                            this.setSession(response.data);
                            // this.$router.push("/").catch(error => console.log(error));
                            window.location.href = "/";
                        })
                        .catch(error => {
                            let errorText;
                            if (error?.response?.status == 400) {
                                errorText = error.response.data;
                            }
                            this.$notify({
                                group: "bottom-left",
                                title: "Login Failed",
                                text:
                                    errorText ||
                                    `There was a problem logging in as ${this.selectedIdentity.fullName}. Please try again or contact the help desk.`,
                                type: "error"
                            });
                            this.impersonateContainerShowing = false;
                        });
                }
            } else {
                this.impersonateError = "A Loan officer is required.";
            }
            this.setAppLoading(false);
        }
    }
};
</script>

<style lang="scss" scoped>
.loginPage {
    height: 100vh;
    background-color: $lightGray;
    background-image: url("~@/assets/images/loginPage_bg.jpg");
    background-size: cover;
    background-repeat: no-repeat;
}
h1 {
    margin-bottom: 2rem;
    text-align: center;
    font-size: 3rem;
    color: $lightTeal;
}
form {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 37rem;
    padding: 2rem 6rem 2rem;
    background-color: #fff;
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.3);
    @include breakpoint(mobile) {
        width: 96%;
    }
    label {
        color: #333;
    }
    button {
        width: 15rem;
        display: block;
        margin: 3rem auto 2rem;
    }
    .error {
        position: absolute;
        bottom: 0rem;
        padding: 1rem 6rem 1rem 0;
        text-align: center;
        font-size: 1.4rem;
        color: $red;
        font-weight: 600;
    }
}

// TRANSITIONS
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
.slide-enter,
.slide-leave-to {
    transform: translateX(-3rem);
    opacity: 0;
}
</style>
