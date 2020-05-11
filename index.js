const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const filesize = require('filesize');

const rimrafAsync = promisify(rimraf);

const processFunc = async (basePath, outputPath) => {
  const stats = fs.statSync(basePath);
  const basename = path.basename(basePath);

  if (basename === '.DS_Store') return;

  await rimrafAsync(outputPath);

  let content = [];

  if (stats.isDirectory()) {
    console.log('directory: ', basePath);

    content = fs.readdirSync(basePath);

    fs.mkdirSync(outputPath);

    if (content.length) {
      for (let inner of content) {
        await processFunc(
          path.join(basePath, inner),
          path.join(outputPath, inner)
        );
      }
    }
  } else if (stats.isFile()) {
    const [file] = await imagemin([basePath], {
      destination: path.resolve(outputPath, '..'),
      plugins: [imageminPngquant({ quality: [0.6, 0.8] })],
    });
    console.log(
      'file: ',
      basePath,
      filesize(stats.size),
      filesize(file.data.length)
    );
  }
};

const basePath = '/Users/admin/Downloads/images/input';
const outputPath = '/Users/admin/Downloads/images/output';

(async () => {
  await processFunc(basePath, outputPath);
})();
