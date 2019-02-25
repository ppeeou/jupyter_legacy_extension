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
  class Loading {
    constructor({ parent, text = 'Loading', speed = 300 }) {
      this.parent = parent;
      this.loadingText = text;
      this.loadingTextStop = this.loadingText + '...';
      this.speed = speed;

      this.work = this.work.bind(this);
      this.clear = this.clear.bind(this);

      this.work();
    }

    work() {
      this.me = document.createElement('div');
      this.me.innerHTML = this.loadingText;
      this.parent.append(this.me);

      this.interval = window.setInterval(() => {
        this.me.innerHTML = this.me.innerHTML === this.loadingTextStop
          ? this.loadingText
          : this.me.innerHTML + '.';
      }, this.speed);
    }

    clear() {
      this.me.remove();
      window.clearInterval(this.interval);
    }
  }


  function execute(code, callback) {
    Jupyter.notebook.kernel.execute(code, { iopub: { output: callback } }, { silent: true });
  }

  function Message(command, data) {
    const _Message = {};
    _Message.name = 'nsml';
    _Message.prefix = '%';
    _Message.commands = {};

    // temp
    _Message.commands.getImages = function (data) {
      return 'getImages';
    }

    _Message.commands.setImage = function (data) {
      return ['setImage', data].join(' ');
    }

    function makeCmd() {
      if (!_Message.commands[command]) throw new Error('Unknown nsml command');
      return [_Message.prefix, _Message.name, _Message.commands[command](data)].join(' ');
    }
    return makeCmd();
  }

  const initialize = function () {
    console.log('-------------------------------');
    console.log('Hello NSML');
    console.log('-------------------------------');

    // add our extension's css to the page
    $('<link/>')
      .attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: requirejs.toUrl('./nsml.css')
      })
      .appendTo('head');
    // kernel name nsml

    try {
      const cells = Jupyter.notebook.get_cells();
      const firstCellEle = Jupyter.notebook.get_cell_element(0);
      // var text = firstCell.get_text();


      function appendDockerImageList(content) {
        const metaHTML = 'text/html';
        const metaPlain = 'text/plain';

        const data = content.data;
        const execution_count = content.data;
        let dockerImageDom;

        if (!data[metaPlain] && !data[metaHTML]) return;

        if (data[metaPlain]) {
          dockerImageDom = document.createElement('div');
          dockerImageDom.innerHTML = data[metaPlain];
        } else if (data[metaHTML]) {
          dockerImageDom = data[metaHTML];
        }
        firstCellEle.append(dockerImageDom);
      }

      function select_image_callback(loading, dockerImageDom, data) {
        setTimeout(() => {
          // remove loading
          loading.clear();
          // set images
          console.log('set image!!!', data);
          const dom = document.createElement('div');
          dom.innerHTML = 'SET IMAGE';
          dockerImageDom.append(dom);
        }, 5000)
      }

      function addEvtDockerImages() {
        let dockerImageDom = document.querySelector('.dockerImages-container');

        const listener = (dom) => {
          const dockerImage = dom.target.closest('li');
          const cmd = Message('setImage', dockerImage.id);
          // loading
          execute(cmd, (...args) =>
            select_image_callback(new Loading({ parent: dockerImageDom }), dockerImageDom, ...args));
        }

        if (dockerImageDom) {
          dockerImageDom.addEventListener('click', listener);
        }
      }

      function init_exec_callback(res) {
        const content = res.content;

        appendDockerImageList(content);
        addEvtDockerImages();
      };

      function get_info_kernel() {
        Jupyter.notebook.kernel.get_info(function (info) {
          if (info.name === 'nsml_test' || info.name === 'nsml') {
            execute(Message('getImages'), init_exec_callback)
          }
        })
      }
      get_info_kernel();
    } catch (error) {
      console.log('nsml error', error)
    }
  };

  const load_ipython_extension = function () {
    return Jupyter.notebook.config.loaded.then(initialize);
  };

  return { load_ipython_extension: load_ipython_extension };
});
