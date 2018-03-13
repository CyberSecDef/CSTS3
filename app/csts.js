/*
  Class: CSTS

  Description:
    This is the main CSTS class that bootstraps and loads everything.  This class also creates a
    global object that everything can be attached to.

  License:
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

  Category:
    Controller

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - Robert F Weber, Jr.

*/
const csts = {

  /*
    Variables: Props

    controllers - contains all controllers
    db - contains all database objects
    jobs - contains all cronJobs
    libs - contains all library modules
    models - contains all models
    startTime - the timestamp for when this instance was executed
    router - the Router object
    routes - the various routes within the application
    shells - any active shell objects used by the application
  */
  controllers: {},
  db: {},
  jobs: [],
  libs: {},
  models: {},
  startTime: (Date.now()),
  router: {},
  routes: {},
  shells: {},
  theme: 'Default',
  /*
    Objects: Plugins

    crypto - cryptographic functions
    cpu - cpu statistics
    cron - cron jobs
    dns - dns framework
    fs - file system module
    ejs - Embedded JavaScript templates
    isElevated - determins if the user is elevated
    os - pulls information from the os
    moment - used for managing time objects
    navigo - the router used for navigating the site
    path - module to handle filesystem paths
    util - utility module
    zlib - zlib compression
    tray - works with the systray and taskbar
    win - module to manage the application window
    reload - watches for changes in the file system and reloads the application
    Shell - allows nwjs to interface with powershell
    si - system information module
    xlsx - reads and writes various spreadsheet files
  */
  plugins: {
    crypto: require('crypto'),
    cpu: require('cpu-stat'),
    Cron: require('cron').CronJob,
    dt: require('datatables.net')(),
    dns: require('dns'),
    fs: require('fs'),
    ejs: require('ejs'),
    isElevated: require('is-elevated'),
    jsonQuery: require('json-query'),
    jsonPath: require('jsonpath'),
    os: require('os'),
    moment: require('moment'),
    Navigo: require('navigo'),
    numeral: require('numeral'),
    path: require('path'),
    util: require('util'),
    zlib: require('zlib'),
    tray: (new nw.Tray({
      title: 'Tray',
      icon: 'app/public/images/csts.png',
    })),
    win: nw.Window.get(),
    reload: {},
    Shell: require('node-powershell'),
    si: require('systeminformation'),
    xlsx: require('xlsx'),
    xml2js: require('xml2js'),
    zip: require('zip-local'),
  },

  /*
      Method: requireFile

      Description:
        Used to include dynamic files in the browser

      Parameters:
        @param {string} s - path to file to require

      Returns:
        void
  */
  requireFile(s) {
    $.ajax({
      url: s,
      dataType: 'script',
      async: false, // <-- This is the key
      success() {},
      error() {
        throw new Error(`Could not load script ${s}`);
      },
    });
  },

  /*
   * Method: initializeCsts
   *
   * Description:
   *  This function initializes the csts class
   *
   * Returns:
   * {void}
   */
  initializeCsts() {

    // leaving this to show how jobs can be created
    //
    // this.jobs.push(new this.plugins.Cron({
    //   cronTime: '1-60/6 * * * * *',
    //   onTick() {
    //     csts.plugins.si.mem((data) => {
    //       const p = parseFloat(data.used / data.total);
    //       $('#memChart').css('background', (`#${Math.ceil((0xFF * p)).toString(16)}${Math.ceil(0xFF - (0xFF * p)).toString(16)}00`));
    //     });
    //   },
    //   start: true,
    // }));

    if (nw.App.manifest.environment === 'developmental') {
      nw.Window.get().showDevTools();
    }

    require('knockout');
    this.requireFile('../node_modules/knockout/build/output/knockout-latest.js');
    this.requireFile('../node_modules/chart.js/dist/Chart.bundle.min.js');
    this.requireFile('../node_modules/jspdf/dist/jspdf.min.js');
    this.requireFile('../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js');
    

    // include library files.  These are individually listed for ordering purposes
    $.each([
      './public/js/jquery-ui.js',
      './public/js/bootstrap.bundle.js',
      './public/js/fontawesome-all.min.js',
      './public/js/jquery.tree.js',
      './public/js/jquery.dataTables.js',
      './public/js/dataTables.bootstrap4.min.js',
      './public/js/hilitor.js',
    ], (index, item) => {
      this.requireFile(item);
    });


    // include routes
    $.each(
      csts.plugins.fs.readdirSync('./app/routes/'),
      (index, item) => {
        this.requireFile(`./routes/${item}`);
      },
    );

    // controllers
    $.each(
      csts.plugins.fs.readdirSync('./app/controllers/'),
      (index, item) => {
        this.requireFile(`./controllers/${item}`);
      },
    );

    // models
    $.each(
      csts.plugins.fs.readdirSync('./app/models/'),
      (index, item) => {
        this.requireFile(`./models/${item}`);
      },
    );

    // lib
    $.each(
      csts.plugins.fs.readdirSync('./app/lib/'),
      (index, item) => {
        this.requireFile(`./lib/${item}`);
      },
    );

    if (csts.plugins.fs.existsSync('app/database/config.db')) {
      csts.db.config = JSON.parse(csts.plugins.fs.readFileSync('app/database/config.db'));
    } else {
      csts.db.config = {
        _id: csts.libs.utils.getGuid(),
        viewCount: 1,
        theme: 'Default',
      };
    }

    if (typeof csts.db.config.theme === 'undefined') {
      csts.db.config.theme = 'Default';
    }

    $('head').append(
      $('<link rel="stylesheet" type="text/css" />')
        .attr('href', `./public/themes/${csts.db.config.theme}/bootstrap.min.css`)
    );

    csts.db.config.viewCount += 1;
    csts.plugins.fs.writeFileSync('app/database/config.db', JSON.stringify(csts.db.config));

    csts.plugins.tray.tooltip = 'Cyber Security Tool Suite v3.0.0';
    csts.plugins.win.width = (csts.plugins.win.width < 1280 ? 1280 : csts.plugins.win.width);
    csts.plugins.win.height = (csts.plugins.win.height < 800 ? 800 : csts.plugins.win.height);
    csts.plugins.ejs.delimeter = '$';

    // csts.plugins.reload = csts.plugins.fs.watch('./app', {
    //   recursive: true,
    // }, (eventType, filename) => {
    //   if (filename.substring(0, 8) !== 'database' && filename.substring(0, 4) !== 'docs' && filename.indexOf('storage') < 0) {
    //     window.location.href = '/app/index.html';
    //     reloadWatcher.close();
    //   }
    // });

    csts.router = new csts.plugins.Navigo(window.location.origin, false, '#');

    $(document).ready(() => {

      // load search box library
      csts.plugins.hilitor = new Hilitor('#main-center-col');

      csts.plugins.ejs.renderFile('app/resources/views/layouts/default.tpl', {
        username: process.env.USERNAME,
        url: window.location.valueOf().pathname.replace('/app', '').replace('index.html', ''),
      }, {}, (err, str) => {
        $('body').html(str);
      });

      // load any routes that are specified in the controllers
      Object.keys(csts.controllers).forEach((c) => {
        Object.keys(csts.controllers[c]).filter(m => typeof csts.controllers[c][m] === 'object').forEach((m) => {
          if (typeof csts.controllers[c][m].default !== 'undefined') {
            // add to route
            const r = {};
            r[`/${c}/${m}`] = `${c}@${m}.${csts.controllers[c][m].default}`;
            $.extend(csts.routes, r);

            // add to navbar
            $('header nav.navbar div ul li').find(`a:contains('${c}')`)
              .parent()
              .find('div.dropdown-menu')
              .append($('<a></a>')
                .addClass('dropdown-item')
                .attr('href', `/${c}/${m}`)
                .text(csts.controllers[c][m].name));
          }
        });
      });

      $.each(csts.routes, (name, val) => {
        let c = '';
        let f = '';

        function index(obj, i) {
          return obj[i];
        } // magic that allows dynamic dot objects for grouping routes (scans.compareRarPoam.index)
        switch (typeof val) {
          case 'string':
            c = val.substring(0, val.indexOf('@'));
            f = val.substring(val.indexOf('@') + 1);
            if (f.indexOf('.') >= 0) {
              csts.router.on(name, f.split('.').reduce(index, csts.controllers[c]));
            } else {
              csts.router.on(name, csts.controllers[c][f]);
            }
            break;
          case 'function':
            csts.router.on(name, val);
            break;
          default:
            csts.router.on(name, val);
        }
      });

      
      $('#viewCount').text(csts.db.config.viewCount);
      csts.plugins.ejs.cache.set('viewCount', csts.db.config.viewCount);
      
      // this function calls the routing without actually navigating away
      csts.plugins.win.on('navigation', (frame, url, policy) => {
        window.onbeforeunload = null;
        policy.ignore();
        const req = url.replace(window.location.origin, '');

        // only naviate if this is going to a new page. (double tapping same link causes page to blank out)
        if (csts.router.lastRouteResolved() == null || typeof csts.router.lastRouteResolved() === 'undefined' || req !== csts.router.lastRouteResolved().url) {
          $('#main-center-col *').remove();
          $('#main-center-col').html('');
          csts.router.navigate(req);
        }
        return false;
      });

      // default route
      csts.controllers.Home.main.showHome();

      csts.plugins.isElevated().then((elevated) => {
        $('div.footer div.systray').append(elevated ? '<i class="fas fa-chess-king"></i>' : '<i class="fas fa-user" onclick="alert(1);"></i>');
      });
    });

    csts.plugins.jsonPath.flatValue = function flatValue(element, path) {
      const v = this.value(element, path);
      if (typeof v !== 'undefined') {
        return v.reduce(a => a);
      }
      return null;
    };

    csts.plugins.win.resizeTo(1200, 800);

    // clean up an existing child processes
    csts.plugins.win.on('unload', () => {
      this.killChildProcesses();
    });
    csts.plugins.win.on('loaded', () => {
      this.killChildProcesses();
    });
    csts.plugins.win.on('loading', () => {
      this.killChildProcesses();
    });
  },

  /*
    Method: killChildProcesses

    Description:
      This will clean up an child processes spawned from the
      main application.  Used when the application reloads.

    Parameters:

    Returns:
      {void}
  */
  killChildProcesses() {
    const childProcesses = nw.process._getActiveHandles().filter(process => process.constructor.name === 'ChildProcess');
    for (let i = 0; i < childProcesses.length; i += 1) {
      if (!csts.libs.utils.isBlank(childProcesses[i].pid)) {
        try {
          nw.process.kill(childProcesses[i].pid);
        } catch (e) {
          console.log(`Could not kill PID: ${childProcesses[i].pid}`);
        }
      }
    }
  },
};
