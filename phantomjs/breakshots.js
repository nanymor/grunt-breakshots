/*
  grunt-breakshots
  https://github.com/EightMedia/grunt-breakshots

  Copyright (c) 2013 J. Tangelder
  Licensed under the MIT license.
*/

'use strict';
module.exports = function(grunt) {
  var fs, jade, path;
  path = require('path');
  jade = require('jade');
  fs = require('fs');
  return grunt.registerMultiTask('breakshots', 'Create screenshots of html files per breakpoint', function() {
    var done, generateDocuments, options, pages, phantomjs;
    done = this.async();
    options = this.options({
      cwd: '.',
      ext: 'png',
      pattern: "FILENAME.BREAKPOINT.EXT",
      breakpoints: ['320x400','768x900','1024x700','1280,800']
    });
    pages = [];

    this.files.forEach(function(group) {
      var p;
      p = group.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath) || !grunt.file.isFile(filepath)) {
          return false;
        }
        return true;
      }).map(function(filepath) {
        var filename;
        filename = path.relative(options.cwd, filepath);
        return {
          destDir: group.dest,
          destPath: path.normalize("" + group.dest + "/" + filename),
          filename: filename,
          path: filepath
        };
      });
      return Array.prototype.push.apply(pages, p);
    });

    phantomjs = {
      bin: require('phantomjs').path,
      script: path.resolve(__dirname, '../phantomjs/render.js')
    };
    grunt.util.async.forEachSeries(pages, function(page, next) {
      console.log('generating screenshot of '+page.filename+' at '+options.breakpoints.join(","));
      if (page === undefined) {
         return;
      }
      return grunt.util.spawn({
        cmd: phantomjs.bin,
        args: [phantomjs.script, options.ext, options.breakpoints.join(","), options.pattern, page.destDir, page.filename, page.path]
      }, function(err) {
        if (err) {
          return done();
        } else {
          return next();
        }
      });
    }, function(index,next) {
      if (next !== undefined) {
        //this.generateDocuments();
      }
      return done();
    });
    return generateDocuments = function() {
      var compiled, fn, item, size, template, _i, _j, _len, _len1, _ref, _results;
      template = path.resolve(__dirname, '../template/template.jade');
      fn = jade.compile(fs.readFileSync(template), {
        pretty: true,
        filename: template
      });
      _results = [];
      for (_i = 0, _len = pages.length; _i < _len; _i++) {
        item = pages[_i];
        item.breakpoints = [];
        _ref = options.breakpoints;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          size = _ref[_j][0];
          item.breakpoints.push({
            size: size,
            file: options.pattern.replace('FILENAME', item.filename).replace('BREAKPOINT', size).replace('EXT', options.ext)
          });
        }
        compiled = fn({
          pages: pages,
          item: item
        });
        _results.push(fs.writeFileSync(item.destPath, compiled, {
          encoding: 'utf8'
        }));
      }
      return _results;
    };
  });
};