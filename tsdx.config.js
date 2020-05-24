const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const less = require('less');

const processLess = function(context, payload) {
    return new Promise(( resolve, reject ) => {
      less.render({
        file: context
      }, function(err, result) {
        if( !err ) {
          resolve(result);
        } else {
          reject(err);
        }
      });
  
      less.render(context, {})
      .then(function(output) {
        // output.css = string of css
        // output.map = string of sourcemap
        // output.imports = array of string filenames of the imports referenced
        if( output && output.css ) {
          resolve(output.css);
        } else {
          reject({})
        }
      },
      function(err) {
        reject(err)
      });
  
    })
  }

module.exports = {
    rollup(config, options){
        config.plugins.push(
            postcss({
              plugins: [
                autoprefixer(),
                cssnano({
                  preset: 'default',
                }),
              ],
              inject: false,
              // only write out CSS for the first bundle (avoids pointless extra files):
              extract: !!options.writeMeta,
              process:processLess
            })
          );
        return config
    }
}