var tar = require('tar');

// compress files into tar.gz archive
tar.c({
        gzip: true,
        file: 'dist.tgz'
      },
      ['dist'])
   .then(a => {
     console.log('tarball has been created from "dist" directory with README and LICENSE');
   });
