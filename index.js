document.addEventListener('DOMContentLoaded', setUp)

function setUp () {
  const _fileInput = document.getElementById('fileInput')
  const _listArea = document.getElementById('listArea')
  const _bibArea = document.getElementById('bibArea')

  _fileInput.addEventListener('change', async function () {
    if (_fileInput.files.length === 0) return

    const file = _fileInput.files[0]
    const text = await file.text()

    const uniqueCitates = prepareCiteArr(text)
    const bibItems = parseBibItems(text)

    const citateList = uniqueCitates
      .map((cite, index) => `${index + 1 < 10 ? ' ' : ''}${index + 1}. ${cite}`)
      .join('\n')

    const bibList = prepareBibiList(uniqueCitates, bibItems)

    _listArea.value = `${file.name}\n\n` + citateList
    _bibArea.value =
      '%%%%%%%%%%%%%%%%\n' +
      '% Bibliography %\n' +
      '%%%%%%%%%%%%%%%%\n' +
      '\\begin{thebibliography}\n\n' +
      bibList

    _fileInput.value = ''
  })
}

function prepareCiteArr (text) {
  const commentlessText = removeSingleLineComments(text)

  const citates = extractNames(commentlessText)

  const normalisedCitates = citates
    .join(',')
    .split(',')
    .map(cite => cite.trim())
    .filter(cite => cite.length > 0)

  const setCitates = new Set(normalisedCitates)
  const uniqueCitates = [...setCitates]

  return uniqueCitates
}

function parseBibItems (text) {
  const rows = text.split('\n')

  const bibStart = rows.findIndex(row => row.includes('\\bibitem{'))

  const sources = []

  for (let i = bibStart; i < rows.length; i++) {
    if (rows[i].trim().length === 0) {
      continue
    }

    if (rows[i].includes('\\end{thebibliography}')) {
      break
    }

    if (rows[i].includes('\\bibitem{')) {
      sources.push({
        nameRow: rows[i],
        body: []
      })

      continue
    }

    if (sources.length === 0) {
      continue
    }

    sources[sources.length - 1].body.push('    ' + rows[i].trim())
  }

  return sources
}

function prepareBibiList (citates, bibItemesArr) {
  const bibItemes = bibItemesArr.map(bibitem => { return { state: 'parsed', ...bibitem } })
  let list =
    '%%%%%%%%%%%%\n' +
    '% Relevant %\n' +
    '%%%%%%%%%%%%\n'

  let bibItemIndex = -1
  for (let i = 0; i < citates.length; i++) {
    bibItemIndex = bibItemes.findIndex(bibitem => bibitem.nameRow.includes(citates[i]))

    if (bibItemIndex === -1) {
      list += '% Houston, we have a problem\n'
      list += `%     ${citates[i]}\n\n`
      continue
    }

    list += bibItemes[bibItemIndex].nameRow
    list += '\n'

    list += bibItemes[bibItemIndex].body.join('\n')
    list += '\n\n'

    bibItemes[bibItemIndex].state = 'listed'
  }

  const extra = bibItemes.filter(bibitem => bibitem.state !== 'listed')

  if (extra.length !== 0) {
    list +=
      '\n\n' +
      '%%%%%%%%%\n' +
      '% Extra %\n' +
      '%%%%%%%%%\n'

    for (const bibItem of extra) {
      list += bibItem.nameRow
      list += '\n'

      list += bibItem.body.join('\n')
      list += '\n\n'

      bibItem.state = 'extra'
    }
  }

  return list
}

function removeSingleLineComments (text) {
  const rows = text.split('\n')

  const commentless = rows.map(row => {
    if (row[0] === '%') {
      return '%'
    } else {
      return row.trim()
    }
  })

  return commentless.join()
}

function extractNames (text) {
  const refReg = /\\cite\{(?<names>.+?)\}/g

  const names = []

  for (let match = refReg.exec(text); match !== null; match = refReg.exec(text)) {
    names.push(match.groups.names)
  }

  return names
}
