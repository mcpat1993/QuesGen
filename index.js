$(document).ready(function () {
    //first we get the language of the user
    $.get('data/util/lang', function (result) {
        $("#lang_toggle").val(result.lang);
        $("#signup_lang").val(result.lang);
        switchLang(result.lang);
    }).fail(function() {
        $("#lang_toggle").val("en");
        $("#signup_lang").val("en");
    });


    //create a test user
    $.post('data/admin/newuser', {pwd:"123", lang:"de", email:"dec2mclaren@hotmail.com", code:"thecakeisalie"}, function (result) {
            console.log("New user created, ", result)
    }).fail(function (result) {
        console.log("new user failed creation.", result);
    });
        
    fillQuestionLists();

    if (typeof Cookies.get("sessionId") === 'undefined') {
        //Logged out
        $("#edit_template_tab").hide();
        $("#login_signup").show();
        $("#logout").hide();
        $("#logged_in_title").hide();
    } else {
        //Logged in
        $.get("data/session/user/lang", {sessionId: Cookies.get("sessionId")}, function(result) {
                $("#lang_toggle").val(result.lang);
                switchLang(result.lang);
            });
        $.get("data/session/user/email", {sessionId: Cookies.get("sessionId")}, function(result) {
            $("#logged_in_title").text(result.email);
        });
        $("#logged_in_title").show();
        $("#login_signup").hide();
        $("#logout").show();
        $.get('data/template', {sessionId: Cookies.get("sessionId")}, function (templates) {
            renderEditTemplate(templates);
            $("#q_temp_toggle>option").not(".SelectOne").remove();
            $.each(templates, function(index, template){
                console.log(template);
                $("#q_temp_toggle").append($("<option></option>")
                    .attr("value", template.name.toLowerCase())
                    .text(template.name));
            });
        }).fail(function (result) {
            console.log("sessionId failed in template service.", result);
        });
    }
    $("#searchTermForm").on('submit', function (e) {
        e.preventDefault();
        searchTerm();
    });
    $("#lang_toggle").change(function () {
        switchLang($("#lang_toggle option:selected").val());
    });

    /*
     * Beginning of setup for Login/Register sidebar.
     * Sidebar will hide if somewhere else is clicked
     */
    $("#slider").hide();
    $("#reg_loader").hide();
    $("#search_loader").hide();
    $("#reg_message").hide();
    $("#search_message").hide();
    $("#signin_loader").hide();
    $(window).click(function () {
        closePanel();
    });
    $('#slider').click(function (event) {
        event.stopPropagation();
    });
    /*
     * This is to make sure that clicking the button doesn't
     * inherit the logical "outside of sidebar" click that closes
     * the sidebar and would therefor prevent it from actually
     * opening
     */
    $('#login_signup').click(function (event) {
        event.stopPropagation();
    });
    /*
     * End of setup for Login/Register sidebar
     */


    $("#list_tab").on('click', renderListView);
    $("#gen_tab").on('click', renderQuesGenView);
    $("#edit_template_tab").on('click', showEditTemplateView);

    renderQuesGenView();
});

function showEditTemplateView() {
    unselectAllTabs();
    document.getElementById("edit_template_tab").className = "selected_tab";
    $("#edit_template_content").show();
}

function clearEditTemplate() {
    $("#edit_template_sel>option").not(".SelectOne").remove();
    $("#edit_template_content>div").remove(".Level");
}

/*
 * @param {type} template
 * This function uses the argument template to display all of the templates in 
 * the edit view. It fills a select box in order to decide with template to 
 * display.
 */
function renderEditTemplate(templates) {
    clearEditTemplate();
    $.each(templates, function (i, template) {
        var listNode = document.createElement("OPTION");
        var listText = document.createTextNode(template.name);
        listNode.appendChild(listText);
        listNode.value = template.id;
        listNode.id = template.id;
        document.getElementById("edit_template_sel").appendChild(listNode);
        $.each(template.levels, function (i, level) {
            renderEditTemplateLevel(template.id, level);
        });
    });

    $("#edit_template_content").find(".Level").hide();
}

function showEditTemplate(templateId) {
    $("#edit_template_content").find(".Level").hide();
    $("#edit_template_content").find(".edit_" + templateId).show();
}

