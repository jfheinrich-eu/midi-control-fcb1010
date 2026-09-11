const fs = require('fs')
const path = require('path')

const repositoryRoot = path.resolve(__dirname, '..')
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g
const ignoredDirectories = new Set(['.git', 'node_modules'])

function collectMarkdownFiles(directory) {
	const markdownFiles = []
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
		const entryPath = path.join(directory, entry.name)
		if (entry.isDirectory()) {
			markdownFiles.push(...collectMarkdownFiles(entryPath))
		} else if (entry.isFile() && entry.name.endsWith('.md')) {
			markdownFiles.push(entryPath)
		}
	}
	return markdownFiles
}

function isExternalLink(target) {
	return /^(?:https?:\/\/|mailto:|[A-Za-z]+:)/.test(target)
}

const brokenLinks = []
for (const markdownFile of collectMarkdownFiles(repositoryRoot)) {
	const content = fs.readFileSync(markdownFile, 'utf8')
	for (const match of content.matchAll(markdownLinkPattern)) {
		const target = match[1].split('#', 1)[0]
		if (!target || isExternalLink(target)) continue
		const resolvedPath = target.startsWith('/')
			? path.join(repositoryRoot, target)
			: path.resolve(path.dirname(markdownFile), target)
		if (!fs.existsSync(resolvedPath)) {
			brokenLinks.push(`${path.relative(repositoryRoot, markdownFile)} -> ${target}`)
		}
	}
}

if (brokenLinks.length > 0) {
	console.error('Broken Markdown links:')
	for (const brokenLink of brokenLinks) console.error(`- ${brokenLink}`)
	process.exit(1)
}

console.log('Markdown link check passed.')
