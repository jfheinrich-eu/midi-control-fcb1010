.PHONY: package install-extension check validate validate-driver validate-extension validate-json markdown-links validate-current-js extension-dev clean

VSCODE ?= code
VSCE ?= npx --yes @vscode/vsce
EXTENSION_DIR := vscode-uno2-language
VSIX := $(EXTENSION_DIR)/uno2-language-support-0.1.0.vsix

package:
	cd $(EXTENSION_DIR) && npm_config_loglevel=error $(VSCE) package

install-extension: package
	$(VSCODE) --install-extension $(VSIX) --force

check: validate validate-json markdown-links

validate: validate-driver validate-extension

validate-driver:
	node --check Behringer_BehringerFCB1010UnO2.js

validate-extension:
	node scripts/validate-uno2-extension.js

validate-json:
	node -e "for (const file of ['.vscode/settings.json', 'vscode-uno2-language/package.json', 'vscode-uno2-language/syntaxes/uno2.tmLanguage.json', 'vscode-uno2-language/themes/uno2-color-theme.json']) JSON.parse(require('fs').readFileSync(file, 'utf8')); console.log('JSON validation passed.')"

markdown-links:
	node scripts/check-markdown-links.js

validate-current-js:
	test -n "$(FILE)" || (echo "Usage: make validate-current-js FILE=path/to/file.js"; exit 1)
	node --check "$(FILE)"

extension-dev:
	$(VSCODE) --extensionDevelopmentPath="$(CURDIR)/$(EXTENSION_DIR)" "$(CURDIR)"

clean:
	rm -f $(VSIX)
