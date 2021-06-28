<template>
    <div class="monitorPage">
        <page-heading heading="Monitor Leads" />

        <div class="content-wrapper">
            <section class="top-content-container">
                <div class="zone-display">
                    <!-- Zone selector -->
                    <div class="form-group zoneSelector">
                        <!-- <label for="">Zone</label> -->
                        <multi-select
                            v-model="selectedZone"
                            :options="zones"
                            track-by="zoneNumber"
                            :custom-label="customZoneLabel"
                            :searchable="true"
                            :show-labels="false"
                            :hide-selected="true"
                            placeholder="Select a zone"
                            class="zoneSelector"
                            @input="fetchLeadsAndSessionsByZone()"
                        />
                    </div>

                    <!-- Filters -->
                    <section class="filters">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Filters</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="filtersShowing ? 'Hide' : 'Show'"
                                @click.native="filtersShowing = !filtersShowing"
                            />
                        </div>
                        <transition name="table">
                            <div
                                v-if="filtersShowing"
                                class="filter-container"
                            >
                                <!-- Date Range -->
                                <div class="dateRange-container">
                                    <div class="form-group">
                                        <label>Leads From</label>
                                        <date-picker
                                            :no-value-to-custom-elem="true"
                                            :no-button-now="true"
                                            :no-button="true"
                                            color="#08485c"
                                            v-model="leadsDateRange.fromDate"
                                            :only-date="true"
                                            format="YYYY-MM-DD"
                                            :auto-close="true"
                                        >
                                            <button class="pickerTrigger">
                                                {{ leadsDateRange.fromDate }}
                                            </button>
                                        </date-picker>
                                    </div>
                                    <div class="form-group">
                                        <label>Leads To</label>
                                        <date-picker
                                            :no-value-to-custom-elem="true"
                                            :no-button-now="true"
                                            :no-button="true"
                                            color="#08485c"
                                            v-model="leadsDateRange.toDate"
                                            :only-date="true"
                                            format="YYYY-MM-DD"
                                            :auto-close="true"
                                        >
                                            <button class="pickerTrigger">
                                                {{ leadsDateRange.toDate }}
                                            </button>
                                        </date-picker>
                                    </div>
                                </div>
                                <app-button
                                    text="Submit"
                                    classes="btn btn-orange filterSubmit"
                                    @click.native="setLeadsFilterAndFetch()"
                                />
                            </div>
                        </transition>
                    </section>

                    <!-- Zone Queue Table -->
                    <div class="zoneQueue-table">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Zone Queue</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="zoneQueueShowing ? 'Hide' : 'Show'"
                                @click.native="zoneQueueShowing = !zoneQueueShowing"
                            />
                        </div>

                        <transition
                            name="table"
                            mode="out-in"
                        >
                            <vue-good-table
                                v-if="zoneQueueShowing && !loadingFromApi"
                                :columns="zoneQueueTableColumns"
                                :rows="zoneSessions"
                                style-class="vgt-table"
                                :pagination-options="{
                                    enabled: true,
                                    mode: 'records',
                                    perPage: 10
                                }"
                            >
                                <template
                                    slot="table-row"
                                    slot-scope="props"
                                >
                                    <!-- EncompassID -->
                                    <span
                                        v-if="props.column.field == 'encompassID'"
                                        class="username"
                                        @click="selectLoanOfficerHistory(props.row)"
                                    >
                                        {{ props.row.encompassID }}
                                    </span>
                                    <!-- SessionStart -->
                                    <span v-else-if="props.column.field == 'sessionStartDateTime'">
                                        {{
                                            formatDate(
                                                props.row.sessionStartDateTime,
                                                "MM/DD/YY h:mm a"
                                            )
                                        }}
                                    </span>
                                    <!-- Arrow Controls -->
                                    <span
                                        v-else-if="props.column.field == 'positionControls'"
                                        class="position-controls"
                                    >
                                        <span
                                            v-if="arrowShouldShow('down', props.row)"
                                            class="downPosition"
                                            @click="
                                                changequeuePosition(
                                                    props.row.encompassID,
                                                    props.row.zoneNumber,
                                                    1
                                                )
                                            "
                                        ></span>
                                        <span
                                            v-if="arrowShouldShow('up', props.row)"
                                            class="upPosition"
                                            @click="
                                                changequeuePosition(
                                                    props.row.encompassID,
                                                    props.row.zoneNumber,
                                                    -1
                                                )
                                            "
                                        ></span>
                                    </span>
                                    <!-- Fall back to default -->
                                    <span v-else>
                                        {{ props.formattedRow[props.column.field] }}
                                    </span>
                                </template>
                            </vue-good-table>
                            <div
                                v-if="loadingFromApi"
                                class="tableLoading"
                            >
                                Loading data...
                            </div>
                        </transition>
                    </div>

                    <!-- Zone Config -->
                    <section class="zone-configuration">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Manage Zones</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="manageZonesShowing ? 'Hide' : 'Show'"
                                @click.native="manageZonesShowing = !manageZonesShowing"
                            />
                        </div>

                        <transition name="table">
                            <div
                                v-if="manageZonesShowing"
                                class="section-content"
                            >
                                <div class="column-labels">
                                    <span class="name">Zone Name</span>
                                    <span class="dailyLeads">Daily Leads</span>
                                </div>

                                <div
                                    v-for="(zone, index) in configurableZones"
                                    :key="zone.zoneNumber"
                                >
                                    <div
                                        v-if="zone.zoneNumber < 20"
                                        class="zone"
                                    >
                                        <span class="name">{{ zone.zoneName }}</span>
                                        <text-input
                                            class="dailyLeads"
                                            v-model="localZones[index + 1].leadQuota"
                                        />
                                        <app-button
                                            :classes="
                                                localZones[index + 1].leadQuota !=
                                                zones[index + 1].leadQuota
                                                    ? 'btn btn-green'
                                                    : 'btn btn-orange'
                                            "
                                            text="Save"
                                            @click.native="saveZoneConfig(localZones[index + 1])"
                                        />

                                        <div class="counties">
                                            <p>Counties</p>
                                            <span
                                                v-for="(county, index) in zone.counties"
                                                :key="index"
                                                class="county"
                                            >
                                                {{ county }}<span v-if="index !== zone.counties.length - 1">,</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </section>
                </div>

                <!-- Leads Tables -->
                <div class="leads-container">
                    <!-- Assigned Leads Table -->
                    <div class="assigned-leads">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Assigned Leads</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="assignedLeadsShowing ? 'Hide' : 'Show'"
                                @click.native="assignedLeadsShowing = !assignedLeadsShowing"
                            />
                        </div>
                        <transition
                            name="table"
                            mode="out-in"
                        >
                            <vue-good-table
                                v-if="assignedLeadsShowing && !loadingFromApi"
                                :columns="assignedLeadTableColumns"
                                :rows="assignedLeads"
                                style-class="vgt-table"
                                :pagination-options="{
                                    enabled: true,
                                    mode: 'records',
                                    perPage: 10
                                }"
                            >
                                <template
                                    slot="table-row"
                                    slot-scope="props"
                                >
                                    <span v-if="props.column.field == 'loanNumber'">
                                        <span
                                            class="loanNumber"
                                            @click="selectLead(props.row)"
                                        >{{
                                            props.row.loanNumber
                                        }}</span>
                                    </span>
                                    <span v-else-if="props.column.field == 'loanAddedDateTime'">
                                        {{ formatDate(props.row.loanAddedDateTime, "MM/DD/YYYY") }}
                                    </span>
                                    <span v-else-if="props.column.field == 'zoneName'">
                                        {{ props.row.zoneNumber }} - {{ props.row.zoneName }}
                                    </span>
                                    <span v-else>
                                        {{ props.formattedRow[props.column.field] }}
                                    </span>
                                </template>
                            </vue-good-table>
                            <div
                                v-if="loadingFromApi"
                                class="tableLoading"
                            >
                                Loading data...
                            </div>
                        </transition>
                    </div>

                    <!-- Unassigned Leads Table -->
                    <div class="unassigned-leads">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Unassigned Leads</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="unassignedLeadsShowing ? 'Hide' : 'Show'"
                                @click.native="unassignedLeadsShowing = !unassignedLeadsShowing"
                            />
                        </div>
                        <transition
                            name="table"
                            mode="out-in"
                        >
                            <vue-good-table
                                v-if="unassignedLeadsShowing && !loadingFromApi"
                                :columns="unassignedLeadTableColumns"
                                :rows="unassignedLeads"
                                style-class="vgt-table"
                                :pagination-options="{
                                    enabled: true,
                                    mode: 'records',
                                    perPage: 10
                                }"
                            >
                                <template
                                    slot="table-row"
                                    slot-scope="props"
                                >
                                    <span v-if="props.column.field == 'loanNumber'">
                                        <span
                                            class="loanNumber"
                                            @click="selectLead(props.row)"
                                        >{{
                                            props.row.loanNumber
                                        }}</span>
                                    </span>
                                    <span v-else-if="props.column.field == 'loanAddedDateTime'">
                                        {{ formatDate(props.row.loanAddedDateTime, "MM/DD/YYYY") }}
                                    </span>
                                    <span v-else-if="props.column.field == 'zoneName'">
                                        {{ props.row.zoneNumber }} - {{ props.row.zoneName }}
                                    </span>
                                    <span v-else>
                                        {{ props.formattedRow[props.column.field] }}
                                    </span>
                                </template>
                            </vue-good-table>
                            <div
                                v-if="loadingFromApi"
                                class="tableLoading"
                            >
                                Loading data...
                            </div>
                        </transition>
                    </div>

                    <!-- Leads w/ errors Table -->
                    <div class="error-leads">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Leads w/ Errors</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="leadsWithErrorsShowing ? 'Hide' : 'Show'"
                                @click.native="leadsWithErrorsShowing = !leadsWithErrorsShowing"
                            />
                        </div>

                        <transition
                            name="table"
                            mode="out-in"
                        >
                            <vue-good-table
                                v-if="leadsWithErrorsShowing && !loadingFromApi"
                                :columns="leadsWithErrorsTableColumns"
                                :rows="leadsWithErrors"
                                style-class="vgt-table"
                                :pagination-options="{
                                    enabled: true,
                                    mode: 'records',
                                    perPage: 10
                                }"
                            >
                                <template
                                    slot="table-row"
                                    slot-scope="props"
                                >
                                    <span v-if="props.column.field == 'loanNumber'">
                                        <span
                                            class="loanNumber"
                                            @click="selectLead(props.row)"
                                        >{{
                                            props.row.loanNumber
                                        }}</span>
                                    </span>
                                    <span v-else-if="props.column.field == 'loanAddedDateTime'">
                                        {{ formatDate(props.row.loanAddedDateTime, "MM/DD/YYYY") }}
                                    </span>
                                    <span v-else>
                                        {{ props.formattedRow[props.column.field] }}
                                    </span>
                                </template>
                            </vue-good-table>
                            <div
                                v-if="loadingFromApi"
                                class="tableLoading"
                            >
                                Loading data...
                            </div>
                        </transition>
                    </div>

                    <!-- Lead History Table -->
                    <div class="lead-history">
                        <div class="blockHeading-container">
                            <h2 class="blockHeading">Lead History</h2>
                            <app-button
                                classes="btn btn-blue"
                                :text="leadHistoryShowing ? 'Hide' : 'Show'"
                                @click.native="leadHistoryShowing = !leadHistoryShowing"
                            />
                        </div>

                        <transition
                            name="table"
                            mode="out-in"
                        >
                            <vue-good-table
                                v-if="leadHistoryShowing && !loadingFromApi"
                                :columns="leadHistoryTableColumns"
                                :rows="leadHistory"
                                style-class="vgt-table"
                                :pagination-options="{
                                    enabled: true,
                                    mode: 'pages',
                                    perPage: 10
                                }"
                                :search-options="{
                                    enabled: true,
                                    skipDiacritics: true
                                }"
                            >
                                <template
                                    slot="table-row"
                                    slot-scope="props"
                                >
                                    <span v-if="props.column.field == 'eventDateTime'">
                                        {{
                                            formatDate(
                                                props.row.eventDateTime,
                                                "MM/DD/YYYY h:mm:ss a"
                                            )
                                        }}
                                    </span>
                                    <span v-else>
                                        {{ props.formattedRow[props.column.field] }}
                                    </span>
                                </template>
                            </vue-good-table>
                            <div
                                v-if="loadingFromApi"
                                class="tableLoading"
                            >
                                Loading data...
                            </div>
                        </transition>
                    </div>
                </div>
            </section>

            <!-- LO History Modal -->
            <app-modal
                classes="leadsClaimed-modal"
                width="40rem"
                :show="loHistoryModalShowing"
                :clickaway="true"
                @close="loHistoryModalShowing = false"
            >
                <template v-slot:header>
                    <h2 class="modalHeading">{{ selectedSession.encompassID }}</h2>
                </template>

                <template v-slot:body>
                    <div class="column-labels">
                        <span class="label">Loan #</span>
                        <span class="label">Date Claimed</span>
                    </div>

                    <div class="loanList">
                        <div
                            v-for="lead in selectedSession.leadsClaimed"
                            :key="lead.loanNumber"
                            class="loan"
                        >
                            <span>{{ lead.loanNumber }}</span>
                            <span>{{ formatDate(lead.claimedDateTime, "MM/DD/YY h:mm a") }}</span>
                        </div>
                    </div>
                </template>
            </app-modal>

            <!-- Lead Detail Modal -->
            <app-modal
                classes="leadDetail-modal"
                width="38rem"
                :show="leadDetailModalShowing"
                :is-loading="leadDetailModalLoading"
                :clickaway="true"
                @close="closeLeadDetailModal"
            >
                <template v-slot:header>
                    <h1 class="modalHeading">Loan #{{ selectedLead.loanNumber }}</h1>
                </template>

                <template v-slot:body>
                    <!-- Is a web lead? -->
                    <div class="form-group">
                        <label for="">Is this a web lead?</label>
                        <div class="input-group">
                            <radio-input
                                :check="true"
                                label="Yes"
                                labelFor="webLeadYes"
                                v-model="selectedLead.isWebLead"
                                name="isWebLead"
                                id="webLeadYes"
                            />
                            <radio-input
                                :check="false"
                                label="No"
                                labelFor="webLeadNo"
                                name="isWebLead"
                                v-model="selectedLead.isWebLead"
                                id="webLeadNo"
                            />
                        </div>
                    </div>
                    <!-- LO Selector -->
                    <div
                        v-if="selectedLead.zoneNumber !== -1"
                        class="form-group loSelector"
                    >
                        <label class="value">Loan Officer:</label>
                        <multi-select
                            v-model="selectedLead.loanOfficer"
                            :options="loanOfficersByWebLead"
                            track-by="encompassID"
                            label="fullName"
                            :show-labels="false"
                            placeholder="Select a loan officer"
                            :typeahead="true"
                        />
                    </div>
                    <!-- Property City & State -->
                    <div class="inline-form-group">
                        <div class="form-group">
                            <label for="propertyCity">City</label>
                            <text-input
                                v-model="selectedLead.propertyCity"
                                type="text"
                                name="propertyCity"
                                id="propertyCity"
                            />
                            <div
                                v-if="cityError !== null"
                                class="validationError"
                            >
                                {{ cityError }}
                            </div>
                        </div>
                        <!-- Property State -->
                        <div class="form-group propertyState">
                            <label for="propertyState">State</label>
                            <state-select
                                v-model="selectedLead.propertyState"
                                @stateChanged="stateChanged"
                            />
                            <div
                                v-if="stateError != null"
                                class="validationError"
                            >
                                {{ stateError }}
                            </div>
                        </div>
                        <!-- Property State -->
                    </div>
                    <!-- Lead Claimed -->
                    <div class="form-group leadClaimed">
                        <label>Lead Claimed:</label>
                        <span :class="[
                                'value',
                                'isClaimed',
                                selectedLead.isClaimed ? 'claimed' : 'unclaimed'
                            ]">{{ selectedLead.isClaimed }}</span>
                    </div>
                    <div class="modalControls">
                        <app-button
                            classes="btn btn-orange"
                            text="Save Changes"
                            @click.native="saveLeadChanges(true)"
                        />
                        <!-- <app-button
              classes="btn btn-red removeLead"
              text="Not a Weblead"
              @click.native="saveLeadChanges(false)"
            /> -->
                    </div>
                </template>
            </app-modal>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import api from "@/api";
