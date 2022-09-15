// ==UserScript==
// @name         Console highlightning
// @namespace    http://tampermonkey.net/
// @version      0.32
// @description  try to take over the world!
// @author       https://github.com/imevs
// @match        http://localhost:*/*
// @match        https://imevs.github.io/ReadableLogs/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://imevs.github.io/ReadableLogs/require.js
// @require      https://imevs.github.io/ReadableLogs/tampermonkeyUserScript.js
// @grant        none
// ==/UserScript==

window.formattingOptions = {
    prefix: ">>>: ", mode: "overrideConsole", getMessageType: logPart => Object.keys(logPart)[0]
};
require(["tampermonkeyUserScript"], () => {});
