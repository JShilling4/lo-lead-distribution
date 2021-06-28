<template>
    <div></div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "Home",
    computed: {
        ...mapState(["userProfile"]),
    },
    mounted() {
        if (this.userProfile.session.isAdmin == true) {
            this.$router.replace("monitor");
        }
        if (this.userProfile.session.isAdmin == false) {
            this.$router.replace("leads");
        }
    },
};
</script>
