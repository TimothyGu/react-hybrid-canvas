import babel from 'rollup-plugin-babel';
const {dependencies, peerDependencies} = require('./package.json');

const deps = Object.keys(dependencies).concat(Object.keys(peerDependencies));

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      presets: [
        ['es2015', { modules: false, loose: true }],
        'es2017',
        'react',
        'stage-2'
      ],
      plugins: [
        'transform-runtime'
      ],
      runtimeHelpers: true
    })
  ],
  targets: [
    { dest: 'lib/index.js', format: 'cjs' },
    { dest: 'lib/index.es.js', format: 'es' }
  ],
  external: id => deps.includes(id.split('/')[0])
};
