'use babel'

import { CompositeDisposable } from 'atom'
import request from 'request'
import cheerio from 'cheerio'

export default {
  subscriptions: null,
  activate() {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sourcefetch:fetch': () => this.fetch()
    }))
  },
  deactivate() {
    this.subscriptions.dispose()
  },

  /*
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  filter
  forEach
  map
  some
  */
  scrape(html) {
    $ = cheerio.load(html)
    return $('#description').next('div').text()
  },

  download(term) {
    return new Promise((resolve, reject) => {
      request(`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/${term}`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Unable to download page'
          })
        }
      })
    })
  },

  fetch() {
    let editor
    let self = this

    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      this.download(selection)
      .then((html) => {
        let answer = self.scrape(html)
        if (answer === '') {
          atom.notifications.addWarning('No answer found :(')
        } else {
          atom.notifications.addInfo(answer, {
            dismissable: true
          })
        }
      })
      .catch((error) => {
        console.log(error)
        atom.notifications.addWarning(error.reason)
      })
    }
  }
}
