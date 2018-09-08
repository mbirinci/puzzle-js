const path = require('path');

module.exports = (entry, dist) => Object.assign({
  entry,
  mode: "production",
  output: {
    filename: "index.js",
    path: dist,
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  stats: 'verbose'
});