function renderEditTemplateLevel(templateId, levelData) {
    var level = document.createElement("DIV");
    level.className = "Level edit_" + templateId;
    level.id = levelData.id;
    var levelHeader = document.createElement("H6");
    var headerText = document.createTextNode(levelData.name);
    var questionList = document.createElement("UL");
    questionList.id = levelData.id + "_list";
    levelHeader.appendChild(headerText);
    level.appendChild(levelHeader);
    $.each(levelData.questions, function (index, question) {
        var questionLI = document.createElement("LI");
        questionLI.id = "edit_li" + question.id;
        var questionText = document.createTextNode(question.text);

        var editLink = document.createElement("A");
        editLink.id = "edit_icon_link" + question.id;
        editLink.onclick = function () {
            if (typeof document.getElementById("edit_li" + question.id) === 'undefined') {
                //edit on original rendering not add element
                editTemplate(question.text, question.id);
            } else {
                var updatedText = document.getElementById("edit_li" + question.id).childNodes[0].nodeValue;
                console.log("Entered new node state!!!!!   ", updatedText);
                editTemplate(updatedText, question.id);
            }

        };

        var editIcon = document.createElement("IMG");
        editIcon.src = "assets/icons/svg/edit.svg";
        editIcon.className = "edit_icon";
        editIcon.id = "edit_icon" + question.id;
        editLink.appendChild(editIcon);


        var saveEditLink = document.createElement("A");
        saveEditLink.id = "save_edit_icon_link" + question.id;
        saveEditLink.onclick = function () {
            updateQuestion(question.id, levelData.id);
        };
        saveEditLink.style.display = "none";

        var saveEditIcon = document.createElement("IMG");
        saveEditIcon.src = "assets/icons/svg/save.svg";
        saveEditIcon.className = "save_edit_icon";
        saveEditIcon.id = "save_edit_icon" + question.id;
        saveEditLink.appendChild(saveEditIcon);

        var delEditLink = document.createElement("A");
        delEditLink.id = "del_edit_icon_link" + question.id;
        delEditLink.onclick = function () {
            deleteQuestion(question.id, levelData.id);
            //addDividers(levelData.id+"_list");
        };

        var delEditIcon = document.createElement("IMG");
        delEditIcon.src = "assets/icons/svg/remove-button.svg";
        delEditIcon.className = "del_edit_icon";
        delEditIcon.id = "del_edit_icon" + question.id;
        delEditLink.appendChild(delEditIcon);

        questionLI.appendChild(questionText);
        questionLI.appendChild(editLink);
        questionLI.appendChild(saveEditLink);
        questionLI.appendChild(delEditLink);

        var editForm = document.createElement("FORM");
        editForm.id = "edit_form" + question.id;
        var editBox = document.createElement("TEXTAREA");
        editBox.id = "editbox" + question.id;
        //editBox.value = template;
        editBox.className = "edit_form";
        editBox.addEventListener("keypress", function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                updateQuestion(question.id, levelData.id);
            }
        });
        editForm.appendChild(editBox);
        
        var clear = document.createElement("DIV");
        clear.className = "clear";
        clear.id = "edit_clear_" + levelData.id + "_" + question.id;
        clear.style.display = "none";
        editForm.appendChild(clear);
        
        var editMessage = document.createElement("H8");
        editMessage.id = "edit_message_" + levelData.id + "_" + question.id;
        editMessage.style.display = "none";
        editForm.appendChild(editMessage);
        
        questionLI.appendChild(editForm);
        editForm.style.display = "none";

        questionList.appendChild(questionLI);
        var divider = document.createElement("HR");
        questionList.appendChild(divider);
    });
    level.appendChild(questionList);

    var li = document.createElement("LI");
    li.className = "add_link_li";

    var newTemplateForm = document.createElement("FORM");
    //newTemplateForm.id = "new_temp" + value.id;
    newTemplateForm.className = "new_temp_form";

    var newTemplateBox = document.createElement("TEXTAREA");
    newTemplateBox.id = "add_template_box" + levelData.id;
    newTemplateBox.className = "add_template_box";
    console.log("Setting placeholder now: ",$("#lang_toggle option:selected").val());
    $.post('data/view/html', {key: "newQuestion", lang: $("#lang_toggle option:selected").val()}, function (result) {
        console.log(result);
        newTemplateBox.placeholder = result;
    }).fail(function (result) {
        console.log("newQuestion internationalization failed.", result);
    });

    newTemplateForm.appendChild(newTemplateBox);
    li.appendChild(newTemplateForm);

    var addLink = document.createElement("A");
    addLink.id = levelData.name + "_link";
    addLink.onclick = function () {
        addQuestionTemplate(newTemplateBox.value, levelData.id);
    };
    li.appendChild(addLink);

    var addIcon = document.createElement("IMG");
    addIcon.src = "assets/icons/svg/add.svg";
    addIcon.className = "add_icon";

    //addLink.appendChild(addIcon);



    addLink.appendChild(addIcon);
    var br = document.createElement("BR");
    li.appendChild(br);
    var addMessage = document.createElement("H8");
    addMessage.id = "add_message_" + levelData.id;
    addMessage.style.color = "red";
    li.appendChild(addMessage);

    questionList.appendChild(li);




    document.getElementById("edit_template_content").appendChild(level);
    //enter key will submit newly added template
    $('#add_template_box' + levelData.id).keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            addQuestionTemplate(newTemplateBox.value, levelData.id);
        }
    });
}

