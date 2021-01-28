'use strict';
/* global odkTables, util, odkCommon, odkData */

var persons;
function display() {
    console.log("Persons list loading");
    
    loadPersons();
}

function loadPersons() {
    // SQL to get persons
    var sql = "SELECT _id, reg, tab, mor, nome_mae, date" + 
        " FROM AccessMCH " +
        " ORDER BY reg, tab, mor, nome_mae";
    persons = [];
    console.log("Querying database for included persons...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " persons");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id");
            
            var REG = result.getData(row,"reg");
            var TAB = result.getData(row,"tab");
            var MOR = result.getData(row,"mor");
            var NOMEMAE = titleCase(result.getData(row,"nome_mae"));
            var DATE = result.getData(row,"date");

            var p = {type: 'person', rowId, REG, TAB, MOR, NOMEMAE, DATE};
            persons.push(p);
        }
        console.log("loadPersons:", persons)
        populateView();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get persons from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up persons.");
    }

    odkData.arbitraryQuery('AccessMCH', sql, null, null, null, successFn, failureFn);
}

function populateView() {
    var ul = $('#persons');
    ul.empty();
    $.each(persons, function() {
        console.log("test",this)
        var that = this;      
        
        // set text to display
        var displayText = setDisplayText(that);

        // id for btn
        var btnId = this.rowId.slice(6);

        // list
        ul.append($("<li />").append($("<button />").attr('id',btnId).attr('class', '' + ' btn ' + this.type).append(displayText)));
                
        var btn = ul.find('#' + btnId);
        btn.on("click", function() {
            openForm(that);
        })
    });
}

function setDisplayText(person) {
    var date;
    if (person.DATE == "D:NS,M:NS,Y:NS" | person.C_DATE === null) {
       date = "Não sabe";
    } else {
       date = formatDate(person.DATE);
    }
    
    var name;
    if (person.NOMEMAE == null) {
        name = "Não sabe";
    } else {
        name = person.NOMEMAE;
    }

    var displayText = "Nome: " + name + "<br />" +
        "Data: " + date + "<br />" +
        "Reg: " + person.REG + "; Tab: " + person.TAB + "; Mor: " + person.MOR;
    return displayText
 }

function formatDate(adate) {
    var d = adate.slice(2, adate.search("M")-1);
    var m = adate.slice(adate.search("M")+2, adate.search("Y")-1);
    var y = adate.slice(adate.search("Y")+2);
    var date = d + "/" + m + "/" + y;
    return date;
}

function openForm(person) {
    console.log("Preparing form for ", person);
    var rowId = person.rowId;

    odkTables.editRowWithSurvey(
            null,
            "AccessMCH",
            rowId,
            "AccessMCH",
            null,);
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }