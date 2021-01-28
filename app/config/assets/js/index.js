/**
 * Responsible for rendering the select region/sector/tabanca screen.
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */

function display() {
    
    // Set the background to be a picture.
    //var body = $('body').first();
    //body.css('background', 'url(img/form_logo.png) fixed');
    doSanityCheck();
    initButtons();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

function initButtons() {
    // Inclusion
    var btnInc = $('#btnInc');
    btnInc.on("click", function() {
        odkTables.launchHTML(null, 'config/assets/inclusion.html');
    });
    // List
    var btnList = $('#btnList');
    btnList.on("click", function() {
        odkTables.launchHTML(null, 'config/assets/list.html');
    });
}