function addQuestionTemplate(newTemplateText, levelId) {

    if (newTemplateText.indexOf("_") < 0) {
        $('#add_template_box' + levelId).css('border-color', 'red');
        $.post('data/view/html', {key: "noUnderscore", lang: $("#lang_toggle option:selected").val()}, function (result) {
            //$('#add_template_box'+levelId).attr("placeholder", result);
            $("#add_message_" + levelId).text(result);
        }).fail(function (result) {
            console.log("No Underscore message post failed.", result);
        });
    } else {
        if (newTemplateText[newTemplateText.length - 1] !== "?" &&
                newTemplateText[newTemplateText.length - 1] !== "." &&
                newTemplateText[newTemplateText.length - 1] !== "!") {
            $('#add_template_box' + levelId).css('border-color', 'red');
            $.post('data/view/html', {key: "noPunctuation", lang: $("#lang_toggle option:selected").val()}, function (result) {
                //$('#add_template_box'+levelId).attr("placeholder", result);
                $("#add_message_" + levelId).text(result);
            }).fail(function (result) {
                console.log("No Underscore message post failed.", result);
            });
        } else {
            //update db to reflect the edit and render changes on success
            templateId = $("#edit_template_sel option:selected").attr("id");
            $.post('data/template/question/add', {sessionId: Cookies.get("sessionId"), templateId: templateId, levelId: levelId, text: newTemplateText}, function (result) {
                $("#add_message_" + levelId).text("");
                $('#add_template_box' + levelId).css('border-color', 'green');
                var index = $("#" + levelId + "_list").children().length - 2;

                var questionLI = document.createElement("LI");
                questionLI.id = "edit_li" + result.questionId;
                var questionText = document.createTextNode(newTemplateText);

                var editLink = document.createElement("A");
                editLink.id = "edit_icon_link" + result.questionId;
                editLink.onclick = function () {
                    if (typeof document.getElementById("edit_li" + result.questionId) === 'undefined') {
                        //edit on original rendering not add element
                        editTemplate($("#editbox" + result.questionId).val(), result.questionId);
                    } else {
                        var updatedText = document.getElementById("edit_li" + result.questionId).childNodes[0].nodeValue;
                        console.log("Entered new node state!!!!!   ", updatedText);
                        editTemplate(updatedText, result.questionId);
                    }
                    
                };

                var editIcon = document.createElement("IMG");
                editIcon.src = "assets/icons/svg/edit.svg";
                editIcon.className = "edit_icon";
                editIcon.id = "edit_icon" + result.questionId;
                editLink.appendChild(editIcon);


                var saveEditLink = document.createElement("A");
                saveEditLink.id = "save_edit_icon_link" + result.questionId;
                saveEditLink.onclick = function () {
                    updateQuestion(result.questionId, levelId);
                };
                saveEditLink.style.display = "none";

                var saveEditIcon = document.createElement("IMG");
                saveEditIcon.src = "assets/icons/svg/save.svg";
                saveEditIcon.className = "save_edit_icon";
                saveEditIcon.id = "save_edit_icon" + result.questionId;
                saveEditLink.appendChild(saveEditIcon);

                var editForm = document.createElement("FORM");
                editForm.id = "edit_form" + result.questionId;
                var editBox = document.createElement("TEXTAREA");
                editBox.id = "editbox" + result.questionId;
                editBox.className = "edit_form";
                editForm.appendChild(editBox);
                editForm.style.display = "none";
                editBox.addEventListener("keypress", function(event) {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        updateQuestion(result.questionId, levelId);
                    }
                });

                var delEditLink = document.createElement("A");
                delEditLink.id = "del_edit_icon_link" + result.questionId;
                delEditLink.onclick = function () {
                    deleteQuestion(result.questionId, levelId);
                    //addDividers(levelId+"_list");
                };

                var delEditIcon = document.createElement("IMG");
                delEditIcon.src = "assets/icons/svg/remove-button.svg";
                delEditIcon.className = "del_edit_icon";
                delEditIcon.id = "del_edit_icon" + result.questionId;
                delEditLink.appendChild(delEditIcon);

                questionLI.appendChild(questionText);
                questionLI.appendChild(editLink);
                questionLI.appendChild(saveEditLink);
                questionLI.appendChild(delEditLink);
                questionLI.appendChild(editForm);
                


                if (index < 0) {
                    $("#" + levelId + "_list").prepend(questionLI);
                } else {
                    $("#" + levelId + "_list li:nth-child(" + index + ")").after(questionLI);
                }
                addDividers(levelId + "_list");

                //remove the text in the add box after adding has been completed
                $("#add_template_box" + levelId).val("");
            }).fail(function (result) {
                console.log("addQuestionTemplate unsuccessful.", result);
            });
        }
    }
}

function deleteQuestion(questionId, levelId) {
    templateId = $("#edit_template_sel option:selected").attr("id");
    $.post('data/template/question/del', {sessionId: Cookies.get("sessionId"), templateId: templateId, levelId: levelId, questionId: questionId}, function (result) {
        $("#edit_li" + questionId).next().remove();
        $("#edit_li" + questionId).remove();
    }).fail(function (result) {
        console.log("deleteQuestion post failed.", result);
    });
}

