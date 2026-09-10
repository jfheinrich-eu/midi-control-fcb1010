# UnO2 Language Support

This local VS Code extension adds syntax highlighting for UnO2 FCB1010 setup files.

## Use during development

1. From the repository root, launch `code --extensionDevelopmentPath="$PWD/vscode-uno2-language" "$PWD"`.
2. Open `UnO2_Cubase_OBS_Setup.txt` in the launched Extension Development Host.

The repository workspace associates `UnO2_Cubase_OBS_Setup.txt` and `*.uno2` files with the `uno2` language identifier.

The VSIX also registers `UnO2_Cubase_OBS_Setup.txt` directly, so the association
works in other workspaces after installation.

## Install locally

Package this folder as a VSIX with the VS Code Extension Manager or the `vsce` command, then install the generated VSIX in VS Code. After installation, the workspace association activates UnO2 highlighting automatically.

The grammar targets the syntax documented by the UnO2 v1.3a manual and is
validated against the repository setup fixture identified as UnO2 v1.4. Syntax
introduced by later versions is not guaranteed unless covered by the fixture.

The extension contributes an optional `UnO2 Syntax Colors` light theme. Select
it with **Preferences: Color Theme** when using the extension outside this
repository.
