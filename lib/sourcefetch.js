'use babel';

import { CompositeDisposable } from 'atom';
import request from 'request'

export default {

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sourcefetch:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.subscriptions.dispose(); // dispose vs. destroy?
  },

  fetch() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      this.download(selection)
      .then((html) => {
        editor.insertText(html);
      })
      .catch((error) => {
        atom.notifications.addWarning(error.reason);
      })
    }
  },

  download(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject({
            reason: 'Unable to download page'
          });
        }
      });
    });
  }

};