function addDividers(listId) {
    var list = $("#" + listId).children();
    list.each(function (i, currentElem) {
        if (currentElem.nextSibling && currentElem.nextSibling.nodeName == "LI" && currentElem.nodeName == "LI") {
            var divider = document.createElement("HR");
            insertAfter(divider, currentElem);
        }
        if (currentElem.nextSibling && currentElem.nextSibling.nodeName == "HR" && currentElem.nodeName == "HR") {
            currentElem.remove();
        }
    });
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function editTemplate(template, id) {
    $("#edit_icon_link" + id).hide();
    $("#save_edit_icon_link" + id).show();
    $("#edit_form" + id).show();
    $("#editbox" + id).val(template);
}

function updateQuestion(questionId, levelId) {
    var newTemplate = $('#editbox' + questionId).val().trim();
    if (newTemplate.indexOf("_") < 0) {
        //alert("A template has to contain a '_'.");
        $.post('data/view/html', {key: "noUnderscore", lang: $("#lang_toggle option:selected").val()}, function (result) {
            //alert(result);
            $("#edit_clear_" + levelId+ "_" + questionId).show();
            $("#edit_message_" + levelId+ "_" + questionId).text(result);
            $("#edit_message_" + levelId+ "_" + questionId).show();
        }).fail(function (result) {
            console.log("updateQuestion post failed.", result);
        });
    } else {
        if (newTemplate[newTemplate.length - 1] !== "?" &&
                newTemplate[newTemplate.length - 1] !== "." &&
                newTemplate[newTemplate.length - 1] !== "!") {
            //alert("A template must end in '?'");
            $.post('data/view/html', {key: "noPunctuation", lang: $("#lang_toggle option:selected").val()}, function (result) {
                //alert(result);
                $("#edit_clear_" + levelId+ "_" + questionId).show();
                $("#edit_message_" + levelId+ "_" + questionId).text(result);
                $("#edit_message_" + levelId+ "_" + questionId).show();
            }).fail(function (result) {
                console.log("updateQuestion post failed.", result);
            });
        } else {
            //update db to reflect the edit and render changes on success
            templateId = $("#edit_template_sel option:selected").attr("id");
            $.post('data/template/question/update', {sessionId: Cookies.get("sessionId"), templateId: templateId, levelId: levelId, questionId: questionId, text: newTemplate}, function (result) {
                document.getElementById("edit_li" + questionId).childNodes[0].nodeValue = newTemplate;

                $("#edit_message_" + levelId+ "_" + questionId).hide();
                $("#edit_clear_" + levelId+ "_" + questionId).hide();
                $("#edit_icon_link" + questionId).show();
                $("#save_edit_icon_link" + questionId).hide();
                $("#edit_form" + questionId).hide();
            }).fail(function (result) {
                console.log("updateQuestion update unsuccessful.", result);
            });
        }
    }
}

/*
 * This function will fill in the drop down in the memory list view with the 
 * term lists that have saved questions in them.
 */
function fillQuestionLists() {
    //----------------------------------------------------
    //Ajax call to get logged in users memory lists
    var q_list_json = '[{"term":"List1"}, {"term":"List2"}, {"term":"List3"}]';
    var q_list = JSON.parse(q_list_json);
    //----------------------------------------------------

    $.each(q_list, function (index, value) {
        var listNode = document.createElement("OPTION");
        var listText = document.createTextNode(value.term);
        listNode.appendChild(listText);
        listNode.value = value.list_name;
        document.getElementById("question_lists").appendChild(listNode);
    });
}


function renderList(listName) {
    var listStr = '[{"id":"11111", "text":"Etwas _ noch etwas11?", "term":"something"}, {"id":"222222", "text":"Etwas _ noch etwas11?", "term":"something2"}, {"id":"333333", "text":"Etwas _ noch etwas11?", "term":"something"}, {"id":"444444", "text":"Etwas _ noch etwas11?", "term":"something"}, {"id":"5555555", "text":"Etwas _ noch etwas11?", "term":"something"}]';
    var list = JSON.parse(listStr);
    if (document.contains(document.getElementById("memList"))) {
        document.getElementById("memList").remove();
    }

    var qList = document.createElement("DIV");
    qList.className = "Level";
    qList.id = "memList"
    var questionList = document.createElement("UL");
    $.each(list, function (index, value) {
        var questionLI = document.createElement("LI");
        questionLI.id = "li" + value.id;
        var questionText = document.createTextNode(value.text.replace("_", value.term));
        //var gradeScale = document.createElement("SPAN");
        //gradeScale.className = "my-rating";
        //gradeScale.id = "scale"+value.id;

        var link = document.createElement("A");
        link.onclick = function () {
            removeQuestion(value.text, value.term)
        }

        var removeIcon = document.createElement("IMG")
        removeIcon.src = "assets/icons/svg/remove-button.svg";
        removeIcon.className = "save_icon";

        link.appendChild(removeIcon);
        questionLI.appendChild(questionText);
        questionLI.appendChild(link);
        //questionLI.appendChild(gradeScale);

        questionList.appendChild(questionLI);
        var divider = document.createElement("HR");
        questionList.appendChild(divider);
    });
    qList.appendChild(questionList);
    document.getElementById("list_content").appendChild(qList);
}

function renderListView() {
    unselectAllTabs();
    document.getElementById("list_tab").className = "selected_tab";
    $("#list_content").show();
}

function renderQuesGenView() {
    unselectAllTabs();
    document.getElementById("gen_tab").className = "selected_tab";
    $("#gen_content").show();
}

function unselectAllTabs() {
    var doc = document.getElementById("tabs");
    for (var i = 0; i < doc.childNodes.length; i++) {
        if (doc.childNodes[i].className == "selected_tab") {
            doc.childNodes[i].className = "unselected_tab";
            break;
        }
    }
    $("#tab_content").children().hide();
}



/*
 * Function to open the Login/Register Panel
 */
function openPanel() {
    $("#slider").show();
    var slidingDiv = document.getElementById("slider");
    slidingDiv.style.right = 0;
    var b = document.getElementById("login_signup");
    b.setAttribute("onclick", "closePanel()");
}

/*
 * Function to close up the Login/Register panel
 */
function closePanel() {
    var slidingDiv = document.getElementById("slider");
    slidingDiv.style.right = -342;
    $("#slider").hide();
    var b = document.getElementById("login_signup");
    b.setAttribute("onclick", "openPanel()");
}



/*
 * A function to handle the search and render the results for a specific
 * search term, database and template type.
 */
function searchTerm() {
    //console.log("db: ", $("#search_db_toggle option:selected").val());
    var lang = $("#lang_toggle option:selected").val();
    var term = $("#searchTerm").val();
    var db = $("#search_db_toggle option:selected").val();
    var taxonomy = $("#q_temp_toggle option:selected").val();
    if($("#search_db_toggle option:selected").is(":disabled") || $("#q_temp_toggle option:selected").is(":disabled") ||
            term === "") {
        //show message that a search cannot be completed as such right now
        console.log("disabled");
        if(term === "") {
            $.post('data/view/html', {key: "enterTerm", lang: lang}, function (result) {
                $("#search_message").text(result);
            }).fail(function (result) {
                console.log("enterTerm internationalization failed.", result);
            });
        }else {
            if($("#search_db_toggle option:selected").is(":disabled")) {
                $.post('data/view/html', {key: "selectDB", lang: lang}, function (result) {
                    $("#search_message").text(result);
                }).fail(function (result) {
                    console.log("selectDB internationalization failed.", result);
                });
            }else {
                $.post('data/view/html', {key: "selectTemp", lang: lang}, function (result) {
                    $("#search_message").text(result);
                }).fail(function (result) {
                    console.log("selectTemp internationalization failed.", result);
                });
            }
        }
        
        $("#search_message").show();
    }else {
        $("#search_message").hide();
        console.log("Check these vals: ", db, " ", taxonomy, " ", term);
        var response = {"disambiguation": [{"word": "Love (Thing)", "extra": "..."}, {"word": "Love (Song)", "extra": "..."}, {"word": "Love (Emotion)", "extra": "..."}]};
        var response2 = {"words": [{"word": "Love", "link": "http://wiki/Love"}, {"word": "Drugs", "link": "http://wiki/Drugs"}, {"word": "Rocknroll", "link": "http://wiki/Rocknroll"}, {"word": "fuckboat", "link": "http://wiki/fuckboat"}, {"word": "shit", "link": "http://wiki/shit"}, {"word": "stupid", "link": "http://wiki/stupid"}, {"word": "flabroll", "link": "http://wiki/flabroll"}, {"word": "cheese", "link": "http://wiki/cheese"}, {"word": "spotsplat", "link": "http://wiki/spotsplat"}]};
        //var template = { "id":"111", "name":"FirstTemplate", "levels":[ { "name":"Lvl2", "id":"1231", "questions":[ { "text":"What _ is _?", "id":"11" }, { "text":"Why _ is _ interesting?", "id":"12" }, { "text":"When is _?", "id":"13" } ]},{ "name":"Lvl1", "id":"1231", "questions":[ { "text":"What _ is _?", "id":"11" }, { "text":"Why is _ interesting?", "id":"12" }, { "text":"When is _?", "id":"13" } ]}]};
        //console.log("search!! ", response2.words);


        clearSearchLevels();
        $("#search_loader").show();
        $.get('data/template', {sessionId:Cookies.get("sessionId")}, function (templates) {
            //First get the template selected in the search drop down
            console.log("Looking for Taxonomy: ",taxonomy," in ",templates);
            var template = null;
            $.each(templates, function (i, temp) {
                if(temp.name.toLowerCase() === taxonomy.toLowerCase()) {
                    template = temp;
                }
            });
            //Here we figure out how many underscores we will need to fill with the 
            //generated words.
            //console.log("result template: ",template);
            var blankCount = 0;
            $.each(template.levels, function (i, level) {
                //renderSearchLevel(value);
                //console.log(level.name," has ", level.questions.length, " questions");

                $.each(level.questions, function(j, question) {
                    blankCount += (question.text.match(/_/g) || []).length;
                });
                //console.log("Num '_' : ", blankCount);
            });
            //console.log("Num '_' : ", blankCount);


            //Now we make the call with the underscore count calculated
            var blankCount2 = blankCount;
            //console.log("term: ",term," db: ",db, " count:", blankCount);
            $.post('data/search', {term:term, dbType: db, count: blankCount}, function (result) {
                //var result = response;//remove this
                $("#search_loader").hide();
                if("disambiguation" in result) {
                    //DISAMBIGUATION
                    $.each(response.disambiguation, function(index, value) {
                        var termOption = document.createElement("OPTION");
                        termOption.value = value.word;
                        //termOption.label = value.extra;
                        termOption.id = value.extra;
                        document.getElementById("search_terms").appendChild(termOption);
                    });
                }else {
                    //BLANK-FILLER WORDS, NO DISAMBIGUATION
                    if(result.words.length === 0) {
                        //word list is empty
                        $.post('data/view/html', {key: "specifySearch", lang: lang}, function (result) {
                            $("#search_message").text(result);
                            $("#search_message").show();
                        }).fail(function (result) {
                            console.log("specifySearch internationalization failed.", result);
                        });

                    }else {
                        //console.log("words: ", words);
                        //console.log("template: ",template);
                        $.each(template.levels, function (i, level) {  

                            $.each(level.questions, function(j, question) {
                                question["id"] = i + "_" + j;
                                question["term"] = term;
                                //console.log("term: ", question["term"],"==",term);
                                //console.log("result: ", result);
                                while(question.text.includes("_")) {
                                    blankCount--;
                                    //console.log(result.words[blankCount % result.words.length]);
                                    question.text = question.text.replace("_", result.words[blankCount % result.words.length].word);
                                    //delete result.words[0];
                                }
                            });
                            //console.log(level);
                        });
                        //console.log(template);

                        $.each(template.levels, function(i, level) {
                            renderSearchLevel(level);
                        });
                    }
                }   
            }).fail(function (result) {
                console.log("Failure to get words.", response);
                $("#search_loader").hide();
            });
        }).fail(function (result) {
            console.log("Template get failed.", result);
            $("#search_loader").hide();
        });
    }
}

/*
 * This function renders a taxonomic level and the questions that were generated in
 * a level. This function will be called once for each level of the selected taxonomy.
 */
function renderSearchLevel(levelData) {
    console.log("renderSearchLevel: ", levelData);
    var level = document.createElement("DIV");
    level.className = "Level";
    var levelHeader = document.createElement("H6");
    var headerText = document.createTextNode(levelData.name);
    var questionList = document.createElement("UL");
    levelHeader.appendChild(headerText);
    level.appendChild(levelHeader);
    $.each(levelData.questions, function (index, value) {
        var questionLI = document.createElement("LI");
        questionLI.id = "gen_li" + value.id;
        var questionText = document.createTextNode(value.text.replace("_", value.term));
        var gradeScale = document.createElement("SPAN");
        gradeScale.className = "my-rating";
        gradeScale.id = "gen_scale" + value.id;

        var link = document.createElement("A");
        link.onclick = function () {
            saveQuestion(value.text, value.term);
        };

        var saveIcon = document.createElement("IMG");
        saveIcon.src = "assets/icons/svg/add.svg";
        saveIcon.className = "save_icon";

        link.appendChild(saveIcon);
        questionLI.appendChild(questionText);
        questionLI.appendChild(link);
        questionLI.appendChild(gradeScale);

        questionList.appendChild(questionLI);
        var divider = document.createElement("HR");
        questionList.appendChild(divider);
    });
    level.appendChild(questionList);
    document.getElementById("search_levels").appendChild(level);


    $.each(levelData.questions, function (index, value) {
        $("#gen_scale" + value.id).starRating({
            starSize: 15,
            totalStars: 10,
            useFullStars: true,
            disableAfterRate: false,
            callback: function (currentRating, $el) {
                if (currentRating <= 2) {
                    //ask for comment why rating is so bad
                    var li = document.getElementById("gen_li" + value.id);
                    var commentForm = document.createElement("FORM");
                    commentForm.id = "form" + value.id;
                    commentForm.className = "comment_form";
                    var commentBox = document.createElement("TEXTAREA");
                    commentBox.id = "comment" + value.id;
                    $.post('data/view/html', {key: "comment", lang: $("#lang_toggle option:selected").val()}, function (result) {
                        commentBox.placeholder = result;
                    }).fail(function (result) {
                        console.log("Failure to get comment.", result);
                    });


                    var clear = document.createElement("DIV");
                    clear.className = "clear";
                    li.appendChild(clear);
                    commentForm.appendChild(commentBox);
                    li.appendChild(commentForm);

                    //enter key will submit the comment
                    $('#comment' + value.id).keypress(function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                            $('#comment' + value.id).remove();
                        }
                    });
                }
            }
        });
    });

}


