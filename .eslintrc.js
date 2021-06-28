module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["eslint:recommended", "plugin:vue/essential"],
    parserOptions: {
        parser: "babel-eslint"
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "max-len": 0,
        "linebreak-style": 0,
        "no-param-reassign": 0,
        eqeqeq: 0,
        "no-unused-vars": "warn",
        "vue/no-use-v-if-with-v-for": "warn",
        "import/no-unresolved": 0
    }
};
