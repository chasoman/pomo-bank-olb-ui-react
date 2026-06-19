const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: { port: 3000, historyApiFallback: true, headers: { "Access-Control-Allow-Origin": "*" } },
  output: { publicPath: 'http://localhost:3000/', path: path.resolve(__dirname, 'dist'), clean: true },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] } }
      },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        sharedCore: 'sharedCore@http://localhost:3002/remoteEntry.js',
        homepage: 'homepage@http://localhost:3003/remoteEntry.js'
      },
      shared: { ...deps, react: { singleton: true, eager: true, requiredVersion: deps.react }, 'react-dom': { singleton: true, eager: true, requiredVersion: deps['react-dom'] } }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};