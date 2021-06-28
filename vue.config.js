module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `
            @import "@/scss/utility/_variables.scss";
            @import "@/scss/utility/_mixins.scss";
            @import "@/scss/utility/_animations.scss"; 
          `,
        sourceMap: true,
      },
    },
    sourceMap: true,
  },
  configureWebpack: {
    resolve: {
      extensions: ['.scss', '.css', '.json', '.vue'],
    },
    devtool: 'source-map',
  },
};