/*
 * This function is called on a click of the add icon of a generated question.
 * The term and template will be saved in the DB
 */
function saveQuestion(template, term) {
    console.log("saveQuestion clicked, template: ", template, " term:", term);
}

/*
 * This function is responsible for removing a question from the memory list
 */
function removeQuestion(template, term) {
    console.log("removeQuestion clicked, template: ", template, " term: ", term);
}

/*
 * This clears the rendered levels in the question generation view.
 */
function clearSearchLevels() {
    $("#search_levels>.Level").remove();
    $("#select_list").remove();
    $("#search_message").hide();
    $("#search_terms").empty();
}


function logIn() {
    if ($('input[name=login_email]').val() !== "") {
        $("#signin_loader").show();
        $.post('data/session/login', {email: $('input[name=login_email]').val(), password: $('input[name=login_pw]').val()}, function (result) {
            if (Cookies.get("sessionId") !== "") {
                $("#edit_template_tab").show();
            }
            Cookies.set("userId", result.userId);
            Cookies.set("sessionId", result.sessionId);
            
            $.get("data/session/user/lang", {sessionId: Cookies.get("sessionId")}, function(result) {
                $("#lang_toggle").val(result.lang);
                switchLang(result.lang);
            });

            $("#signin_loader").hide();
            $("#logged_in_title").text($('input[name=login_email]').val());
            $("#logged_in_title").show();
            $("#login_signup").hide();
            $("#logout").show();

            $.get('data/template', {sessionId: Cookies.get("sessionId")}, function (templates) {
                renderEditTemplate(templates);
                $("#q_temp_toggle>option").not(".SelectOne").remove();
                $.each(templates, function(index, template){
                    $("#q_temp_toggle").append($("<option></option>")
                        .attr("value", template.name)
                        .text(template.name));
                });
            }).fail(function (result) {
                console.log("Template get failed.", result);
            });

            clearLoginSignupFields();
            closePanel();
        }).fail(function (result) {
            $("#signin_loader").hide();
            console.log("Login failed.", result);
            Cookies.remove("sessionId");
        });
    } else {
        $.post('data/view/html', {key: "enterAnEmail", lang: $("#lang_toggle option:selected").val()}, function (result) {
            alert(result);
        }).fail(function (result) {
            console.log("Failure to get enterAnEmail.", result);
        });
    }
}
function logOut() {
    $.post('data/session/logout', {sessionId: Cookies.get("sessionId")}, function (result) {
        Cookies.remove("sessionId");
        Cookies.remove("userId")

        clearEditTemplate();
        clearSearchLevels();
        $("#edit_template_tab").hide();
        $("#login_signup").show();
        $("#logout").hide();
        $("#logged_in_title").hide();

        //after logging out we return to the generation view
        renderQuesGenView();
    }).fail(function (result) {
        console.log("Logout failed.", result);
    });
}

