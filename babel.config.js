module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs', // Ensure ES modules are converted to CommonJS
      },
    ],
  ],
};
