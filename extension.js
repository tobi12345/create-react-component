// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
const util = require('util')

var fs = require('fs');
var path = require('path');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed




function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "first-test" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.addComponentStateful', function (context) {
        vscode.window.showInputBox().then((name) => {
            if (typeof name === "undefined") {
                return vscode.window.showErrorMessage("Create Component Failed");
            }

            vscode.window.showQuickPick(["yes", "no"], { placeHolder: "Do you need a css file?" }).then((needCss) => {
                createComponent(name, needCss !== "no", context.fsPath, true);

            });
        });
    });
    var disposable = vscode.commands.registerCommand('extension.addComponentStateless', function (context) {
        vscode.window.showInputBox().then((name) => {
            if (typeof name === "undefined") {
                return vscode.window.showErrorMessage("Create Component Failed");
            }
            vscode.window.showQuickPick(["yes", "no"], { placeHolder: "Do you need a css file?" }).then((needCss) => {
                createComponent(name, needCss !== "no", context.fsPath, false);

            });
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function createFile(_path) {
    console.log("path: ", _path);
    return new Promise((resolve, reject) => {
        fs.open(_path, "wx", function (err, fd) {
            // handle error
            if (err) {
                return reject("File allrady exists");
            }
            return resolve(fd);
        });
    });
}

function writeFile(file, data) {
    return new Promise((resolve, reject) => {
        fs.write(file, data, function (err, fd) {
            // handle error
            if (err) {
                return reject("File allrady exists");
            }
            return resolve(fd);
        });
    });
}


function componnentString(name, needCss) {
    return `import React from 'react';

${needCss ? `import './${name}.css';` : ""}

class ${name} extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div ${needCss ? `className='${name.toLowerCase()}_wrapper'` : ""}>

            </div>
        );
    }
}

export default ${name};`

}

function componnentString_Stateless(name, needCss) {
    return `import React from 'react';

${needCss ? `import './${name}.css';` : ""}

const ${name} = () => {

    return (
        <div ${needCss ? `className='${name.toLowerCase()}_wrapper'` : ""}>

        </div>
    );

}

export default ${name};`

}

function cssString(name) {
    return `.${name.toLowerCase()}_wrapper{\n\n}`
}

function createComponent(name, needCss, _path, isStateful) {
    const dir_path = _path;
    const component_name = name;
    const file_name_react = path.join(dir_path, component_name, component_name + ".react.js");
    const file_name_css = path.join(dir_path, component_name, component_name + ".css");


    fs.mkdirSync(path.join(dir_path, component_name));

    const file_Promise_Component = createFile(file_name_react);
    file_Promise_Component.then((file) => {
        const write_Promise_Component = writeFile(file, isStateful ? componnentString(component_name, needCss) : componnentString_Stateless(component_name, needCss));

        write_Promise_Component.then(() => {
            fs.close(file, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }).catch((err) => {
            console.log(err);
            vscode.window.showInformationMessage('Error');
        });

    }).catch((err) => {
        console.log(err);
        vscode.window.showInformationMessage('Error');
    });
    if (!needCss) return;

    const file_Promise_CSS = createFile(file_name_css);
    file_Promise_CSS.then((file) => {
        const write_Promise_Component = writeFile(file, cssString(component_name));

        write_Promise_Component.then(() => {
            fs.close(file, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }).catch((err) => {
            console.log(err);
            vscode.window.showInformationMessage('Error');
        });

    }).catch((err) => {
        console.log(err);
        vscode.window.showInformationMessage('Error');
    });
}