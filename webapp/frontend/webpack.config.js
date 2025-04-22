const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const webpack = require('webpack');

module.exports = {
  entry: {pong: "./src/index.ts", tic: "./src/tic.ts"},// static: "./src/staticJs.ts", socket: "./src/socket.ts"
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      // {
      //   test: /\.ejs$/,
      //   use: "ejs-loader",
      // },
      {
        test: /\.(png|jpg|gif|env|glb|stl)$/i,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 8192,
            },
        }, ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: {
      name: 'kek', // you then can access it via window: `window.youLib`
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    //   filename: "index.html",
    }),
    new CopyWebpackPlugin({
        patterns: [{ from: "static/textures", to: "assets" }], // Copy "public/" to "dist/assets"
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
  }),
  ],
  devServer: {
    static: "./dist",
    port: 8080,
  },
  
};