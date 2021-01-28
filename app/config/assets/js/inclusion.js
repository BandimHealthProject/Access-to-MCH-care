/**
 * Responsible for rendering the select region/sector/tabanca screen.
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */

var selReg, selTab, selAss, selDay, selMon, selYea, regions, assistants, button;
var tabancas = []; // This will hold the tabancas read from database

function display() {    
    selReg = $('#selRegion');
    selTab = $('#selTabanca');
    selAss = $('#selAssistant');
    selDay = $('#selDateDay');
    selMon = $('#selDateMonth');
    selYea = $('#selDateYear');
    doSanityCheck();
    getList();
    initButtons();

    console.log("We got:" + ass + ", " + tab + ", " + reg + ", " + day + ", " + mon + ", " + yea);
    var ass = window.localStorage.getItem('ass');
    if (ass) selAss.val(ass);
    var tab = window.localStorage.getItem('tab');
    if (tab) selTab.val(tab);
    var reg = window.localStorage.getItem('reg');
    if (reg) selReg.val(reg);
    var day = window.localStorage.getItem('day');
    if (day) selDay.val(day);
    var mon = window.localStorage.getItem('mon');
    if (mon) selMon.val(mon);
    var yea = window.localStorage.getItem('yea');
    if (yea) selYea.val(yea);
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

// Get assistants from CSV
$.ajax({
    url: 'assistants.csv',
    dataType: 'text',
}).done(getAssistants);

function getAssistants(data) {
    assistants = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length-1; row++) {  // start at row = 1 to skip header
        var rowValues = allRows[row].split(",");
        var p = {code: rowValues[0], name: rowValues[1]};
        assistants.push(p);
    }
    console.log('Assistants', assistants);
}

// Get tabancas from CSV
$.ajax({
    url: 'tabancaList.csv',
    dataType: 'text',
}).done(getTabancas);

function getTabancas(data) {
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length; row++) {  // start at row = 1 to skip header
        var rowValues = allRows[row].split(",");
        var p = {regName: rowValues[0], reg: rowValues[1], tabName: rowValues[2], tab: rowValues[3]};
        tabancas.push(p);
    }
    console.log('Tabancas', tabancas);
    var regNames = [ ...new Set(tabancas.map(x=>x.regName)) ];
    var regIds = [ ...new Set(tabancas.map(x=>x.reg)) ];
    regions = [];
    if (regNames.length != regIds.length) {
        alert('Unable to load regions (duplicate region id with different region name?)');
        return;
    }
    for (var i=0;i<regNames.length;i++) {
        regions.push({reg: regIds[i], regName: regNames[i]});
    }
    console.log('Regions',regions);
}

function getList() {
    // This is only to get the csv's loaded...
    var sql = "SELECT _id FROM AccessMCH";
    var successFn = function( result ) {
        initDrops();
        return;
    }
    var failureFn = function( errorMsg ) {
    }
    odkData.arbitraryQuery('AccessMCH', sql, null, null, null, successFn, failureFn);
}


function initDrops() {
    // Set default date
    var today = new Date();
    var defaultDay = today.getDate();
    var defaultMon = today.getMonth()+1;
    var defaultYea = today.getFullYear();

    // List of date, months, years
    var days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    var months = [1,2,3,4,5,6,7,8,9,10,11,12];
    var years = [defaultYea-1, defaultYea, defaultYea+1];

    $.each(days, function() {
        if (this == defaultDay) {
            selDay.append($("<option />").val(this).text(this).attr("selected",true));
        } else {
            selDay.append($("<option />").val(this).text(this));
        }
    })

    $.each(months, function() {
        if (this == defaultMon) {
            selMon.append($("<option />").val(this).text(this).attr("selected",true));
        } else {
            selMon.append($("<option />").val(this).text(this));
        }
    })

    $.each(years, function() {
        if (this == defaultYea) {
            selYea.append($("<option />").val(this).text(this).attr("selected",true));
        } else {
            selYea.append($("<option />").val(this).text(this));
        }
    })

    // Assistants dropdown
    selAss.append($("<option />").val(-1).text(""));
    $.each(assistants, function() {
        selAss.append($("<option />").val(this.code).text(this.name));
    })
    
    selReg.append($("<option />").val(-1).text(""));
    $.each(regions, function() {
        selReg.append($("<option />").val(this.reg).text(this.regName));
    });

    selTab[0].options.length = 0;
    selTab.append($("<option />").val(-1).text(""));
    selTab.add(getOption("Tabanca",0));
    selTab.attr('disabled', 'disabled');
    
    selReg.on("change", function() {
        populateTabancas(selReg.val());
        window.localStorage.setItem('reg', selReg.val());
    });

    selTab.on("change", function() {
        window.localStorage.setItem('tab', selTab.val());
        window.localStorage.setItem('ass', selAss.val());
        button.removeAttr("disabled");
    });
}

function populateTabancas(reg) {
    selTab[0].options.length = 0;
    selTab.append($("<option />").val(-1).text(""));
    var tabs = tabancas.filter(x => x.reg == reg);
    $.each(tabs, function() {
        selTab.append($("<option />").val(this.tab).text(this.tabName));
    });
    
    selTab.removeAttr("disabled");
    button.attr("disabled","disabled");
}

function initButtons() {
    button = $('#btnInc');
    button.on("click", function() {
        var date = "D:" + selDay.val() + ",M:" + selMon.val() + ",Y:" + selYea.val();
        var assistant = selAss.val();
        if (!assistant || assistant == -1) {
            selAss.css('background-color','pink');
            return false;
        }
        var region = selReg.val();
        var tabanca = selTab.val();    
        
        // set defaults
        var defaults = {};
        defaults["date"] = date;
        defaults["nome_assistente"] = assistant;
        defaults["reg"] = region;
        defaults["tab"] = tabanca;
        console.log(defaults)

        // launch form
        odkTables.addRowWithSurvey(
            null,
            "AccessMCH",
            "AccessMCH",
            null,
            defaults);
    });
    button.attr("disabled","disabled");
}


function getOption(name,valle) {
    var option = document.createElement("option");
    option.text = name;
    option.value = valle;
    return option;
}