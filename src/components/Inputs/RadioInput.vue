<template>
    <div class="radio-group">
        <input
            type="radio"
            :checked="check == value"
            :name="name"
            :id="id"
            :disabled="isDisabled"
            @change="radioChanged($event)"
        />
        <label
            :for="labelFor"
            class="radio-label"
        >{{ label }}</label>
    </div>
</template>

<script>
export default {
    name: "RadioInput",
    props: {
        value: {
            type: [String, Number, Boolean],
            required: true,
        },
        check: {
            type: [String, Number, Boolean],
            required: true,
        },
        isDisabled: Boolean,
        name: String,
        label: String,
        id: String,
        labelFor: String,
    },
    computed: {},
    methods: {
        radioChanged() {
            this.$emit("input", this.check);
        },
    },
};
</script>

<style lang="scss" scoped>
label {
    font-weight: normal;
    margin: 1rem 2rem 0 0.5rem;
}
input {
    margin-right: 1rem;
}
.form-group {
    display: flex;
}
.radio-group {
    display: flex;
    align-items: center;
    input[type="radio"] {
        position: absolute;
        opacity: 0;
        z-index: 100;
        cursor: pointer;

        + .radio-label {
            &:before {
                content: "";
                background: #fff;
                border-radius: 100%;
                border: 1px solid $gray;
                display: inline-block;
                width: 12px;
                height: 12px;
                position: relative;
                top: 0;
                left: -4px;
                vertical-align: top;
                cursor: pointer;
                text-align: center;
                transition: all 250ms ease;
            }
        }

        &:checked {
            + .radio-label {
                &:before {
                    background-color: darken($lightTeal, 5%);
                    box-shadow: inset 0 0 0 3px #fff;
                }
            }
        }

        &:focus {
            + .radio-label {
                &:before {
                    outline: none;
                }
            }
        }
        + .radio-label {
            margin-top: 3px;
            cursor: pointer;
            &:empty {
                &:before {
                    margin-right: 0;
                }
            }
        }
    }
}
</style>
