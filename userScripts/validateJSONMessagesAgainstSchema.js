// ==UserScript==
// @name         Console highlightning
// @namespace    http://tampermonkey.net/
// @version      0.32
// @description  try to take over the world!
// @author       https://github.com/imevs
// @match        http://localhost:*/*
// @match        https://imevs.github.io/ReadableLogs/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://raw.githubusercontent.com/ajv-validator/ajv-dist/master/dist/ajv2020.bundle.js
// @require      https://imevs.github.io/ReadableLogs/require.js
// @require      https://raw.githubusercontent.com/imevs/wshook/master/wsHook.js
// @require      https://imevs.github.io/ReadableLogs/tampermonkeyUserScript.js
// @grant        none
// ==/UserScript==

const schema = {
    type: "object",
    properties: {
        a: {type: "integer"},
        bar: {type: "string"}
    },
    required: ["foo"],
    additionalProperties: false,
};
// eslint-disable-next-line no-undef
const ajv = new ajv2020({ allErrors: true });
// individual schema could be specified for each type of object
const validate = ajv.compile(schema);

window.formattingOptions = {
    prefix: "incoming: ",
    mode: "overrideWebsocket",
    multiline: true,
    validate(data) {
        const valid = validate(data);
        return valid ? [] : validate.errors.map(e => ({ type: "error", path: e.instancePath, text: e.message }));
    }
};
require(["tampermonkeyUserScript"], () => {});
