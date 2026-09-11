const fs = require('fs')
const path = require('path')

const repositoryRoot = path.resolve(__dirname, '..')
const extensionRoot = path.join(repositoryRoot, 'vscode-uno2-language')
const packagePath = path.join(extensionRoot, 'package.json')
const grammarPath = path.join(extensionRoot, 'syntaxes', 'uno2.tmLanguage.json')
const themePath = path.join(extensionRoot, 'themes', 'uno2-color-theme.json')
const setupPath = path.join(repositoryRoot, 'UnO2_Cubase_OBS_Setup.txt')

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function assertCondition(condition, message) {
	if (!condition) {
		throw new Error(message)
	}
}

const extensionPackage = readJson(packagePath)
const grammar = readJson(grammarPath)
const theme = readJson(themePath)
const setupText = fs.readFileSync(setupPath, 'utf8')
const grammarText = fs.readFileSync(grammarPath, 'utf8')
const languageContribution = extensionPackage.contributes.languages.find((language) => language.id === 'uno2')

assertCondition(languageContribution, 'The uno2 language contribution is missing.')
assertCondition(languageContribution.extensions.includes('.uno2'), 'The .uno2 extension is not registered.')
assertCondition(
	languageContribution.filenames.includes('UnO2_Cubase_OBS_Setup.txt'),
	'The central UnO2 setup filename is not registered.'
)
assertCondition(grammar.scopeName === 'source.uno2', 'The grammar scope name is incorrect.')
assertCondition(theme.tokenColors.some((token) => token.scope.includes('comment.block.uno2')), 'Comment colors are missing.')
for (const requiredScope of [
	'keyword.control.section.uno2',
	'entity.name.function.definition.uno2',
	'variable.other.uno2',
	'comment.block.uno2'
]) {
	assertCondition(grammarText.includes(requiredScope), `Grammar scope is missing: ${requiredScope}.`)
}
for (const requiredPattern of [
	'PRESETS|EFFECTS|TRIGGERS|SWEEPS|BANKS',
	'entity.name.function.definition.uno2',
	'\\\\$[A-Za-z_][A-Za-z0-9_]*',
	'"begin": "/\\\\*"'
]) {
	assertCondition(grammarText.includes(requiredPattern), `Grammar pattern is missing: ${requiredPattern}.`)
}
for (const requiredSection of ['PRESETS', 'EFFECTS', 'TRIGGERS', 'SWEEPS', 'BANKS']) {
	assertCondition(setupText.includes(`${requiredSection} =`), `Setup fixture is missing ${requiredSection}.`)
}
for (const requiredVariable of ['$current_bank', '$NOTE_ON_VELOCITY']) {
	assertCondition(setupText.includes(requiredVariable), `Setup fixture is missing ${requiredVariable}.`)
}

console.log('UnO2 extension manifest, grammar, theme, and setup fixture are valid.')
