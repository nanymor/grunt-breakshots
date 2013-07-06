var args, destFile, page, renderBreakpoints, system, webpage;

system = require("system");

args = {
  ext: system.args[1],
  breakpoints: system.args[2].split(","),
  pattern: system.args[3],
  destDir: system.args[4],
  destFilename: system.args[5],
  source: system.args[6]
};

webpage = require("webpage");

page = webpage.create();

destFile = function(breakpoint) {
  var file;
  file = args.pattern.replace('FILENAME', args.destFilename).replace('EXT', args.ext).replace('BREAKPOINT', breakpoint);
  return "" + args.destDir + "/" + file;
};

/*
 render given urls
 param array of URLs to render
 param callbackPerUrl Function called after finishing each URL, including the last URL
 param callbackFinal Function called after finishing everything
*/


renderBreakpoints = function(done) {
  var next;
  next = function() {
    var breakpoint;
    var breakpointarray;
    var breakpointstring
    if (args.breakpoints.length) {
      breakpointstring = args.breakpoints.shift();
      breakpointarray = breakpointstring.split('x');

      breakpoint = parseInt(breakpointarray[0],10);
      page.viewportSize = {
        width: breakpoint,
        height: parseInt(breakpointarray[1],10)
      };
      return page.open(args.source, function(status) {
        return window.setTimeout(function() {
          var size;
          if (status === "success") {
            size = page.evaluate(function(breakpoint) {
              document.querySelector('html').style.width = "" + breakpoint + "px";
              return {
                width: document.body.clientWidth,
                height: document.body.clientHeight
              };
            }, breakpoint);
            page.clipRect = {
              top: 0,
              left: 0,
              width: breakpoint,
              height: size.height
            };
            page.render(destFile(breakpointstring));
            return next();
          } else {
            return next();
          }
        }, 100);
      });
    } else {
      return done();
    }
  };
  return next();
};

renderBreakpoints(function() {
  return phantom.exit();
});