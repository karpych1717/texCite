document.addEventListener('DOMContentLoaded', setUp)

function setUp () {
  const _fileInput = document.getElementById('fileInput')
  const _textArea = document.getElementById('outputArea')

  _fileInput.addEventListener('change', async function () {
    if (_fileInput.files.length === 0) return

    const file = _fileInput.files[0]
    const text = await file.text()

    const citates = extractNames(text)

    const normalisedCitates = citates
      .join(',')
      .split(',')
      .map(cite => cite.trim())

    const uniqueCitates = new Set(normalisedCitates)
    const citatesAsString = [...uniqueCitates]
      .map((cite, index) => `${index + 1 < 10 ? ' ' : ''}${index + 1}. ${cite}`)
      .join('\n')

    _textArea.value = `${file.name}\n\n` + citatesAsString

    _fileInput.value = ''
  })
}

function extractNames (text) {
  const refReg = /\\cite\{(?<names>.+?)\}/g

  const names = []

  for (let match = refReg.exec(text); match !== null; match = refReg.exec(text)) {
    names.push(match.groups.names)
  }

  return names
}