import moment from "moment";
import "@/scss/vendor/vue-ctk-date-time-picker";

export default {
    name: "Monitor",

    components: {
        "page-heading": () => import("@/components/Layout/PageHeading"),
        "multi-select": () =>
            import("@/components/Inputs/Multiselect/Multiselect"),
        "text-input": () => import("@/components/Inputs/TextInput"),
        "radio-input": () => import("@/components/Inputs/RadioInput"),
        "state-select": () => import("@/components/Inputs/StateSelect"),
        "app-button": () => import("@/components/AppButton"),
        "app-modal": () => import("@/components/AppModal"),
        "vue-good-table": () => import("@/components/Table/Table"),
        "date-picker": () => import("vue-ctk-date-time-picker"),
    },

    data() {
        return {
            // Table columns
            zoneQueueTableColumns: [
                {
                    label: "Zone Name",
                    field: "zoneName",
                },
                {
                    label: "Username",
                    field: "encompassID",
                },
                {
                    label: "Session Start",
                    field: "sessionStartDateTime",
                },
                {
                    label: "",
                    field: "positionControls",
                    thClass: "vgt-center-align",
                    tdClass: "vgt-center-align",
                },
            ],
            assignedLeadTableColumns: [
                {
                    label: "Loan #",
                    field: "loanNumber",
                },
                {
                    label: "Loan Officer",
                    field: "loanOfficer.fullName",
                },
                {
                    label: "Borrower Name",
                    field: "borrowerName",
                },
                {
                    label: "Added",
                    field: "loanAddedDateTime",
                },
                {
                    label: "Zone",
                    field: "zoneName",
                },
            ],
            unassignedLeadTableColumns: [
                {
                    label: "Loan #",
                    field: "loanNumber",
                },
                {
                    label: "Borrower Name",
                    field: "borrowerName",
                },
                {
                    label: "Added",
                    field: "loanAddedDateTime",
                },
                {
                    label: "Zone",
                    field: "zoneName",
                },
            ],
            leadsWithErrorsTableColumns: [
                {
                    label: "Loan #",
                    field: "loanNumber",
                },
                {
                    label: "Added",
                    field: "loanAddedDateTime",
                },
                {
                    label: "State",
                    field: "propertyState",
                },
                {
                    label: "City",
                    field: "propertyCity",
                },
                {
                    label: "Zip",
                    field: "propertyZip",
                    thClass: "vgt-center-align",
                    tdClass: "vgt-center-align",
                },
            ],
            leadHistoryTableColumns: [
                {
                    label: "Loan #",
                    field: "loanNumber",
                },
                {
                    label: "AD",
                    field: "activeDirectoryID",
                },
                {
                    label: "Encompass ID",
                    field: "encompassID",
                },
                {
                    label: "Date",
                    field: "eventDateTime",
                },
                {
                    label: "Event",
                    field: "eventDescription",
                },
            ],

            // Datasets from API
            zones: [{ zoneNumber: 0, zoneName: "All Zones", leadQuota: null }],
            allLeads: [],
            zoneSessions: [],
            allLoanOfficers: [],
            leadsWithErrors: [],
            leadHistory: [],

            // Local UI state
            loadingFromApi: false,
            filtersShowing: false,
            zoneQueueShowing: true,
            manageZonesShowing: true,
            loHistoryModalShowing: false,
            leadDetailModalShowing: false,
            leadDetailModalLoading: false,
            assignedLeadsShowing: true,
            unassignedLeadsShowing: true,
            leadsWithErrorsShowing: true,
            leadHistoryShowing: true,
            selectedSession: {
                activeDirectoryID: null,
                leadsClaimed: null,
            },

            // Local input state
            localZones: [],
            selectedLead: null,
            selectedZone: {
                leadQuota: null,
                zoneName: "All Zones",
                zoneNumber: 0,
            },
            cityError: null,
            stateError: null,
            newLoanOfficer: null,
            leadsDateRange: {
                fromDate: null,
                toDate: null,
            },
        };
    },

    computed: {
        ...mapState(["userProfile"]),
        assignedLeads() {
            return this.allLeads
                .filter((lead) => lead.isClaimed == true)
                .sort(
                    (a, b) =>
                        new Date(b.loanAddedDateTime) -
                        new Date(a.loanAddedDateTime)
                );
        },

        unassignedLeads() {
            return this.allLeads.filter((lead) => lead.isClaimed == false);
        },

        zoneQueue() {
            if (this.selectedZone.zoneName == "All Zones") {
                return this.zoneSessions;
            }
            return this.zoneSessions.filter(
                (session) => session.zoneName == this.selectedZone.zoneName
            );
        },

        configurableZones() {
            return this.zones.filter((zone) => zone.zoneNumber !== 0);
        },

        loanOfficersByWebLead() {
            if (this.selectedLead.isWebLead == false) {
                return this.allLoanOfficers;
            }
            return this.allLoanOfficers.filter(
                (lo) => lo.zoneNumber === this.selectedLead.zoneNumber
            );
        },
    },

    methods: {
        // data fetches & getters
        fetchLeadsAndSessionsByZone() {
            const { zoneNumber } = this.selectedZone;
            const { fromDate, toDate } = this.leadsDateRange;
            // fetch leads by zone to populate leads tables
            this.loadingFromApi = true;
            api.monitor
                .fetchLeadsByZone({
                    zoneNumber,
                    from: fromDate,
                    to: toDate,
                    isClaimed: null,
                })
                .then((response) => {
                    if (response) {
                        this.allLeads = response.data;
                    }
                    this.loadingFromApi = false;
                })
                .catch(() => {
                    this.loadingFromApi = false;
                });

            // fetch zone sessions by zone to populate zone queue
            this.loadingFromApi = true;
            api.monitor
                .fetchZoneSessionsByZone(zoneNumber)
                .then((response) => {
                    if (response) {
                        this.zoneSessions = response.data;
                    }
                    this.loadingFromApi = false;
                })
                .catch(() => {
                    this.loadingFromApi = false;
                });
        },

        fetchLeadHistory() {
            const { fromDate, toDate } = this.leadsDateRange;

            this.loadingLeadHistory = true;
            api.monitor
                .fetchLeadHistory({
                    from: fromDate == null ? "" : fromDate,
                    to: toDate == null ? "" : toDate,
                })
                .then((response) => {
                    if (response) {
                        this.leadHistory = response.data.sort(
                            (a, b) =>
                                new Date(b.eventDateTime) -
                                new Date(a.eventDateTime)
                        );
                    }
                    this.loadingLeadHistory = false;
                })
                .catch(() => {
                    this.loadingLeadHistory = false;
                });
        },

        getSessionsByZoneNumber(zone) {
            return this.zoneQueue.filter(
                (session) => session.zoneNumber == zone
            );
        },

        // data mutations & binding
        stateChanged(value) {
            // this syncs the full string and abbreviation for label & input value
            this.selectedLead.propertyState = value.abbreviation;
        },

        saveZoneConfig(zone) {
            api.monitor
                .updateZoneQuota(zone.zoneNumber, zone.leadQuota)
                .then(() => {
                    // replace zone in state with the local input value since request was successful
                    this.zones.find(
                        (z) => z.zoneNumber == zone.zoneNumber
                    ).leadQuota = zone.leadQuota;
                    this.$notify({
                        group: "bottom-left",
                        title: "Request successful",
                        text: `The lead quota for zone '${zone.zoneName}' was successfully updated to ${zone.leadQuota}`,
                        type: "success",
                        duration: 4000,
                    });
                })
                .catch((error) => {
                    let errorText;
                    if (error.response.status == 400) {
                        errorText = error.response.data;
                    }
                    this.$notify({
                        group: "bottom-left",
                        title: "Request failed",
                        text:
                            errorText ||
                            `The update request for '${zone.zoneName}' has failed.`,
                        type: "error",
                    });
                });
        },

        changequeuePosition(encompassID, zoneNumber, direction) {
            api.monitor
                .updateLoanOfficerqueuePosition({
                    encompassID,
                    zoneNumber,
                    direction,
                })
                .then((response) => {
                    this.zoneSessions = response.data;
                    this.$notify({
                        group: "bottom-left",
                        title: "Request Successful",
                        text: `Queue position for ${encompassID} successfully updated.`,
                        type: "success",
                        duration: 4000,
                    });
                })
                .catch((error) => {
                    console.log(error);
                    this.$notify({
                        group: "bottom-left",
                        title: "Request Failed",
                        text: `Queue position for ${encompassID} failed to update.`,
                        type: "error",
                    });
                });
        },

        async saveLeadChanges() {
            const inputsValid = await this.validateLeadInputs();
            if (inputsValid) {
                // build/cleanup the request payload
                const payload = {};
                payload.lead = this.selectedLead;
                payload.isWebLead = this.selectedLead.isWebLead;
                // remove unnecessary props
                delete payload.lead.vgt_id;
                delete payload.lead.originalIndex;
                // send payload
                this.leadDetailModalLoading = true;
                api.monitor
                    .updateLead(payload)
                    .then(() => {
                        this.leadDetailModalLoading = false;
                        this.leadDetailModalShowing = false;
                        this.$notify({
                            group: "bottom-left",
                            title: "Request successful",
                            text: `${this.selectedLead.loanNumber} was upated in Encompass. Please allow 5-10 minutes for the table to reflect the changes.`,
                            type: "success",
                            // duration: 4000,
                        });
                    })
                    .catch((error) => {
                        this.leadDetailModalLoading = false;
                        this.$notify({
                            group: "bottom-left",
                            title: "Request failed",
                            text: `${this.selectedLead.loanNumber} failed to update in Encompass - ${error}`,
                            type: "error",
                        });
                    });
            }
        },

        validateLeadInputs() {
            let isValid = true;
            this.cityError = null;
            this.stateError = null;
            if (this.selectedLead.propertyCity == null) {
                isValid = false;
                this.cityError = "Required field.";
            } else if (this.selectedLead.propertyCity.trim() == "") {
                isValid = false;
                this.cityError = "Required field.";
            }
            if (this.selectedLead.propertyState == null) {
                isValid = false;
                this.stateError = "Required field.";
            } else if (this.selectedLead.propertyState.trim() == "") {
                isValid = false;
                this.stateError = "Required field.";
            }
            return isValid;
        },

        setLeadsFilterAndFetch() {
            if (this.selectedZone == "") {
                [this.selectedZone] = this.localZones;
            }
            this.fetchLeadsAndSessionsByZone();
            this.fetchLeadHistory();
        },

        // component triggers
        selectLead(row) {
            // triggers the lead detail modal
            this.selectedLead = JSON.parse(JSON.stringify({ ...row }));
            Vue.set(this.selectedLead, "isWebLead", true);
            this.newLoanOfficer = JSON.parse(
                JSON.stringify({ ...row.loanOfficer })
            );
            this.leadDetailModalShowing = true;
        },

        selectLoanOfficerHistory(row) {
            // triggers the LO leads claimed history modal
            const { encompassID } = row;
            // reset modal
            this.selectedSession.encompassID = null;
            this.selectedSession.leadsClaimed = null;
            // set AD ID from row clicked to use in API fetch
            this.selectedSession.encompassID = encompassID;
            // fetch claimed lead history by AD ID
            api.monitor
                .fetchLeadsClaimedHistory(encompassID)
                .then((response) => {
                    if (response) {
                        this.selectedSession.leadsClaimed = response.data;
                    }
                })
                .catch(() => {});
            this.loHistoryModalShowing = true;
        },

        closeLeadDetailModal() {
            this.cityError = null;
            this.stateError = null;
            this.leadDetailModalShowing = false;
        },

        // ui/display
        customZoneLabel(option) {
            const zoneName =
                option.zoneNumber != 0 ? `${option.zoneNumber} - ` : "";
            return `${zoneName} ${option.zoneName}`;
        },

        formatDate(timestamp, format) {
            return moment(timestamp).format(format);
        },

        arrowShouldShow(direction, session) {
            if (this.selectedZone.zoneNumber == 0) {
                return false;
            }
            if (direction === "up") {
                if (session.queuePosition == 1) {
                    return false;
                }
                return true;
            }
            if (direction === "down") {
                if (
                    session.queuePosition ==
                    this.getSessionsByZoneNumber(session.zoneNumber).length
                ) {
                    return false;
                }
            }
            return true;
        },
    },

    async mounted() {
        // fetch all leads
        this.fetchLeadsAndSessionsByZone();

        // fetch all zone data
        api.monitor
            .fetchAllZones()
            .then((response) => {
                if (response) {
                    this.zones = [...this.zones, ...response.data];
                    this.localZones = JSON.parse(
                        JSON.stringify([...this.zones])
                    );
                }
            })
            .catch(() => {});

        // fetch all Loan Officers
        api.monitor
            .fetchLoanOfficersByZone(0)
            .then((response) => {
                if (response) {
                    this.allLoanOfficers = response.data;
                }
            })
            .catch(() => {});

        // fetch leads with errors
        api.monitor
            .fetchLeadsWithErrors()
            .then((response) => {
                if (response) {
                    this.leadsWithErrors = response.data;
                }
            })
            .catch(() => {});

        // fetch lead history
        this.loadingLeadHistory = true;
        this.fetchLeadHistory();
    },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
    padding: 0 2rem 6rem;
    @include breakpoint(mobile-small) {
        padding: 0 1rem;
    }
}

