// ==UserScript==
// @name         Console highlightning
// @namespace    http://tampermonkey.net/
// @version      0.32
// @description  try to take over the world!
// @author       You
// @match        http://localhost:*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://imevs.github.io/ReadableLogs/require.js
// @require      https://imevs.github.io/ReadableLogs/tampermonkeyUserScript.js
// @grant        none
// ==/UserScript==

window.formattingOptions = { prefix: ">>>: " };
require(["tampermonkeyUserScript"], () => {});
