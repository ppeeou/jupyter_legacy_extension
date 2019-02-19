define([
  'base/js/namespace',
  'jquery',
  'require',
  'base/js/events',
  'services/config',
  'notebook/js/codecell',
  'codemirror/lib/codemirror',
  'codemirror/addon/fold/foldcode',
  'codemirror/addon/fold/foldgutter',
  'codemirror/addon/fold/brace-fold',
  'codemirror/addon/fold/indent-fold'
], function (Jupyter, $, requirejs, events, configmod, codecell, CodeMirror) {
  "use strict";
  var initialize = function () {
    // add our extension's css to the page
    $('<link/>')
      .attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: requirejs.toUrl('./nsml.css')
      })
      .appendTo('head');
    // kernel name nsml

    var cells = Jupyter.notebook.get_cells();
    // first cell
    cells[0].execute();
  };

  var load_ipython_extension = function () {
    return Jupyter.notebook.config.loaded.then(initialize);
  };


  return { load_ipython_extension: load_ipython_extension };
});