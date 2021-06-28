import Vue from "vue";
import Vuex from "vuex";
import api from "@/api";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userProfile: {},
        appIsLoading: false,
        userIsValidated: false
    },
    mutations: {
        UPDATE_USER_PROFILE(state, data) {
            state.userProfile = data;
            state.userIsValidated = true;
            localStorage.setItem("wlv4", data.token.access_token);
        },
        UPDATE_SESSION(state, data) {
            state.userProfile.session = data;
        },
        SET_APP_LOADING(state, isLoading) {
            state.appIsLoading = isLoading;
        },
        SET_SESSION_START(state, timestamp) {
            state.userProfile.session.sessionStartDateTime = timestamp;
        },
        LOG_OUT(state) {
            state.userProfile = {};
            localStorage.removeItem("wlv4");
        }
    },
    actions: {
        setUserProfile({ commit }, data) {
            commit("UPDATE_USER_PROFILE", data);
        },
        setSession({ commit }, data) {
            commit("UPDATE_SESSION", data);
        },
        setAppLoading({ commit }, isLoading) {
            commit("SET_APP_LOADING", isLoading);
        },
        setsessionStart({ commit }, timestamp) {
            commit("SET_SESSION_START", timestamp);
        },
        validateToken({ commit, dispatch }, token) {
            dispatch("setAppLoading", true);
            return api.auth
                .validateToken(token)
                .then(response => {
                    dispatch("setSession", response.data);
                    dispatch("setAppLoading", false);
                    return response.data;
                })
                .catch(error => {
                    dispatch("setAppLoading", false);
                    commit("LOG_OUT");
                    console.log(error);
                });
        },
        logOut({ commit }, session) {
            api.auth
                .logout(session)
                .then(() => commit("LOG_OUT"))
                .catch(() => commit("LOG_OUT"));
        }
    }
});