.top-content-container {
    display: flex;
    max-width: 168rem;
    margin: 4rem auto;
    @include breakpoint(ipadPro) {
        flex-wrap: wrap;
    }
    @include breakpoint(mobile) {
        margin-top: 2rem;
    }
}

.blockHeading-container {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    .blockHeading {
        font-size: 2.2rem;
        font-weight: 500;
        color: $blueGreen;
        @include breakpoint(ipadPro) {
            font-size: 1.8rem;
        }
        @include breakpoint(mobile-small) {
            font-size: 1.6rem;
        }
    }
    .btn {
        padding: 1px 0 0;
        min-width: 4.5rem;
        margin-left: 1rem;
        line-height: 1.2rem;
        font-size: 1rem;
        @include breakpoint(mobile) {
            font-size: 8px;
            line-height: 1rem;
        }
    }
}

.zone-display {
    width: 45%;
    margin-right: 8rem;
    @include breakpoint(ipadPro) {
        width: 100%;
        margin: 0;
    }
    .zoneSelector {
        margin-right: 2rem;
        max-width: 25rem;
        @include breakpoint(mobile) {
            width: 100%;
        }
    }
    section.filters {
        margin-bottom: 2rem;
        .blockHeading-container {
            margin-bottom: 2rem;
        }
        .filter-container {
            display: flex;
            align-items: center;
        }
        .form-group {
            height: 62px;
        }
        .dateRange-container {
            display: flex;
            align-items: center;
            @include breakpoint(mobile) {
                width: 100%;
            }
            .form-group {
                margin-right: 1rem;
            }
            .pickerTrigger {
                background-color: transparent;
                text-align: left;
                width: 8.3rem;
                cursor: pointer;
                @include breakpoint(mobile) {
                    width: 100%;
                }
            }
        }
        button.filterSubmit {
            margin-left: 2rem;
            @include breakpoint(laptop) {
                margin-left: 0;
            }
            @include breakpoint(ipadPro) {
                margin-left: 2rem;
            }
            @include breakpoint(tablet-port) {
                margin: 0 2rem 0 0;
            }
        }
    }
    .zoneQueue-table {
        .username {
            color: $blueGreen;
            text-decoration: underline;
            cursor: pointer;
            transition: color 0.3s;
            &:hover {
                color: $orange;
            }
        }
        .position-controls {
            display: flex;
            justify-content: center;
            .upPosition,
            .downPosition {
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                cursor: pointer;
                &:not(:last-child) {
                    margin-right: 1rem;
                }
            }
            .upPosition {
                border-bottom-width: 15px;
                border-bottom-style: solid;
                border-bottom-color: $gray;

                &:hover {
                    border-bottom-color: $orange;
                }
            }
            .downPosition {
                border-top-width: 15px;
                border-top-style: solid;
                border-top-color: $gray;
                &:hover {
                    border-top-color: $orange;
                }
            }
        }
    }
    .zone-configuration {
        margin-top: 2rem;
        @include breakpoint(ipadPro) {
            margin-bottom: 4rem;
        }
        .blockHeading-container {
            margin-bottom: 2rem;
        }
        .section-content {
            max-width: 45rem;
            // padding-left: 1rem;
        }
        .column-labels {
            display: flex;
            margin-bottom: 1rem;
            padding: 0 1rem;
            span {
                color: $blueGreen;
                font-weight: 500;
                text-decoration: underline;
            }
            span.name {
                width: 65%;
            }
            span.dailyLeads {
                min-width: 16rem;
            }
        }
        .zone {
            position: relative;
            display: flex;
            align-items: center;
            padding: 1rem 1rem;
            font-size: 1.4rem;
            font-weight: 500;
            color: #606266;
            border-bottom: 1px solid #dcdfe6;
            @include breakpoint(mobile) {
                font-size: 1.2rem;
            }
            &:hover {
                background-color: lighten($blueGreen, 70%);
            }
            &:hover .counties {
                display: block;
            }
            .name {
                width: 65%;
            }
            .dailyLeads {
                width: 8.3rem;
                text-align: center;
                padding: 0.5rem 0 0;
                height: 2.5rem;
                margin-right: 2rem;
            }
            .btn {
                padding: 0;
                min-width: 6rem;
                @include breakpoint(mobile) {
                    font-size: 1.2rem;
                }
            }
            .counties {
                display: none;
                position: absolute;
                z-index: 99;
                right: -25rem;
                bottom: 0;
                width: 24rem;
                padding: 1rem;
                background-color: $blueGreen;
                color: #fff;
                border-radius: 5px;
                @include breakpoint(tablet-land) {
                    bottom: 6rem;
                    left: 0;
                    right: initial;
                }
                p {
                    margin-bottom: 1rem;
                }
                .county {
                    font-weight: normal;
                }
            }
        }
    }
}