function signUp() {
    var email = $('input[name=signup_email]').val().trim();
    var pw1 = $('input[name=signup_pw]').val().trim();
    var pw2 = $('input[name=signup_pw2]').val().trim();
    if (email !== "") {
        if (pw1 === pw2) {
            $("#reg_loader").show();
            $("#signup_form").hide();
            $.post('data/register/create', {email: email, pwd: pw1, lang: $("#signup_lang option:selected").val()}, function (result) {
                $("#reg_loader").hide();
                $.post('data/view/html', {key: "checkEmail", lang: $("#lang_toggle option:selected").val()}, function (result) {
                    $("#reg_message").text(result);
                    $("#reg_message").show();
                }).fail(function (result) {
                    console.log("Failure to get ")
                });
            }).fail(function (result) {
                console.log("Registration unsuccessful.", result);
                $("#reg_loader").hide();
            });
        } else {
            $('input[name=signup_pw]').val("");
            $('input[name=signup_pw2]').val("");

            $.post('data/view/html', {key: "pwNoMatch", lang: $("#lang_toggle option:selected").val()}, function (result) {
                alert(result);
            }).fail(function (result) {
                console.log("Failure to get pwNoMatch.", result);
            });
        }
    } else {
        $.post('data/view/html', {key: "enterAnEmail", lang: $("#lang_toggle option:selected").val()}, function (result) {
            alert(result);
        }).fail(function (result) {
            console.log("Failure to get enterAnEmail.", result);
        });
    }
}

