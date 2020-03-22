module.exports = {
    module: {
      rules: [
        {
          test: /\.mp3$/,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
  };