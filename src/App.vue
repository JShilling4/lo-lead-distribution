<template>
    <div
        id="app"
        v-if="!usingIE"
    >
        <notifications
            group="bottom-left"
            :duration="-1"
            position="bottom left"
        />
        <notifications
            group="top-center"
            :duration="-1"
            position="top center"
        />
        <transition name="fadeInOut">
            <loading-screen v-if="appIsLoading"></loading-screen>
        </transition>
        <nav-bar
            v-if="userProfile.session && navShouldShow"
            :is-admin="userProfile.session.isAdmin"
            @logout="logUserOut"
            @open-info-modal="infoModalShowing = true"
        />
        <transition name="fadeInOut">
            <router-view
                v-show="!appIsLoading"
                :info-modal-showing="infoModalShowing"
                @close-info-modal="infoModalShowing = false"
            />
        </transition>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import LoadingScreen from "@/components/Layout/LoadingScreen";

export default {
    name: "App",
    components: {
        "nav-bar": () => import("@/components/Layout/Navbar"),
        "loading-screen": LoadingScreen,
    },
    data() {
        return {
            infoModalShowing: false,
        };
    },
    computed: {
        ...mapState(["userProfile", "appIsLoading"]),
        navShouldShow() {
            if (this.$route.name !== "Login") {
                return true;
            }
            return false;
        },
        usingIE() {
            return /MSIE|Trident/.test(window.navigator.userAgent);
        },
    },
    methods: {
        ...mapActions(["logOut", "setUserProfile", "setAppLoading"]),
        logUserOut() {
            this.logOut(this.userProfile.session);
            this.$router.push("/login");
        },
    },
};
</script>

<style lang="scss">
@import "./scss/base/base";
@import "./scss/base/typography";
@import "~@/scss/components/forms";

.vue-notification {
    color: #333 !important;
    border: 1px solid #333;
    border-left-width: 5px;
    background-color: #fff !important;
    &.success {
        border-color: $lightTeal;
        .notification-title {
            color: $lightTeal;
        }
    }
    &.error {
        border-color: $red;
        .notification-title {
            color: $red;
        }
    }
    .notification-title {
        margin-bottom: 0.3rem;
        &:after {
            content: "X";
            position: absolute;
            right: 1.5rem;
            top: .5rem;
        }
    }
}
</style>
