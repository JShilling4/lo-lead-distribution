<template>
    <div class="404">
        <page-heading heading="404 Not Found" />
        <div class="message-container">
            <h1 class="message">
                The page you are looking for could not be found.
            </h1>
            <app-button
                text="Back Home"
                classes="btn btn-orange"
                @click.native="$router.replace('/')"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "NotFound",
    components: {
        "app-button": () => import("@/components/AppButton"),
        "page-heading": () => import("@/components/Layout/PageHeading"),
    },
};
</script>

<style lang="scss" scoped>
.message-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);

    .message {
        margin-bottom: 4rem;
        padding: 0 2rem;
        text-align: center;
        color: $blueGreen;
    }
    .btn {
        display: block;
        margin: 0 auto;
    }
}
</style>