.leads-container {
    width: 55%;
    @include breakpoint(ipadPro) {
        width: 100%;
    }
    .loanNumber {
        color: $blueGreen;
        text-decoration: underline;
        cursor: pointer;
        transition: color 0.3s;
        &:hover {
            color: $orange;
        }
    }

    .assigned-leads,
    .unassigned-leads,
    .error-leads {
        margin-bottom: 2rem;
    }
}

// Multiselect
::v-deep {
    .multiselect__input {
        height: unset;
    }
}
.loSelector {
    ::v-deep {
        .multiselect__content-wrapper {
            max-height: 21rem !important;
        }
    }
}

// Modals
::v-deep .modal__body {
    overflow-x: hidden;
}
.modalHeading {
    color: $lightTeal;
    margin-bottom: 3rem;
}

.leadDetail-modal {
    .inline-form-group {
        .propertyState {
            margin-left: 1rem;
            width: 35rem;
            ::v-deep .multiselect__content-wrapper {
                max-height: 13.5rem !important;
                overflow-x: hidden;
            }
            @include breakpoint(mobile) {
                margin-left: 0;
            }
        }
        @include breakpoint(mobile) {
            flex-wrap: wrap;
        }
    }

    .form-group.leadClaimed {
        margin-top: 2rem;
        label {
            display: inline;
        }
        .value.isClaimed {
            margin-left: 1rem;
            text-transform: capitalize;
            font-weight: 500;
            &.claimed {
                color: $lightTeal;
            }
            &.unclaimed {
                color: $red;
            }
        }
    }
    .modalControls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 3rem;
    }
    .btn {
        &:not(:last-child) {
            margin-right: 1rem;
        }
    }
}

