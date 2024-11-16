const path = require('path');

module.exports = {
  // Modo de desenvolvimento
  mode: 'development',
  
  // Arquivo de entrada principal
  entry: './src/renderer.js',
  
  // Saída do bundle
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  // Configuração de módulos
  module: {
    rules: [
      {
        test: /\.js$/, // Processar arquivos JavaScript
        exclude: /node_modules/, // Ignorar dependências
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Transformações modernas do JS
          },
        },
      },
      {
        test: /\.css$/, // Processar arquivos CSS
        use: ['style-loader', 'css-loader'], // Carregadores para CSS
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Processar imagens
        type: 'asset/resource', // Mover para a pasta 'dist'
      },
    ],
  },

  // Alvo para o ambiente Electron
  target: 'electron-renderer',

  // Configuração de Source Maps (útil para debug)
  devtool: 'source-map',
};
