<template>
    <div class="stateSelect">
        <multi-select
            v-model="computedValue"
            :options="states"
            track-by="abbreviation"
            label="name"
            :searchable="true"
            :show-labels="false"
            :hide-selected="true"
            placeholder=""
        />
    </div>
</template>

<script>
export default {
    name: "StateSelect",
    props: {
        value: {
            type: [String, null],
            required: false,
        },
    },
    computed: {
        computedValue: {
            get() {
                return this.states.find(
                    (state) => state.abbreviation == this.value
                );
            },
            set(newValue) {
                this.localValue = newValue;
            },
        },
    },
    watch: {
        localValue() {
            this.$emit("stateChanged", this.localValue);
        },
    },
    components: {
        "multi-select": () =>
            import("@/components/Inputs/Multiselect/Multiselect"),
    },
    data() {
        return {
            localValue: "",
            states: [
                {
                    name: "Alabama",
                    abbreviation: "AL",
                },
                {
                    name: "Alaska",
                    abbreviation: "AK",
                },
                {
                    name: "Arizona",
                    abbreviation: "AZ",
                },
                {
                    name: "Arkansas",
                    abbreviation: "AR",
                },
                {
                    name: "California",
                    abbreviation: "CA",
                },
                {
                    name: "Colorado",
                    abbreviation: "CO",
                },
                {
                    name: "Connecticut",
                    abbreviation: "CT",
                },
                {
                    name: "Delaware",
                    abbreviation: "DE",
                },
                {
                    name: "District Of Columbia",
                    abbreviation: "DC",
                },
                {
                    name: "Florida",
                    abbreviation: "FL",
                },
                {
                    name: "Georgia",
                    abbreviation: "GA",
                },
                {
                    name: "Guam",
                    abbreviation: "GU",
                },
                {
                    name: "Hawaii",
                    abbreviation: "HI",
                },
                {
                    name: "Idaho",
                    abbreviation: "ID",
                },
                {
                    name: "Illinois",
                    abbreviation: "IL",
                },
                {
                    name: "Indiana",
                    abbreviation: "IN",
                },
                {
                    name: "Iowa",
                    abbreviation: "IA",
                },
                {
                    name: "Kansas",
                    abbreviation: "KS",
                },
                {
                    name: "Kentucky",
                    abbreviation: "KY",
                },
                {
                    name: "Louisiana",
                    abbreviation: "LA",
                },
                {
                    name: "Maine",
                    abbreviation: "ME",
                },
                {
                    name: "Maryland",
                    abbreviation: "MD",
                },
                {
                    name: "Massachusetts",
                    abbreviation: "MA",
                },
                {
                    name: "Michigan",
                    abbreviation: "MI",
                },
                {
                    name: "Minnesota",
                    abbreviation: "MN",
                },
                {
                    name: "Mississippi",
                    abbreviation: "MS",
                },
                {
                    name: "Missouri",
                    abbreviation: "MO",
                },
                {
                    name: "Montana",
                    abbreviation: "MT",
                },
                {
                    name: "Nebraska",
                    abbreviation: "NE",
                },
                {
                    name: "Nevada",
                    abbreviation: "NV",
                },
                {
                    name: "New Hampshire",
                    abbreviation: "NH",
                },
                {
                    name: "New Jersey",
                    abbreviation: "NJ",
                },
                {
                    name: "New Mexico",
                    abbreviation: "NM",
                },
                {
                    name: "New York",
                    abbreviation: "NY",
                },
                {
                    name: "North Carolina",
                    abbreviation: "NC",
                },
                {
                    name: "North Dakota",
                    abbreviation: "ND",
                },
                {
                    name: "Ohio",
                    abbreviation: "OH",
                },
                {
                    name: "Oklahoma",
                    abbreviation: "OK",
                },
                {
                    name: "Oregon",
                    abbreviation: "OR",
                },
                {
                    name: "Pennsylvania",
                    abbreviation: "PA",
                },
                {
                    name: "Puerto Rico",
                    abbreviation: "PR",
                },
                {
                    name: "Rhode Island",
                    abbreviation: "RI",
                },
                {
                    name: "South Carolina",
                    abbreviation: "SC",
                },
                {
                    name: "South Dakota",
                    abbreviation: "SD",
                },
                {
                    name: "Tennessee",
                    abbreviation: "TN",
                },
                {
                    name: "Texas",
                    abbreviation: "TX",
                },
                {
                    name: "Utah",
                    abbreviation: "UT",
                },
                {
                    name: "Vermont",
                    abbreviation: "VT",
                },
                {
                    name: "Virginia",
                    abbreviation: "VA",
                },
                {
                    name: "Virgin Islands",
                    abbreviation: "VI",
                },
                {
                    name: "Washington",
                    abbreviation: "WA",
                },
                {
                    name: "West Virginia",
                    abbreviation: "WV",
                },
                {
                    name: "Wisconsin",
                    abbreviation: "WI",
                },
                {
                    name: "Wyoming",
                    abbreviation: "WY",
                },
            ],
        };
    },
};
</script>

<style lang="scss" scoped></style>
