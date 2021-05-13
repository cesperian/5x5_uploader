const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "production",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "5x5_uploader.min.js"
    },
    resolve: {
        fallback: {
            "querystring": require.resolve("querystring-es3")
        }
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ],
    node: {
        // fs: "empty" //https://github.com/pugjs/pug-loader/issues/8
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },
    externals: {
        'materialize-css': 'materialize-css',
    }
};