/*
 * 
 * This function is responsible for clearing all of the fields in the login/signup
 * sidebar. It will be performed on every login, register and sign out.
 */
function clearLoginSignupFields() {
    $("input[name=login_email]").val("");
    $("input[name=login_pw]").val("");

    $("input[name=signup_email]").val("");
    $("input[name=signup_pw]").val("");
    $("input[name=signup_pw2]").val("");

    $("#signup_lang option[value=en]").attr("selected", "selected");
}


/*
 * This function is responsible for internationalizing the QuesGen site.
 * It is responsible for changing the text fields of all of the elements
 * that have text that needs to be translated into a different language
 * in order to make the site sensible. Text such as the title of the 
 * project "QuesGen" will not be translated.
 */
function switchLang(language) {
    console.log("changing language");
    if (typeof Cookies.get("sessionId") !== 'undefined') {
        $.post('data/session/user/lang', {sessionId: Cookies.get("sessionId"), lang: language}, function (result) {
            $("#lang_toggle").val(language);
        }).fail(function (result) {
            console.log("setting user language failed.", result);
        });
    }
    
    $.post('data/view/html', {key: "searchPlaceholder", lang: language}, function (result) {
        $("#searchTerm").attr("placeholder", result);
    }).fail(function (result) {
        console.log("searchPlaceholder internationalization failed.", result);
    });
    $.post('data/view/html', {key: "quesGen", lang: language}, function (result) {
        $("#tab1_label").text(result);
    }).fail(function (result) {
        console.log("quesGen internationalization failed.", result);
    });
    $.post('data/view/html', {key: "memLists", lang: language}, function (result) {
        $("#tab2_label").text(result);
        $("#mem_list_content_head").text(result);
    }).fail(function (result) {
        console.log("memLists internationalization failed.", result);
    });
    $.post('data/view/html', {key: "loginSignup", lang: language}, function (result) {
        $("#login_signup").text(result);
    }).fail(function (result) {
        console.log("loginSignup internationalization failed.", result);
    });
    $.post('data/view/html', {key: "selectOne", lang: language}, function (result) {
        $(".SelectOne").text(result);//implicit iteration :)
    }).fail(function (result) {
        console.log("selectOne internationalization failed.", result);
    });
    $.post('data/view/html', {key: "templates", lang: language}, function (result) {
        $(".Templates").text(result);
    }).fail(function (result) {
        console.log("templates internationalization failed.", result);
    });
    $.post('data/view/html', {key: "editTemplates", lang: language}, function (result) {
        $("#tab3_label").text(result);
    }).fail(function (result) {
        console.log("editTemplates internationalization failed.", result);
    });


    $.post('data/view/html', {key: "login", lang: language}, function (result) {
        $("#login_header").text(result);
        $("#login_button").text(result);
    }).fail(function (result) {
        console.log("login internationalization failed.", result);
    });
    $.post('data/view/html', {key: "logout", lang: language}, function (result) {
        $("#logout").text(result);
    }).fail(function (result) {
        console.log("logout internationalization failed.", result);
    });
    $.post('data/view/html', {key: "emailUsername", lang: language}, function (result) {
        $("#email_usr_login").text(result);
    }).fail(function (result) {
        console.log("emailUsername internationalization failed.", result);
    });
    $.post('data/view/html', {key: "password", lang: language}, function (result) {
        $("#pw_login").text(result);
        $("#pw_signup").text(result);
    }).fail(function (result) {
        console.log("password internationalization failed.", result);
    });


    $.post('data/view/html', {key: "signup", lang: language}, function (result) {
        $("#signup_header").text(result);
        $("#signup_button").text(result);
    }).fail(function (result) {
        console.log("signup internationalization failed.", result);
    });
    $.post('data/view/html', {key: "email", lang: language}, function (result) {
        $("#email_signup").text(result);
    }).fail(function (result) {
        console.log("email internationalization failed.", result);
    });
    $.post('data/view/html', {key: "reenterPW", lang: language}, function (result) {
        $("#re_pw_signup").text(result);
    }).fail(function (result) {
        console.log("reenterPW internationalization failed.", result);
    });
    $.post('data/view/html', {key: "fName", lang: language}, function (result) {
        $("#fn_signup").text(result);
    }).fail(function (result) {
        console.log("fName internationalization failed.", result);
    });
    $.post('data/view/html', {key: "lName", lang: language}, function (result) {
        $("#ln_signup").text(result);
    }).fail(function (result) {
        console.log("lName internationalization failed.", result);
    });
    $.post('data/view/html', {key: "lang", lang: language}, function (result) {
        $("#lang_signup").text(result);
    }).fail(function (result) {
        console.log("lang internationalization failed.", result);
    });
    $.post('data/view/html', {key: "or", lang: language}, function (result) {
        $("#or").text(result);
    }).fail(function (result) {
        console.log("or internationalization failed.", result);
    });
    $.post('data/view/html', {key: "checkEmail", lang: language}, function (result) {
        $("#reg_message").text(result);
    }).fail(function (result) {
        console.log("checkEmail internationalization failed.", result);
    });
    $.post('data/view/html', {key: "specifySearch", lang: language}, function (result) {
        $("#search_message").text(result);
    }).fail(function (result) {
        console.log("specifySearch internationalization failed.", result);
    });
    
    //Switch the options for a database depending on the language also.
    $("#search_db_toggle>option").not(".SelectOne").remove();
    $("#search_db_toggle").val("");
    if(language === "en") {
        $("#search_db_toggle").append($("<option></option>")
                    .attr("value", "conceptnet")
                    .text("ConceptNet"));
        $("#search_db_toggle").append($("<option></option>")
                    .attr("value", "wordnet")
                    .text("WordNet"));
    }
    if(language === "de") {
        $("#search_db_toggle").append($("<option></option>")
                    .attr("value", "dbpedia")
                    .text("DBPedia"));
        $("#search_db_toggle").append($("<option></option>")
                    .attr("value", "germanet")
                    .text("GermaNet"));
    }
    if(language === "ja") {
        
    }
    $.post('data/view/html', {key: "noDB", lang: language}, function (result) {
        $("#search_db_toggle").append($("<option></option>")
                    .attr("value", "none")
                    .text(result));
    }).fail(function (result) {
        console.log("noDB internationalization failed.", result);
    });
    
    
    $.post('data/view/html', {key: "database", lang: language}, function (result) {
        $("#disabled_db").text(result);
    }).fail(function (result) {
        console.log("database internationalization failed.", result);
    });
    $("#q_temp_toggle").val("");
    $.post('data/view/html', {key: "template", lang: language}, function (result) {
        $("#disabled_temp").text(result);
    }).fail(function (result) {
        console.log("template internationalization failed.", result);
    });
}