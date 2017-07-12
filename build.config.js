/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',
  demo_dir: 'demo',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js', '!src/**/*.config.js'],
    jsunit: ['src/**/*.spec.js'],
    jsconfig: ['src/**/*.config.js'],

    atpl: ['src/app/**/*.tpl.html'],
    ctpl: ['src/common/**/*.tpl.html'],

    html: ['src/index.html'],
    less: 'src/less/main.less'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      //'vendor/jquery/dist/jquery.min.js',
      //'vendor/moment/min/moment.min.js',
      //'vendor/underscore/underscore-min.js',
      //'vendor/angular/angular.min.js',
      //'vendor/angular-ui-router/release/angular-ui-router.min.js',
      'vendor/angular-cookies/angular-cookies.min.js',
      'vendor/angular-ui-utils/ui-utils.min.js',
      'vendor/angular-sanitize/angular-sanitize.min.js',
      'vendor/angular-resource/angular-resource.min.js',
      'vendor/angular-route/angular-route.min.js',
      'vendor/angular-touch/angular-touch.min.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/angular-toggle-switch/angular-toggle-switch.min.js',
      'vendor/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js',
      'vendor/oclazyload/dist/ocLazyLoad.js',
      'vendor/restangular/dist/restangular.min.js',
      'vendor/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js',
      //'vendor/spin.js/spin.js',
      //'vendor/modernizr/modernizr.js',
      'vendor/bootstrap/dist/js/bootstrap.min.js',
      'vendor/bootstrap-datepicker/js/bootstrap-datepicker.js',
      'vendor/iCheck/icheck.min.js',
      //'vendor/jquery.inputmask/dist/inputmask/jquery.inputmask.js',
      //'vendor/jquery.inputmask/dist/inputmask/jquery.inputmask.date.extension.js',
      //'vendor/jquery-autosize/jquery.autosize.min.js',
      //'vendor/jquery-ui/jquery-ui.min.js',
      'vendor/ng-table/dist/ng-table.min.js',
      'vendor/angular-translate/angular-translate.min.js',
      //'vendor/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
      //'vendor/angular-youtube-mb/src/angular-youtube-embed.js',
      //'vendor/file-saver.js/FileSaver.js',
      //'vendor/angular-tooltips/src/js/angular-tooltips.js', // Override by HuyD

      //'vendor/angular-load/angular-load.min.js',
      'vendor/angular-google-places-autocomplete/src/autocomplete.js',
      'vendor/angular-ui-load/ui-load.js',
      'vendor/angular-ui-jq/ui-jq.js',
      'vendor/ngstorage/ngStorage.min.js',
      'vendor/bootstrap-daterangepicker/daterangepicker.js',
      'vendor/angular-daterangepicker/js/angular-daterangepicker.js'     
      //'src/assets/plugins/ui-bootstrap-tpls-0.12.0-SNAPSHOT.js', // Fix angular bootstrap
      //'src/assets/plugins/bootstrap3-timepicker/js/bootstrap-timepicker.min.js',
      //'src/assets/plugins/angular-ui-calendar/src/calendar.js',
      //'src/assets/plugins/fullcalendar/dist/fullcalendar.js',
      //'src/assets/plugins/fullcalendar/dist/gcal.js'
    ],
    css: [],
    assets_fonts: [
      'vendor/bootstrap/dist/fonts/*',
      'vendor/font-awesome/fonts/*'
    ],
    assets: [
      // css
      'vendor/bootstrap-daterangepicker/daterangepicker.css',
      'vendor/angular-toggle-switch/angular-toggle-switch.css',
      'vendor/select2/select2.css',
      'vendor/iCheck/skins/all.css',
      'vendor/angular-tooltips/src/css/angular-tooltips.css'   
    ]
  }
};
