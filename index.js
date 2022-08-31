const Plugin = require('broccoli-plugin');
const fg = require('fast-glob');
const fs = require('fs');

const only = (subject, props = []) => {
    const keys = Object.keys(subject);
    const result = {};

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (props.includes(key)) {
            result[key] = subject[key];
        }
    }

    return result;
};

const IndexExtensionsToJson = function () {
    return new Promise((resolve, reject) => {
        const extensions = [];

        return fg(['node_modules/**/flb-*-extension/package.json'])
            .then((results) => {
                for (let i = 0; i < results.length; i++) {
                    const path = results[i];

                    let json = fs.readFileSync(path);
                    let data = JSON.parse(json);

                    if (data?.extension === undefined || data?.extension === null) {
                        continue;
                    }

                    extensions.push(only(data, ['name', 'description', 'version', 'extension', 'icon', 'keywords', 'license', 'repository']));
                }
                resolve(extensions);
            })
            .catch(reject);
    });
};

module.exports = class FleetbaseExtensionsIndexer extends Plugin {
    constructor() {
        super([]);
    }

    async build() {
        const extensions = await IndexExtensionsToJson();

        this.output.writeFileSync('extensions.json', JSON.stringify(extensions));
    }
};
