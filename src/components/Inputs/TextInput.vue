<template>
    <input
        class="textInput"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :value="value"
        :disabled="isDisabled"
        @input="$emit('input', $event.target.value)"
    />
</template>

<script>
export default {
    name: "TextInput",
    props: {
        value: [String, Number],
        type: {
            type: String,
            default: "text",
        },
        name: {
            type: String,
            default: "",
        },
        placeholder: {
            type: String,
            default: "",
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss" scoped>
.textInput {
    background-color: #fff;
    outline: none;
    &:focus {
        border: 1px solid $lightTeal;
    }
}
</style>
