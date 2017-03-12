import buble from 'rollup-plugin-buble';

export default {
    entry: 'dist/index.js',
    dest: 'dist/bundles/ngx-widget-grid.umd.js',
    format: 'umd',
    moduleName: 'ngx.widgetgrid',
    external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms',
        '@angular/platform-browser',
        'rxjs',
        'rxjs/Subject',
        'rxjs/Observable'
    ],
    globals: {
        '@angular/core' : 'ng.core',
        '@angular/common' : 'ng.common',
        '@angular/forms' : 'ng.forms',
        '@angular/platform-browser' : 'ng.platformBrowser',
        'rxjs' : 'rxjs',
        'rxjs/Subject' : 'rxjs.Subject',
        'rxjs/Observable' : 'rxjs/Observable'
    },
    plugins: [
        buble()
    ],
    onwarn: function (warning) {
        // Suppress ignore-able warning messages. See: https://github.com/rollup/rollup/issues/794
        if (warning.code === 'THIS_IS_UNDEFINED'){
            return;
        }
        console.error(warning.message);
    }
};