var webpack = require('webpack');

module.exports = {
    entry: "./src/main.js",
    output: {
        path: './',
        filename: "bundle.js"
    },
    watchOptions: {
        poll: true
    },
    devServer: {
        inline: true,
        contentBase: "./"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    exclude: /node_modules/,
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
    ]
};