.leadsClaimed-modal {
    ::v-deep .modal__dialog {
        padding: 2rem 1rem 3rem 3rem;
    }
    .column-labels {
        display: flex;
        margin-bottom: 1rem;
        span.label {
            width: 50%;
            color: $blueGreen;
            font-weight: 500;
        }
    }
    .loanList {
        max-height: 40rem;
        .loan {
            display: flex;
            margin-bottom: 0.5rem;
            color: $darkGray;
            span {
                width: 50%;
            }
        }
    }
}

// Table
::v-deep {
    .vgt-table thead th {
        border-bottom: none;
        border-top: none;
        background: linear-gradient($lightTeal, $darkTeal);
        // background: linear-gradient($blueGreen, $darkBlue);
        color: #fff;
        cursor: pointer;
    }
    table.vgt-table td,
    table.vgt-table th {
        @media screen and (max-width: 420px) {
            font-size: 12px;
        }
        &.isClaimed {
            text-transform: capitalize;
        }
    }
    .vgt-table thead th.sorting-asc,
    .vgt-table thead th.sorting-desc {
        color: #fff;
    }
    .vgt-table thead th.sorting-desc:after {
        border-top: 6px solid #fff;
    }
    .vgt-table thead th.sorting-asc:after {
        border-bottom: 6px solid #fff;
    }
    .vgt-global-search {
        right: -1rem;
        top: -4.5rem;
    }
    .footer__navigation__page-info__current-entry {
        padding-left: 0;
        height: 3rem;
    }
}
.table-enter-active,
.table-leave-active {
    transition: opacity 0.3s, transform 0.3s;
    transform-origin: top;
}

.table-enter,
.table-leave-to {
    opacity: 0;
}

.tableLoading {
    margin-top: 2rem;
    color: $darkTeal;
}
</style>
