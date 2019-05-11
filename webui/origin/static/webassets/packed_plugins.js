// JS assets for plugin DisplayLayerProgress
(function () {
    try {
        // source: plugin/DisplayLayerProgress/js/DisplayLayerProgress.js
        /*
         * View model for DisplayLayerProgress
         *
         * Author: Olli
         * License: AGPLv3
         */
        $(function () {
            function DisplaylayerprogressViewModel(parameters) {
                var PLUGIN_ID = "DisplayLayerProgress";
                // enable support of resetSettings
                new ResetSettingsUtil().assignResetSettingsFeature(PLUGIN_ID, function(data){
                                        // assign new settings-values // TODO find a more generic way
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnNavBar(data.showOnNavBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnPrinterDisplay(data.showOnPrinterDisplay);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showAllPrinterMessages(data.showAllPrinterMessages);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.navBarMessagePattern(data.navBarMessagePattern);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayMessagePattern(data.printerDisplayMessagePattern);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayScreenLocation(data.printerDisplayScreenLocation);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayWidth(data.printerDisplayWidth);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.addTrailingChar(data.addTrailingChar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.layerExpressions(data.layerExpressions);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showLayerInStatusBar(data.showLayerInStatusBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.showHeightInStatusBar(data.showHeightInStatusBar);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.updatePrinterDisplayWhilePrinting(data.updatePrinterDisplayWhilePrinting);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.feedrateFactor(data.feedrateFactor);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.feedrateFormat(data.feedrateFormat);
                                        self.settingsViewModel.settings.plugins.DisplayLayerProgress.debuggingEnabled(data.debuggingEnabled);
                });
        
                var self = this;
        
                // assign the injected parameters, e.g.:
                self.loginStateViewModel = parameters[0];
                self.settingsViewModel = parameters[1];
        
                self.navBarMessage = ko.observable();
        
                // startup
                self.onStartup = function () {
                    //alert("hallo");
                    var element = $("#state").find(".accordion-inner .progress");
                    if (element.length) {
                        var busyIndicator = " <i class='fa fa-spinner fa-spin busyIndicator' style='display:none'></i>";
        
                        // height
                        var label = gettext("Current Height");
                        var tooltip = gettext("Might be inaccurate!");
                        element.before("<span id='heightStateOutput' style='display:none'><span title='" + tooltip + "'>" + label + "</span>" + ": "
                            + "<strong id='state_height_message'>- / -</strong>"+busyIndicator+"  <br/></span>");
                        // layer
                        label = gettext("Layer");
                        tooltip = gettext("Shows the layer information");
                        element.before("<span id='layerStateOutput' style='display:none'> <span title='" + tooltip + "'>" + label + "</span>" + ": "
                            + "<strong id='state_layer_message'>- / -</strong>"+busyIndicator+"<br/></span>");
        
                        // call backend for update navbar and printer-display
                        OctoPrint.get("api/plugin/"+PLUGIN_ID);
                    }
        
                    $("#layerExpressionTextArea").numberedtextarea();
                };
        
                var printerDisplay = null;
                // receive data from server
                self.onDataUpdaterPluginMessage = function (plugin, data) {
        
                    if (plugin != PLUGIN_ID) {
                        return;
                    }
        
                    if (data.busy){
                        $(".busyIndicator").show();
                    } else {
                        $(".busyIndicator").hide();
                    }
        
                    // NavBar
                    if (data.navBarMessage){
                        self.navBarMessage(data.navBarMessage);
                    }
        
                    // visibility of height/layer in statebar
                    if (data.showHeightInStatusBar != null){
                        if(data.showHeightInStatusBar == true){
                            $("#heightStateOutput").show();
                        } else {
                            $("#heightStateOutput").hide();
                        }
                    }
                    if (data.showLayerInStatusBar != null){
                        if (data.showLayerInStatusBar == true){
                            $("#layerStateOutput").show();
                        } else {
                            $("#layerStateOutput").hide();
                        }
                    }
                    // State Layer
                    if (data.stateMessage){
                        var layerElement = document.getElementById("state_layer_message");
                        if (layerElement != null && data.stateMessage != null) {
                            layerElement.innerHTML = data.stateMessage;
                        }
                    }
                    // State Height
                    if (data.heightMessage){
                        var heightElement = document.getElementById("state_height_message");
                        if (heightElement != null && data.heightMessage != null) {
                            heightElement.innerHTML = data.heightMessage;
                        }
                    }
        			// Printer Display
                    if ( (printerDisplay == null && data.initPrinterDisplay) ||
                          data.initPrinterDisplay){
                        if (printerDisplay != null){
                            $("h4.ui-pnotify-title:contains('Printer Display')").parent().parent().remove();
                        }
                        //var stack_bar_bottom = {"dir1": "up", "dir2": "left", "spacing1": 0, "spacing2": 0};
                        var stack_bar_bottom = JSON.parse("{"+data.printerDisplayScreenLocation+"}");
                        printerDisplay = new PNotify({
                            title: 'Printer Display',
                            type: 'info',
                            width: data.printerDisplayWidth,
                            //addclass: "stack-bottomleft",
                            addclass: data.classDefinition,
                            stack: stack_bar_bottom,
                            hide: false
                            });
                    }
        			if (data.showDesktopPrinterDisplay && data.printerDisplay && printerDisplay != null){
                        printerDisplay.update({
                            text: '<h3 class="fontsforweb_fontid_507"><font color="lightblue" style="background-color:blue;">'+data.printerDisplay+'</font></h3>'
                        });
        			}
        
        			// NotificationMessages
        			if (data.notifyType){
        			    var notfiyType = data.notifyType;
        			    var notifyMessage = data.notifyMessage;
                        new PNotify({
                            title: 'Attention',
                            text: notifyMessage,
                            type: notfiyType,
                            hide: false
                            });
        
        			}
        
                };
        
                self.onBeforeBinding = function () {
                    self.settings = self.settingsViewModel.settings.plugins.DisplayLayerProgress;
                    // From server-settings to client-settings
                };
        
                self.onSettingsBeforeSave = function () {
                }
            }
        
            /* view model class, parameters for constructor, container to bind to
             * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
             * and a full list of the available options.
             */
            OCTOPRINT_VIEWMODELS.push({
                construct: DisplaylayerprogressViewModel,
                // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
                dependencies: ["loginStateViewModel", "settingsViewModel"],
                // Elements to bind to, e.g. #settings_plugin_DisplayLayerProgress, #tab_plugin_DisplayLayerProgress, ...
                //elements: [document.getElementById("progressinfo_plugin_navbar")]
                elements: [
                    document.getElementById("displayLayerProgress_plugin_navbar"),
                    document.getElementById("displayLayerProgress_plugin_settings")
                ]
            });
        });
        
        ;
        
        // source: plugin/DisplayLayerProgress/js/ResetSettingsUtil.js
        /**
         *
         */
        function ResetSettingsUtil(){
        
            var RESET_BUTTON_ID = "resetSettingsButton"
            var RESET_BUTTON_HTML = "<button id='"+RESET_BUTTON_ID+"' class='btn btn-warning' style='margin-right:3%'>Reset Settings</button>"
        
            this.assignResetSettingsFeature = function(PLUGIN_ID_string, mapSettingsToViewModel_function){
                var resetSettingsButtonFunction = function(){
                    var resetButton = $("#" + RESET_BUTTON_ID).hide();
                }
                // hide reset button when hidding settings. needed because of next dialog-shown event
                var settingsDialog = $("#settings_dialog");
                var settingsDialogDOMElement = settingsDialog.get(0);
        
                var eventObject = $._data(settingsDialogDOMElement, 'events');
                if (eventObject != undefined && eventObject.hide != undefined){
                    // already there, is it my function
                    if (eventObject.hide[0].handler.name != "resetSettingsButtonFunction"){
                        settingsDialog.on('hide', resetSettingsButtonFunction);
                    }
                } else {
                    settingsDialog.on('hide', resetSettingsButtonFunction);
                }
        
                // add click hook for own plugin the check if resetSettings is available
                var pluginSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_plugin_"+PLUGIN_ID_string+"] > a[href^=\\#settings_plugin_"+PLUGIN_ID_string+"]:not([hooked="+PLUGIN_ID_string+"])");
                pluginSettingsLink.attr("hooked", PLUGIN_ID_string);
                pluginSettingsLink.click(function() {
                    // call backend, is resetSettingsButtonEnabled
                    // hide reset settings button
                    $.ajax({
                        url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=isResetSettingsEnabled",
                        type: "GET"
                    }).done(function( data ){
                        var resetButton = $("#" + RESET_BUTTON_ID);
                        if (data.enabled == "true"){
                            // build-button, if necessary
                            if (resetButton.length == 0){
                                // add button to page
                                $(".modal-footer > .aboutlink").after(RESET_BUTTON_HTML);
                                resetButton = $("#" + RESET_BUTTON_ID);
                            }
        
                            // add/update click action
                            resetButton.unbind( "click" );
                            resetButton.click(function() {
                                $.ajax({
                                    url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=resetSettings",
                                    type: "GET"
                                }).done(function( data ){
                                    new PNotify({
                                        title: "Default settings saved!",
                                        text: "The plugin-settings were now reseted to default values.<br>Please do a Browser reload (Strg+F5) to update all settings in the UI.",
                                        type: "info",
                                        hide: true
                                    });
        
                                    mapSettingsToViewModel_function(data);
                                });
                            });
        
                            resetButton.show();
                        } else {
                            if (resetButton.length != 0){
                                resetButton.hide();
                            }
                        }
                    });
                });
        
                // default behaviour -> hide reset button --> if not already assigned
                var otherSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_] > a[href^=\\#settings_]:not([hooked])");
                if (otherSettingsLink.length != 0){
                    otherSettingsLink.attr("hooked", "otherSettings");
                    otherSettingsLink.click(resetSettingsButtonFunction);
                }
            }
        
        }
        
        ;
        
        // source: plugin/DisplayLayerProgress/js/jquery-numberedtextarea.js
        /*
         * NumberedTextarea - jQuery Plugin
         * Textarea with line numbering
         *
         * Copyright (c) 2015 Dariusz Arciszewski
         *
         * Requires: jQuery v2.0+
         *
         * Licensed under the GPL licenses:
         *   http://www.gnu.org/licenses/gpl.html
         */
        
        (function ($) {
        
            $.fn.numberedtextarea = function(options) {
        
                var settings = $.extend({
                    color:          null,        // Font color
                    borderColor:    null,        // Border color
                    class:          null,        // Add class to the 'numberedtextarea-wrapper'
                    allowTabChar:   false,       // If true Tab key creates indentation
                }, options);
        
                this.each(function() {
                    if(this.nodeName.toLowerCase() !== "textarea") {
                        console.log('This is not a <textarea>, so no way Jose...');
                        return false;
                    }
        
                    addWrapper(this, settings);
                    addLineNumbers(this, settings);
        
                    if(settings.allowTabChar) {
                        $(this).allowTabChar();
                    }
                });
        
                return this;
            };
        
            $.fn.allowTabChar = function() {
                if (this.jquery) {
                    this.each(function() {
                        if (this.nodeType == 1) {
                            var nodeName = this.nodeName.toLowerCase();
                            if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
                                allowTabChar(this);
                            }
                        }
                    })
                }
                return this;
            }
        
        
        
            function addWrapper(element, settings) {
                var wrapper = $('<div class="numberedtextarea-wrapper"></div>').insertAfter(element);
                $(element).detach().appendTo(wrapper);
            }
        
            function addLineNumbers(element, settings) {
                element = $(element);
        
                var wrapper = element.parents('.numberedtextarea-wrapper');
        
                // Get textarea styles to implement it on line numbers div
                var paddingLeft = parseFloat(element.css('padding-left'));
                var paddingTop = parseFloat(element.css('padding-top'));
                var paddingBottom = parseFloat(element.css('padding-bottom'));
        
                var lineNumbers = $('<div class="numberedtextarea-line-numbers"></div>').insertAfter(element);
        
                element.css({
                    paddingLeft: paddingLeft + lineNumbers.width() + 'px'
                }).on('input propertychange change keyup paste', function() {
                    renderLineNumbers(element, settings);
                }).on('scroll', function() {
                    scrollLineNumbers(element, settings);
                });
        
                lineNumbers.css({
                    paddingLeft: paddingLeft + 'px',
                    paddingTop: paddingTop + 'px',
                    lineHeight: element.css('line-height'),
                    fontFamily: element.css('font-family'),
                    width: lineNumbers.width() - paddingLeft + 'px',
                });
        
                element.trigger('change');
            }
        
            function renderLineNumbers(element, settings) {
                element = $(element);
        
                var linesDiv = element.parent().find('.numberedtextarea-line-numbers');
                var count = element.val().split("\n").length;
                var paddingBottom = parseFloat(element.css('padding-bottom'));
        
                linesDiv.find('.numberedtextarea-number').remove();
        
                for(i = 1; i<=count; i++) {
                    var line = $('<div class="numberedtextarea-number numberedtextarea-number-' + i + '">' + i + '</div>').appendTo(linesDiv);
        
                    if(i === count) {
                    	line.css('margin-bottom', paddingBottom + 'px');
                    }
                }
            }
        
            function scrollLineNumbers(element, settings) {
                element = $(element);
                var linesDiv = element.parent().find('.numberedtextarea-line-numbers');
                linesDiv.scrollTop(element.scrollTop());
            }
        
            function pasteIntoInput(el, text) {
                el.focus();
                if (typeof el.selectionStart == "number") {
                    var val = el.value;
                    var selStart = el.selectionStart;
                    el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
                    el.selectionEnd = el.selectionStart = selStart + text.length;
                } else if (typeof document.selection != "undefined") {
                    var textRange = document.selection.createRange();
                    textRange.text = text;
                    textRange.collapse(false);
                    textRange.select();
                }
            }
        
            function allowTabChar(el) {
                $(el).keydown(function(e) {
                    if (e.which == 9) {
                        pasteIntoInput(this, "\t");
                        return false;
                    }
                });
        
                // For Opera, which only allows suppression of keypress events, not keydown
                $(el).keypress(function(e) {
                    if (e.which == 9) {
                        return false;
                    }
                });
            }
        
        }(jQuery));
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin DisplayLayerProgress:", (error.stack || error));
    }
})();

// JS assets for plugin GcodeEditor
(function () {
    try {
        // source: plugin/GcodeEditor/js/GcodeEditor.js
        /*
         * View model for OctoPrint-GcodeEditor
         *
         * Author: ieatacid
         * License: AGPLv3
         */
        $(function() {
            function GcodeEditorViewModel(parameters) {
                var self = this;
        
                self.filesViewModel = parameters[0];
                self.loginState = parameters[1];
                self.printerState = parameters[2];
                self.settings = parameters[3];
        
                var _loadingFile = false;
                var _firstRun = true;
                var _selectedFilePath;
                self.files = null;
                self.title = ko.observable();
                self.gcodeTextArea = ko.observable();
                self.destinationFilename = ko.observable();
                self.maxGcodeSize = ko.observable();
                self.maxGcodeSizeMobile = ko.observable();
        
                self.saveGcode = ko.pureComputed(function() {
                    var fName = self._sanitize(self.destinationFilename());
                    var gtext = self.gcodeTextArea();
        
                    var file = new Blob([gtext], { type: "text/plain" });
        
                    OctoPrint.files.upload("local", file, { filename: _selectedFilePath + fName });
        
                    $("#gcode_edit_dialog").modal("hide");
                });
        
                self.canSaveGcode = ko.pureComputed(function() {
                    return !(self.printerState.isPrinting() && self.printerState.filename() === self.destinationFilename());
                });
        
                self.saveGcodeButtonTooltip = ko.pureComputed(function() {
                    if (!self.canSaveGcode()) {
                        return gettext("Cannot edit gcode of file that is currently printing");
                    } else {
                        return gettext("Save gcode");
                    }
                });
        
                // Modified from M33-Fio https://github.com/donovan6000/M33-Fio/blob/master/octoprint_m33fio/static/js/m33fio.js#L3970
                function showGcodeEditor(url, name, header, onloadCallback, delay) {
                    var str = getGcodePathAndName(getRootFilePath(), url);
        
                    if(str.split("/").length > 2) {
                        _selectedFilePath = str.substring(1, str.lastIndexOf("/")) + "/";
                    } else {
                        _selectedFilePath = "";
                    }
        
                    // Send request
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "text",
                        data: null,
                        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                        traditional: true,
                        processData: true,
                        headers: {
                            "Pragma": "no-cache",
                            "Expires": "0",
                            "Cache-Control": "no-cache, no-store, must-revalidate"
                        },
                        beforeSend: function() {
                            $('#loading_modal').modal("show");
                        }
                    // Done
                    }).done(function(data) {
                        onloadCallback();
        
                        self.title(header);
        
                        self.destinationFilename(name);
        
                        self.gcodeTextArea(data);
        
                        $("#gcode_edit_dialog").modal("show");                
                    });
                }
        
                $('body').on('shown', '#gcode_edit_dialog', function(e){
                    $('#loading_modal').modal("hide");
                });
        
                function removeEditButtons() {
                    $("#files div.gcode_files div.entry .action-buttons div.btn-mini.editGcode").remove();
                }
        
                function disableEditButton(name, reason) {
                    var select = _.sprintf(gettext("#files div.gcode_files div.entry .title:contains('%(filename)s')"), {filename: name});
        
                    if($(select).parent().children().eq(4).children().eq(2).hasClass('editGcode')) {
                        $(select).parent().children().eq(4).children().eq(2).addClass('disabled');
        
                        if(reason.length > 0) {
                            $(select).parent().children().eq(4).children().eq(2).prop('title', reason);
                        }
                    }
                }
        
                function enableEditButton(name) {
                    var select = _.sprintf(gettext("#files div.gcode_files div.entry .title:contains('%(filename)s')"), {filename: name});
        
                    if($(select).parent().children().eq(4).children().eq(2).hasClass('editGcode')) {
                        $(select).parent().children().eq(4).children().eq(2).removeClass('disabled');
                        $(select).parent().children().eq(4).children().eq(2).prop('title', 'Edit');
                    }
                }
        
                // Modified from M33-Fio https://github.com/donovan6000/M33-Fio/blob/master/octoprint_m33fio/static/js/m33fio.js#L5026
                // Add edit buttons to G-code
                function addEditButtonsToGcode() {
        
                    // Remove all edit buttons
                    // $("#files div.gcode_files div.entry .action-buttons div.btn-mini.editGcode").remove();
        
                    // Go through all file entries
                    $("#files div.gcode_files div.entry .action-buttons").each(function() {
        
                        // Check if file is G-code
                        if($(this).children().children("i.icon-print, i.fa.fa-print").length) {
                            var url = $(this).children().eq(1).attr("href");
                            var size = _bytesFromSize($(this).parent().children().eq(2).text());
        
                            // Add edit button
                            if(!$(this).children().eq(1).hasClass("disabled")) {
                                if(size > self.maxGcodeSize() || (OctoPrint.coreui.browser.mobile && size > self.maxGcodeSizeMobile())) {
                                    $(this).children("a.btn-mini").after("\
                                        <div class=\"btn btn-mini editGcode disabled\" title=\"" + encodeQuotes(gettext("File size too large")) + "\">\
                                            <i class=\"icon-pencil\"></i>\
                                        </div>\
                                    ");
                                }
                                else if(url.indexOf("/files/local/") === -1) {
                                    $(this).children("a.btn-mini").after("\
                                        <div class=\"btn btn-mini editGcode disabled\" title=\"" + encodeQuotes(gettext("Not local file")) + "\">\
                                            <i class=\"icon-pencil\"></i>\
                                        </div>\
                                    ");
                                }
                                else if(self.printerState.isPrinting() && self.printerState.filename() === $(this).children().parent().parent().children().eq(0).text()) {
                                    $(this).children("a.btn-mini").after("\
                                        <div class=\"btn btn-mini editGcode disabled\" title=\"" + encodeQuotes(gettext("File is currently printing")) + "\">\
                                            <i class=\"icon-pencil\"></i>\
                                        </div>\
                                    ");
                                }
                                else {
                                    $(this).children("a.btn-mini").after("\
                                        <div class=\"btn btn-mini editGcode\" title=\"" + encodeQuotes(gettext("Edit")) + "\">\
                                            <i class=\"icon-pencil\"></i>\
                                        </div>\
                                    ");
                                }
                            }
                        }
                    });
        
                    // Check if user isn't logged in
                    if(!self.loginState.loggedIn()) {
                        // Disable edit buttons
                        $("#files div.gcode_files div.entry .action-buttons div.btn-mini.editGcode").addClass("disabled");
                    }
        
                    // Edit button click event
                    $("#files div.gcode_files div.entry .action-buttons div.btn-mini.editGcode").click(function() {
        
                        var button = $(this);
        
                        // Blur self
                        button.blur();
        
                        // Check if button is not disabled
                        if(!button.hasClass("disabled")) {
        
                            // Check if not already loading file
                            if(!_loadingFile) {
        
                                // Set loading file
                                _loadingFile = true;
        
                                // Enable other edit buttons
                                // $("#files div.gcode_files div.entry .action-buttons div.btn-mini.editGcode").removeClass("disabled");
        
                                // Set icon to spinning animation
                                button.addClass("disabled").children("i").removeClass("icon-pencil").addClass("icon-spinner icon-spin");
        
                                setTimeout(function() {
        
                                    // Show G-code editor
                                    showGcodeEditor(button.parent().children("a.btn-mini").attr("href"),        // url,
                                        button.parent().parent().children("div").eq(0).text(),                  // name,
                                        _.sprintf(gettext("Editing %(fileName)s"),                              // header,
                                            {fileName: htmlEncode(typeof self.files.currentPath === "undefined" ||
                                            self.files.currentPath().length == 0 ? "" :
                                            "/" + self.files.currentPath() + "/") +
                                            button.parent().parent().children("div").eq(0).html()}),
                                        function() {                                                            // onloadCallback
        
                                            setTimeout(function() {
        
                                                // Clear loading file
                                                _loadingFile = false;
        
                                                // Restore edit icon and enable button
                                                button.removeClass("disabled").children("i").removeClass("icon-spinner icon-spin").addClass("icon-pencil");
                                            }, 0);
                                        }, 0);
                                }, 200);
                            }
                        }
                    });
        
                    _firstRun = false;
                }
        
                function _bytesFromSize(size_str) {
                    return bytesFromSize(size_str.split("Size: ")[1]);
                }
        
                // Get root file path
                function getRootFilePath() {
        
                    // Initialize entry
                    var entry = self.files.listHelper.allItems[0];
        
                    // Check if OctoPrint version doesn't use upload folders
                    if(entry && !entry.hasOwnProperty("parent")) {
        
                        // Construct root file path
                        var root = {
                            children: {}
                        };
        
                        // Go throguh all entries
                        for(var index in self.files.listHelper.allItems)
        
                            // Add entry to root's children
                            root.children[index] = self.files.listHelper.allItems[index];
        
                        // Return root
                        return root;
                    }
        
                    // Loop while entry has a parent
                    while(entry && entry.hasOwnProperty("parent") && typeof entry["parent"] !== "undefined")
        
                        // Set entry to its parent
                        entry = entry["parent"];
        
                    // Return entry
                    return entry;
                }
        
                // Get G-code path and name
                function getGcodePathAndName(entry, gcodeUrl) {
        
                    // Check if entry is a folder
                    if (entry && entry.hasOwnProperty("children"))
        
                        // Go through each entry in the folder
                        for(var child in entry.children) {
        
                            // Check if current child is the specified G-code file
                            var value = getGcodePathAndName(entry.children[child], gcodeUrl);
                            if(typeof value !== "undefined")
        
                                // Return upload date
                                return value;
                        }
        
                    // Otherwise check if entry is the specified G-code file
                    else if(entry && entry.hasOwnProperty("name") && entry.refs && entry.refs.hasOwnProperty("download") && entry["refs"]["download"] === gcodeUrl)
        
                        // Return path and name
                        return (typeof self.files.currentPath !== "undefined" ? "/" : "") + (entry.hasOwnProperty("path") ? entry["path"] : entry["name"]);
                }
        
                // Encode quotes https://github.com/donovan6000/M33-Fio/blob/master/octoprint_m33fio/static/js/m33fio.js#L681
                function encodeQuotes(text) {
        
                    // Return text with encoded quotes
                    return String(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
                }
        
                // Encode html entities https://github.com/donovan6000/M33-Fio/blob/master/octoprint_m33fio/static/js/m33fio.js#L688
                function htmlEncode(value) {
        
                    // Return encoded html
                    return $("<div>").text(value).html().replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
                }
        
                // https://github.com/foosel/OctoPrint/blob/master/src/octoprint/static/js/app/viewmodels/slicing.js#L294
                self._sanitize = function(name) {
                    return name.replace(/[^a-zA-Z0-9\-_\.\(\) ]/g, "").replace(/ /g, "_");
                };
        
                self.onStartupComplete = function() {
                    self.maxGcodeSize(bytesFromSize(self.settings.settings.plugins.GcodeEditor.maxGcodeSize()));
                    self.maxGcodeSizeMobile(bytesFromSize(self.settings.settings.plugins.GcodeEditor.maxGcodeSizeMobile()));
        
                    addEditButtonsToGcode();
                }
        
                self.onSettingsHidden = function() {
                    self.maxGcodeSize(bytesFromSize(self.settings.settings.plugins.GcodeEditor.maxGcodeSize()));
                    self.maxGcodeSizeMobile(bytesFromSize(self.settings.settings.plugins.GcodeEditor.maxGcodeSizeMobile()));
        
                    removeEditButtons();
                    addEditButtonsToGcode();
                }
        
                self.onAllBound = function(payload) {
        
                    // Modified from M33-Fio https://github.com/donovan6000/M33-Fio/blob/master/octoprint_m33fio/static/js/m33fio.js#L18516
                    // Go through all view models
                    for(var viewModel in payload) {
        
                        // Otherwise check if view model is files view model
                        if(payload[viewModel].constructor.name === "FilesViewModel" || payload[viewModel].constructor.name === "GcodeFilesViewModel") {
        
                            // Set files
                            self.files = payload[viewModel];
        
                            // Replace list helper update items
                            var originalUpdateItems = self.files.listHelper._updateItems;
                            self.files.listHelper._updateItems = function() {
        
                                // Update items
                                originalUpdateItems();
        
                                removeEditButtons();
                                addEditButtonsToGcode();
                            }
                        }
                    }
                }
        
                self.onUserLoggedIn = function() {
                    if(!_firstRun) {
                        removeEditButtons();
                        addEditButtonsToGcode();
                    }
                }
        
                self.onUserLoggedOut = function() {
                    removeEditButtons();
                }
        
                self.onEventPrintStarted = function(payload) {
                    disableEditButton(payload.name, "Can't edit while printing");
                }
        
                self.onEventPrintDone = function(payload) {
                    var fileName = payload.file.substr(payload.file.lastIndexOf("/") + 1, payload.file.length);
        
                    setTimeout(function() {
                        enableEditButton(fileName);
                    }, 100);
                }
            }
        
            OCTOPRINT_VIEWMODELS.push([
                GcodeEditorViewModel,
        
                ["filesViewModel", "loginStateViewModel", "printerStateViewModel", "settingsViewModel"],
                ["#gcode_edit_dialog"]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin GcodeEditor:", (error.stack || error));
    }
})();

// JS assets for plugin TerminalCommands
(function () {
    try {
        // source: plugin/TerminalCommands/js/TerminalCommands.js
        /*
         * View model for OctoPrint-TerminalCommands
         *
         * Author: ieatacid
         * License: AGPLv3
         */
        $(function() {
            function TerminalCommandsViewModel(parameters) {
                var self = this;
        
                self.terminalViewModel = parameters[0];
                self.settingsViewModel = parameters[1];
                self.loginState = parameters[2];
        
                self.terminalCommands = ko.observableArray([]);
        
                self.addTerminalCommand = function(data) {
                    console.log("addTerminalCommand: ")
                    console.log(data);
                    self.terminalCommands.push({name: "", commands: ""})
                };
        
                self.removeTerminalCommand = function(filter) {
                    self.terminalCommands.remove(filter);
                };
        
                function getCmdFromName(name) {
                    console.log("getCmdFromName: " + name);
                    var data = self.terminalCommands();
                    for(var i = 0; i < data.length; i++) {
                        if(name == (typeof data[i].name === 'function' ? data[i].name() : data[i].name)) {
                            return (typeof data[i].commands === 'function' ? data[i].commands() : data[i].commands);
                        }
                    }
                }
        
                // From: https://github.com/foosel/OctoPrint/blob/master/src/octoprint/static/js/app/viewmodels/terminal.js#L320
                // To bypass the terminal input textarea and not add to command history
                var commandRe = /^(([gmt][0-9]+)(\.[0-9+])?)(\s.*)?/i;
                self.sendCommand = function(command) {
                    if(!command) {
                        return;
                    }
        
                    var commandToSend = command;
                    var commandMatch = commandToSend.match(commandRe);
        
                    if(commandMatch !== null) {
                        var fullCode = commandMatch[1].toUpperCase(); // full code incl. sub code
                        var mainCode = commandMatch[2].toUpperCase(); // main code only without sub code
        
                        if(self.terminalViewModel.blacklist.indexOf(mainCode) < 0 && self.terminalViewModel.blacklist.indexOf(fullCode) < 0) {
                            // full or main code not on blacklist -> upper case the whole command
                            commandToSend = commandToSend.toUpperCase();
                        } else {
                            // full or main code on blacklist -> only upper case that and leave parameters as is
                            commandToSend = fullCode + (commandMatch[4] !== undefined ? commandMatch[4] : "");
                        }
                    }
        
                    if(commandToSend) {
                        OctoPrint.control.sendGcode(commandToSend);
        
                        /**** don't add to command history ****/
                            // .done(function() {
                                // self.terminalViewModel.cmdHistory.push(command);
                                // self.terminalViewModel.cmdHistory.slice(-300); // just to set a sane limit to how many manually entered commands will be saved...
                                // self.terminalViewModel.cmdHistoryIdx = self.terminalViewModel.cmdHistory.length;
                                // self.terminalViewModel.command("");
                            // });
                    }
                };
        
                function removeButtonsFromTermTab() {
                    $(".termctrl").remove();
                }
        
                function addButtonsToTermTab() {
                    console.log("addButtonsToTermTab");
                    console.log("len: %i", self.terminalCommands().length);
                    $(".termctrl").remove();
        
                    if(!self.loginState.loggedIn()) {
                        return;
                    }
        
                    if(self.terminalCommands().length > 0) {
                        $("div.terminal").after("\
                            <hr class=\"termctrl top-hr\">\
                            <form class=\"form-horizontal termctrl\">\
                                <div class=\"termctrl\">\
                                </div>\
                            </form>\
                            <hr class=\"termctrl bottom-hr\">\
                        ");
                    }
        
                    // copy and reverse array so buttons appear in the order they're added (!)
                    self.terminalCommands().slice(0).reverse().forEach(function(data) {
                        var name, commands;
        
                        if(typeof data.name === 'function') {
                            name = data.name();
                            commands = data.commands();
                        }
                        else {
                            name = data.name;
                            commands = data.commands;
                        }
                        console.log("Adding button: [" + name + "]  " + commands);
                        $("div.termctrl").after("\
                            <button type=\"button\" class=\"btn termctrl\">" + name + "</button>\
                        ");
                    });
        
                    $("button.termctrl").click(function() {
                        var button = $(this);
                        var commandStr = getCmdFromName(button.text());
                        var cmds = commandStr.split(";");
                        var nCmds = cmds.length;
                        console.log("Click: [" + button.text() + "]  " + commandStr);
        
                        if(nCmds > 1) {
                            console.log("Multiple commands...");
                            var i = 0;
                            do {
                                console.log("send( " + cmds[i] + " )");
                                self.sendCommand(cmds[i]);
                                i++;
                                nCmds--;
                            } while(nCmds > 0);
                        } else {
                            console.log("send( " + cmds[i] + " )");
                            self.sendCommand(commandStr);
                        }
                    });
                }
        
                function printCommandArray() {
                    self.terminalCommands().forEach(function(data, i) {
                        var name, command;
                        if(typeof data.name === 'function') {
                            name = data.name();
                            commands = data.commands();
                        }
                        else {
                            name = data.name;
                            commands = data.commands;
                        }
                        console.log("printCommandArray:");
                        console.log("[" + name + "]  " + commands);
                    })
                }
        
                self.onUserLoggedIn = function() {
                    addButtonsToTermTab();
        
                }
        
                self.onUserLoggedOut = function() {
                    removeButtonsFromTermTab();
                }
        
                self.onBeforeBinding = function () {
                    self.terminalCommands(self.settingsViewModel.settings.plugins.TerminalCommands.controls.slice(0));
                    // printCommandArray();
                    addButtonsToTermTab();
                };
        
                self.onSettingsBeforeSave = function () {
                    self.settingsViewModel.settings.plugins.TerminalCommands.controls(self.terminalCommands.slice(0));
                    // printCommandArray();
                    addButtonsToTermTab();
                }
            }
        
            OCTOPRINT_VIEWMODELS.push([
                TerminalCommandsViewModel,
                [ "terminalViewModel", "settingsViewModel", "loginStateViewModel"],
                [ "#settings_plugin_TerminalCommands" ]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin TerminalCommands:", (error.stack || error));
    }
})();

// JS assets for plugin actioncommands
(function () {
    try {
        // source: plugin/actioncommands/js/actioncommands.js
        $(function() {
            function ActionCommandsViewModel(parameters) {
                var self = this;
        
                self.global_settings = parameters[0];
        
                self.command_definitions = ko.observableArray();
        
                self.addCommandDefinition = function() {
                    self.command_definitions.push({action:"", type:"", command:"", enabled: true});
                };
        
                self.removeCommandDefinition = function(definition) {
                    self.command_definitions.remove(definition);
                };
        
                self.onBeforeBinding = function () {
                    self.settings = self.global_settings.settings.plugins.actioncommands;
                    self.command_definitions(self.settings.command_definitions.slice(0));
                };
        
                self.onSettingsBeforeSave = function () {
                    self.global_settings.settings.plugins.actioncommands.command_definitions(self.command_definitions.slice(0));
                }
            }
        
            ADDITIONAL_VIEWMODELS.push([
                ActionCommandsViewModel,
                ["settingsViewModel"],
                ["#settings_plugin_actioncommands"]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin actioncommands:", (error.stack || error));
    }
})();

// JS assets for plugin actiontrigger
(function () {
    try {
        // source: plugin/actiontrigger/js/actiontrigger.js
        $(function() {
          function ActionTriggerViewModel(parameters) {
            var self = this;
        
            self.loginState = parameters[0];
            self.printerState = parameters[1];
            self.control = parameters[2];
            self.settingsViewModel = parameters[3];
        
            self.actionTriggerTemplate = ko.observable(undefined);
        
            self.showActionTriggerDialog = function (data) {
              var actionTriggerDialog = $("#action_trigger_dialog");
              var actionTriggerDialogAck = $(".action_trigger_dialog_acknowledge", actionTriggerDialog);
        
              $(".action_trigger_title", actionTriggerDialog).text(data.title);
              $(".action_trigger_dialog_message", actionTriggerDialog).text(data.message);
              actionTriggerDialogAck.unbind("click");
              actionTriggerDialogAck.bind("click", function (e) {
                e.preventDefault();
                $("#action_trigger_dialog").modal("hide");
                self.showControls();
                //prob going to do some stuff here huh.
              });
              actionTriggerDialog.modal({
                show: 'true',
                backdrop:'static',
                keyboard: false
              });
        
        
            };
        
            //$('#action_trigger_dialog').on('hidden', function(){
            //  $('#action_trigger_dialog').data('modal', null);
            //});
        
            self.onBeforeBinding = function() {
              self.settings = self.settingsViewModel.settings;
            };
        
            self.showControls = function() {
              $('#tabs a[href="#control"]').tab('show')
            };
        
            self.onDataUpdaterPluginMessage = function (plugin, data) {
              if (plugin != "actiontrigger") {
                return;
              };
        
              var messageType = data.type;
              var messageData = data.data;
        
              // Process action_trigger call from plugin
              switch (messageType) {
                case "filament":
                  messageData.title = "Attention! Filament stop detected!";
                  self.actionTriggerTemplate(messageType);
                  self.showActionTriggerDialog(messageData);
                  break;
                case "door_open":
                  messageData.title = "Attention! Door is open!";
                  self.actionTriggerTemplate(messageType);
                  self.showActionTriggerDialog(messageData);
                  break;
                case "door_closed":
                  $("#action_trigger_dialog").modal("hide");
                  break;
        
        
                //Do nothing
              };
            };
        
          };
          ADDITIONAL_VIEWMODELS.push([ActionTriggerViewModel, ["loginStateViewModel", "printerStateViewModel", "controlViewModel", "settingsViewModel"], document.getElementById("action_trigger_dialog")]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin actiontrigger:", (error.stack || error));
    }
})();

// JS assets for plugin active_filters
(function () {
    try {
        // source: plugin/active_filters/js/knockout.persist.js
        (function(ko) {
        
            // Don't crash on browsers that are missing localStorage
            if (typeof (localStorage) === "undefined") { return; }
        
            ko.extenders.persist = function(target, key) {
        
                var initialValue = target();
        
                // Load existing value from localStorage if set
                if (key && localStorage.getItem(key) !== null) {
                    try {
                        initialValue = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                    }
                }
                target(initialValue);
        
                // Subscribe to new values and add them to localStorage
                target.subscribe(function (newValue) {
                    localStorage.setItem(key, ko.toJSON(newValue));
                });
                return target;
        
            };
        
        })(ko);
        ;
        
        // source: plugin/active_filters/js/active_filters.js
        $(function() {
        	function activeFiltersPluginViewModel(viewModels) {
        		var self = this;
        		
        		self.onAfterBinding = function () {
        			terminal = viewModels[0];
        			//cleanup potential manually removed filters
        			currentFilters = terminal.filters();
        			savedValues = JSON.parse(localStorage.getItem('terminal.activeFilters'));
        			cleanValues = _.filter(savedValues, function(value) {
        					return currentFilters.some(function(e) { return e.regex == value; } );
        			});
        			localStorage.setItem('terminal.activeFilters', ko.toJSON(cleanValues));
        			
        			terminal.activeFilters = terminal.activeFilters.extend({ persist: 'terminal.activeFilters' });
        		}
        	}
        
        	OCTOPRINT_VIEWMODELS.push([
        		activeFiltersPluginViewModel, 
        		["terminalViewModel"],[]
        	]);
        });
        
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin active_filters:", (error.stack || error));
    }
})();

// JS assets for plugin bedlevelvisualizer
(function () {
    try {
        // source: plugin/bedlevelvisualizer/js/bedlevelvisualizer.js
        $(function () {
        	function bedlevelvisualizerViewModel(parameters) {
        		var self = this;
        
        		self.settingsViewModel = parameters[0];
        		self.controlViewModel = parameters[1];
        		self.loginStateViewModel = parameters[2];
        
        		self.processing = ko.observable(false);
        		self.mesh_data = ko.observableArray([]);
        		self.mesh_data_x = ko.observableArray([]);
        		self.mesh_data_y = ko.observableArray([]);
        		self.mesh_data_z_height = ko.observable();
        		self.save_mesh = ko.observable();
        		self.mesh_status = ko.computed(function(){
        			if(self.processing()){
        				return 'Collecting mesh data.';
        			}
        			if (self.save_mesh() && self.mesh_data().length > 0) {
        				return 'Using saved mesh data from ' + self.settingsViewModel.settings.plugins.bedlevelvisualizer.mesh_timestamp() + '.';
        			} else {
        				return 'Update mesh.'
        			}
        		});
        		
        		self.onBeforeBinding = function() {
        			self.mesh_data(self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh());
        			self.mesh_data_x(self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_x());
        			self.mesh_data_y(self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_y());
        			self.mesh_data_z_height(self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_z_height());
        			self.save_mesh(self.settingsViewModel.settings.plugins.bedlevelvisualizer.save_mesh());
        		}
        		
        		self.onAfterBinding = function() {
        			$('div#settings_plugin_bedlevelvisualizer i[data-toggle="tooltip"],div#tab_plugin_bedlevelvisualizer i[data-toggle="tooltip"],div#wizard_plugin_bedlevelvisualizer i[data-toggle="tooltip"],div#settings_plugin_bedlevelvisualizer pre[data-toggle="tooltip"]').tooltip();
        		}
        		
        		self.onEventSettingsUpdated = function (payload) {
        			self.mesh_data(self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh());
        			self.save_mesh(self.settingsViewModel.settings.plugins.bedlevelvisualizer.save_mesh());
        		}
        
        		self.onDataUpdaterPluginMessage = function (plugin, mesh_data) {
        			if (plugin !== "bedlevelvisualizer") {
        				return;
        			}
        			if (mesh_data.mesh) {
        				if (mesh_data.mesh.length > 0) {
        					var x_data = [];
        					var y_data = [];
        					
        					for(var i = 0;i <= (mesh_data.mesh[0].length - 1);i++){
        						if((mesh_data.bed.type == "circular") || self.settingsViewModel.settings.plugins.bedlevelvisualizer.use_center_origin()){
        							x_data.push(Math.round(mesh_data.bed.x_min - (mesh_data.bed.x_max/2)+i/(mesh_data.mesh[0].length - 1)*(mesh_data.bed.x_max - mesh_data.bed.x_min)));
        						} else {
        							x_data.push(Math.round(mesh_data.bed.x_min+i/(mesh_data.mesh[0].length - 1)*(mesh_data.bed.x_max - mesh_data.bed.x_min)));
        						}
        					};
        					
        					for(var i = 0;i <= (mesh_data.mesh.length - 1);i++){
        						if((mesh_data.bed.type == "circular") || self.settingsViewModel.settings.plugins.bedlevelvisualizer.use_center_origin()){
        							y_data.push(Math.round(mesh_data.bed.y_min - (mesh_data.bed.y_max/2)+i/(mesh_data.mesh.length - 1)*(mesh_data.bed.y_max - mesh_data.bed.y_min)));
        						} else {
        							y_data.push(Math.round(mesh_data.bed.y_min+i/(mesh_data.mesh.length - 1)*(mesh_data.bed.y_max - mesh_data.bed.y_min)));
        						}
        					};
        					
        					self.drawMesh(mesh_data.mesh,true,x_data,y_data,mesh_data.bed.z_max);
        				}
        				return;
        			}
        			if (mesh_data.error) {
        				new PNotify({
        						title: 'Bed Visualizer Error',
        						text: '<div class="row-fluid"><p>Looks like your settings are not correct or there was an error.</p><p>Please see the <a href="https://github.com/jneilliii/OctoPrint-BedLevelVisualizer/#tips" target="_blank">Readme</a> for configuration tips.</p></div><p><pre style="padding-top: 5px;">'+mesh_data.error+'</pre></p>',
        						hide: true
        						});	
        				return;
        			}
        			return;
        		};
        
        		self.drawMesh = function (mesh_data_z,store_data,mesh_data_x,mesh_data_y,mesh_data_z_height) {
        			// console.log(mesh_data_z+'\n'+store_data+'\n'+mesh_data_x+'\n'+mesh_data_y+'\n'+mesh_data_z_height);
        			clearTimeout(self.timeout);
        			self.processing(false);
        			if(self.save_mesh()){
        				if(store_data){
        					self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh(mesh_data_z);
        					self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_x(mesh_data_x);
        					self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_y(mesh_data_y);
        					self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_z_height(mesh_data_z_height);
        					self.settingsViewModel.settings.plugins.bedlevelvisualizer.mesh_timestamp(new Date().toLocaleString());
        					self.settingsViewModel.saveData();
        				};
        			}
        			
        			try {
        				var data = [{
        						z: mesh_data_z,
        						x: mesh_data_x,
        						y: mesh_data_y,
        						type: 'surface'
        					}
        				];
        
        				var layout = {
        					//title: 'Bed Leveling Mesh',
        					autosize: true,
        					margin: {
        						l: 0,
        						r: 0,
        						b: 0,
        						t: 0
        					},
        					scene: {
        						camera: {
        							eye: {
        								x: -1.25,
        								y: -1.25,
        								z: .25
        							}
        						},
        						zaxis: {
        							range: [-2,2]
        						}
        					}
        				};
        				
        				var config_options = {
        					modeBarButtonsToRemove: ['resetCameraLastSave3d'],
        					modeBarButtonsToAdd: [{
        					name: 'Move Nozzle',
        					icon: Plotly.Icons.autoscale,
        					toggle: true,
        					click: function(gd, ev) {
        						var button = ev.currentTarget;
        						var button_enabled = button._previousVal || false;
        						if(!button_enabled){
        							gd.on('plotly_click', function(data){
        									var gcode_command = 'G1 X' + data.points[0].x + ' Y' + data.points[0].y
        									OctoPrint.control.sendGcode([gcode_command]);
        								});
        							button._previousVal = true;
        						} else {
        							gd.removeAllListeners('plotly_click');
        							button._previousVal = null;
        						}
        					}
        					}]
        				}
        				
        				Plotly.react('bedlevelvisualizergraph', data, layout, config_options);
        			} catch(err) {
        				new PNotify({
        						title: 'Bed Visualizer Error',
        						text: '<div class="row-fluid">Looks like your settings are not correct or there was an error.  Please see the <a href="https://github.com/jneilliii/OctoPrint-BedLevelVisualizer/#octoprint-bedlevelvisualizer" target="_blank">Readme</a> for configuration hints.</div><pre style="padding-top: 5px;">'+err+'</pre>',
        						type: 'error',
        						hide: false
        						});
        			}
        		};
        
        		self.onAfterTabChange = function (current, previous) {
        			if (current === "#tab_plugin_bedlevelvisualizer" && self.loginStateViewModel.isUser() && !self.processing()) {
        				if (!self.save_mesh()) {
        					if (self.controlViewModel.isOperational() && !self.controlViewModel.isPrinting()) {
        						self.updateMesh();
        					}
        				} else if (self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh().length > 0) {
        					self.drawMesh(self.mesh_data(),false,self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_x(),self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_y(),self.settingsViewModel.settings.plugins.bedlevelvisualizer.stored_mesh_z_height());
        				} 
        				return;
        			}
        			
        			if (previous === "#tab_plugin_bedlevelvisualizer") {
        				//Plotly.purge('bedlevelvisualizergraph');
        			}
        		};
        
        		self.updateMesh = function () {
        			self.processing(true);
        			self.timeout = setTimeout(function(){self.processing(false);new PNotify({title: 'Bed Visualizer Error',text: '<div class="row-fluid">Timeout occured before prcessing completed. Processing may still be running or there may be a configuration error. Consider increasing the timeout value in settings.</div>',type: 'info',hide: true});}, (parseInt(self.settingsViewModel.settings.plugins.bedlevelvisualizer.timeout())*1000));
        			var gcode_cmds = self.settingsViewModel.settings.plugins.bedlevelvisualizer.command().split("\n");
        			if (gcode_cmds.indexOf("@BEDLEVELVISUALIZER") == -1){
        				gcode_cmds = ["@BEDLEVELVISUALIZER"].concat(gcode_cmds);
        			}
        			// clean extraneous code
        			gcode_cmds = gcode_cmds.filter(function(array_val) {
        					var x = Boolean(array_val);
        					return x == true;
        				});
        				
        			console.log(gcode_cmds);
        				
        			OctoPrint.control.sendGcode(gcode_cmds);
        		};
        	}
        
        	OCTOPRINT_VIEWMODELS.push({
        		construct: bedlevelvisualizerViewModel,
        		dependencies: ["settingsViewModel", "controlViewModel", "loginStateViewModel"],
        		elements: ["#settings_plugin_bedlevelvisualizer", "#tab_plugin_bedlevelvisualizer", "#wizard_plugin_bedlevelvisualizer"]
        	});
        });
        
        ;
        
        // source: plugin/bedlevelvisualizer/js/plotly-latest.min.js
        /**
        * plotly.js v1.35.2
        * Copyright 2012-2018, Plotly, Inc.
        * All rights reserved.
        * Licensed under the MIT license
        */
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin bedlevelvisualizer:", (error.stack || error));
    }
})();

// JS assets for plugin cost
(function () {
    try {
        // source: plugin/cost/js/cost.js
        /*
         * View model for OctoPrint-Cost
         *
         * Author: Jan Szumiec
         * License: MIT
         */
        $(function() {
            function CostViewModel(parameters) {
                var printerState = parameters[0];
                var settingsState = parameters[1];
                var filesState = parameters[2];
                var self = this;
        
                // There must be a nicer way of doing this.
        
        	settingsState.check_cost = ko.observable(true);
        
        	settingsState.costPerWeight = ko.pureComputed(function() {
                var currency = settingsState.settings.plugins.cost.currency();
                var weight = settingsState.settings.plugins.cost.weight();
                return currency + '/' + weight;
        	});
        	settingsState.costPerLength = ko.pureComputed(function() {
                var currency = settingsState.settings.plugins.cost.currency();
                var length = settingsState.settings.plugins.cost.length();
                return currency + '/' + length;
        	});
        	settingsState.costPerTime = ko.pureComputed(function() {
                var currency = settingsState.settings.plugins.cost.currency();
                var time = settingsState.settings.plugins.cost.time();
                return currency + '/' + time;
        	});
        
                printerState.costString = ko.pureComputed(function() {
                    if (settingsState.settings === undefined) return '-';
                    if (printerState.filament().length == 0) return '-';
        
                    var currency = settingsState.settings.plugins.cost.currency();
                    var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
                    var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
                    var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
                    var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();
        
                    var filament_used_length = printerState.filament()[0].data().length / 1000;
                    var filament_used_volume = printerState.filament()[0].data().volume / 1000;
                    var expected_time = (printerState.printTime() + printerState.printTimeLeft()) / 3600;
        
                    if (settingsState.check_cost()) {
                        var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
                    } else {
                        var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
                    }
        
                    return '' + currency + totalCost.toFixed(2);
                });
        
                var originalGetAdditionalData = filesState.getAdditionalData;
                filesState.getAdditionalData = function(data) {
                    var output = originalGetAdditionalData(data);
        
                    if (data.hasOwnProperty('gcodeAnalysis')) {
                        var gcode = data.gcodeAnalysis;
                        if (gcode.hasOwnProperty('filament') && gcode.filament.hasOwnProperty('tool0') && gcode.hasOwnProperty('estimatedPrintTime')) {
                            var currency = settingsState.settings.plugins.cost.currency();
                            var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
                            var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
                            var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
                            var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();
                            var filament_used_length = gcode.filament.tool0.length / 1000;
                            var filament_used_volume = gcode.filament.tool0.volume / 1000;
        
                            // Use last print time instead of estimation for prints that are already printed at least once
                            if (data["prints"] && data["prints"]["last"] && data["prints"]["last"]["printTime"]) {
                                var expected_time = data["prints"]["last"]["printTime"] / 3600;
                            } else {
                                var expected_time = gcode.estimatedPrintTime / 3600;
                            }
        
                            if (settingsState.check_cost()) {
                                var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
                            } else {
                                var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
                            }
        
                            // Build different output string for first time prints (the octoprint frontend adds a new line or not depending on this. A bug?)
                            if (data["prints"] && data["prints"]["last"] && data["prints"]["last"]["printTime"]) {
                                output += "<br>" + gettext("Cost") + ": " + currency + totalCost.toFixed(2);
                            } else {
                                output += gettext("Cost") + ": " + currency + totalCost.toFixed(2);
                            }
                        }
                    }
        
                    return output;
                };
        
                self.onStartup = function() {
                    var element = $("#state").find(".accordion-inner .progress");
                    if (element.length) {
                        var text = gettext("Cost");
                        element.before(text + ": <strong data-bind='text: costString'></strong><br>");
                    }
                };
        
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                CostViewModel,
                ["printerStateViewModel", "settingsViewModel", "gcodeFilesViewModel"],
                []
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin cost:", (error.stack || error));
    }
})();

// JS assets for plugin customControl
(function () {
    try {
        // source: plugin/customControl/js/jquery.ui.sortable.js
        /*! jQuery UI - v1.11.4 - 2015-08-30
        * http://jqueryui.com
        * Includes: core.js, widget.js, mouse.js, draggable.js, droppable.js, sortable.js
        * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */
        
        (function( factory ) {
        	if ( typeof define === "function" && define.amd ) {
        
        		// AMD. Register as an anonymous module.
        		define([ "jquery" ], factory );
        	} else {
        
        		// Browser globals
        		factory( jQuery );
        	}
        }(function( $ ) {
        /*!
         * jQuery UI Core 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/category/ui-core/
         */
        
        
        // $.ui might exist from components with no dependencies, e.g., $.ui.position
        $.ui = $.ui || {};
        
        $.extend( $.ui, {
        	version: "1.11.4",
        
        	keyCode: {
        		BACKSPACE: 8,
        		COMMA: 188,
        		DELETE: 46,
        		DOWN: 40,
        		END: 35,
        		ENTER: 13,
        		ESCAPE: 27,
        		HOME: 36,
        		LEFT: 37,
        		PAGE_DOWN: 34,
        		PAGE_UP: 33,
        		PERIOD: 190,
        		RIGHT: 39,
        		SPACE: 32,
        		TAB: 9,
        		UP: 38
        	}
        });
        
        // plugins
        $.fn.extend({
        	scrollParent: function( includeHidden ) {
        		var position = this.css( "position" ),
        			excludeStaticParent = position === "absolute",
        			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
        			scrollParent = this.parents().filter( function() {
        				var parent = $( this );
        				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
        					return false;
        				}
        				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
        			}).eq( 0 );
        
        		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
        	},
        
        	uniqueId: (function() {
        		var uuid = 0;
        
        		return function() {
        			return this.each(function() {
        				if ( !this.id ) {
        					this.id = "ui-id-" + ( ++uuid );
        				}
        			});
        		};
        	})(),
        
        	removeUniqueId: function() {
        		return this.each(function() {
        			if ( /^ui-id-\d+$/.test( this.id ) ) {
        				$( this ).removeAttr( "id" );
        			}
        		});
        	}
        });
        
        // selectors
        function focusable( element, isTabIndexNotNaN ) {
        	var map, mapName, img,
        		nodeName = element.nodeName.toLowerCase();
        	if ( "area" === nodeName ) {
        		map = element.parentNode;
        		mapName = map.name;
        		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
        			return false;
        		}
        		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
        		return !!img && visible( img );
        	}
        	return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
        		!element.disabled :
        		"a" === nodeName ?
        			element.href || isTabIndexNotNaN :
        			isTabIndexNotNaN) &&
        		// the element and all of its ancestors must be visible
        		visible( element );
        }
        
        function visible( element ) {
        	return $.expr.filters.visible( element ) &&
        		!$( element ).parents().addBack().filter(function() {
        			return $.css( this, "visibility" ) === "hidden";
        		}).length;
        }
        
        $.extend( $.expr[ ":" ], {
        	data: $.expr.createPseudo ?
        		$.expr.createPseudo(function( dataName ) {
        			return function( elem ) {
        				return !!$.data( elem, dataName );
        			};
        		}) :
        		// support: jQuery <1.8
        		function( elem, i, match ) {
        			return !!$.data( elem, match[ 3 ] );
        		},
        
        	focusable: function( element ) {
        		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        	},
        
        	tabbable: function( element ) {
        		var tabIndex = $.attr( element, "tabindex" ),
        			isTabIndexNaN = isNaN( tabIndex );
        		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        	}
        });
        
        // support: jQuery <1.8
        if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
        	$.each( [ "Width", "Height" ], function( i, name ) {
        		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
        			type = name.toLowerCase(),
        			orig = {
        				innerWidth: $.fn.innerWidth,
        				innerHeight: $.fn.innerHeight,
        				outerWidth: $.fn.outerWidth,
        				outerHeight: $.fn.outerHeight
        			};
        
        		function reduce( elem, size, border, margin ) {
        			$.each( side, function() {
        				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
        				if ( border ) {
        					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
        				}
        				if ( margin ) {
        					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
        				}
        			});
        			return size;
        		}
        
        		$.fn[ "inner" + name ] = function( size ) {
        			if ( size === undefined ) {
        				return orig[ "inner" + name ].call( this );
        			}
        
        			return this.each(function() {
        				$( this ).css( type, reduce( this, size ) + "px" );
        			});
        		};
        
        		$.fn[ "outer" + name] = function( size, margin ) {
        			if ( typeof size !== "number" ) {
        				return orig[ "outer" + name ].call( this, size );
        			}
        
        			return this.each(function() {
        				$( this).css( type, reduce( this, size, true, margin ) + "px" );
        			});
        		};
        	});
        }
        
        // support: jQuery <1.8
        if ( !$.fn.addBack ) {
        	$.fn.addBack = function( selector ) {
        		return this.add( selector == null ?
        			this.prevObject : this.prevObject.filter( selector )
        		);
        	};
        }
        
        // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
        if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
        	$.fn.removeData = (function( removeData ) {
        		return function( key ) {
        			if ( arguments.length ) {
        				return removeData.call( this, $.camelCase( key ) );
        			} else {
        				return removeData.call( this );
        			}
        		};
        	})( $.fn.removeData );
        }
        
        // deprecated
        $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
        
        $.fn.extend({
        	focus: (function( orig ) {
        		return function( delay, fn ) {
        			return typeof delay === "number" ?
        				this.each(function() {
        					var elem = this;
        					setTimeout(function() {
        						$( elem ).focus();
        						if ( fn ) {
        							fn.call( elem );
        						}
        					}, delay );
        				}) :
        				orig.apply( this, arguments );
        		};
        	})( $.fn.focus ),
        
        	disableSelection: (function() {
        		var eventType = "onselectstart" in document.createElement( "div" ) ?
        			"selectstart" :
        			"mousedown";
        
        		return function() {
        			return this.bind( eventType + ".ui-disableSelection", function( event ) {
        				event.preventDefault();
        			});
        		};
        	})(),
        
        	enableSelection: function() {
        		return this.unbind( ".ui-disableSelection" );
        	},
        
        	zIndex: function( zIndex ) {
        		if ( zIndex !== undefined ) {
        			return this.css( "zIndex", zIndex );
        		}
        
        		if ( this.length ) {
        			var elem = $( this[ 0 ] ), position, value;
        			while ( elem.length && elem[ 0 ] !== document ) {
        				// Ignore z-index if position is set to a value where z-index is ignored by the browser
        				// This makes behavior of this function consistent across browsers
        				// WebKit always returns auto if the element is positioned
        				position = elem.css( "position" );
        				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
        					// IE returns 0 when zIndex is not specified
        					// other browsers return a string
        					// we ignore the case of nested elements with an explicit value of 0
        					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
        					value = parseInt( elem.css( "zIndex" ), 10 );
        					if ( !isNaN( value ) && value !== 0 ) {
        						return value;
        					}
        				}
        				elem = elem.parent();
        			}
        		}
        
        		return 0;
        	}
        });
        
        // $.ui.plugin is deprecated. Use $.widget() extensions instead.
        $.ui.plugin = {
        	add: function( module, option, set ) {
        		var i,
        			proto = $.ui[ module ].prototype;
        		for ( i in set ) {
        			proto.plugins[ i ] = proto.plugins[ i ] || [];
        			proto.plugins[ i ].push( [ option, set[ i ] ] );
        		}
        	},
        	call: function( instance, name, args, allowDisconnected ) {
        		var i,
        			set = instance.plugins[ name ];
        
        		if ( !set ) {
        			return;
        		}
        
        		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
        			return;
        		}
        
        		for ( i = 0; i < set.length; i++ ) {
        			if ( instance.options[ set[ i ][ 0 ] ] ) {
        				set[ i ][ 1 ].apply( instance.element, args );
        			}
        		}
        	}
        };
        
        
        /*!
         * jQuery UI Widget 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/jQuery.widget/
         */
        
        
        var widget_uuid = 0,
        	widget_slice = Array.prototype.slice;
        
        $.cleanData = (function( orig ) {
        	return function( elems ) {
        		var events, elem, i;
        		for ( i = 0; (elem = elems[i]) != null; i++ ) {
        			try {
        
        				// Only trigger remove when necessary to save time
        				events = $._data( elem, "events" );
        				if ( events && events.remove ) {
        					$( elem ).triggerHandler( "remove" );
        				}
        
        			// http://bugs.jquery.com/ticket/8235
        			} catch ( e ) {}
        		}
        		orig( elems );
        	};
        })( $.cleanData );
        
        $.widget = function( name, base, prototype ) {
        	var fullName, existingConstructor, constructor, basePrototype,
        		// proxiedPrototype allows the provided prototype to remain unmodified
        		// so that it can be used as a mixin for multiple widgets (#8876)
        		proxiedPrototype = {},
        		namespace = name.split( "." )[ 0 ];
        
        	name = name.split( "." )[ 1 ];
        	fullName = namespace + "-" + name;
        
        	if ( !prototype ) {
        		prototype = base;
        		base = $.Widget;
        	}
        
        	// create selector for plugin
        	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
        		return !!$.data( elem, fullName );
        	};
        
        	$[ namespace ] = $[ namespace ] || {};
        	existingConstructor = $[ namespace ][ name ];
        	constructor = $[ namespace ][ name ] = function( options, element ) {
        		// allow instantiation without "new" keyword
        		if ( !this._createWidget ) {
        			return new constructor( options, element );
        		}
        
        		// allow instantiation without initializing for simple inheritance
        		// must use "new" keyword (the code above always passes args)
        		if ( arguments.length ) {
        			this._createWidget( options, element );
        		}
        	};
        	// extend with the existing constructor to carry over any static properties
        	$.extend( constructor, existingConstructor, {
        		version: prototype.version,
        		// copy the object used to create the prototype in case we need to
        		// redefine the widget later
        		_proto: $.extend( {}, prototype ),
        		// track widgets that inherit from this widget in case this widget is
        		// redefined after a widget inherits from it
        		_childConstructors: []
        	});
        
        	basePrototype = new base();
        	// we need to make the options hash a property directly on the new instance
        	// otherwise we'll modify the options hash on the prototype that we're
        	// inheriting from
        	basePrototype.options = $.widget.extend( {}, basePrototype.options );
        	$.each( prototype, function( prop, value ) {
        		if ( !$.isFunction( value ) ) {
        			proxiedPrototype[ prop ] = value;
        			return;
        		}
        		proxiedPrototype[ prop ] = (function() {
        			var _super = function() {
        					return base.prototype[ prop ].apply( this, arguments );
        				},
        				_superApply = function( args ) {
        					return base.prototype[ prop ].apply( this, args );
        				};
        			return function() {
        				var __super = this._super,
        					__superApply = this._superApply,
        					returnValue;
        
        				this._super = _super;
        				this._superApply = _superApply;
        
        				returnValue = value.apply( this, arguments );
        
        				this._super = __super;
        				this._superApply = __superApply;
        
        				return returnValue;
        			};
        		})();
        	});
        	constructor.prototype = $.widget.extend( basePrototype, {
        		// TODO: remove support for widgetEventPrefix
        		// always use the name + a colon as the prefix, e.g., draggable:start
        		// don't prefix for widgets that aren't DOM-based
        		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
        	}, proxiedPrototype, {
        		constructor: constructor,
        		namespace: namespace,
        		widgetName: name,
        		widgetFullName: fullName
        	});
        
        	// If this widget is being redefined then we need to find all widgets that
        	// are inheriting from it and redefine all of them so that they inherit from
        	// the new version of this widget. We're essentially trying to replace one
        	// level in the prototype chain.
        	if ( existingConstructor ) {
        		$.each( existingConstructor._childConstructors, function( i, child ) {
        			var childPrototype = child.prototype;
        
        			// redefine the child widget using the same prototype that was
        			// originally used, but inherit from the new version of the base
        			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
        		});
        		// remove the list of existing child constructors from the old constructor
        		// so the old child constructors can be garbage collected
        		delete existingConstructor._childConstructors;
        	} else {
        		base._childConstructors.push( constructor );
        	}
        
        	$.widget.bridge( name, constructor );
        
        	return constructor;
        };
        
        $.widget.extend = function( target ) {
        	var input = widget_slice.call( arguments, 1 ),
        		inputIndex = 0,
        		inputLength = input.length,
        		key,
        		value;
        	for ( ; inputIndex < inputLength; inputIndex++ ) {
        		for ( key in input[ inputIndex ] ) {
        			value = input[ inputIndex ][ key ];
        			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
        				// Clone objects
        				if ( $.isPlainObject( value ) ) {
        					target[ key ] = $.isPlainObject( target[ key ] ) ?
        						$.widget.extend( {}, target[ key ], value ) :
        						// Don't extend strings, arrays, etc. with objects
        						$.widget.extend( {}, value );
        				// Copy everything else by reference
        				} else {
        					target[ key ] = value;
        				}
        			}
        		}
        	}
        	return target;
        };
        
        $.widget.bridge = function( name, object ) {
        	var fullName = object.prototype.widgetFullName || name;
        	$.fn[ name ] = function( options ) {
        		var isMethodCall = typeof options === "string",
        			args = widget_slice.call( arguments, 1 ),
        			returnValue = this;
        
        		if ( isMethodCall ) {
        			this.each(function() {
        				var methodValue,
        					instance = $.data( this, fullName );
        				if ( options === "instance" ) {
        					returnValue = instance;
        					return false;
        				}
        				if ( !instance ) {
        					return $.error( "cannot call methods on " + name + " prior to initialization; " +
        						"attempted to call method '" + options + "'" );
        				}
        				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
        					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
        				}
        				methodValue = instance[ options ].apply( instance, args );
        				if ( methodValue !== instance && methodValue !== undefined ) {
        					returnValue = methodValue && methodValue.jquery ?
        						returnValue.pushStack( methodValue.get() ) :
        						methodValue;
        					return false;
        				}
        			});
        		} else {
        
        			// Allow multiple hashes to be passed on init
        			if ( args.length ) {
        				options = $.widget.extend.apply( null, [ options ].concat(args) );
        			}
        
        			this.each(function() {
        				var instance = $.data( this, fullName );
        				if ( instance ) {
        					instance.option( options || {} );
        					if ( instance._init ) {
        						instance._init();
        					}
        				} else {
        					$.data( this, fullName, new object( options, this ) );
        				}
        			});
        		}
        
        		return returnValue;
        	};
        };
        
        $.Widget = function( /* options, element */ ) {};
        $.Widget._childConstructors = [];
        
        $.Widget.prototype = {
        	widgetName: "widget",
        	widgetEventPrefix: "",
        	defaultElement: "<div>",
        	options: {
        		disabled: false,
        
        		// callbacks
        		create: null
        	},
        	_createWidget: function( options, element ) {
        		element = $( element || this.defaultElement || this )[ 0 ];
        		this.element = $( element );
        		this.uuid = widget_uuid++;
        		this.eventNamespace = "." + this.widgetName + this.uuid;
        
        		this.bindings = $();
        		this.hoverable = $();
        		this.focusable = $();
        
        		if ( element !== this ) {
        			$.data( element, this.widgetFullName, this );
        			this._on( true, this.element, {
        				remove: function( event ) {
        					if ( event.target === element ) {
        						this.destroy();
        					}
        				}
        			});
        			this.document = $( element.style ?
        				// element within the document
        				element.ownerDocument :
        				// element is window or document
        				element.document || element );
        			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
        		}
        
        		this.options = $.widget.extend( {},
        			this.options,
        			this._getCreateOptions(),
        			options );
        
        		this._create();
        		this._trigger( "create", null, this._getCreateEventData() );
        		this._init();
        	},
        	_getCreateOptions: $.noop,
        	_getCreateEventData: $.noop,
        	_create: $.noop,
        	_init: $.noop,
        
        	destroy: function() {
        		this._destroy();
        		// we can probably remove the unbind calls in 2.0
        		// all event bindings should go through this._on()
        		this.element
        			.unbind( this.eventNamespace )
        			.removeData( this.widgetFullName )
        			// support: jquery <1.6.3
        			// http://bugs.jquery.com/ticket/9413
        			.removeData( $.camelCase( this.widgetFullName ) );
        		this.widget()
        			.unbind( this.eventNamespace )
        			.removeAttr( "aria-disabled" )
        			.removeClass(
        				this.widgetFullName + "-disabled " +
        				"ui-state-disabled" );
        
        		// clean up events and states
        		this.bindings.unbind( this.eventNamespace );
        		this.hoverable.removeClass( "ui-state-hover" );
        		this.focusable.removeClass( "ui-state-focus" );
        	},
        	_destroy: $.noop,
        
        	widget: function() {
        		return this.element;
        	},
        
        	option: function( key, value ) {
        		var options = key,
        			parts,
        			curOption,
        			i;
        
        		if ( arguments.length === 0 ) {
        			// don't return a reference to the internal hash
        			return $.widget.extend( {}, this.options );
        		}
        
        		if ( typeof key === "string" ) {
        			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        			options = {};
        			parts = key.split( "." );
        			key = parts.shift();
        			if ( parts.length ) {
        				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
        				for ( i = 0; i < parts.length - 1; i++ ) {
        					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
        					curOption = curOption[ parts[ i ] ];
        				}
        				key = parts.pop();
        				if ( arguments.length === 1 ) {
        					return curOption[ key ] === undefined ? null : curOption[ key ];
        				}
        				curOption[ key ] = value;
        			} else {
        				if ( arguments.length === 1 ) {
        					return this.options[ key ] === undefined ? null : this.options[ key ];
        				}
        				options[ key ] = value;
        			}
        		}
        
        		this._setOptions( options );
        
        		return this;
        	},
        	_setOptions: function( options ) {
        		var key;
        
        		for ( key in options ) {
        			this._setOption( key, options[ key ] );
        		}
        
        		return this;
        	},
        	_setOption: function( key, value ) {
        		this.options[ key ] = value;
        
        		if ( key === "disabled" ) {
        			this.widget()
        				.toggleClass( this.widgetFullName + "-disabled", !!value );
        
        			// If the widget is becoming disabled, then nothing is interactive
        			if ( value ) {
        				this.hoverable.removeClass( "ui-state-hover" );
        				this.focusable.removeClass( "ui-state-focus" );
        			}
        		}
        
        		return this;
        	},
        
        	enable: function() {
        		return this._setOptions({ disabled: false });
        	},
        	disable: function() {
        		return this._setOptions({ disabled: true });
        	},
        
        	_on: function( suppressDisabledCheck, element, handlers ) {
        		var delegateElement,
        			instance = this;
        
        		// no suppressDisabledCheck flag, shuffle arguments
        		if ( typeof suppressDisabledCheck !== "boolean" ) {
        			handlers = element;
        			element = suppressDisabledCheck;
        			suppressDisabledCheck = false;
        		}
        
        		// no element argument, shuffle and use this.element
        		if ( !handlers ) {
        			handlers = element;
        			element = this.element;
        			delegateElement = this.widget();
        		} else {
        			element = delegateElement = $( element );
        			this.bindings = this.bindings.add( element );
        		}
        
        		$.each( handlers, function( event, handler ) {
        			function handlerProxy() {
        				// allow widgets to customize the disabled handling
        				// - disabled as an array instead of boolean
        				// - disabled class as method for disabling individual parts
        				if ( !suppressDisabledCheck &&
        						( instance.options.disabled === true ||
        							$( this ).hasClass( "ui-state-disabled" ) ) ) {
        					return;
        				}
        				return ( typeof handler === "string" ? instance[ handler ] : handler )
        					.apply( instance, arguments );
        			}
        
        			// copy the guid so direct unbinding works
        			if ( typeof handler !== "string" ) {
        				handlerProxy.guid = handler.guid =
        					handler.guid || handlerProxy.guid || $.guid++;
        			}
        
        			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
        				eventName = match[1] + instance.eventNamespace,
        				selector = match[2];
        			if ( selector ) {
        				delegateElement.delegate( selector, eventName, handlerProxy );
        			} else {
        				element.bind( eventName, handlerProxy );
        			}
        		});
        	},
        
        	_off: function( element, eventName ) {
        		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
        			this.eventNamespace;
        		element.unbind( eventName ).undelegate( eventName );
        
        		// Clear the stack to avoid memory leaks (#10056)
        		this.bindings = $( this.bindings.not( element ).get() );
        		this.focusable = $( this.focusable.not( element ).get() );
        		this.hoverable = $( this.hoverable.not( element ).get() );
        	},
        
        	_delay: function( handler, delay ) {
        		function handlerProxy() {
        			return ( typeof handler === "string" ? instance[ handler ] : handler )
        				.apply( instance, arguments );
        		}
        		var instance = this;
        		return setTimeout( handlerProxy, delay || 0 );
        	},
        
        	_hoverable: function( element ) {
        		this.hoverable = this.hoverable.add( element );
        		this._on( element, {
        			mouseenter: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-hover" );
        			},
        			mouseleave: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-hover" );
        			}
        		});
        	},
        
        	_focusable: function( element ) {
        		this.focusable = this.focusable.add( element );
        		this._on( element, {
        			focusin: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-focus" );
        			},
        			focusout: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-focus" );
        			}
        		});
        	},
        
        	_trigger: function( type, event, data ) {
        		var prop, orig,
        			callback = this.options[ type ];
        
        		data = data || {};
        		event = $.Event( event );
        		event.type = ( type === this.widgetEventPrefix ?
        			type :
        			this.widgetEventPrefix + type ).toLowerCase();
        		// the original event may come from any element
        		// so we need to reset the target on the new event
        		event.target = this.element[ 0 ];
        
        		// copy original event properties over to the new event
        		orig = event.originalEvent;
        		if ( orig ) {
        			for ( prop in orig ) {
        				if ( !( prop in event ) ) {
        					event[ prop ] = orig[ prop ];
        				}
        			}
        		}
        
        		this.element.trigger( event, data );
        		return !( $.isFunction( callback ) &&
        			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
        			event.isDefaultPrevented() );
        	}
        };
        
        $.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
        	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        		if ( typeof options === "string" ) {
        			options = { effect: options };
        		}
        		var hasOptions,
        			effectName = !options ?
        				method :
        				options === true || typeof options === "number" ?
        					defaultEffect :
        					options.effect || defaultEffect;
        		options = options || {};
        		if ( typeof options === "number" ) {
        			options = { duration: options };
        		}
        		hasOptions = !$.isEmptyObject( options );
        		options.complete = callback;
        		if ( options.delay ) {
        			element.delay( options.delay );
        		}
        		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
        			element[ method ]( options );
        		} else if ( effectName !== method && element[ effectName ] ) {
        			element[ effectName ]( options.duration, options.easing, callback );
        		} else {
        			element.queue(function( next ) {
        				$( this )[ method ]();
        				if ( callback ) {
        					callback.call( element[ 0 ] );
        				}
        				next();
        			});
        		}
        	};
        });
        
        var widget = $.widget;
        
        
        /*!
         * jQuery UI Mouse 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/mouse/
         */
        
        
        var mouseHandled = false;
        $( document ).mouseup( function() {
        	mouseHandled = false;
        });
        
        var mouse = $.widget("ui.mouse", {
        	version: "1.11.4",
        	options: {
        		cancel: "input,textarea,button,select,option",
        		distance: 1,
        		delay: 0
        	},
        	_mouseInit: function() {
        		var that = this;
        
        		this.element
        			.bind("mousedown." + this.widgetName, function(event) {
        				return that._mouseDown(event);
        			})
        			.bind("click." + this.widgetName, function(event) {
        				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
        					$.removeData(event.target, that.widgetName + ".preventClickEvent");
        					event.stopImmediatePropagation();
        					return false;
        				}
        			});
        
        		this.started = false;
        	},
        
        	// TODO: make sure destroying one instance of mouse doesn't mess with
        	// other instances of mouse
        	_mouseDestroy: function() {
        		this.element.unbind("." + this.widgetName);
        		if ( this._mouseMoveDelegate ) {
        			this.document
        				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
        				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
        		}
        	},
        
        	_mouseDown: function(event) {
        		// don't let more than one widget handle mouseStart
        		if ( mouseHandled ) {
        			return;
        		}
        
        		this._mouseMoved = false;
        
        		// we may have missed mouseup (out of window)
        		(this._mouseStarted && this._mouseUp(event));
        
        		this._mouseDownEvent = event;
        
        		var that = this,
        			btnIsLeft = (event.which === 1),
        			// event.target.nodeName works around a bug in IE 8 with
        			// disabled inputs (#7620)
        			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
        		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
        			return true;
        		}
        
        		this.mouseDelayMet = !this.options.delay;
        		if (!this.mouseDelayMet) {
        			this._mouseDelayTimer = setTimeout(function() {
        				that.mouseDelayMet = true;
        			}, this.options.delay);
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted = (this._mouseStart(event) !== false);
        			if (!this._mouseStarted) {
        				event.preventDefault();
        				return true;
        			}
        		}
        
        		// Click event may never have fired (Gecko & Opera)
        		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
        			$.removeData(event.target, this.widgetName + ".preventClickEvent");
        		}
        
        		// these delegates are required to keep context
        		this._mouseMoveDelegate = function(event) {
        			return that._mouseMove(event);
        		};
        		this._mouseUpDelegate = function(event) {
        			return that._mouseUp(event);
        		};
        
        		this.document
        			.bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
        			.bind( "mouseup." + this.widgetName, this._mouseUpDelegate );
        
        		event.preventDefault();
        
        		mouseHandled = true;
        		return true;
        	},
        
        	_mouseMove: function(event) {
        		// Only check for mouseups outside the document if you've moved inside the document
        		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
        		// fire a mousemove event if content is placed under the cursor. See #7778
        		// Support: IE <9
        		if ( this._mouseMoved ) {
        			// IE mouseup check - mouseup happened when mouse was out of window
        			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
        				return this._mouseUp(event);
        
        			// Iframe mouseup check - mouseup occurred in another document
        			} else if ( !event.which ) {
        				return this._mouseUp( event );
        			}
        		}
        
        		if ( event.which || event.button ) {
        			this._mouseMoved = true;
        		}
        
        		if (this._mouseStarted) {
        			this._mouseDrag(event);
        			return event.preventDefault();
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted =
        				(this._mouseStart(this._mouseDownEvent, event) !== false);
        			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
        		}
        
        		return !this._mouseStarted;
        	},
        
        	_mouseUp: function(event) {
        		this.document
        			.unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
        			.unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );
        
        		if (this._mouseStarted) {
        			this._mouseStarted = false;
        
        			if (event.target === this._mouseDownEvent.target) {
        				$.data(event.target, this.widgetName + ".preventClickEvent", true);
        			}
        
        			this._mouseStop(event);
        		}
        
        		mouseHandled = false;
        		return false;
        	},
        
        	_mouseDistanceMet: function(event) {
        		return (Math.max(
        				Math.abs(this._mouseDownEvent.pageX - event.pageX),
        				Math.abs(this._mouseDownEvent.pageY - event.pageY)
        			) >= this.options.distance
        		);
        	},
        
        	_mouseDelayMet: function(/* event */) {
        		return this.mouseDelayMet;
        	},
        
        	// These are placeholder methods, to be overriden by extending plugin
        	_mouseStart: function(/* event */) {},
        	_mouseDrag: function(/* event */) {},
        	_mouseStop: function(/* event */) {},
        	_mouseCapture: function(/* event */) { return true; }
        });
        
        
        /*!
         * jQuery UI Draggable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/draggable/
         */
        
        
        $.widget("ui.draggable", $.ui.mouse, {
        	version: "1.11.4",
        	widgetEventPrefix: "drag",
        	options: {
        		addClasses: true,
        		appendTo: "parent",
        		axis: false,
        		connectToSortable: false,
        		containment: false,
        		cursor: "auto",
        		cursorAt: false,
        		grid: false,
        		handle: false,
        		helper: "original",
        		iframeFix: false,
        		opacity: false,
        		refreshPositions: false,
        		revert: false,
        		revertDuration: 500,
        		scope: "default",
        		scroll: true,
        		scrollSensitivity: 20,
        		scrollSpeed: 20,
        		snap: false,
        		snapMode: "both",
        		snapTolerance: 20,
        		stack: false,
        		zIndex: false,
        
        		// callbacks
        		drag: null,
        		start: null,
        		stop: null
        	},
        	_create: function() {
        
        		if ( this.options.helper === "original" ) {
        			this._setPositionRelative();
        		}
        		if (this.options.addClasses){
        			this.element.addClass("ui-draggable");
        		}
        		if (this.options.disabled){
        			this.element.addClass("ui-draggable-disabled");
        		}
        		this._setHandleClassName();
        
        		this._mouseInit();
        	},
        
        	_setOption: function( key, value ) {
        		this._super( key, value );
        		if ( key === "handle" ) {
        			this._removeHandleClassName();
        			this._setHandleClassName();
        		}
        	},
        
        	_destroy: function() {
        		if ( ( this.helper || this.element ).is( ".ui-draggable-dragging" ) ) {
        			this.destroyOnClear = true;
        			return;
        		}
        		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
        		this._removeHandleClassName();
        		this._mouseDestroy();
        	},
        
        	_mouseCapture: function(event) {
        		var o = this.options;
        
        		this._blurActiveElement( event );
        
        		// among others, prevent a drag on a resizable-handle
        		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
        			return false;
        		}
        
        		//Quit if we're not on a valid handle
        		this.handle = this._getHandle(event);
        		if (!this.handle) {
        			return false;
        		}
        
        		this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );
        
        		return true;
        
        	},
        
        	_blockFrames: function( selector ) {
        		this.iframeBlocks = this.document.find( selector ).map(function() {
        			var iframe = $( this );
        
        			return $( "<div>" )
        				.css( "position", "absolute" )
        				.appendTo( iframe.parent() )
        				.outerWidth( iframe.outerWidth() )
        				.outerHeight( iframe.outerHeight() )
        				.offset( iframe.offset() )[ 0 ];
        		});
        	},
        
        	_unblockFrames: function() {
        		if ( this.iframeBlocks ) {
        			this.iframeBlocks.remove();
        			delete this.iframeBlocks;
        		}
        	},
        
        	_blurActiveElement: function( event ) {
        		var document = this.document[ 0 ];
        
        		// Only need to blur if the event occurred on the draggable itself, see #10527
        		if ( !this.handleElement.is( event.target ) ) {
        			return;
        		}
        
        		// support: IE9
        		// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
        		try {
        
        			// Support: IE9, IE10
        			// If the <body> is blurred, IE will switch windows, see #9520
        			if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== "body" ) {
        
        				// Blur any element that currently has focus, see #4261
        				$( document.activeElement ).blur();
        			}
        		} catch ( error ) {}
        	},
        
        	_mouseStart: function(event) {
        
        		var o = this.options;
        
        		//Create and append the visible helper
        		this.helper = this._createHelper(event);
        
        		this.helper.addClass("ui-draggable-dragging");
        
        		//Cache the helper size
        		this._cacheHelperProportions();
        
        		//If ddmanager is used for droppables, set the global draggable
        		if ($.ui.ddmanager) {
        			$.ui.ddmanager.current = this;
        		}
        
        		/*
        		 * - Position generation -
        		 * This block generates everything position related - it's the core of draggables.
        		 */
        
        		//Cache the margins of the original element
        		this._cacheMargins();
        
        		//Store the helper's css position
        		this.cssPosition = this.helper.css( "position" );
        		this.scrollParent = this.helper.scrollParent( true );
        		this.offsetParent = this.helper.offsetParent();
        		this.hasFixedAncestor = this.helper.parents().filter(function() {
        				return $( this ).css( "position" ) === "fixed";
        			}).length > 0;
        
        		//The element's absolute position on the page minus margins
        		this.positionAbs = this.element.offset();
        		this._refreshOffsets( event );
        
        		//Generate the original position
        		this.originalPosition = this.position = this._generatePosition( event, false );
        		this.originalPageX = event.pageX;
        		this.originalPageY = event.pageY;
        
        		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
        		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
        
        		//Set a containment if given in the options
        		this._setContainment();
        
        		//Trigger event + callbacks
        		if (this._trigger("start", event) === false) {
        			this._clear();
        			return false;
        		}
        
        		//Recache the helper size
        		this._cacheHelperProportions();
        
        		//Prepare the droppable offsets
        		if ($.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(this, event);
        		}
        
        		// Reset helper's right/bottom css if they're set and set explicit width/height instead
        		// as this prevents resizing of elements with right/bottom set (see #7772)
        		this._normalizeRightBottom();
        
        		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        
        		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
        		if ( $.ui.ddmanager ) {
        			$.ui.ddmanager.dragStart(this, event);
        		}
        
        		return true;
        	},
        
        	_refreshOffsets: function( event ) {
        		this.offset = {
        			top: this.positionAbs.top - this.margins.top,
        			left: this.positionAbs.left - this.margins.left,
        			scroll: false,
        			parent: this._getParentOffset(),
        			relative: this._getRelativeOffset()
        		};
        
        		this.offset.click = {
        			left: event.pageX - this.offset.left,
        			top: event.pageY - this.offset.top
        		};
        	},
        
        	_mouseDrag: function(event, noPropagation) {
        		// reset any necessary cached properties (see #5009)
        		if ( this.hasFixedAncestor ) {
        			this.offset.parent = this._getParentOffset();
        		}
        
        		//Compute the helpers position
        		this.position = this._generatePosition( event, true );
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		//Call plugins and callbacks and use the resulting position if something is returned
        		if (!noPropagation) {
        			var ui = this._uiHash();
        			if (this._trigger("drag", event, ui) === false) {
        				this._mouseUp({});
        				return false;
        			}
        			this.position = ui.position;
        		}
        
        		this.helper[ 0 ].style.left = this.position.left + "px";
        		this.helper[ 0 ].style.top = this.position.top + "px";
        
        		if ($.ui.ddmanager) {
        			$.ui.ddmanager.drag(this, event);
        		}
        
        		return false;
        	},
        
        	_mouseStop: function(event) {
        
        		//If we are using droppables, inform the manager about the drop
        		var that = this,
        			dropped = false;
        		if ($.ui.ddmanager && !this.options.dropBehaviour) {
        			dropped = $.ui.ddmanager.drop(this, event);
        		}
        
        		//if a drop comes from outside (a sortable)
        		if (this.dropped) {
        			dropped = this.dropped;
        			this.dropped = false;
        		}
        
        		if ((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
        			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
        				if (that._trigger("stop", event) !== false) {
        					that._clear();
        				}
        			});
        		} else {
        			if (this._trigger("stop", event) !== false) {
        				this._clear();
        			}
        		}
        
        		return false;
        	},
        
        	_mouseUp: function( event ) {
        		this._unblockFrames();
        
        		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
        		if ( $.ui.ddmanager ) {
        			$.ui.ddmanager.dragStop(this, event);
        		}
        
        		// Only need to focus if the event occurred on the draggable itself, see #10527
        		if ( this.handleElement.is( event.target ) ) {
        			// The interaction is over; whether or not the click resulted in a drag, focus the element
        			this.element.focus();
        		}
        
        		return $.ui.mouse.prototype._mouseUp.call(this, event);
        	},
        
        	cancel: function() {
        
        		if (this.helper.is(".ui-draggable-dragging")) {
        			this._mouseUp({});
        		} else {
        			this._clear();
        		}
        
        		return this;
        
        	},
        
        	_getHandle: function(event) {
        		return this.options.handle ?
        			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
        			true;
        	},
        
        	_setHandleClassName: function() {
        		this.handleElement = this.options.handle ?
        			this.element.find( this.options.handle ) : this.element;
        		this.handleElement.addClass( "ui-draggable-handle" );
        	},
        
        	_removeHandleClassName: function() {
        		this.handleElement.removeClass( "ui-draggable-handle" );
        	},
        
        	_createHelper: function(event) {
        
        		var o = this.options,
        			helperIsFunction = $.isFunction( o.helper ),
        			helper = helperIsFunction ?
        				$( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
        				( o.helper === "clone" ?
        					this.element.clone().removeAttr( "id" ) :
        					this.element );
        
        		if (!helper.parents("body").length) {
        			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
        		}
        
        		// http://bugs.jqueryui.com/ticket/9446
        		// a helper function can return the original element
        		// which wouldn't have been set to relative in _create
        		if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
        			this._setPositionRelative();
        		}
        
        		if (helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
        			helper.css("position", "absolute");
        		}
        
        		return helper;
        
        	},
        
        	_setPositionRelative: function() {
        		if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
        			this.element[ 0 ].style.position = "relative";
        		}
        	},
        
        	_adjustOffsetFromHelper: function(obj) {
        		if (typeof obj === "string") {
        			obj = obj.split(" ");
        		}
        		if ($.isArray(obj)) {
        			obj = { left: +obj[0], top: +obj[1] || 0 };
        		}
        		if ("left" in obj) {
        			this.offset.click.left = obj.left + this.margins.left;
        		}
        		if ("right" in obj) {
        			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        		}
        		if ("top" in obj) {
        			this.offset.click.top = obj.top + this.margins.top;
        		}
        		if ("bottom" in obj) {
        			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        		}
        	},
        
        	_isRootNode: function( element ) {
        		return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
        	},
        
        	_getParentOffset: function() {
        
        		//Get the offsetParent and cache its position
        		var po = this.offsetParent.offset(),
        			document = this.document[ 0 ];
        
        		// This is a special case where we need to modify a offset calculated on start, since the following happened:
        		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
        		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
        		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
        		if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        			po.left += this.scrollParent.scrollLeft();
        			po.top += this.scrollParent.scrollTop();
        		}
        
        		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
        			po = { top: 0, left: 0 };
        		}
        
        		return {
        			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
        			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
        		};
        
        	},
        
        	_getRelativeOffset: function() {
        		if ( this.cssPosition !== "relative" ) {
        			return { top: 0, left: 0 };
        		}
        
        		var p = this.element.position(),
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );
        
        		return {
        			top: p.top - ( parseInt(this.helper.css( "top" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
        			left: p.left - ( parseInt(this.helper.css( "left" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
        		};
        
        	},
        
        	_cacheMargins: function() {
        		this.margins = {
        			left: (parseInt(this.element.css("marginLeft"), 10) || 0),
        			top: (parseInt(this.element.css("marginTop"), 10) || 0),
        			right: (parseInt(this.element.css("marginRight"), 10) || 0),
        			bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
        		};
        	},
        
        	_cacheHelperProportions: function() {
        		this.helperProportions = {
        			width: this.helper.outerWidth(),
        			height: this.helper.outerHeight()
        		};
        	},
        
        	_setContainment: function() {
        
        		var isUserScrollable, c, ce,
        			o = this.options,
        			document = this.document[ 0 ];
        
        		this.relativeContainer = null;
        
        		if ( !o.containment ) {
        			this.containment = null;
        			return;
        		}
        
        		if ( o.containment === "window" ) {
        			this.containment = [
        				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
        				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
        				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
        				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
        			];
        			return;
        		}
        
        		if ( o.containment === "document") {
        			this.containment = [
        				0,
        				0,
        				$( document ).width() - this.helperProportions.width - this.margins.left,
        				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
        			];
        			return;
        		}
        
        		if ( o.containment.constructor === Array ) {
        			this.containment = o.containment;
        			return;
        		}
        
        		if ( o.containment === "parent" ) {
        			o.containment = this.helper[ 0 ].parentNode;
        		}
        
        		c = $( o.containment );
        		ce = c[ 0 ];
        
        		if ( !ce ) {
        			return;
        		}
        
        		isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );
        
        		this.containment = [
        			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
        			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
        			( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
        				( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
        				( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
        				this.helperProportions.width -
        				this.margins.left -
        				this.margins.right,
        			( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
        				( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
        				( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
        				this.helperProportions.height -
        				this.margins.top -
        				this.margins.bottom
        		];
        		this.relativeContainer = c;
        	},
        
        	_convertPositionTo: function(d, pos) {
        
        		if (!pos) {
        			pos = this.position;
        		}
        
        		var mod = d === "absolute" ? 1 : -1,
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );
        
        		return {
        			top: (
        				pos.top	+																// The absolute mouse position
        				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod)
        			),
        			left: (
        				pos.left +																// The absolute mouse position
        				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod)
        			)
        		};
        
        	},
        
        	_generatePosition: function( event, constrainPosition ) {
        
        		var containment, co, top, left,
        			o = this.options,
        			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
        			pageX = event.pageX,
        			pageY = event.pageY;
        
        		// Cache the scroll
        		if ( !scrollIsRootNode || !this.offset.scroll ) {
        			this.offset.scroll = {
        				top: this.scrollParent.scrollTop(),
        				left: this.scrollParent.scrollLeft()
        			};
        		}
        
        		/*
        		 * - Position constraining -
        		 * Constrain the position to a mix of grid, containment.
        		 */
        
        		// If we are not dragging yet, we won't check for options
        		if ( constrainPosition ) {
        			if ( this.containment ) {
        				if ( this.relativeContainer ){
        					co = this.relativeContainer.offset();
        					containment = [
        						this.containment[ 0 ] + co.left,
        						this.containment[ 1 ] + co.top,
        						this.containment[ 2 ] + co.left,
        						this.containment[ 3 ] + co.top
        					];
        				} else {
        					containment = this.containment;
        				}
        
        				if (event.pageX - this.offset.click.left < containment[0]) {
        					pageX = containment[0] + this.offset.click.left;
        				}
        				if (event.pageY - this.offset.click.top < containment[1]) {
        					pageY = containment[1] + this.offset.click.top;
        				}
        				if (event.pageX - this.offset.click.left > containment[2]) {
        					pageX = containment[2] + this.offset.click.left;
        				}
        				if (event.pageY - this.offset.click.top > containment[3]) {
        					pageY = containment[3] + this.offset.click.top;
        				}
        			}
        
        			if (o.grid) {
        				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
        				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
        				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
        
        				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
        				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        			}
        
        			if ( o.axis === "y" ) {
        				pageX = this.originalPageX;
        			}
        
        			if ( o.axis === "x" ) {
        				pageY = this.originalPageY;
        			}
        		}
        
        		return {
        			top: (
        				pageY -																	// The absolute mouse position
        				this.offset.click.top	-												// Click offset (relative to the element)
        				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
        				( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
        			),
        			left: (
        				pageX -																	// The absolute mouse position
        				this.offset.click.left -												// Click offset (relative to the element)
        				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
        				( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
        			)
        		};
        
        	},
        
        	_clear: function() {
        		this.helper.removeClass("ui-draggable-dragging");
        		if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
        			this.helper.remove();
        		}
        		this.helper = null;
        		this.cancelHelperRemoval = false;
        		if ( this.destroyOnClear ) {
        			this.destroy();
        		}
        	},
        
        	_normalizeRightBottom: function() {
        		if ( this.options.axis !== "y" && this.helper.css( "right" ) !== "auto" ) {
        			this.helper.width( this.helper.width() );
        			this.helper.css( "right", "auto" );
        		}
        		if ( this.options.axis !== "x" && this.helper.css( "bottom" ) !== "auto" ) {
        			this.helper.height( this.helper.height() );
        			this.helper.css( "bottom", "auto" );
        		}
        	},
        
        	// From now on bulk stuff - mainly helpers
        
        	_trigger: function( type, event, ui ) {
        		ui = ui || this._uiHash();
        		$.ui.plugin.call( this, type, [ event, ui, this ], true );
        
        		// Absolute position and offset (see #6884 ) have to be recalculated after plugins
        		if ( /^(drag|start|stop)/.test( type ) ) {
        			this.positionAbs = this._convertPositionTo( "absolute" );
        			ui.offset = this.positionAbs;
        		}
        		return $.Widget.prototype._trigger.call( this, type, event, ui );
        	},
        
        	plugins: {},
        
        	_uiHash: function() {
        		return {
        			helper: this.helper,
        			position: this.position,
        			originalPosition: this.originalPosition,
        			offset: this.positionAbs
        		};
        	}
        
        });
        
        $.ui.plugin.add( "draggable", "connectToSortable", {
        	start: function( event, ui, draggable ) {
        		var uiSortable = $.extend( {}, ui, {
        			item: draggable.element
        		});
        
        		draggable.sortables = [];
        		$( draggable.options.connectToSortable ).each(function() {
        			var sortable = $( this ).sortable( "instance" );
        
        			if ( sortable && !sortable.options.disabled ) {
        				draggable.sortables.push( sortable );
        
        				// refreshPositions is called at drag start to refresh the containerCache
        				// which is used in drag. This ensures it's initialized and synchronized
        				// with any changes that might have happened on the page since initialization.
        				sortable.refreshPositions();
        				sortable._trigger("activate", event, uiSortable);
        			}
        		});
        	},
        	stop: function( event, ui, draggable ) {
        		var uiSortable = $.extend( {}, ui, {
        			item: draggable.element
        		});
        
        		draggable.cancelHelperRemoval = false;
        
        		$.each( draggable.sortables, function() {
        			var sortable = this;
        
        			if ( sortable.isOver ) {
        				sortable.isOver = 0;
        
        				// Allow this sortable to handle removing the helper
        				draggable.cancelHelperRemoval = true;
        				sortable.cancelHelperRemoval = false;
        
        				// Use _storedCSS To restore properties in the sortable,
        				// as this also handles revert (#9675) since the draggable
        				// may have modified them in unexpected ways (#8809)
        				sortable._storedCSS = {
        					position: sortable.placeholder.css( "position" ),
        					top: sortable.placeholder.css( "top" ),
        					left: sortable.placeholder.css( "left" )
        				};
        
        				sortable._mouseStop(event);
        
        				// Once drag has ended, the sortable should return to using
        				// its original helper, not the shared helper from draggable
        				sortable.options.helper = sortable.options._helper;
        			} else {
        				// Prevent this Sortable from removing the helper.
        				// However, don't set the draggable to remove the helper
        				// either as another connected Sortable may yet handle the removal.
        				sortable.cancelHelperRemoval = true;
        
        				sortable._trigger( "deactivate", event, uiSortable );
        			}
        		});
        	},
        	drag: function( event, ui, draggable ) {
        		$.each( draggable.sortables, function() {
        			var innermostIntersecting = false,
        				sortable = this;
        
        			// Copy over variables that sortable's _intersectsWith uses
        			sortable.positionAbs = draggable.positionAbs;
        			sortable.helperProportions = draggable.helperProportions;
        			sortable.offset.click = draggable.offset.click;
        
        			if ( sortable._intersectsWith( sortable.containerCache ) ) {
        				innermostIntersecting = true;
        
        				$.each( draggable.sortables, function() {
        					// Copy over variables that sortable's _intersectsWith uses
        					this.positionAbs = draggable.positionAbs;
        					this.helperProportions = draggable.helperProportions;
        					this.offset.click = draggable.offset.click;
        
        					if ( this !== sortable &&
        							this._intersectsWith( this.containerCache ) &&
        							$.contains( sortable.element[ 0 ], this.element[ 0 ] ) ) {
        						innermostIntersecting = false;
        					}
        
        					return innermostIntersecting;
        				});
        			}
        
        			if ( innermostIntersecting ) {
        				// If it intersects, we use a little isOver variable and set it once,
        				// so that the move-in stuff gets fired only once.
        				if ( !sortable.isOver ) {
        					sortable.isOver = 1;
        
        					// Store draggable's parent in case we need to reappend to it later.
        					draggable._parent = ui.helper.parent();
        
        					sortable.currentItem = ui.helper
        						.appendTo( sortable.element )
        						.data( "ui-sortable-item", true );
        
        					// Store helper option to later restore it
        					sortable.options._helper = sortable.options.helper;
        
        					sortable.options.helper = function() {
        						return ui.helper[ 0 ];
        					};
        
        					// Fire the start events of the sortable with our passed browser event,
        					// and our own helper (so it doesn't create a new one)
        					event.target = sortable.currentItem[ 0 ];
        					sortable._mouseCapture( event, true );
        					sortable._mouseStart( event, true, true );
        
        					// Because the browser event is way off the new appended portlet,
        					// modify necessary variables to reflect the changes
        					sortable.offset.click.top = draggable.offset.click.top;
        					sortable.offset.click.left = draggable.offset.click.left;
        					sortable.offset.parent.left -= draggable.offset.parent.left -
        						sortable.offset.parent.left;
        					sortable.offset.parent.top -= draggable.offset.parent.top -
        						sortable.offset.parent.top;
        
        					draggable._trigger( "toSortable", event );
        
        					// Inform draggable that the helper is in a valid drop zone,
        					// used solely in the revert option to handle "valid/invalid".
        					draggable.dropped = sortable.element;
        
        					// Need to refreshPositions of all sortables in the case that
        					// adding to one sortable changes the location of the other sortables (#9675)
        					$.each( draggable.sortables, function() {
        						this.refreshPositions();
        					});
        
        					// hack so receive/update callbacks work (mostly)
        					draggable.currentItem = draggable.element;
        					sortable.fromOutside = draggable;
        				}
        
        				if ( sortable.currentItem ) {
        					sortable._mouseDrag( event );
        					// Copy the sortable's position because the draggable's can potentially reflect
        					// a relative position, while sortable is always absolute, which the dragged
        					// element has now become. (#8809)
        					ui.position = sortable.position;
        				}
        			} else {
        				// If it doesn't intersect with the sortable, and it intersected before,
        				// we fake the drag stop of the sortable, but make sure it doesn't remove
        				// the helper by using cancelHelperRemoval.
        				if ( sortable.isOver ) {
        
        					sortable.isOver = 0;
        					sortable.cancelHelperRemoval = true;
        
        					// Calling sortable's mouseStop would trigger a revert,
        					// so revert must be temporarily false until after mouseStop is called.
        					sortable.options._revert = sortable.options.revert;
        					sortable.options.revert = false;
        
        					sortable._trigger( "out", event, sortable._uiHash( sortable ) );
        					sortable._mouseStop( event, true );
        
        					// restore sortable behaviors that were modfied
        					// when the draggable entered the sortable area (#9481)
        					sortable.options.revert = sortable.options._revert;
        					sortable.options.helper = sortable.options._helper;
        
        					if ( sortable.placeholder ) {
        						sortable.placeholder.remove();
        					}
        
        					// Restore and recalculate the draggable's offset considering the sortable
        					// may have modified them in unexpected ways. (#8809, #10669)
        					ui.helper.appendTo( draggable._parent );
        					draggable._refreshOffsets( event );
        					ui.position = draggable._generatePosition( event, true );
        
        					draggable._trigger( "fromSortable", event );
        
        					// Inform draggable that the helper is no longer in a valid drop zone
        					draggable.dropped = false;
        
        					// Need to refreshPositions of all sortables just in case removing
        					// from one sortable changes the location of other sortables (#9675)
        					$.each( draggable.sortables, function() {
        						this.refreshPositions();
        					});
        				}
        			}
        		});
        	}
        });
        
        $.ui.plugin.add("draggable", "cursor", {
        	start: function( event, ui, instance ) {
        		var t = $( "body" ),
        			o = instance.options;
        
        		if (t.css("cursor")) {
        			o._cursor = t.css("cursor");
        		}
        		t.css("cursor", o.cursor);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        		if (o._cursor) {
        			$("body").css("cursor", o._cursor);
        		}
        	}
        });
        
        $.ui.plugin.add("draggable", "opacity", {
        	start: function( event, ui, instance ) {
        		var t = $( ui.helper ),
        			o = instance.options;
        		if (t.css("opacity")) {
        			o._opacity = t.css("opacity");
        		}
        		t.css("opacity", o.opacity);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        		if (o._opacity) {
        			$(ui.helper).css("opacity", o._opacity);
        		}
        	}
        });
        
        $.ui.plugin.add("draggable", "scroll", {
        	start: function( event, ui, i ) {
        		if ( !i.scrollParentNotHidden ) {
        			i.scrollParentNotHidden = i.helper.scrollParent( false );
        		}
        
        		if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] && i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
        			i.overflowOffset = i.scrollParentNotHidden.offset();
        		}
        	},
        	drag: function( event, ui, i  ) {
        
        		var o = i.options,
        			scrolled = false,
        			scrollParent = i.scrollParentNotHidden[ 0 ],
        			document = i.document[ 0 ];
        
        		if ( scrollParent !== document && scrollParent.tagName !== "HTML" ) {
        			if ( !o.axis || o.axis !== "x" ) {
        				if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY < o.scrollSensitivity ) {
        					scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
        				} else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
        					scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
        				}
        			}
        
        			if ( !o.axis || o.axis !== "y" ) {
        				if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX < o.scrollSensitivity ) {
        					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
        				} else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
        					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
        				}
        			}
        
        		} else {
        
        			if (!o.axis || o.axis !== "x") {
        				if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
        					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
        				} else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
        					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
        				}
        			}
        
        			if (!o.axis || o.axis !== "y") {
        				if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
        					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
        				} else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
        					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
        				}
        			}
        
        		}
        
        		if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(i, event);
        		}
        
        	}
        });
        
        $.ui.plugin.add("draggable", "snap", {
        	start: function( event, ui, i ) {
        
        		var o = i.options;
        
        		i.snapElements = [];
        
        		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
        			var $t = $(this),
        				$o = $t.offset();
        			if (this !== i.element[0]) {
        				i.snapElements.push({
        					item: this,
        					width: $t.outerWidth(), height: $t.outerHeight(),
        					top: $o.top, left: $o.left
        				});
        			}
        		});
        
        	},
        	drag: function( event, ui, inst ) {
        
        		var ts, bs, ls, rs, l, r, t, b, i, first,
        			o = inst.options,
        			d = o.snapTolerance,
        			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
        			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;
        
        		for (i = inst.snapElements.length - 1; i >= 0; i--){
        
        			l = inst.snapElements[i].left - inst.margins.left;
        			r = l + inst.snapElements[i].width;
        			t = inst.snapElements[i].top - inst.margins.top;
        			b = t + inst.snapElements[i].height;
        
        			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
        				if (inst.snapElements[i].snapping) {
        					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
        				}
        				inst.snapElements[i].snapping = false;
        				continue;
        			}
        
        			if (o.snapMode !== "inner") {
        				ts = Math.abs(t - y2) <= d;
        				bs = Math.abs(b - y1) <= d;
        				ls = Math.abs(l - x2) <= d;
        				rs = Math.abs(r - x1) <= d;
        				if (ts) {
        					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top;
        				}
        				if (bs) {
        					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top;
        				}
        				if (ls) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left;
        				}
        				if (rs) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left;
        				}
        			}
        
        			first = (ts || bs || ls || rs);
        
        			if (o.snapMode !== "outer") {
        				ts = Math.abs(t - y1) <= d;
        				bs = Math.abs(b - y2) <= d;
        				ls = Math.abs(l - x1) <= d;
        				rs = Math.abs(r - x2) <= d;
        				if (ts) {
        					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top;
        				}
        				if (bs) {
        					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top;
        				}
        				if (ls) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left;
        				}
        				if (rs) {
        					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left;
        				}
        			}
        
        			if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
        				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
        			}
        			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);
        
        		}
        
        	}
        });
        
        $.ui.plugin.add("draggable", "stack", {
        	start: function( event, ui, instance ) {
        		var min,
        			o = instance.options,
        			group = $.makeArray($(o.stack)).sort(function(a, b) {
        				return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
        			});
        
        		if (!group.length) { return; }
        
        		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
        		$(group).each(function(i) {
        			$(this).css("zIndex", min + i);
        		});
        		this.css("zIndex", (min + group.length));
        	}
        });
        
        $.ui.plugin.add("draggable", "zIndex", {
        	start: function( event, ui, instance ) {
        		var t = $( ui.helper ),
        			o = instance.options;
        
        		if (t.css("zIndex")) {
        			o._zIndex = t.css("zIndex");
        		}
        		t.css("zIndex", o.zIndex);
        	},
        	stop: function( event, ui, instance ) {
        		var o = instance.options;
        
        		if (o._zIndex) {
        			$(ui.helper).css("zIndex", o._zIndex);
        		}
        	}
        });
        
        var draggable = $.ui.draggable;
        
        
        /*!
         * jQuery UI Droppable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/droppable/
         */
        
        
        $.widget( "ui.droppable", {
        	version: "1.11.4",
        	widgetEventPrefix: "drop",
        	options: {
        		accept: "*",
        		activeClass: false,
        		addClasses: true,
        		greedy: false,
        		hoverClass: false,
        		scope: "default",
        		tolerance: "intersect",
        
        		// callbacks
        		activate: null,
        		deactivate: null,
        		drop: null,
        		out: null,
        		over: null
        	},
        	_create: function() {
        
        		var proportions,
        			o = this.options,
        			accept = o.accept;
        
        		this.isover = false;
        		this.isout = true;
        
        		this.accept = $.isFunction( accept ) ? accept : function( d ) {
        			return d.is( accept );
        		};
        
        		this.proportions = function( /* valueToWrite */ ) {
        			if ( arguments.length ) {
        				// Store the droppable's proportions
        				proportions = arguments[ 0 ];
        			} else {
        				// Retrieve or derive the droppable's proportions
        				return proportions ?
        					proportions :
        					proportions = {
        						width: this.element[ 0 ].offsetWidth,
        						height: this.element[ 0 ].offsetHeight
        					};
        			}
        		};
        
        		this._addToManager( o.scope );
        
        		o.addClasses && this.element.addClass( "ui-droppable" );
        
        	},
        
        	_addToManager: function( scope ) {
        		// Add the reference and positions to the manager
        		$.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
        		$.ui.ddmanager.droppables[ scope ].push( this );
        	},
        
        	_splice: function( drop ) {
        		var i = 0;
        		for ( ; i < drop.length; i++ ) {
        			if ( drop[ i ] === this ) {
        				drop.splice( i, 1 );
        			}
        		}
        	},
        
        	_destroy: function() {
        		var drop = $.ui.ddmanager.droppables[ this.options.scope ];
        
        		this._splice( drop );
        
        		this.element.removeClass( "ui-droppable ui-droppable-disabled" );
        	},
        
        	_setOption: function( key, value ) {
        
        		if ( key === "accept" ) {
        			this.accept = $.isFunction( value ) ? value : function( d ) {
        				return d.is( value );
        			};
        		} else if ( key === "scope" ) {
        			var drop = $.ui.ddmanager.droppables[ this.options.scope ];
        
        			this._splice( drop );
        			this._addToManager( value );
        		}
        
        		this._super( key, value );
        	},
        
        	_activate: function( event ) {
        		var draggable = $.ui.ddmanager.current;
        		if ( this.options.activeClass ) {
        			this.element.addClass( this.options.activeClass );
        		}
        		if ( draggable ){
        			this._trigger( "activate", event, this.ui( draggable ) );
        		}
        	},
        
        	_deactivate: function( event ) {
        		var draggable = $.ui.ddmanager.current;
        		if ( this.options.activeClass ) {
        			this.element.removeClass( this.options.activeClass );
        		}
        		if ( draggable ){
        			this._trigger( "deactivate", event, this.ui( draggable ) );
        		}
        	},
        
        	_over: function( event ) {
        
        		var draggable = $.ui.ddmanager.current;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.hoverClass ) {
        				this.element.addClass( this.options.hoverClass );
        			}
        			this._trigger( "over", event, this.ui( draggable ) );
        		}
        
        	},
        
        	_out: function( event ) {
        
        		var draggable = $.ui.ddmanager.current;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.hoverClass ) {
        				this.element.removeClass( this.options.hoverClass );
        			}
        			this._trigger( "out", event, this.ui( draggable ) );
        		}
        
        	},
        
        	_drop: function( event, custom ) {
        
        		var draggable = custom || $.ui.ddmanager.current,
        			childrenIntersection = false;
        
        		// Bail if draggable and droppable are same element
        		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
        			return false;
        		}
        
        		this.element.find( ":data(ui-droppable)" ).not( ".ui-draggable-dragging" ).each(function() {
        			var inst = $( this ).droppable( "instance" );
        			if (
        				inst.options.greedy &&
        				!inst.options.disabled &&
        				inst.options.scope === draggable.options.scope &&
        				inst.accept.call( inst.element[ 0 ], ( draggable.currentItem || draggable.element ) ) &&
        				$.ui.intersect( draggable, $.extend( inst, { offset: inst.element.offset() } ), inst.options.tolerance, event )
        			) { childrenIntersection = true; return false; }
        		});
        		if ( childrenIntersection ) {
        			return false;
        		}
        
        		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        			if ( this.options.activeClass ) {
        				this.element.removeClass( this.options.activeClass );
        			}
        			if ( this.options.hoverClass ) {
        				this.element.removeClass( this.options.hoverClass );
        			}
        			this._trigger( "drop", event, this.ui( draggable ) );
        			return this.element;
        		}
        
        		return false;
        
        	},
        
        	ui: function( c ) {
        		return {
        			draggable: ( c.currentItem || c.element ),
        			helper: c.helper,
        			position: c.position,
        			offset: c.positionAbs
        		};
        	}
        
        });
        
        $.ui.intersect = (function() {
        	function isOverAxis( x, reference, size ) {
        		return ( x >= reference ) && ( x < ( reference + size ) );
        	}
        
        	return function( draggable, droppable, toleranceMode, event ) {
        
        		if ( !droppable.offset ) {
        			return false;
        		}
        
        		var x1 = ( draggable.positionAbs || draggable.position.absolute ).left + draggable.margins.left,
        			y1 = ( draggable.positionAbs || draggable.position.absolute ).top + draggable.margins.top,
        			x2 = x1 + draggable.helperProportions.width,
        			y2 = y1 + draggable.helperProportions.height,
        			l = droppable.offset.left,
        			t = droppable.offset.top,
        			r = l + droppable.proportions().width,
        			b = t + droppable.proportions().height;
        
        		switch ( toleranceMode ) {
        		case "fit":
        			return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
        		case "intersect":
        			return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
        				x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
        				t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
        				y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
        		case "pointer":
        			return isOverAxis( event.pageY, t, droppable.proportions().height ) && isOverAxis( event.pageX, l, droppable.proportions().width );
        		case "touch":
        			return (
        				( y1 >= t && y1 <= b ) || // Top edge touching
        				( y2 >= t && y2 <= b ) || // Bottom edge touching
        				( y1 < t && y2 > b ) // Surrounded vertically
        			) && (
        				( x1 >= l && x1 <= r ) || // Left edge touching
        				( x2 >= l && x2 <= r ) || // Right edge touching
        				( x1 < l && x2 > r ) // Surrounded horizontally
        			);
        		default:
        			return false;
        		}
        	};
        })();
        
        /*
        	This manager tracks offsets of draggables and droppables
        */
        $.ui.ddmanager = {
        	current: null,
        	droppables: { "default": [] },
        	prepareOffsets: function( t, event ) {
        
        		var i, j,
        			m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
        			type = event ? event.type : null, // workaround for #2317
        			list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();
        
        		droppablesLoop: for ( i = 0; i < m.length; i++ ) {
        
        			// No disabled and non-accepted
        			if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
        				continue;
        			}
        
        			// Filter out elements in the current dragged item
        			for ( j = 0; j < list.length; j++ ) {
        				if ( list[ j ] === m[ i ].element[ 0 ] ) {
        					m[ i ].proportions().height = 0;
        					continue droppablesLoop;
        				}
        			}
        
        			m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
        			if ( !m[ i ].visible ) {
        				continue;
        			}
        
        			// Activate the droppable if used directly from draggables
        			if ( type === "mousedown" ) {
        				m[ i ]._activate.call( m[ i ], event );
        			}
        
        			m[ i ].offset = m[ i ].element.offset();
        			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });
        
        		}
        
        	},
        	drop: function( draggable, event ) {
        
        		var dropped = false;
        		// Create a copy of the droppables in case the list changes during the drop (#9116)
        		$.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {
        
        			if ( !this.options ) {
        				return;
        			}
        			if ( !this.options.disabled && this.visible && $.ui.intersect( draggable, this, this.options.tolerance, event ) ) {
        				dropped = this._drop.call( this, event ) || dropped;
        			}
        
        			if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
        				this.isout = true;
        				this.isover = false;
        				this._deactivate.call( this, event );
        			}
        
        		});
        		return dropped;
        
        	},
        	dragStart: function( draggable, event ) {
        		// Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
        		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
        			if ( !draggable.options.refreshPositions ) {
        				$.ui.ddmanager.prepareOffsets( draggable, event );
        			}
        		});
        	},
        	drag: function( draggable, event ) {
        
        		// If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
        		if ( draggable.options.refreshPositions ) {
        			$.ui.ddmanager.prepareOffsets( draggable, event );
        		}
        
        		// Run through all droppables and check their positions based on specific tolerance options
        		$.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {
        
        			if ( this.options.disabled || this.greedyChild || !this.visible ) {
        				return;
        			}
        
        			var parentInstance, scope, parent,
        				intersects = $.ui.intersect( draggable, this, this.options.tolerance, event ),
        				c = !intersects && this.isover ? "isout" : ( intersects && !this.isover ? "isover" : null );
        			if ( !c ) {
        				return;
        			}
        
        			if ( this.options.greedy ) {
        				// find droppable parents with same scope
        				scope = this.options.scope;
        				parent = this.element.parents( ":data(ui-droppable)" ).filter(function() {
        					return $( this ).droppable( "instance" ).options.scope === scope;
        				});
        
        				if ( parent.length ) {
        					parentInstance = $( parent[ 0 ] ).droppable( "instance" );
        					parentInstance.greedyChild = ( c === "isover" );
        				}
        			}
        
        			// we just moved into a greedy child
        			if ( parentInstance && c === "isover" ) {
        				parentInstance.isover = false;
        				parentInstance.isout = true;
        				parentInstance._out.call( parentInstance, event );
        			}
        
        			this[ c ] = true;
        			this[c === "isout" ? "isover" : "isout"] = false;
        			this[c === "isover" ? "_over" : "_out"].call( this, event );
        
        			// we just moved out of a greedy child
        			if ( parentInstance && c === "isout" ) {
        				parentInstance.isout = false;
        				parentInstance.isover = true;
        				parentInstance._over.call( parentInstance, event );
        			}
        		});
        
        	},
        	dragStop: function( draggable, event ) {
        		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
        		// Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
        		if ( !draggable.options.refreshPositions ) {
        			$.ui.ddmanager.prepareOffsets( draggable, event );
        		}
        	}
        };
        
        var droppable = $.ui.droppable;
        
        
        /*!
         * jQuery UI Sortable 1.11.4
         * http://jqueryui.com
         *
         * Copyright jQuery Foundation and other contributors
         * Released under the MIT license.
         * http://jquery.org/license
         *
         * http://api.jqueryui.com/sortable/
         */
        
        
        var sortable = $.widget("ui.sortable", $.ui.mouse, {
        	version: "1.11.4",
        	widgetEventPrefix: "sort",
        	ready: false,
        	options: {
        		appendTo: "parent",
        		axis: false,
        		connectWith: false,
        		containment: false,
        		cursor: "auto",
        		cursorAt: false,
        		dropOnEmpty: true,
        		forcePlaceholderSize: false,
        		forceHelperSize: false,
        		grid: false,
        		handle: false,
        		helper: "original",
        		items: "> *",
        		opacity: false,
        		placeholder: false,
        		revert: false,
        		scroll: true,
        		scrollSensitivity: 20,
        		scrollSpeed: 20,
        		scope: "default",
        		tolerance: "intersect",
        		zIndex: 1000,
        
        		// callbacks
        		activate: null,
        		beforeStop: null,
        		change: null,
        		deactivate: null,
        		out: null,
        		over: null,
        		receive: null,
        		remove: null,
        		sort: null,
        		start: null,
        		stop: null,
        		update: null
        	},
        
        	_isOverAxis: function( x, reference, size ) {
        		return ( x >= reference ) && ( x < ( reference + size ) );
        	},
        
        	_isFloating: function( item ) {
        		return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
        	},
        
        	_create: function() {
        		this.containerCache = {};
        		this.element.addClass("ui-sortable");
        
        		//Get the items
        		this.refresh();
        
        		//Let's determine the parent's offset
        		this.offset = this.element.offset();
        
        		//Initialize mouse events for interaction
        		this._mouseInit();
        
        		this._setHandleClassName();
        
        		//We're ready to go
        		this.ready = true;
        
        	},
        
        	_setOption: function( key, value ) {
        		this._super( key, value );
        
        		if ( key === "handle" ) {
        			this._setHandleClassName();
        		}
        	},
        
        	_setHandleClassName: function() {
        		this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
        		$.each( this.items, function() {
        			( this.instance.options.handle ?
        				this.item.find( this.instance.options.handle ) : this.item )
        				.addClass( "ui-sortable-handle" );
        		});
        	},
        
        	_destroy: function() {
        		this.element
        			.removeClass( "ui-sortable ui-sortable-disabled" )
        			.find( ".ui-sortable-handle" )
        				.removeClass( "ui-sortable-handle" );
        		this._mouseDestroy();
        
        		for ( var i = this.items.length - 1; i >= 0; i-- ) {
        			this.items[i].item.removeData(this.widgetName + "-item");
        		}
        
        		return this;
        	},
        
        	_mouseCapture: function(event, overrideHandle) {
        		var currentItem = null,
        			validHandle = false,
        			that = this;
        
        		if (this.reverting) {
        			return false;
        		}
        
        		if(this.options.disabled || this.options.type === "static") {
        			return false;
        		}
        
        		//We have to refresh the items data once first
        		this._refreshItems(event);
        
        		//Find out if the clicked node (or one of its parents) is a actual item in this.items
        		$(event.target).parents().each(function() {
        			if($.data(this, that.widgetName + "-item") === that) {
        				currentItem = $(this);
        				return false;
        			}
        		});
        		if($.data(event.target, that.widgetName + "-item") === that) {
        			currentItem = $(event.target);
        		}
        
        		if(!currentItem) {
        			return false;
        		}
        		if(this.options.handle && !overrideHandle) {
        			$(this.options.handle, currentItem).find("*").addBack().each(function() {
        				if(this === event.target) {
        					validHandle = true;
        				}
        			});
        			if(!validHandle) {
        				return false;
        			}
        		}
        
        		this.currentItem = currentItem;
        		this._removeCurrentsFromItems();
        		return true;
        
        	},
        
        	_mouseStart: function(event, overrideHandle, noActivation) {
        
        		var i, body,
        			o = this.options;
        
        		this.currentContainer = this;
        
        		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
        		this.refreshPositions();
        
        		//Create and append the visible helper
        		this.helper = this._createHelper(event);
        
        		//Cache the helper size
        		this._cacheHelperProportions();
        
        		/*
        		 * - Position generation -
        		 * This block generates everything position related - it's the core of draggables.
        		 */
        
        		//Cache the margins of the original element
        		this._cacheMargins();
        
        		//Get the next scrolling parent
        		this.scrollParent = this.helper.scrollParent();
        
        		//The element's absolute position on the page minus margins
        		this.offset = this.currentItem.offset();
        		this.offset = {
        			top: this.offset.top - this.margins.top,
        			left: this.offset.left - this.margins.left
        		};
        
        		$.extend(this.offset, {
        			click: { //Where the click happened, relative to the element
        				left: event.pageX - this.offset.left,
        				top: event.pageY - this.offset.top
        			},
        			parent: this._getParentOffset(),
        			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
        		});
        
        		// Only after we got the offset, we can change the helper's position to absolute
        		// TODO: Still need to figure out a way to make relative sorting possible
        		this.helper.css("position", "absolute");
        		this.cssPosition = this.helper.css("position");
        
        		//Generate the original position
        		this.originalPosition = this._generatePosition(event);
        		this.originalPageX = event.pageX;
        		this.originalPageY = event.pageY;
        
        		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
        		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
        
        		//Cache the former DOM position
        		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };
        
        		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
        		if(this.helper[0] !== this.currentItem[0]) {
        			this.currentItem.hide();
        		}
        
        		//Create the placeholder
        		this._createPlaceholder();
        
        		//Set a containment if given in the options
        		if(o.containment) {
        			this._setContainment();
        		}
        
        		if( o.cursor && o.cursor !== "auto" ) { // cursor option
        			body = this.document.find( "body" );
        
        			// support: IE
        			this.storedCursor = body.css( "cursor" );
        			body.css( "cursor", o.cursor );
        
        			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
        		}
        
        		if(o.opacity) { // opacity option
        			if (this.helper.css("opacity")) {
        				this._storedOpacity = this.helper.css("opacity");
        			}
        			this.helper.css("opacity", o.opacity);
        		}
        
        		if(o.zIndex) { // zIndex option
        			if (this.helper.css("zIndex")) {
        				this._storedZIndex = this.helper.css("zIndex");
        			}
        			this.helper.css("zIndex", o.zIndex);
        		}
        
        		//Prepare scrolling
        		if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
        			this.overflowOffset = this.scrollParent.offset();
        		}
        
        		//Call callbacks
        		this._trigger("start", event, this._uiHash());
        
        		//Recache the helper size
        		if(!this._preserveHelperProportions) {
        			this._cacheHelperProportions();
        		}
        
        
        		//Post "activate" events to possible containers
        		if( !noActivation ) {
        			for ( i = this.containers.length - 1; i >= 0; i-- ) {
        				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
        			}
        		}
        
        		//Prepare possible droppables
        		if($.ui.ddmanager) {
        			$.ui.ddmanager.current = this;
        		}
        
        		if ($.ui.ddmanager && !o.dropBehaviour) {
        			$.ui.ddmanager.prepareOffsets(this, event);
        		}
        
        		this.dragging = true;
        
        		this.helper.addClass("ui-sortable-helper");
        		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        		return true;
        
        	},
        
        	_mouseDrag: function(event) {
        		var i, item, itemElement, intersection,
        			o = this.options,
        			scrolled = false;
        
        		//Compute the helpers position
        		this.position = this._generatePosition(event);
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		if (!this.lastPositionAbs) {
        			this.lastPositionAbs = this.positionAbs;
        		}
        
        		//Do scrolling
        		if(this.options.scroll) {
        			if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
        
        				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
        				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
        				}
        
        				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
        				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
        				}
        
        			} else {
        
        				if(event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
        					scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
        				} else if(this.window.height() - (event.pageY - this.document.scrollTop()) < o.scrollSensitivity) {
        					scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
        				}
        
        				if(event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
        					scrolled = this.document.scrollLeft(this.document.scrollLeft() - o.scrollSpeed);
        				} else if(this.window.width() - (event.pageX - this.document.scrollLeft()) < o.scrollSensitivity) {
        					scrolled = this.document.scrollLeft(this.document.scrollLeft() + o.scrollSpeed);
        				}
        
        			}
        
        			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
        				$.ui.ddmanager.prepareOffsets(this, event);
        			}
        		}
        
        		//Regenerate the absolute position used for position checks
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		//Set the helper position
        		if(!this.options.axis || this.options.axis !== "y") {
        			this.helper[0].style.left = this.position.left+"px";
        		}
        		if(!this.options.axis || this.options.axis !== "x") {
        			this.helper[0].style.top = this.position.top+"px";
        		}
        
        		//Rearrange
        		for (i = this.items.length - 1; i >= 0; i--) {
        
        			//Cache variables and intersection, continue if no intersection
        			item = this.items[i];
        			itemElement = item.item[0];
        			intersection = this._intersectsWithPointer(item);
        			if (!intersection) {
        				continue;
        			}
        
        			// Only put the placeholder inside the current Container, skip all
        			// items from other containers. This works because when moving
        			// an item from one container to another the
        			// currentContainer is switched before the placeholder is moved.
        			//
        			// Without this, moving items in "sub-sortables" can cause
        			// the placeholder to jitter between the outer and inner container.
        			if (item.instance !== this.currentContainer) {
        				continue;
        			}
        
        			// cannot intersect with itself
        			// no useless actions that have been done before
        			// no action if the item moved is the parent of the item checked
        			if (itemElement !== this.currentItem[0] &&
        				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
        				!$.contains(this.placeholder[0], itemElement) &&
        				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
        			) {
        
        				this.direction = intersection === 1 ? "down" : "up";
        
        				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
        					this._rearrange(event, item);
        				} else {
        					break;
        				}
        
        				this._trigger("change", event, this._uiHash());
        				break;
        			}
        		}
        
        		//Post events to containers
        		this._contactContainers(event);
        
        		//Interconnect with droppables
        		if($.ui.ddmanager) {
        			$.ui.ddmanager.drag(this, event);
        		}
        
        		//Call callbacks
        		this._trigger("sort", event, this._uiHash());
        
        		this.lastPositionAbs = this.positionAbs;
        		return false;
        
        	},
        
        	_mouseStop: function(event, noPropagation) {
        
        		if(!event) {
        			return;
        		}
        
        		//If we are using droppables, inform the manager about the drop
        		if ($.ui.ddmanager && !this.options.dropBehaviour) {
        			$.ui.ddmanager.drop(this, event);
        		}
        
        		if(this.options.revert) {
        			var that = this,
        				cur = this.placeholder.offset(),
        				axis = this.options.axis,
        				animation = {};
        
        			if ( !axis || axis === "x" ) {
        				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft);
        			}
        			if ( !axis || axis === "y" ) {
        				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop);
        			}
        			this.reverting = true;
        			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
        				that._clear(event);
        			});
        		} else {
        			this._clear(event, noPropagation);
        		}
        
        		return false;
        
        	},
        
        	cancel: function() {
        
        		if(this.dragging) {
        
        			this._mouseUp({ target: null });
        
        			if(this.options.helper === "original") {
        				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        			} else {
        				this.currentItem.show();
        			}
        
        			//Post deactivating events to containers
        			for (var i = this.containers.length - 1; i >= 0; i--){
        				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", null, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		if (this.placeholder) {
        			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        			if(this.placeholder[0].parentNode) {
        				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        			}
        			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
        				this.helper.remove();
        			}
        
        			$.extend(this, {
        				helper: null,
        				dragging: false,
        				reverting: false,
        				_noFinalSort: null
        			});
        
        			if(this.domPosition.prev) {
        				$(this.domPosition.prev).after(this.currentItem);
        			} else {
        				$(this.domPosition.parent).prepend(this.currentItem);
        			}
        		}
        
        		return this;
        
        	},
        
        	serialize: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected),
        			str = [];
        		o = o || {};
        
        		$(items).each(function() {
        			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
        			if (res) {
        				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
        			}
        		});
        
        		if(!str.length && o.key) {
        			str.push(o.key + "=");
        		}
        
        		return str.join("&");
        
        	},
        
        	toArray: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected),
        			ret = [];
        
        		o = o || {};
        
        		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
        		return ret;
        
        	},
        
        	/* Be careful with the following core functions */
        	_intersectsWith: function(item) {
        
        		var x1 = this.positionAbs.left,
        			x2 = x1 + this.helperProportions.width,
        			y1 = this.positionAbs.top,
        			y2 = y1 + this.helperProportions.height,
        			l = item.left,
        			r = l + item.width,
        			t = item.top,
        			b = t + item.height,
        			dyClick = this.offset.click.top,
        			dxClick = this.offset.click.left,
        			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
        			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
        			isOverElement = isOverElementHeight && isOverElementWidth;
        
        		if ( this.options.tolerance === "pointer" ||
        			this.options.forcePointerForContainers ||
        			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
        		) {
        			return isOverElement;
        		} else {
        
        			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
        				x2 - (this.helperProportions.width / 2) < r && // Left Half
        				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
        				y2 - (this.helperProportions.height / 2) < b ); // Top Half
        
        		}
        	},
        
        	_intersectsWithPointer: function(item) {
        
        		var isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
        			isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
        			isOverElement = isOverElementHeight && isOverElementWidth,
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (!isOverElement) {
        			return false;
        		}
        
        		return this.floating ?
        			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
        			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );
        
        	},
        
        	_intersectsWithSides: function(item) {
        
        		var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
        			isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (this.floating && horizontalDirection) {
        			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
        		} else {
        			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
        		}
        
        	},
        
        	_getDragVerticalDirection: function() {
        		var delta = this.positionAbs.top - this.lastPositionAbs.top;
        		return delta !== 0 && (delta > 0 ? "down" : "up");
        	},
        
        	_getDragHorizontalDirection: function() {
        		var delta = this.positionAbs.left - this.lastPositionAbs.left;
        		return delta !== 0 && (delta > 0 ? "right" : "left");
        	},
        
        	refresh: function(event) {
        		this._refreshItems(event);
        		this._setHandleClassName();
        		this.refreshPositions();
        		return this;
        	},
        
        	_connectWith: function() {
        		var options = this.options;
        		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
        	},
        
        	_getItemsAsjQuery: function(connected) {
        
        		var i, j, cur, inst,
        			items = [],
        			queries = [],
        			connectWith = this._connectWith();
        
        		if(connectWith && connected) {
        			for (i = connectWith.length - 1; i >= 0; i--){
        				cur = $(connectWith[i], this.document[0]);
        				for ( j = cur.length - 1; j >= 0; j--){
        					inst = $.data(cur[j], this.widgetFullName);
        					if(inst && inst !== this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
        					}
        				}
        			}
        		}
        
        		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);
        
        		function addItems() {
        			items.push( this );
        		}
        		for (i = queries.length - 1; i >= 0; i--){
        			queries[i][0].each( addItems );
        		}
        
        		return $(items);
        
        	},
        
        	_removeCurrentsFromItems: function() {
        
        		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");
        
        		this.items = $.grep(this.items, function (item) {
        			for (var j=0; j < list.length; j++) {
        				if(list[j] === item.item[0]) {
        					return false;
        				}
        			}
        			return true;
        		});
        
        	},
        
        	_refreshItems: function(event) {
        
        		this.items = [];
        		this.containers = [this];
        
        		var i, j, cur, inst, targetData, _queries, item, queriesLength,
        			items = this.items,
        			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
        			connectWith = this._connectWith();
        
        		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
        			for (i = connectWith.length - 1; i >= 0; i--){
        				cur = $(connectWith[i], this.document[0]);
        				for (j = cur.length - 1; j >= 0; j--){
        					inst = $.data(cur[j], this.widgetFullName);
        					if(inst && inst !== this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
        						this.containers.push(inst);
        					}
        				}
        			}
        		}
        
        		for (i = queries.length - 1; i >= 0; i--) {
        			targetData = queries[i][1];
        			_queries = queries[i][0];
        
        			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
        				item = $(_queries[j]);
        
        				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)
        
        				items.push({
        					item: item,
        					instance: targetData,
        					width: 0, height: 0,
        					left: 0, top: 0
        				});
        			}
        		}
        
        	},
        
        	refreshPositions: function(fast) {
        
        		// Determine whether items are being displayed horizontally
        		this.floating = this.items.length ?
        			this.options.axis === "x" || this._isFloating( this.items[ 0 ].item ) :
        			false;
        
        		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
        		if(this.offsetParent && this.helper) {
        			this.offset.parent = this._getParentOffset();
        		}
        
        		var i, item, t, p;
        
        		for (i = this.items.length - 1; i >= 0; i--){
        			item = this.items[i];
        
        			//We ignore calculating positions of all connected containers when we're not over them
        			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
        				continue;
        			}
        
        			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
        
        			if (!fast) {
        				item.width = t.outerWidth();
        				item.height = t.outerHeight();
        			}
        
        			p = t.offset();
        			item.left = p.left;
        			item.top = p.top;
        		}
        
        		if(this.options.custom && this.options.custom.refreshContainers) {
        			this.options.custom.refreshContainers.call(this);
        		} else {
        			for (i = this.containers.length - 1; i >= 0; i--){
        				p = this.containers[i].element.offset();
        				this.containers[i].containerCache.left = p.left;
        				this.containers[i].containerCache.top = p.top;
        				this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
        				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
        			}
        		}
        
        		return this;
        	},
        
        	_createPlaceholder: function(that) {
        		that = that || this;
        		var className,
        			o = that.options;
        
        		if(!o.placeholder || o.placeholder.constructor === String) {
        			className = o.placeholder;
        			o.placeholder = {
        				element: function() {
        
        					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
        						element = $( "<" + nodeName + ">", that.document[0] )
        							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
        							.removeClass("ui-sortable-helper");
        
        					if ( nodeName === "tbody" ) {
        						that._createTrPlaceholder(
        							that.currentItem.find( "tr" ).eq( 0 ),
        							$( "<tr>", that.document[ 0 ] ).appendTo( element )
        						);
        					} else if ( nodeName === "tr" ) {
        						that._createTrPlaceholder( that.currentItem, element );
        					} else if ( nodeName === "img" ) {
        						element.attr( "src", that.currentItem.attr( "src" ) );
        					}
        
        					if ( !className ) {
        						element.css( "visibility", "hidden" );
        					}
        
        					return element;
        				},
        				update: function(container, p) {
        
        					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
        					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
        					if(className && !o.forcePlaceholderSize) {
        						return;
        					}
        
        					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
        					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
        					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
        				}
        			};
        		}
        
        		//Create the placeholder
        		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));
        
        		//Append it after the actual current item
        		that.currentItem.after(that.placeholder);
        
        		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
        		o.placeholder.update(that, that.placeholder);
        
        	},
        
        	_createTrPlaceholder: function( sourceTr, targetTr ) {
        		var that = this;
        
        		sourceTr.children().each(function() {
        			$( "<td>&#160;</td>", that.document[ 0 ] )
        				.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
        				.appendTo( targetTr );
        		});
        	},
        
        	_contactContainers: function(event) {
        		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis,
        			innermostContainer = null,
        			innermostIndex = null;
        
        		// get innermost container that intersects with item
        		for (i = this.containers.length - 1; i >= 0; i--) {
        
        			// never consider a container that's located within the item itself
        			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
        				continue;
        			}
        
        			if(this._intersectsWith(this.containers[i].containerCache)) {
        
        				// if we've already found a container and it's more "inner" than this, then continue
        				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
        					continue;
        				}
        
        				innermostContainer = this.containers[i];
        				innermostIndex = i;
        
        			} else {
        				// container doesn't intersect. trigger "out" event if necessary
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", event, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		// if no intersecting containers found, return
        		if(!innermostContainer) {
        			return;
        		}
        
        		// move the item into the container if it's not there already
        		if(this.containers.length === 1) {
        			if (!this.containers[innermostIndex].containerCache.over) {
        				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        				this.containers[innermostIndex].containerCache.over = 1;
        			}
        		} else {
        
        			//When entering a new container, we will find the item with the least distance and append our item near it
        			dist = 10000;
        			itemWithLeastDistance = null;
        			floating = innermostContainer.floating || this._isFloating(this.currentItem);
        			posProperty = floating ? "left" : "top";
        			sizeProperty = floating ? "width" : "height";
        			axis = floating ? "clientX" : "clientY";
        
        			for (j = this.items.length - 1; j >= 0; j--) {
        				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
        					continue;
        				}
        				if(this.items[j].item[0] === this.currentItem[0]) {
        					continue;
        				}
        
        				cur = this.items[j].item.offset()[posProperty];
        				nearBottom = false;
        				if ( event[ axis ] - cur > this.items[ j ][ sizeProperty ] / 2 ) {
        					nearBottom = true;
        				}
        
        				if ( Math.abs( event[ axis ] - cur ) < dist ) {
        					dist = Math.abs( event[ axis ] - cur );
        					itemWithLeastDistance = this.items[ j ];
        					this.direction = nearBottom ? "up": "down";
        				}
        			}
        
        			//Check if dropOnEmpty is enabled
        			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
        				return;
        			}
        
        			if(this.currentContainer === this.containers[innermostIndex]) {
        				if ( !this.currentContainer.containerCache.over ) {
        					this.containers[ innermostIndex ]._trigger( "over", event, this._uiHash() );
        					this.currentContainer.containerCache.over = 1;
        				}
        				return;
        			}
        
        			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
        			this._trigger("change", event, this._uiHash());
        			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
        			this.currentContainer = this.containers[innermostIndex];
        
        			//Update the placeholder
        			this.options.placeholder.update(this.currentContainer, this.placeholder);
        
        			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        			this.containers[innermostIndex].containerCache.over = 1;
        		}
        
        
        	},
        
        	_createHelper: function(event) {
        
        		var o = this.options,
        			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);
        
        		//Add the helper to the DOM if that didn't happen already
        		if(!helper.parents("body").length) {
        			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
        		}
        
        		if(helper[0] === this.currentItem[0]) {
        			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
        		}
        
        		if(!helper[0].style.width || o.forceHelperSize) {
        			helper.width(this.currentItem.width());
        		}
        		if(!helper[0].style.height || o.forceHelperSize) {
        			helper.height(this.currentItem.height());
        		}
        
        		return helper;
        
        	},
        
        	_adjustOffsetFromHelper: function(obj) {
        		if (typeof obj === "string") {
        			obj = obj.split(" ");
        		}
        		if ($.isArray(obj)) {
        			obj = {left: +obj[0], top: +obj[1] || 0};
        		}
        		if ("left" in obj) {
        			this.offset.click.left = obj.left + this.margins.left;
        		}
        		if ("right" in obj) {
        			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        		}
        		if ("top" in obj) {
        			this.offset.click.top = obj.top + this.margins.top;
        		}
        		if ("bottom" in obj) {
        			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        		}
        	},
        
        	_getParentOffset: function() {
        
        
        		//Get the offsetParent and cache its position
        		this.offsetParent = this.helper.offsetParent();
        		var po = this.offsetParent.offset();
        
        		// This is a special case where we need to modify a offset calculated on start, since the following happened:
        		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
        		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
        		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
        		if(this.cssPosition === "absolute" && this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        			po.left += this.scrollParent.scrollLeft();
        			po.top += this.scrollParent.scrollTop();
        		}
        
        		// This needs to be actually done for all browsers, since pageX/pageY includes this information
        		// with an ugly IE fix
        		if( this.offsetParent[0] === this.document[0].body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
        			po = { top: 0, left: 0 };
        		}
        
        		return {
        			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
        			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
        		};
        
        	},
        
        	_getRelativeOffset: function() {
        
        		if(this.cssPosition === "relative") {
        			var p = this.currentItem.position();
        			return {
        				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
        				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
        			};
        		} else {
        			return { top: 0, left: 0 };
        		}
        
        	},
        
        	_cacheMargins: function() {
        		this.margins = {
        			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
        			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
        		};
        	},
        
        	_cacheHelperProportions: function() {
        		this.helperProportions = {
        			width: this.helper.outerWidth(),
        			height: this.helper.outerHeight()
        		};
        	},
        
        	_setContainment: function() {
        
        		var ce, co, over,
        			o = this.options;
        		if(o.containment === "parent") {
        			o.containment = this.helper[0].parentNode;
        		}
        		if(o.containment === "document" || o.containment === "window") {
        			this.containment = [
        				0 - this.offset.relative.left - this.offset.parent.left,
        				0 - this.offset.relative.top - this.offset.parent.top,
        				o.containment === "document" ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left,
        				(o.containment === "document" ? this.document.width() : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
        			];
        		}
        
        		if(!(/^(document|window|parent)$/).test(o.containment)) {
        			ce = $(o.containment)[0];
        			co = $(o.containment).offset();
        			over = ($(ce).css("overflow") !== "hidden");
        
        			this.containment = [
        				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
        				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
        				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
        				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
        			];
        		}
        
        	},
        
        	_convertPositionTo: function(d, pos) {
        
        		if(!pos) {
        			pos = this.position;
        		}
        		var mod = d === "absolute" ? 1 : -1,
        			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
        			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		return {
        			top: (
        				pos.top	+																// The absolute mouse position
        				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
        			),
        			left: (
        				pos.left +																// The absolute mouse position
        				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
        			)
        		};
        
        	},
        
        	_generatePosition: function(event) {
        
        		var top, left,
        			o = this.options,
        			pageX = event.pageX,
        			pageY = event.pageY,
        			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		// This is another very weird special case that only happens for relative elements:
        		// 1. If the css position is relative
        		// 2. and the scroll parent is the document or similar to the offset parent
        		// we have to refresh the relative offset during the scroll so there are no jumps
        		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0])) {
        			this.offset.relative = this._getRelativeOffset();
        		}
        
        		/*
        		 * - Position constraining -
        		 * Constrain the position to a mix of grid, containment.
        		 */
        
        		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
        
        			if(this.containment) {
        				if(event.pageX - this.offset.click.left < this.containment[0]) {
        					pageX = this.containment[0] + this.offset.click.left;
        				}
        				if(event.pageY - this.offset.click.top < this.containment[1]) {
        					pageY = this.containment[1] + this.offset.click.top;
        				}
        				if(event.pageX - this.offset.click.left > this.containment[2]) {
        					pageX = this.containment[2] + this.offset.click.left;
        				}
        				if(event.pageY - this.offset.click.top > this.containment[3]) {
        					pageY = this.containment[3] + this.offset.click.top;
        				}
        			}
        
        			if(o.grid) {
        				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
        
        				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        			}
        
        		}
        
        		return {
        			top: (
        				pageY -																// The absolute mouse position
        				this.offset.click.top -													// Click offset (relative to the element)
        				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
        			),
        			left: (
        				pageX -																// The absolute mouse position
        				this.offset.click.left -												// Click offset (relative to the element)
        				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
        				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
        				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
        			)
        		};
        
        	},
        
        	_rearrange: function(event, i, a, hardRefresh) {
        
        		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));
        
        		//Various things done here to improve the performance:
        		// 1. we create a setTimeout, that calls refreshPositions
        		// 2. on the instance, we have a counter variable, that get's higher after every append
        		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
        		// 4. this lets only the last addition to the timeout stack through
        		this.counter = this.counter ? ++this.counter : 1;
        		var counter = this.counter;
        
        		this._delay(function() {
        			if(counter === this.counter) {
        				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
        			}
        		});
        
        	},
        
        	_clear: function(event, noPropagation) {
        
        		this.reverting = false;
        		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
        		// everything else normalized again
        		var i,
        			delayedTriggers = [];
        
        		// We first have to update the dom position of the actual currentItem
        		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
        		if(!this._noFinalSort && this.currentItem.parent().length) {
        			this.placeholder.before(this.currentItem);
        		}
        		this._noFinalSort = null;
        
        		if(this.helper[0] === this.currentItem[0]) {
        			for(i in this._storedCSS) {
        				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
        					this._storedCSS[i] = "";
        				}
        			}
        			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        		} else {
        			this.currentItem.show();
        		}
        
        		if(this.fromOutside && !noPropagation) {
        			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
        		}
        		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
        			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
        		}
        
        		// Check if the items Container has Changed and trigger appropriate
        		// events.
        		if (this !== this.currentContainer) {
        			if(!noPropagation) {
        				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
        			}
        		}
        
        
        		//Post events to containers
        		function delayEvent( type, instance, container ) {
        			return function( event ) {
        				container._trigger( type, event, instance._uiHash( instance ) );
        			};
        		}
        		for (i = this.containers.length - 1; i >= 0; i--){
        			if (!noPropagation) {
        				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
        			}
        			if(this.containers[i].containerCache.over) {
        				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
        				this.containers[i].containerCache.over = 0;
        			}
        		}
        
        		//Do what was originally in plugins
        		if ( this.storedCursor ) {
        			this.document.find( "body" ).css( "cursor", this.storedCursor );
        			this.storedStylesheet.remove();
        		}
        		if(this._storedOpacity) {
        			this.helper.css("opacity", this._storedOpacity);
        		}
        		if(this._storedZIndex) {
        			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
        		}
        
        		this.dragging = false;
        
        		if(!noPropagation) {
        			this._trigger("beforeStop", event, this._uiHash());
        		}
        
        		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        
        		if ( !this.cancelHelperRemoval ) {
        			if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
        				this.helper.remove();
        			}
        			this.helper = null;
        		}
        
        		if(!noPropagation) {
        			for (i=0; i < delayedTriggers.length; i++) {
        				delayedTriggers[i].call(this, event);
        			} //Trigger all delayed events
        			this._trigger("stop", event, this._uiHash());
        		}
        
        		this.fromOutside = false;
        		return !this.cancelHelperRemoval;
        
        	},
        
        	_trigger: function() {
        		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
        			this.cancel();
        		}
        	},
        
        	_uiHash: function(_inst) {
        		var inst = _inst || this;
        		return {
        			helper: inst.helper,
        			placeholder: inst.placeholder || $([]),
        			position: inst.position,
        			originalPosition: inst.originalPosition,
        			offset: inst.positionAbs,
        			item: inst.currentItem,
        			sender: _inst ? _inst.element : null
        		};
        	}
        
        });
        
        
        
        }));
        ;
        
        // source: plugin/customControl/js/customControl.js
        ﻿$(function () {
            function CustomControlViewModel(parameters) {
                var self = this;
        
                self.loginState = parameters[0];
                self.settingsViewModel = parameters[1];
                self.controlViewModel = parameters[2];
        
                self.customControlDialogViewModel = parameters[3];
        
                self.popup = undefined;
        
                self.controls = ko.observableArray([]);
        
                self.controlsFromServer = [];
                self.additionalControls = [];
        
                self.staticID = 0;
        
                self._showPopup = function (options, eventListeners) {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                    self.popup = new PNotify(options);
        
                    if (eventListeners) {
                        var popupObj = self.popup.get();
                        _.each(eventListeners, function (value, key) {
                            popupObj.on(key, value);
                        })
                    }
                };
        
                self.onSettingsShown = function () {
                    self.requestData();
                };
        
                self.requestData = function () {
                    $.ajax({
                        url: API_BASEURL + "printer/command/custom",
                        method: "GET",
                        dataType: "json",
                        success: function (response) {
                            self._fromResponse(response);
                        }
                    });
                };
        
                self._fromResponse = function (response) {
                    self.controlsFromServer = response.controls;
                    self.rerenderControls();
                };
        
                self.rerenderControls = function () {
        
                    // TODO: Brainstorming about how to handle additionalControls...
        
                    self.staticID = 0;
                    self.controls(undefined);
                    self.controls(self._processControls(undefined, self.controlsFromServer));
        
                    $(".innerSortable").sortable({
                        connectWith: ".innerSortable",
                        items: "> .sortable",
                        cancel: '',
                        sort: function (event, ui) {
                          var self = $(this),
                              width = ui.helper.outerWidth(),
                              top = ui.helper.position().top;//changed to ;
        
                          self.children().each(function () {
                            if ($(this).hasClass('ui-sortable-helper') || $(this).hasClass('ui-sortable-placeholder')) {
                              return true;
                            }
                            // If overlap is more than half of the dragged item
                            var distance = Math.abs(ui.position.left - $(this).position().left),
                                before = ui.position.left > $(this).position().left;
        
                            if ((width - distance) > (width / 2) && (distance < width) && $(this).position().top === top) {
                              if (before) {
                                $('.ui-sortable-placeholder', self).insertBefore($(this));
                              } else {
                                $('.ui-sortable-placeholder', self).insertAfter($(this));
                              }
                              return false;
                            }
                          });
                        },
                        update: function(event, ui) {
                            var target = ko.dataFor(this);
                            var item = ko.dataFor(ui.item[0]);
        
                            if (target == undefined) {
                                return;
                            } else {
                                if (target == self) {
                                    if (!item.hasOwnProperty("children")) {
                                        return;
                                    }
                                }
                                else if (!target.hasOwnProperty("children")) {
                                    return;
                                }
                            }
        
                            var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                            if (position >= 0) {
                                if (item.parent != undefined) {
                                    item.parent.children.remove(item);
        
                                    if (target == self)
                                        self.controlsFromServer.splice(position, 0, item);
                                    else
                                        target.children.splice(position, 0, item);
                                } else {
                                    self.controlsFromServer = _.without(self.controlsFromServer, item);
                                    if (target == self)
                                        self.controlsFromServer.splice(position, 0, item);
                                    else
                                        target.children.splice(position, 0, item);
                                }
                            }
                        },
                        stop: function(event, ui) {
                            self.rerenderControls();
                        }
                    }).disableSelection();
                };
        
                self._processControls = function (parent, controls) {
                    for (var i = 0; i < controls.length; i++) {
                        controls[i] = self._processControl(parent, controls[i]);
                    }
                    return controls;
                };
        
                self._processInput = function (list) {
                    var inputs = [];
        
                    var attributeToInt = function (obj, key, def) {
                        if (obj.hasOwnProperty(key)) {
                            var val = obj[key];
                            if (_.isNumber(val)) {
                                return val;
                            }
        
                            var parsedVal = parseInt(val);
                            if (!isNaN(parsedVal)) {
                                return parsedVal;
                            }
                        }
                        return def;
                    };
        
                    _.each(list, function (element, index, l) {
                        var input = {
                            name: ko.observable(element.name),
                            parameter: ko.observable(element.parameter),
                            default: ko.observable(element.hasOwnProperty("default") ? element.default : undefined)
                        }
        
                        if (element.hasOwnProperty("slider") && _.isObject(element.slider)) {
                            input.slider = {
                                min: ko.observable(element.slider.min),
                                max: ko.observable(element.slider.max),
                                step: ko.observable(element.slider.step)
                            }
        
                            var defaultValue = attributeToInt(element, "default", attributeToInt(element.slider, "min", 0));
        
                            // if default value is not within range of min and max, correct that
                            if (!_.inRange(defaultValue, element.slider.min, element.slider.max)) {
                                // use bound closer to configured default value
                                defaultValue = defaultValue < element.slider.min ? element.slider.min : element.slider.max;
                            }
        
                            input.value = ko.observable(defaultValue);
                        }
                        else {
                            input.slider = false;
                            input.value = input.default;
                        }
        
                        inputs.push(input);
                    });
        
                    return inputs;
                }
                self._processControl = function (parent, control) {
                    if (control.processed) {
                        control.id("settingsCustomControl_id" + self.staticID++);
                    }
                    else {
                        control.id = ko.observable("settingsCustomControl_id" + self.staticID++);
                    }
                    control.parent = parent;
        
                    if (control.processed) {
                        if (control.hasOwnProperty("children")) {
                            control.children(self._processControls(control, control.children()));
                        }
        
                        return control;
                    }
        
                    if (control.hasOwnProperty("template") && control.hasOwnProperty("regex")) {
                        control.template = ko.observable(control.template);
                        control.regex = ko.observable(control.regex);
                        control.default = ko.observable(control.default || "");
                        control.value = ko.computed(function () { return control.default(); });
        
                        delete control.key;
                        delete control.template_key;
                    }
        
                    if (control.hasOwnProperty("children")) {
                        control.children = ko.observableArray(self._processControls(control, control.children));
                        if (!control.hasOwnProperty("layout") || !(control.layout == "vertical" || control.layout == "horizontal" || control.layout == "horizontal_grid"))
                            control.layout = ko.observable("vertical");
                        else
                            control.layout = ko.observable(control.layout);
        
                        if (control.hasOwnProperty("collapsed"))
                            control.collapsed = ko.observable(control.collapsed);
                        else
                            control.collapsed = ko.observable(false);
                    }
                    
                    if (control.hasOwnProperty("input")) {
                        control.input = ko.observableArray(self._processInput(control.input));
                    }
        
                    control.name = ko.observable(control.name || "");
        
                    control.width = ko.observable(control.hasOwnProperty("width") ? control.width : "2");
                    control.offset = ko.observable(control.hasOwnProperty("offset") ? control.offset : "");
        
                    var js;
                    if (control.hasOwnProperty("javascript")) {
                        control.javascript = control.javascript;
                    }
        
                    if (control.hasOwnProperty("enabled")) {
                        control.enabled = control.enabled;
                    }
        
                    control.processed = true;
                    return control;
                };
        
                self.displayMode = function (customControl) {
                    if (customControl.hasOwnProperty("children")) {
                        return (customControl.hasOwnProperty("name") && customControl.name() != "") ? "settingsCustomControls_containerTemplate_collapsable" : "settingsCustomControls_containerTemplate_nameless";
                    } else {
                        return "settingsCustomControls_controlTemplate";
                    }
                }
        
                self.rowCss = function (customControl) {
                    var span = "span2";
                    var offset = "";
                    if (customControl.hasOwnProperty("width") && customControl.width() != "") {
                        span = "span" + customControl.width();
                    }
                    if (customControl.hasOwnProperty("offset") && customControl.offset() != "") {
                        offset = "offset" + customControl.offset();
                    }
                    return "sortable " + span + " " + offset;
                };
        
                self.searchElement = function (list, id) {
                    for (var i = 0; i < list.length; i++)
                    {
                        if (list[i].id() == id)
                            return list[i];
        
                        if (list[i].hasOwnProperty("children")) {
                            var element = self.searchElement(list[i].children(), id);
                            if (element != undefined)
                                return element;
                        }
                    }
        
                    return undefined;
                }
        
                self.createElement = function (invokedOn, contextParent, selectedMenu) {
                    if (contextParent.attr('id') == "base") {
                        self.customControlDialogViewModel.reset();
        
                        self.customControlDialogViewModel.show(function (ret) {
                            self.controlsFromServer.push(ret);
                            self.rerenderControls();
                        });
                    }
                    else {
                        var parentElement = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                        if (parentElement == undefined) {
                            self._showPopup({
                                title: gettext("Something went wrong while creating the new Element"),
                                type: "error"
                            });
                            return;
                        }
        
                        self.customControlDialogViewModel.reset({ parent: parentElement });
        
                        self.customControlDialogViewModel.show(function (ret) {
                            parentElement.children.push(self._processControl(parentElement, ret));
                        });
                    }
                }
                self.deleteElement = function (invokedOn, contextParent, selectedMenu) {
                    var element = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    showConfirmationDialog("", function (e) {
                        if (element.parent != undefined)
                            element.parent.children.remove(element);
                        else {
                            self.controlsFromServer = _.without(self.controlsFromServer, element);
                            self.rerenderControls();
                        }
                    });
                }
                self.editElement = function (invokedOn, contextParent, selectedMenu) {
                    var element = self.element = self.searchElement(self.controlsFromServer, contextParent.attr('id'));
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    var title = "Edit Container";
                    var type = "container";
                    var data = {
                        parent: element.parent,
                    };
        
                    if (element.hasOwnProperty("name")) {
                        data.name = element.name();
                    }
                    if (element.hasOwnProperty("template")) {
                        data.template = element.template();
                        data.regex = element.regex();
                        data.defaultValue = element.default() || "";
        
                        title = "Edit Output";
                        type = "output";
                    }
                    if (element.hasOwnProperty("layout")) {
                        data.layout = element.layout();
                        data.collapsed = element.collapsed();
        
                        title = "Edit Container";
                        type = "container";
                    }
                    if (element.hasOwnProperty("command")) {
                        data.commands = element.command;
        
                        title = "Edit Command";
                        type = "command";
                    }
                    if (element.hasOwnProperty("commands")) {
                        var commands = "";
                        _.each(element.commands, function (e, index, list) {
                            commands += e;
                            if (index < list.length)
                                commands += '\n';
                        });
                        data.commands = commands;
        
                        title = "Edit Command";
                        type = "command";
                    }
                    if (element.hasOwnProperty("script")) {
                        data.script = element.script;
        
                        title = "Edit Script command";
                        type = "script";
                    }
                    if (element.hasOwnProperty("confirm")) {
                        data.confirm = element.confirm;
                    }
                    if (element.hasOwnProperty("input"))
                    {
                        data.input = [];
                        _.each(element.input(), function (element, index, list) {
                            data.input[index] = ko.mapping.toJS(element);
                            if (element.hasOwnProperty("default")) {
                                data.input[index].defaultValue = element.default;
                            }
                        });
                    }
        
                    if (element.hasOwnProperty("width")) {
                        data.width = element.width();
                    }
                    if (element.hasOwnProperty("offset")) {
                        data.offset = element.offset();
                    }
        
                    self.customControlDialogViewModel.reset(data);
                    self.customControlDialogViewModel.title(gettext(title));
                    self.customControlDialogViewModel.type(type);
        
                    self.customControlDialogViewModel.show(function (ret) {
                        var element = self.element;
        
                        switch (self.customControlDialogViewModel.type()) {
                            case "container": {
                                element.name(ret.name);                           
                                element.layout(ret.layout);
                                element.collapsed(ret.collapsed);
                                break;
                            }
                            case "command": {
                                element.name(ret.name);
        
                                if (ret.command != undefined) {
                                    element.command = ret.command;
                                    delete element.commands;
                                }
                                if (ret.commands != undefined) {
                                    element.commands = ret.commands;
                                    delete element.command;
                                }
        
                                if (ret.confirm != "") {
                                    element.confirm = ret.confirm;
                                }
        
                                if (ret.input != undefined) {
                                    _.each(ret.input, function (element, index, list) {
                                        data.input[index] = ko.mapping.toJS(element);
                                    });
        
                                    element.input(self._processInput(ret.input));
                                }
                                else
                                    delete element.input;
        
                                // Command can also be a output
                                if (ret.hasOwnProperty("template")) {
                                    if (element.hasOwnProperty("template"))
                                        element.template(ret.template);
                                    else
                                        element.template = ko.observable(ret.template);
        
                                    if (element.hasOwnProperty("regex"))
                                        element.regex(ret.regex);
                                    else
                                        element.regex = ko.observable(ret.regex);
        
                                    if (element.hasOwnProperty("default"))
                                        element.default(ret.default);
                                    else
                                        element.default = ko.observable(ret.default);
                                }
                                else
                                {
                                    if (element.hasOwnProperty("default"))
                                        element.default(undefined);
        
                                    delete element.template;
                                    delete element.regex;
                                    delete element.default;
                                }
                                break;
                            }
                            case "script": {
                                element.name(ret.name);
                                element.script = ret.script;
        
                                if (ret.confirm != "") {
                                    element.confirm = ret.confirm;
                                }
        
                                if (ret.input != undefined) {
                                    element.input(self._processInput(ret.input));
                                }
                                else
                                    delete element.input;
        
                                break;
                            }
                            case "output": {
                                element.template(ret.template);
                                element.regex(ret.regex);
                                element.default(ret.defaultValue);
                                break;
                            }
                        }
        
                        if (element.parent && element.parent.layout() == "horizontal_grid") {
                            if (ret.width != undefined && ret.width != "")
                                element.width(ret.width);
        
                            if (ret.offset != undefined && ret.offset != "")
                                element.offset(ret.offset);
                        }
                    });
                }
        
                self.controlContextMenu = function (invokedOn, contextParent, selectedMenu)
                {
                    switch (selectedMenu.attr('cmd')) {
                        case "editElement": {
                            self.editElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        case "deleteElement": {
                            self.deleteElement(invokedOn, contextParent, selectedMenu);
                            break;
                        }
                        default: {
                            if (selectedMenu.attr('cmd').startsWith("create")) {
                                switch (selectedMenu.attr('cmd')) {
                                    case "createContainer": {
                                        self.customControlDialogViewModel.title(gettext("Create container"));
                                        self.customControlDialogViewModel.type("container");
                                        break;
                                    }
                                    case "createCommand": {
                                        self.customControlDialogViewModel.title(gettext("Create Command"));
                                        self.customControlDialogViewModel.type("command");
                                        break;
                                    }
                                    case "createScript": {
                                        self.customControlDialogViewModel.title(gettext("Create Script"));
                                        self.customControlDialogViewModel.type("script");
                                        break;
                                    }
                                    case "createOutput": {
                                        self.customControlDialogViewModel.title(gettext("Create Output"));
                                        self.customControlDialogViewModel.type("output");
                                        break;
                                    }
                                }
        
                                self.createElement(invokedOn, contextParent, selectedMenu);
                            }
                            break;
                        }
                    }
                }
        
                self.editStyle = function (type) {
                }
               
                self.recursiveDeleteProperties = function (list) {
                    _.each(list, function (element, index, ll) {
                        if (!element.parent || (element.parent.hasOwnProperty("layout") && element.parent.layout() != "horizontal_grid")) {
                            delete element.width;
                            delete element.offset;
                        }
        
                        if (element.default == "")
                            delete element.default;
        
                        delete element.id;
                        delete element.parent;
                        delete element.processed;
                        delete element.output;
                        delete element.key;
                        delete element.template_key;
                        delete element.value;
        
                        if (element.hasOwnProperty("input")) {
                            _.each(element.input(), function (e, i, l) {
                                if (e.default == "")
                                    delete e.default;
        
                                delete e.value;
                            });
                        }
        
                        if (element.hasOwnProperty("width") && element.width() == "")
                            delete element.width;
                        if (element.hasOwnProperty("offset") && element.offset() == "")
                            delete element.offset;
        
                        if (!element.hasOwnProperty("name") || element.name() == "") {
                            delete element.name;
                            delete element.collapsed;
                        }
        
        
                        if (element.hasOwnProperty("children")) {
                            if (element.hasOwnProperty("collapsed") && !element.collapsed())
                                delete element.collapsed;
        
                            self.recursiveDeleteProperties(element.children());
                        }
                    });
                }
                self.onSettingsBeforeSave = function () {
                    self.recursiveDeleteProperties(self.controlsFromServer);
                    self.settingsViewModel.settings.plugins.customControl.controls = self.controlsFromServer;
                }
        
                self.onEventSettingsUpdated = function (payload) {
                    self.requestData();
                }
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                CustomControlViewModel,
                ["loginStateViewModel", "settingsViewModel", "controlViewModel", "customControlDialogViewModel"],
                "#settings_plugin_customControl"
            ]);
        });
        ;
        
        // source: plugin/customControl/js/customControlDialog.js
        ﻿$(function () {
            function customControlDialogViewModel(parameters) {
                var self = this;
        
                self.element = ko.observable();
        
                self.title = ko.observable(gettext("Create Container"));
                self.type = ko.observable("container");
        
                self.useInputs = ko.observable(false);
                self.useConfirm = ko.observable(false);
                self.useOutput = ko.observable(false);
                self.useJavaScript = ko.observable(false);
                self.useEnabled = ko.observable(false);
        
                self.layouts = ko.observableArray([
                    { name: gettext("Vertical"), key: "vertical" },
                    { name: gettext("Horizontal"), key: "horizontal" },
                    { name: gettext("Horizontal grid"), key: "horizontal_grid" }
                ]);
                self.types = ko.observableArray([
                    { name: gettext("Container"), key: "container" },
                    { name: gettext("Command"), key: "command" },
                    { name: gettext("Script"), key: "script" },
                    { name: gettext("Output"), key: "output" },
                ]);
        
                self.hasSlider = ko.computed(function () {
                    if (self.element() == undefined || self.element().input == undefined)
                        return false;
        
                    var inputs = self.element().input()
                    for(var i = 0; i < inputs.length; i++)    
                    {
                        if (inputs[i].hasOwnProperty("slider")) {
                            if (typeof inputs[i].slider == "object")
                                return true;
                        }
                    }
                    return false;
                });
                self.span = function(parameter) {
                    return ko.computed(function () {
                        if (self.hasSlider())
                            return "span2";
        
                        switch (parameter) {
                            case "name":
                            case "parameter":
                                return "span4";
                            case "default":
                                return "span3";
                        }
        
                        return "span2";
                    });
                }
        
                self.reset = function (data) {
                    var element = {
                        name: undefined,
                        collapsed: false,
                        commands: "",
                        confirm: "",
                        defaultValue: "",
                        script: "",
                        javascript: "",
                        enabled: "",
                        input: [],
                        layout: "vertical",
                        regex: "",
                        template: "",
                        confirm: "",
                        width: "2",
                        offset: "",
                        parent: undefined
                    };
        
                    if (typeof data == "object") {
                        element = _.extend(element, data);
        
                        self.useConfirm(data.hasOwnProperty("confirm"));
                        self.useInputs(data.hasOwnProperty("input"));
                        self.useOutput(data.hasOwnProperty("template"));
                    }
        
                    self.element(ko.mapping.fromJS(element));
                }
                self.show = function (f) {
                    var dialog = $("#customControlDialog");
                    var primarybtn = $('div.modal-footer .btn-primary', dialog);
        
                    primarybtn.unbind('click').bind('click', function (e) {
                        var obj = ko.mapping.toJS(self.element());
        
                        var el = {};
                        switch (self.type()) {
                            case "container": {
                                el.name = obj.name;
                                el.layout = obj.layout;
                                el.collapsed = obj.collapsed;
        
                                el.children = [];
                                break;
                            }
                            case "command": {
                                el.name = obj.name;
                                if (obj.commands.indexOf('\n') == -1)
                                    el.command = obj.commands;
                                else
                                    el.commands = obj.commands.split('\n');
        
                                if (self.useConfirm()) {
                                    el.confirm = obj.confirm;
                                }
        
                                if (self.useInputs()) {
                                    var attributeToInt = function (obj, key, def) {
                                        if (obj.hasOwnProperty(key)) {
                                            var val = obj[key];
                                            if (_.isNumber(val)) {
                                                return val;
                                            }
        
                                            var parsedVal = parseInt(val);
                                            if (!isNaN(parsedVal)) {
                                                return parsedVal;
                                            }
                                        }
                                        return def;
                                    };
        
                                    el.input = [];
                                    _.each(obj.input, function (element, index, list) {
                                        var input = {
                                            name: element.name,
                                            parameter: element.parameter,
                                            default: element.defaultValue
                                        };
                                        if (element.hasOwnProperty("slider") && element.slider != false) {
                                            input["slider"] = {
                                            };
        
                                            input.default = attributeToInt(element, "defaultValue", undefined);
        
                                            if (element.slider.hasOwnProperty("min") && element.slider.min != "")
                                                input.slider.min = element.slider.min;
                                            if (element.slider.hasOwnProperty("max") && element.slider.max != "")
                                                input.slider.max = element.slider.max;
                                            if (element.slider.hasOwnProperty("step") && element.slider.step != "")
                                                input.slider.step = element.slider.step;
                                        }
        
                                        el.input.push(input);
                                    });
                                }
        
                                if (self.useOutput()) {
                                    el.template = obj.template;
                                    el.regex = obj.regex;
                                    el.default = obj.defaultValue;
                                }
                                break;
                            }
                            case "script":
                                {
                                    el.name = obj.name;
                                    el.script = obj.script;
        
                                    if (self.useConfirm()) {
                                        el.confirm = obj.confirm;
                                    }
        
                                    if (self.useInputs()) {
                                        el.input = [];
                                        _.each(obj.input, function (element, index, list) {
                                            var input = {
                                                name: element.name,
                                                parameter: element.parameter,
                                                defaultValue: !isNaN(element.defaultValue) ? element.defaultValue : undefined
                                            };
                                            if (element.hasOwnProperty("slider") && element.slider != false) {
                                                input["slider"] = {
                                                };
        
                                                input.defaultValue = !isNaN(element.defaultValue) && element.defaultValue != undefined && element.defaultValue != "" ? parseInt(element.defaultValue) : undefined;
        
                                                if (element.slider.min != "")
                                                    input.slider.min = parseInt(element.slider.min);
                                                if (element.slider.max != "")
                                                    input.slider.max = parseInt(element.slider.max);
                                                if (element.slider.step != "")
                                                    input.slider.step = parseInt(element.slider.step);
                                            }
        
                                            el.input.push(input);
                                        });
                                    }
                                    break;
                                }
                            case "output": {
                                el.template = obj.template;
                                el.regex = obj.regex;
                                el.defaultValue = obj.defaultValue;
                                break;
                            }
                        }
        
                        el.width = obj.width;
                        el.offset = obj.offset;
        
                        f(el);
                    });
        
                    dialog.modal({
                        show: 'true',
                        backdrop: 'static',
                        keyboard: false
                    });
                }
        
                self.removeInput = function (data) {
                    self.element().input.remove(data);
                }
                self.addInput = function () {
                    var obj = {
                        name: ko.observable(""),
                        parameter: ko.observable(""),
                        defaultValue: ko.observable(""),
                        slider: false
                    }
        
                    self.element().input.push(obj);
                }
                self.addSliderInput = function () {
                    var obj = {
                        name: ko.observable(""),
                        parameter: ko.observable(""),
                        defaultValue: ko.observable(),
                        slider: {
                            min: ko.observable(),
                            max: ko.observable(),
                            step: ko.observable()
                        }
                    }
        
                    self.element().input.push(obj);
                }
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                customControlDialogViewModel,
                [],
                "#customControlDialog"
            ]);
        });
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin customControl:", (error.stack || error));
    }
})();

// JS assets for plugin displayz
(function () {
    try {
        // source: plugin/displayz/js/displayz.js
        $(function() {
            function DisplayZViewModel() {
                var self = this;
        
                self.onStartup = function() {
                    var element = $("#state").find(".accordion-inner .progress");
                    if (element.length) {
                        var text = gettext("Current Height");
                        var tooltip = gettext("Might be inaccurate!");
                        element.before(text + ": <strong title='" + tooltip + "' data-bind='text: heightString'></strong><br>");
                    }
                };
            }
        
            // view model class, parameters for constructor, container to bind to
            ADDITIONAL_VIEWMODELS.push([DisplayZViewModel, [], []]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin displayz:", (error.stack || error));
    }
})();

// JS assets for plugin dragon_order
(function () {
    try {
        // source: plugin/dragon_order/js/dragon_order.js
        /*
         * View model for OctoPrint-DragonOrder
         *
         * Author: jneilliii
         * License: AGPLv3
         */
        $(function() {
        	function dragon_orderViewModel(parameters) {
        		var self = this;
        		self.settingsViewModel = parameters[0];
        
        		self.onAllBound = function(allViewModels){
        			// Make the Tabs draggable.
        			$('#tabs,#tabs li ul.dropdown-menu').sortable({connectWith: '#tabs li ul.dropdown-menu,#tabs', items: 'li:not(.dropdown)', update:function(event, ui){
        					$('#tabs > li.dropdown > ul > li').appendTo('#tabs');
        					$('#tabs > li.dropdown').remove();
        					$('#tabs').width(function(){return ($('#navbar').width() - $('.accordion.span4').width() - ($('div.octoprint-container > div.row').width()/2) - 25) + 'px';});
        					if (!self.notify || self.notify.state !== 'open'){
        						var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};
        						self.notify = new PNotify({
        							title: 'Dragon Order',
        							text: 'Tabs expanded for setting order. Once complete hold down the [shift] key on your keyboard and press the refresh/reload button in your browser.',
        							type: 'info',
        							hide: false,
        							buttons: {
        								closer: false,
        								sticker: false
        							},
        							stack: stack_bottomright,
        							addclass: 'stack-bottomright',
        							});
        					}
        						
        					var new_tab_order = [];
        					$.each($('#tabs').sortable('toArray'), function(index, value){
        							if(value !== ''){
        								var new_value = value.replace('temp_link','temperature_link').replace('term_link','terminal_link').replace('gcode_link','gcodeviewer_link').replace(/^(tab_)?(.+)_link$/g,'$2');
        								new_tab_order.push(new_value);
        							}
        						});
        					self.settingsViewModel.settings.plugins.dragon_order.tab_order(new_tab_order);
        					self.settingsViewModel.saveData();
        				}});
        			
        			// Make the sidebar draggable.
        			$('body > div > div.container.octoprint-container > div.row > div.accordion.span4').sortable({axis:'y',handle: 'div.accordion-heading', update:function(){
        					var new_sidebar_order = [];
        					$.each($(this).sortable('toArray'), function(index, value){
        							var new_value = value.replace(/^(sidebar_)?(.+)_wrapper$/g,'$2');
        							new_sidebar_order.push(new_value);
        						});
        					self.settingsViewModel.settings.plugins.dragon_order.sidebar_order(new_sidebar_order);
        					self.settingsViewModel.saveData();
        				}});
        				
        			// Make the navbar draggable.
        			$('#navbar > div > div > div > ul.nav').sortable({axis: 'x', update:function(){
        					var new_navbar_order = [];
        					$.each($(this).sortable('toArray'), function(index, value){
        							var new_value = value.replace(/^(navbar_)?(.+)$/g,'$2');
        							new_navbar_order.push(new_value);
        						});
        					self.settingsViewModel.settings.plugins.dragon_order.navbar_order(new_navbar_order);
        					self.settingsViewModel.saveData();					
        				}});
        		}
        	}
        	OCTOPRINT_VIEWMODELS.push({
        		construct: dragon_orderViewModel,
        		dependencies: ['settingsViewModel'],
        		elements: []
        	});
        });
        
        ;
        
        // source: plugin/dragon_order/js/jquery-ui.min.js
        /*! jQuery UI - v1.12.1 - 2018-11-18
        * http://jqueryui.com
        * Includes: widget.js, data.js, disable-selection.js, scroll-parent.js, widgets/draggable.js, widgets/droppable.js, widgets/resizable.js, widgets/selectable.js, widgets/sortable.js, widgets/mouse.js
        * Copyright jQuery Foundation and other contributors; Licensed MIT */
        
        (function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){t.ui=t.ui||{},t.ui.version="1.12.1";var e=0,i=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var s,n,o=i.call(arguments,1),a=0,r=o.length;r>a;a++)for(s in o[a])n=o[a][s],o[a].hasOwnProperty(s)&&void 0!==n&&(e[s]=t.isPlainObject(n)?t.isPlainObject(e[s])?t.widget.extend({},e[s],n):t.widget.extend({},n):n);return e},t.widget.bridge=function(e,s){var n=s.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=i.call(arguments,1),l=this;return a?this.length||"instance"!==o?this.each(function(){var i,s=t.data(this,n);return"instance"===o?(l=s,!1):s?t.isFunction(s[o])&&"_"!==o.charAt(0)?(i=s[o].apply(s,r),i!==s&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):l=void 0:(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,n);e?(e.option(o||{}),e._init&&e._init()):t.data(this,n,new s(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(i,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=e++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),i),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])}}),t.fn.extend({disableSelection:function(){var t="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.on(t+".ui-disableSelection",function(t){t.preventDefault()})}}(),enableSelection:function(){return this.off(".ui-disableSelection")}}),t.fn.scrollParent=function(e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function(){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var s=!1;t(document).on("mouseup",function(){s=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!s){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,n=1===e.which,o="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return n&&!o&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),s=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,s=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.ui.plugin={add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i,s){var n,o=t.plugins[e];if(o&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(n=0;o.length>n;n++)t.options[o[n][0]]&&o[n][1].apply(t.element,i)}},t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.ui.safeBlur=function(e){e&&"body"!==e.nodeName.toLowerCase()&&t(e).trigger("blur")},t.widget("ui.draggable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this._addClass("ui-draggable"),this._setHandleClassName(),this._mouseInit()},_setOption:function(t,e){this._super(t,e),"handle"===t&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){return(this.helper||this.element).is(".ui-draggable-dragging")?(this.destroyOnClear=!0,void 0):(this._removeHandleClassName(),this._mouseDestroy(),void 0)},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(this._blurActiveElement(e),this._blockFrames(i.iframeFix===!0?"iframe":i.iframeFix),!0):!1)},_blockFrames:function(e){this.iframeBlocks=this.document.find(e).map(function(){var e=t(this);return t("<div>").css("position","absolute").appendTo(e.parent()).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).offset(e.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(e){var i=t.ui.safeActiveElement(this.document[0]),s=t(e.target);s.closest(i).length||t.ui.safeBlur(i)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this._addClass(this.helper,"ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=this.helper.parents().filter(function(){return"fixed"===t(this).css("position")}).length>0,this.positionAbs=this.element.offset(),this._refreshOffsets(e),this.originalPosition=this.position=this._generatePosition(e,!1),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_refreshOffsets:function(t){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:t.pageX-this.offset.left,top:t.pageY-this.offset.top}},_mouseDrag:function(e,i){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e,!0),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp(new t.Event("mouseup",e)),!1;this.position=s.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1},_mouseUp:function(e){return this._unblockFrames(),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),this.handleElement.is(e.target)&&this.element.trigger("focus"),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp(new t.Event("mouseup",{target:this.element[0]})):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this._addClass(this.handleElement,"ui-draggable-handle")},_removeHandleClassName:function(){this._removeClass(this.handleElement,"ui-draggable-handle")},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper),n=s?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return n.parents("body").length||n.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s&&n[0]===this.element[0]&&this._setPositionRelative(),n[0]===this.element[0]||/(fixed|absolute)/.test(n.css("position"))||n.css("position","absolute"),n},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_isRootNode:function(t){return/(html|body)/i.test(t.tagName)||t===this.document[0]},_getParentOffset:function(){var e=this.offsetParent.offset(),i=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==i&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),this._isRootNode(this.offsetParent[0])&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var t=this.element.position(),e=this._isRootNode(this.scrollParent[0]);return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+(e?0:this.scrollParent.scrollTop()),left:t.left-(parseInt(this.helper.css("left"),10)||0)+(e?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options,o=this.document[0];return this.relativeContainer=null,n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):"document"===n.containment?(this.containment=[0,0,t(o).width()-this.helperProportions.width-this.margins.left,(t(o).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):n.containment.constructor===Array?(this.containment=n.containment,void 0):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e=/(scroll|auto)/.test(i.css("overflow")),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=i),void 0):(this.containment=null,void 0)},_convertPositionTo:function(t,e){e||(e=this.position);var i="absolute"===t?1:-1,s=this._isRootNode(this.scrollParent[0]);return{top:e.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:s?0:this.offset.scroll.top)*i,left:e.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:s?0:this.offset.scroll.left)*i}},_generatePosition:function(t,e){var i,s,n,o,a=this.options,r=this._isRootNode(this.scrollParent[0]),l=t.pageX,h=t.pageY;return r&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),e&&(this.containment&&(this.relativeContainer?(s=this.relativeContainer.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,t.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),a.grid&&(n=a.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/a.grid[1])*a.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-a.grid[1]:n+a.grid[1]:n,o=a.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/a.grid[0])*a.grid[0]:this.originalPageX,l=i?o-this.offset.click.left>=i[0]||o-this.offset.click.left>i[2]?o:o-this.offset.click.left>=i[0]?o-a.grid[0]:o+a.grid[0]:o),"y"===a.axis&&(l=this.originalPageX),"x"===a.axis&&(h=this.originalPageY)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:r?0:this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:r?0:this.offset.scroll.left)}},_clear:function(){this._removeClass(this.helper,"ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s,this],!0),/^(drag|start|stop)/.test(e)&&(this.positionAbs=this._convertPositionTo("absolute"),s.offset=this.positionAbs),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i,s){var n=t.extend({},i,{item:s.element});s.sortables=[],t(s.options.connectToSortable).each(function(){var i=t(this).sortable("instance");i&&!i.options.disabled&&(s.sortables.push(i),i.refreshPositions(),i._trigger("activate",e,n))})},stop:function(e,i,s){var n=t.extend({},i,{item:s.element});s.cancelHelperRemoval=!1,t.each(s.sortables,function(){var t=this;t.isOver?(t.isOver=0,s.cancelHelperRemoval=!0,t.cancelHelperRemoval=!1,t._storedCSS={position:t.placeholder.css("position"),top:t.placeholder.css("top"),left:t.placeholder.css("left")},t._mouseStop(e),t.options.helper=t.options._helper):(t.cancelHelperRemoval=!0,t._trigger("deactivate",e,n))})},drag:function(e,i,s){t.each(s.sortables,function(){var n=!1,o=this;o.positionAbs=s.positionAbs,o.helperProportions=s.helperProportions,o.offset.click=s.offset.click,o._intersectsWith(o.containerCache)&&(n=!0,t.each(s.sortables,function(){return this.positionAbs=s.positionAbs,this.helperProportions=s.helperProportions,this.offset.click=s.offset.click,this!==o&&this._intersectsWith(this.containerCache)&&t.contains(o.element[0],this.element[0])&&(n=!1),n})),n?(o.isOver||(o.isOver=1,s._parent=i.helper.parent(),o.currentItem=i.helper.appendTo(o.element).data("ui-sortable-item",!0),o.options._helper=o.options.helper,o.options.helper=function(){return i.helper[0]},e.target=o.currentItem[0],o._mouseCapture(e,!0),o._mouseStart(e,!0,!0),o.offset.click.top=s.offset.click.top,o.offset.click.left=s.offset.click.left,o.offset.parent.left-=s.offset.parent.left-o.offset.parent.left,o.offset.parent.top-=s.offset.parent.top-o.offset.parent.top,s._trigger("toSortable",e),s.dropped=o.element,t.each(s.sortables,function(){this.refreshPositions()}),s.currentItem=s.element,o.fromOutside=s),o.currentItem&&(o._mouseDrag(e),i.position=o.position)):o.isOver&&(o.isOver=0,o.cancelHelperRemoval=!0,o.options._revert=o.options.revert,o.options.revert=!1,o._trigger("out",e,o._uiHash(o)),o._mouseStop(e,!0),o.options.revert=o.options._revert,o.options.helper=o.options._helper,o.placeholder&&o.placeholder.remove(),i.helper.appendTo(s._parent),s._refreshOffsets(e),i.position=s._generatePosition(e,!0),s._trigger("fromSortable",e),s.dropped=!1,t.each(s.sortables,function(){this.refreshPositions()}))})}}),t.ui.plugin.add("draggable","cursor",{start:function(e,i,s){var n=t("body"),o=s.options;n.css("cursor")&&(o._cursor=n.css("cursor")),n.css("cursor",o.cursor)},stop:function(e,i,s){var n=s.options;n._cursor&&t("body").css("cursor",n._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("opacity")&&(o._opacity=n.css("opacity")),n.css("opacity",o.opacity)},stop:function(e,i,s){var n=s.options;n._opacity&&t(i.helper).css("opacity",n._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(t,e,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(e,i,s){var n=s.options,o=!1,a=s.scrollParentNotHidden[0],r=s.document[0];a!==r&&"HTML"!==a.tagName?(n.axis&&"x"===n.axis||(s.overflowOffset.top+a.offsetHeight-e.pageY<n.scrollSensitivity?a.scrollTop=o=a.scrollTop+n.scrollSpeed:e.pageY-s.overflowOffset.top<n.scrollSensitivity&&(a.scrollTop=o=a.scrollTop-n.scrollSpeed)),n.axis&&"y"===n.axis||(s.overflowOffset.left+a.offsetWidth-e.pageX<n.scrollSensitivity?a.scrollLeft=o=a.scrollLeft+n.scrollSpeed:e.pageX-s.overflowOffset.left<n.scrollSensitivity&&(a.scrollLeft=o=a.scrollLeft-n.scrollSpeed))):(n.axis&&"x"===n.axis||(e.pageY-t(r).scrollTop()<n.scrollSensitivity?o=t(r).scrollTop(t(r).scrollTop()-n.scrollSpeed):t(window).height()-(e.pageY-t(r).scrollTop())<n.scrollSensitivity&&(o=t(r).scrollTop(t(r).scrollTop()+n.scrollSpeed))),n.axis&&"y"===n.axis||(e.pageX-t(r).scrollLeft()<n.scrollSensitivity?o=t(r).scrollLeft(t(r).scrollLeft()-n.scrollSpeed):t(window).width()-(e.pageX-t(r).scrollLeft())<n.scrollSensitivity&&(o=t(r).scrollLeft(t(r).scrollLeft()+n.scrollSpeed)))),o!==!1&&t.ui.ddmanager&&!n.dropBehaviour&&t.ui.ddmanager.prepareOffsets(s,e)}}),t.ui.plugin.add("draggable","snap",{start:function(e,i,s){var n=s.options;s.snapElements=[],t(n.snap.constructor!==String?n.snap.items||":data(ui-draggable)":n.snap).each(function(){var e=t(this),i=e.offset();this!==s.element[0]&&s.snapElements.push({item:this,width:e.outerWidth(),height:e.outerHeight(),top:i.top,left:i.left})})},drag:function(e,i,s){var n,o,a,r,l,h,c,u,d,p,f=s.options,g=f.snapTolerance,m=i.offset.left,_=m+s.helperProportions.width,v=i.offset.top,b=v+s.helperProportions.height;for(d=s.snapElements.length-1;d>=0;d--)l=s.snapElements[d].left-s.margins.left,h=l+s.snapElements[d].width,c=s.snapElements[d].top-s.margins.top,u=c+s.snapElements[d].height,l-g>_||m>h+g||c-g>b||v>u+g||!t.contains(s.snapElements[d].item.ownerDocument,s.snapElements[d].item)?(s.snapElements[d].snapping&&s.options.snap.release&&s.options.snap.release.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=!1):("inner"!==f.snapMode&&(n=g>=Math.abs(c-b),o=g>=Math.abs(u-v),a=g>=Math.abs(l-_),r=g>=Math.abs(h-m),n&&(i.position.top=s._convertPositionTo("relative",{top:c-s.helperProportions.height,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l-s.helperProportions.width}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h}).left)),p=n||o||a||r,"outer"!==f.snapMode&&(n=g>=Math.abs(c-v),o=g>=Math.abs(u-b),a=g>=Math.abs(l-m),r=g>=Math.abs(h-_),n&&(i.position.top=s._convertPositionTo("relative",{top:c,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u-s.helperProportions.height,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h-s.helperProportions.width}).left)),!s.snapElements[d].snapping&&(n||o||a||r||p)&&s.options.snap.snap&&s.options.snap.snap.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=n||o||a||r||p)}}),t.ui.plugin.add("draggable","stack",{start:function(e,i,s){var n,o=s.options,a=t.makeArray(t(o.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});a.length&&(n=parseInt(t(a[0]).css("zIndex"),10)||0,t(a).each(function(e){t(this).css("zIndex",n+e)}),this.css("zIndex",n+a.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("zIndex")&&(o._zIndex=n.css("zIndex")),n.css("zIndex",o.zIndex)},stop:function(e,i,s){var n=s.options;n._zIndex&&t(i.helper).css("zIndex",n._zIndex)}}),t.ui.draggable,t.widget("ui.droppable",{version:"1.12.1",widgetEventPrefix:"drop",options:{accept:"*",addClasses:!0,greedy:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var e,i=this.options,s=i.accept;this.isover=!1,this.isout=!0,this.accept=t.isFunction(s)?s:function(t){return t.is(s)},this.proportions=function(){return arguments.length?(e=arguments[0],void 0):e?e:e={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight}},this._addToManager(i.scope),i.addClasses&&this._addClass("ui-droppable")},_addToManager:function(e){t.ui.ddmanager.droppables[e]=t.ui.ddmanager.droppables[e]||[],t.ui.ddmanager.droppables[e].push(this)},_splice:function(t){for(var e=0;t.length>e;e++)t[e]===this&&t.splice(e,1)},_destroy:function(){var e=t.ui.ddmanager.droppables[this.options.scope];this._splice(e)},_setOption:function(e,i){if("accept"===e)this.accept=t.isFunction(i)?i:function(t){return t.is(i)};else if("scope"===e){var s=t.ui.ddmanager.droppables[this.options.scope];this._splice(s),this._addToManager(i)}this._super(e,i)},_activate:function(e){var i=t.ui.ddmanager.current;this._addActiveClass(),i&&this._trigger("activate",e,this.ui(i))
        },_deactivate:function(e){var i=t.ui.ddmanager.current;this._removeActiveClass(),i&&this._trigger("deactivate",e,this.ui(i))},_over:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this._addHoverClass(),this._trigger("over",e,this.ui(i)))},_out:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this._removeHoverClass(),this._trigger("out",e,this.ui(i)))},_drop:function(e,i){var s=i||t.ui.ddmanager.current,o=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var i=t(this).droppable("instance");return i.options.greedy&&!i.options.disabled&&i.options.scope===s.options.scope&&i.accept.call(i.element[0],s.currentItem||s.element)&&n(s,t.extend(i,{offset:i.element.offset()}),i.options.tolerance,e)?(o=!0,!1):void 0}),o?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this._removeActiveClass(),this._removeHoverClass(),this._trigger("drop",e,this.ui(s)),this.element):!1):!1},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}},_addHoverClass:function(){this._addClass("ui-droppable-hover")},_removeHoverClass:function(){this._removeClass("ui-droppable-hover")},_addActiveClass:function(){this._addClass("ui-droppable-active")},_removeActiveClass:function(){this._removeClass("ui-droppable-active")}});var n=t.ui.intersect=function(){function t(t,e,i){return t>=e&&e+i>t}return function(e,i,s,n){if(!i.offset)return!1;var o=(e.positionAbs||e.position.absolute).left+e.margins.left,a=(e.positionAbs||e.position.absolute).top+e.margins.top,r=o+e.helperProportions.width,l=a+e.helperProportions.height,h=i.offset.left,c=i.offset.top,u=h+i.proportions().width,d=c+i.proportions().height;switch(s){case"fit":return o>=h&&u>=r&&a>=c&&d>=l;case"intersect":return o+e.helperProportions.width/2>h&&u>r-e.helperProportions.width/2&&a+e.helperProportions.height/2>c&&d>l-e.helperProportions.height/2;case"pointer":return t(n.pageY,c,i.proportions().height)&&t(n.pageX,h,i.proportions().width);case"touch":return(a>=c&&d>=a||l>=c&&d>=l||c>a&&l>d)&&(o>=h&&u>=o||r>=h&&u>=r||h>o&&r>u);default:return!1}}}();t.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,i){var s,n,o=t.ui.ddmanager.droppables[e.options.scope]||[],a=i?i.type:null,r=(e.currentItem||e.element).find(":data(ui-droppable)").addBack();t:for(s=0;o.length>s;s++)if(!(o[s].options.disabled||e&&!o[s].accept.call(o[s].element[0],e.currentItem||e.element))){for(n=0;r.length>n;n++)if(r[n]===o[s].element[0]){o[s].proportions().height=0;continue t}o[s].visible="none"!==o[s].element.css("display"),o[s].visible&&("mousedown"===a&&o[s]._activate.call(o[s],i),o[s].offset=o[s].element.offset(),o[s].proportions({width:o[s].element[0].offsetWidth,height:o[s].element[0].offsetHeight}))}},drop:function(e,i){var s=!1;return t.each((t.ui.ddmanager.droppables[e.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&n(e,this,this.options.tolerance,i)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(e,i){e.element.parentsUntil("body").on("scroll.droppable",function(){e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)})},drag:function(e,i){e.options.refreshPositions&&t.ui.ddmanager.prepareOffsets(e,i),t.each(t.ui.ddmanager.droppables[e.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,o,a,r=n(e,this,this.options.tolerance,i),l=!r&&this.isover?"isout":r&&!this.isover?"isover":null;l&&(this.options.greedy&&(o=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return t(this).droppable("instance").options.scope===o}),a.length&&(s=t(a[0]).droppable("instance"),s.greedyChild="isover"===l)),s&&"isover"===l&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[l]=!0,this["isout"===l?"isover":"isout"]=!1,this["isover"===l?"_over":"_out"].call(this,i),s&&"isout"===l&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(e,i){e.element.parentsUntil("body").off("scroll.droppable"),e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)}},t.uiBackCompat!==!1&&t.widget("ui.droppable",t.ui.droppable,{options:{hoverClass:!1,activeClass:!1},_addActiveClass:function(){this._super(),this.options.activeClass&&this.element.addClass(this.options.activeClass)},_removeActiveClass:function(){this._super(),this.options.activeClass&&this.element.removeClass(this.options.activeClass)},_addHoverClass:function(){this._super(),this.options.hoverClass&&this.element.addClass(this.options.hoverClass)},_removeHoverClass:function(){this._super(),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass)}}),t.ui.droppable,t.widget("ui.resizable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,classes:{"ui-resizable-se":"ui-icon ui-icon-gripsmall-diagonal-se"},containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_num:function(t){return parseFloat(t)||0},_isNumber:function(t){return!isNaN(parseFloat(t))},_hasScroll:function(e,i){if("hidden"===t(e).css("overflow"))return!1;var s=i&&"left"===i?"scrollLeft":"scrollTop",n=!1;return e[s]>0?!0:(e[s]=1,n=e[s]>0,e[s]=0,n)},_create:function(){var e,i=this.options,s=this;this._addClass("ui-resizable"),t.extend(this,{_aspectRatio:!!i.aspectRatio,aspectRatio:i.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:i.helper||i.ghost||i.animate?i.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i)&&(this.element.wrap(t("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.resizable("instance")),this.elementIsWrapper=!0,e={marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom"),marginLeft:this.originalElement.css("marginLeft")},this.element.css(e),this.originalElement.css("margin",0),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css(e),this._proportionallyResize()),this._setupHandles(),i.autoHide&&t(this.element).on("mouseenter",function(){i.disabled||(s._removeClass("ui-resizable-autohide"),s._handles.show())}).on("mouseleave",function(){i.disabled||s.resizing||(s._addClass("ui-resizable-autohide"),s._handles.hide())}),this._mouseInit()},_destroy:function(){this._mouseDestroy();var e,i=function(e){t(e).removeData("resizable").removeData("ui-resizable").off(".resizable").find(".ui-resizable-handle").remove()};return this.elementIsWrapper&&(i(this.element),e=this.element,this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")}).insertAfter(e),e.remove()),this.originalElement.css("resize",this.originalResizeStyle),i(this.originalElement),this},_setOption:function(t,e){switch(this._super(t,e),t){case"handles":this._removeHandles(),this._setupHandles();break;default:}},_setupHandles:function(){var e,i,s,n,o,a=this.options,r=this;if(this.handles=a.handles||(t(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this._handles=t(),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),s=this.handles.split(","),this.handles={},i=0;s.length>i;i++)e=t.trim(s[i]),n="ui-resizable-"+e,o=t("<div>"),this._addClass(o,"ui-resizable-handle "+n),o.css({zIndex:a.zIndex}),this.handles[e]=".ui-resizable-"+e,this.element.append(o);this._renderAxis=function(e){var i,s,n,o;e=e||this.element;for(i in this.handles)this.handles[i].constructor===String?this.handles[i]=this.element.children(this.handles[i]).first().show():(this.handles[i].jquery||this.handles[i].nodeType)&&(this.handles[i]=t(this.handles[i]),this._on(this.handles[i],{mousedown:r._mouseDown})),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i)&&(s=t(this.handles[i],this.element),o=/sw|ne|nw|se|n|s/.test(i)?s.outerHeight():s.outerWidth(),n=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join(""),e.css(n,o),this._proportionallyResize()),this._handles=this._handles.add(this.handles[i])},this._renderAxis(this.element),this._handles=this._handles.add(this.element.find(".ui-resizable-handle")),this._handles.disableSelection(),this._handles.on("mouseover",function(){r.resizing||(this.className&&(o=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),r.axis=o&&o[1]?o[1]:"se")}),a.autoHide&&(this._handles.hide(),this._addClass("ui-resizable-autohide"))},_removeHandles:function(){this._handles.remove()},_mouseCapture:function(e){var i,s,n=!1;for(i in this.handles)s=t(this.handles[i])[0],(s===e.target||t.contains(s,e.target))&&(n=!0);return!this.options.disabled&&n},_mouseStart:function(e){var i,s,n,o=this.options,a=this.element;return this.resizing=!0,this._renderProxy(),i=this._num(this.helper.css("left")),s=this._num(this.helper.css("top")),o.containment&&(i+=t(o.containment).scrollLeft()||0,s+=t(o.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:i,top:s},this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:a.width(),height:a.height()},this.originalSize=this._helper?{width:a.outerWidth(),height:a.outerHeight()}:{width:a.width(),height:a.height()},this.sizeDiff={width:a.outerWidth()-a.width(),height:a.outerHeight()-a.height()},this.originalPosition={left:i,top:s},this.originalMousePosition={left:e.pageX,top:e.pageY},this.aspectRatio="number"==typeof o.aspectRatio?o.aspectRatio:this.originalSize.width/this.originalSize.height||1,n=t(".ui-resizable-"+this.axis).css("cursor"),t("body").css("cursor","auto"===n?this.axis+"-resize":n),this._addClass("ui-resizable-resizing"),this._propagate("start",e),!0},_mouseDrag:function(e){var i,s,n=this.originalMousePosition,o=this.axis,a=e.pageX-n.left||0,r=e.pageY-n.top||0,l=this._change[o];return this._updatePrevProperties(),l?(i=l.apply(this,[e,a,r]),this._updateVirtualBoundaries(e.shiftKey),(this._aspectRatio||e.shiftKey)&&(i=this._updateRatio(i,e)),i=this._respectSize(i,e),this._updateCache(i),this._propagate("resize",e),s=this._applyChanges(),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),t.isEmptyObject(s)||(this._updatePrevProperties(),this._trigger("resize",e,this.ui()),this._applyChanges()),!1):!1},_mouseStop:function(e){this.resizing=!1;var i,s,n,o,a,r,l,h=this.options,c=this;return this._helper&&(i=this._proportionallyResizeElements,s=i.length&&/textarea/i.test(i[0].nodeName),n=s&&this._hasScroll(i[0],"left")?0:c.sizeDiff.height,o=s?0:c.sizeDiff.width,a={width:c.helper.width()-o,height:c.helper.height()-n},r=parseFloat(c.element.css("left"))+(c.position.left-c.originalPosition.left)||null,l=parseFloat(c.element.css("top"))+(c.position.top-c.originalPosition.top)||null,h.animate||this.element.css(t.extend(a,{top:l,left:r})),c.helper.height(c.size.height),c.helper.width(c.size.width),this._helper&&!h.animate&&this._proportionallyResize()),t("body").css("cursor","auto"),this._removeClass("ui-resizable-resizing"),this._propagate("stop",e),this._helper&&this.helper.remove(),!1},_updatePrevProperties:function(){this.prevPosition={top:this.position.top,left:this.position.left},this.prevSize={width:this.size.width,height:this.size.height}},_applyChanges:function(){var t={};return this.position.top!==this.prevPosition.top&&(t.top=this.position.top+"px"),this.position.left!==this.prevPosition.left&&(t.left=this.position.left+"px"),this.size.width!==this.prevSize.width&&(t.width=this.size.width+"px"),this.size.height!==this.prevSize.height&&(t.height=this.size.height+"px"),this.helper.css(t),t},_updateVirtualBoundaries:function(t){var e,i,s,n,o,a=this.options;o={minWidth:this._isNumber(a.minWidth)?a.minWidth:0,maxWidth:this._isNumber(a.maxWidth)?a.maxWidth:1/0,minHeight:this._isNumber(a.minHeight)?a.minHeight:0,maxHeight:this._isNumber(a.maxHeight)?a.maxHeight:1/0},(this._aspectRatio||t)&&(e=o.minHeight*this.aspectRatio,s=o.minWidth/this.aspectRatio,i=o.maxHeight*this.aspectRatio,n=o.maxWidth/this.aspectRatio,e>o.minWidth&&(o.minWidth=e),s>o.minHeight&&(o.minHeight=s),o.maxWidth>i&&(o.maxWidth=i),o.maxHeight>n&&(o.maxHeight=n)),this._vBoundaries=o},_updateCache:function(t){this.offset=this.helper.offset(),this._isNumber(t.left)&&(this.position.left=t.left),this._isNumber(t.top)&&(this.position.top=t.top),this._isNumber(t.height)&&(this.size.height=t.height),this._isNumber(t.width)&&(this.size.width=t.width)},_updateRatio:function(t){var e=this.position,i=this.size,s=this.axis;return this._isNumber(t.height)?t.width=t.height*this.aspectRatio:this._isNumber(t.width)&&(t.height=t.width/this.aspectRatio),"sw"===s&&(t.left=e.left+(i.width-t.width),t.top=null),"nw"===s&&(t.top=e.top+(i.height-t.height),t.left=e.left+(i.width-t.width)),t},_respectSize:function(t){var e=this._vBoundaries,i=this.axis,s=this._isNumber(t.width)&&e.maxWidth&&e.maxWidth<t.width,n=this._isNumber(t.height)&&e.maxHeight&&e.maxHeight<t.height,o=this._isNumber(t.width)&&e.minWidth&&e.minWidth>t.width,a=this._isNumber(t.height)&&e.minHeight&&e.minHeight>t.height,r=this.originalPosition.left+this.originalSize.width,l=this.originalPosition.top+this.originalSize.height,h=/sw|nw|w/.test(i),c=/nw|ne|n/.test(i);return o&&(t.width=e.minWidth),a&&(t.height=e.minHeight),s&&(t.width=e.maxWidth),n&&(t.height=e.maxHeight),o&&h&&(t.left=r-e.minWidth),s&&h&&(t.left=r-e.maxWidth),a&&c&&(t.top=l-e.minHeight),n&&c&&(t.top=l-e.maxHeight),t.width||t.height||t.left||!t.top?t.width||t.height||t.top||!t.left||(t.left=null):t.top=null,t},_getPaddingPlusBorderDimensions:function(t){for(var e=0,i=[],s=[t.css("borderTopWidth"),t.css("borderRightWidth"),t.css("borderBottomWidth"),t.css("borderLeftWidth")],n=[t.css("paddingTop"),t.css("paddingRight"),t.css("paddingBottom"),t.css("paddingLeft")];4>e;e++)i[e]=parseFloat(s[e])||0,i[e]+=parseFloat(n[e])||0;return{height:i[0]+i[2],width:i[1]+i[3]}},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var t,e=0,i=this.helper||this.element;this._proportionallyResizeElements.length>e;e++)t=this._proportionallyResizeElements[e],this.outerDimensions||(this.outerDimensions=this._getPaddingPlusBorderDimensions(t)),t.css({height:i.height()-this.outerDimensions.height||0,width:i.width()-this.outerDimensions.width||0})},_renderProxy:function(){var e=this.element,i=this.options;this.elementOffset=e.offset(),this._helper?(this.helper=this.helper||t("<div style='overflow:hidden;'></div>"),this._addClass(this.helper,this._helper),this.helper.css({width:this.element.outerWidth(),height:this.element.outerHeight(),position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++i.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(t,e){return{width:this.originalSize.width+e}},w:function(t,e){var i=this.originalSize,s=this.originalPosition;return{left:s.left+e,width:i.width-e}},n:function(t,e,i){var s=this.originalSize,n=this.originalPosition;return{top:n.top+i,height:s.height-i}},s:function(t,e,i){return{height:this.originalSize.height+i}},se:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},sw:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[e,i,s]))},ne:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},nw:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[e,i,s]))}},_propagate:function(e,i){t.ui.plugin.call(this,e,[i,this.ui()]),"resize"!==e&&this._trigger(e,i,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),t.ui.plugin.add("resizable","animate",{stop:function(e){var i=t(this).resizable("instance"),s=i.options,n=i._proportionallyResizeElements,o=n.length&&/textarea/i.test(n[0].nodeName),a=o&&i._hasScroll(n[0],"left")?0:i.sizeDiff.height,r=o?0:i.sizeDiff.width,l={width:i.size.width-r,height:i.size.height-a},h=parseFloat(i.element.css("left"))+(i.position.left-i.originalPosition.left)||null,c=parseFloat(i.element.css("top"))+(i.position.top-i.originalPosition.top)||null;i.element.animate(t.extend(l,c&&h?{top:c,left:h}:{}),{duration:s.animateDuration,easing:s.animateEasing,step:function(){var s={width:parseFloat(i.element.css("width")),height:parseFloat(i.element.css("height")),top:parseFloat(i.element.css("top")),left:parseFloat(i.element.css("left"))};n&&n.length&&t(n[0]).css({width:s.width,height:s.height}),i._updateCache(s),i._propagate("resize",e)}})}}),t.ui.plugin.add("resizable","containment",{start:function(){var e,i,s,n,o,a,r,l=t(this).resizable("instance"),h=l.options,c=l.element,u=h.containment,d=u instanceof t?u.get(0):/parent/.test(u)?c.parent().get(0):u;d&&(l.containerElement=t(d),/document/.test(u)||u===document?(l.containerOffset={left:0,top:0},l.containerPosition={left:0,top:0},l.parentData={element:t(document),left:0,top:0,width:t(document).width(),height:t(document).height()||document.body.parentNode.scrollHeight}):(e=t(d),i=[],t(["Top","Right","Left","Bottom"]).each(function(t,s){i[t]=l._num(e.css("padding"+s))}),l.containerOffset=e.offset(),l.containerPosition=e.position(),l.containerSize={height:e.innerHeight()-i[3],width:e.innerWidth()-i[1]},s=l.containerOffset,n=l.containerSize.height,o=l.containerSize.width,a=l._hasScroll(d,"left")?d.scrollWidth:o,r=l._hasScroll(d)?d.scrollHeight:n,l.parentData={element:d,left:s.left,top:s.top,width:a,height:r}))},resize:function(e){var i,s,n,o,a=t(this).resizable("instance"),r=a.options,l=a.containerOffset,h=a.position,c=a._aspectRatio||e.shiftKey,u={top:0,left:0},d=a.containerElement,p=!0;d[0]!==document&&/static/.test(d.css("position"))&&(u=l),h.left<(a._helper?l.left:0)&&(a.size.width=a.size.width+(a._helper?a.position.left-l.left:a.position.left-u.left),c&&(a.size.height=a.size.width/a.aspectRatio,p=!1),a.position.left=r.helper?l.left:0),h.top<(a._helper?l.top:0)&&(a.size.height=a.size.height+(a._helper?a.position.top-l.top:a.position.top),c&&(a.size.width=a.size.height*a.aspectRatio,p=!1),a.position.top=a._helper?l.top:0),n=a.containerElement.get(0)===a.element.parent().get(0),o=/relative|absolute/.test(a.containerElement.css("position")),n&&o?(a.offset.left=a.parentData.left+a.position.left,a.offset.top=a.parentData.top+a.position.top):(a.offset.left=a.element.offset().left,a.offset.top=a.element.offset().top),i=Math.abs(a.sizeDiff.width+(a._helper?a.offset.left-u.left:a.offset.left-l.left)),s=Math.abs(a.sizeDiff.height+(a._helper?a.offset.top-u.top:a.offset.top-l.top)),i+a.size.width>=a.parentData.width&&(a.size.width=a.parentData.width-i,c&&(a.size.height=a.size.width/a.aspectRatio,p=!1)),s+a.size.height>=a.parentData.height&&(a.size.height=a.parentData.height-s,c&&(a.size.width=a.size.height*a.aspectRatio,p=!1)),p||(a.position.left=a.prevPosition.left,a.position.top=a.prevPosition.top,a.size.width=a.prevSize.width,a.size.height=a.prevSize.height)},stop:function(){var e=t(this).resizable("instance"),i=e.options,s=e.containerOffset,n=e.containerPosition,o=e.containerElement,a=t(e.helper),r=a.offset(),l=a.outerWidth()-e.sizeDiff.width,h=a.outerHeight()-e.sizeDiff.height;e._helper&&!i.animate&&/relative/.test(o.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:l,height:h}),e._helper&&!i.animate&&/static/.test(o.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:l,height:h})}}),t.ui.plugin.add("resizable","alsoResize",{start:function(){var e=t(this).resizable("instance"),i=e.options;t(i.alsoResize).each(function(){var e=t(this);e.data("ui-resizable-alsoresize",{width:parseFloat(e.width()),height:parseFloat(e.height()),left:parseFloat(e.css("left")),top:parseFloat(e.css("top"))})})},resize:function(e,i){var s=t(this).resizable("instance"),n=s.options,o=s.originalSize,a=s.originalPosition,r={height:s.size.height-o.height||0,width:s.size.width-o.width||0,top:s.position.top-a.top||0,left:s.position.left-a.left||0};t(n.alsoResize).each(function(){var e=t(this),s=t(this).data("ui-resizable-alsoresize"),n={},o=e.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];t.each(o,function(t,e){var i=(s[e]||0)+(r[e]||0);i&&i>=0&&(n[e]=i||null)}),e.css(n)})},stop:function(){t(this).removeData("ui-resizable-alsoresize")}}),t.ui.plugin.add("resizable","ghost",{start:function(){var e=t(this).resizable("instance"),i=e.size;e.ghost=e.originalElement.clone(),e.ghost.css({opacity:.25,display:"block",position:"relative",height:i.height,width:i.width,margin:0,left:0,top:0}),e._addClass(e.ghost,"ui-resizable-ghost"),t.uiBackCompat!==!1&&"string"==typeof e.options.ghost&&e.ghost.addClass(this.options.ghost),e.ghost.appendTo(e.helper)},resize:function(){var e=t(this).resizable("instance");e.ghost&&e.ghost.css({position:"relative",height:e.size.height,width:e.size.width})},stop:function(){var e=t(this).resizable("instance");e.ghost&&e.helper&&e.helper.get(0).removeChild(e.ghost.get(0))}}),t.ui.plugin.add("resizable","grid",{resize:function(){var e,i=t(this).resizable("instance"),s=i.options,n=i.size,o=i.originalSize,a=i.originalPosition,r=i.axis,l="number"==typeof s.grid?[s.grid,s.grid]:s.grid,h=l[0]||1,c=l[1]||1,u=Math.round((n.width-o.width)/h)*h,d=Math.round((n.height-o.height)/c)*c,p=o.width+u,f=o.height+d,g=s.maxWidth&&p>s.maxWidth,m=s.maxHeight&&f>s.maxHeight,_=s.minWidth&&s.minWidth>p,v=s.minHeight&&s.minHeight>f;s.grid=l,_&&(p+=h),v&&(f+=c),g&&(p-=h),m&&(f-=c),/^(se|s|e)$/.test(r)?(i.size.width=p,i.size.height=f):/^(ne)$/.test(r)?(i.size.width=p,i.size.height=f,i.position.top=a.top-d):/^(sw)$/.test(r)?(i.size.width=p,i.size.height=f,i.position.left=a.left-u):((0>=f-c||0>=p-h)&&(e=i._getPaddingPlusBorderDimensions(this)),f-c>0?(i.size.height=f,i.position.top=a.top-d):(f=c-e.height,i.size.height=f,i.position.top=a.top+o.height-f),p-h>0?(i.size.width=p,i.position.left=a.left-u):(p=h-e.width,i.size.width=p,i.position.left=a.left+o.width-p))}}),t.ui.resizable,t.widget("ui.selectable",t.ui.mouse,{version:"1.12.1",options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch",selected:null,selecting:null,start:null,stop:null,unselected:null,unselecting:null},_create:function(){var e=this;this._addClass("ui-selectable"),this.dragged=!1,this.refresh=function(){e.elementPos=t(e.element[0]).offset(),e.selectees=t(e.options.filter,e.element[0]),e._addClass(e.selectees,"ui-selectee"),e.selectees.each(function(){var i=t(this),s=i.offset(),n={left:s.left-e.elementPos.left,top:s.top-e.elementPos.top};t.data(this,"selectable-item",{element:this,$element:i,left:n.left,top:n.top,right:n.left+i.outerWidth(),bottom:n.top+i.outerHeight(),startselected:!1,selected:i.hasClass("ui-selected"),selecting:i.hasClass("ui-selecting"),unselecting:i.hasClass("ui-unselecting")})})},this.refresh(),this._mouseInit(),this.helper=t("<div>"),this._addClass(this.helper,"ui-selectable-helper")},_destroy:function(){this.selectees.removeData("selectable-item"),this._mouseDestroy()},_mouseStart:function(e){var i=this,s=this.options;this.opos=[e.pageX,e.pageY],this.elementPos=t(this.element[0]).offset(),this.options.disabled||(this.selectees=t(s.filter,this.element[0]),this._trigger("start",e),t(s.appendTo).append(this.helper),this.helper.css({left:e.pageX,top:e.pageY,width:0,height:0}),s.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var s=t.data(this,"selectable-item");s.startselected=!0,e.metaKey||e.ctrlKey||(i._removeClass(s.$element,"ui-selected"),s.selected=!1,i._addClass(s.$element,"ui-unselecting"),s.unselecting=!0,i._trigger("unselecting",e,{unselecting:s.element}))}),t(e.target).parents().addBack().each(function(){var s,n=t.data(this,"selectable-item");return n?(s=!e.metaKey&&!e.ctrlKey||!n.$element.hasClass("ui-selected"),i._removeClass(n.$element,s?"ui-unselecting":"ui-selected")._addClass(n.$element,s?"ui-selecting":"ui-unselecting"),n.unselecting=!s,n.selecting=s,n.selected=s,s?i._trigger("selecting",e,{selecting:n.element}):i._trigger("unselecting",e,{unselecting:n.element}),!1):void 0}))},_mouseDrag:function(e){if(this.dragged=!0,!this.options.disabled){var i,s=this,n=this.options,o=this.opos[0],a=this.opos[1],r=e.pageX,l=e.pageY;return o>r&&(i=r,r=o,o=i),a>l&&(i=l,l=a,a=i),this.helper.css({left:o,top:a,width:r-o,height:l-a}),this.selectees.each(function(){var i=t.data(this,"selectable-item"),h=!1,c={};i&&i.element!==s.element[0]&&(c.left=i.left+s.elementPos.left,c.right=i.right+s.elementPos.left,c.top=i.top+s.elementPos.top,c.bottom=i.bottom+s.elementPos.top,"touch"===n.tolerance?h=!(c.left>r||o>c.right||c.top>l||a>c.bottom):"fit"===n.tolerance&&(h=c.left>o&&r>c.right&&c.top>a&&l>c.bottom),h?(i.selected&&(s._removeClass(i.$element,"ui-selected"),i.selected=!1),i.unselecting&&(s._removeClass(i.$element,"ui-unselecting"),i.unselecting=!1),i.selecting||(s._addClass(i.$element,"ui-selecting"),i.selecting=!0,s._trigger("selecting",e,{selecting:i.element}))):(i.selecting&&((e.metaKey||e.ctrlKey)&&i.startselected?(s._removeClass(i.$element,"ui-selecting"),i.selecting=!1,s._addClass(i.$element,"ui-selected"),i.selected=!0):(s._removeClass(i.$element,"ui-selecting"),i.selecting=!1,i.startselected&&(s._addClass(i.$element,"ui-unselecting"),i.unselecting=!0),s._trigger("unselecting",e,{unselecting:i.element}))),i.selected&&(e.metaKey||e.ctrlKey||i.startselected||(s._removeClass(i.$element,"ui-selected"),i.selected=!1,s._addClass(i.$element,"ui-unselecting"),i.unselecting=!0,s._trigger("unselecting",e,{unselecting:i.element})))))}),!1}},_mouseStop:function(e){var i=this;return this.dragged=!1,t(".ui-unselecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");i._removeClass(s.$element,"ui-unselecting"),s.unselecting=!1,s.startselected=!1,i._trigger("unselected",e,{unselected:s.element})}),t(".ui-selecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");i._removeClass(s.$element,"ui-selecting")._addClass(s.$element,"ui-selected"),s.selecting=!1,s.selected=!0,s.startselected=!0,i._trigger("selected",e,{selected:s.element})}),this._trigger("stop",e),this.helper.remove(),!1}}),t.widget("ui.sortable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"sort",ready:!1,options:{appendTo:"parent",axis:!1,connectWith:!1,containment:!1,cursor:"auto",cursorAt:!1,dropOnEmpty:!0,forcePlaceholderSize:!1,forceHelperSize:!1,grid:!1,handle:!1,helper:"original",items:"> *",opacity:!1,placeholder:!1,revert:!1,scroll:!0,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1e3,activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_isOverAxis:function(t,e,i){return t>=e&&e+i>t},_isFloating:function(t){return/left|right/.test(t.css("float"))||/inline|table-cell/.test(t.css("display"))},_create:function(){this.containerCache={},this._addClass("ui-sortable"),this.refresh(),this.offset=this.element.offset(),this._mouseInit(),this._setHandleClassName(),this.ready=!0},_setOption:function(t,e){this._super(t,e),"handle"===t&&this._setHandleClassName()},_setHandleClassName:function(){var e=this;this._removeClass(this.element.find(".ui-sortable-handle"),"ui-sortable-handle"),t.each(this.items,function(){e._addClass(this.instance.options.handle?this.item.find(this.instance.options.handle):this.item,"ui-sortable-handle")})},_destroy:function(){this._mouseDestroy();for(var t=this.items.length-1;t>=0;t--)this.items[t].item.removeData(this.widgetName+"-item");return this},_mouseCapture:function(e,i){var s=null,n=!1,o=this;return this.reverting?!1:this.options.disabled||"static"===this.options.type?!1:(this._refreshItems(e),t(e.target).parents().each(function(){return t.data(this,o.widgetName+"-item")===o?(s=t(this),!1):void 0}),t.data(e.target,o.widgetName+"-item")===o&&(s=t(e.target)),s?!this.options.handle||i||(t(this.options.handle,s).find("*").addBack().each(function(){this===e.target&&(n=!0)}),n)?(this.currentItem=s,this._removeCurrentsFromItems(),!0):!1:!1)},_mouseStart:function(e,i,s){var n,o,a=this.options;if(this.currentContainer=this,this.refreshPositions(),this.helper=this._createHelper(e),this._cacheHelperProportions(),this._cacheMargins(),this.scrollParent=this.helper.scrollParent(),this.offset=this.currentItem.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.helper.css("position","absolute"),this.cssPosition=this.helper.css("position"),this.originalPosition=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,a.cursorAt&&this._adjustOffsetFromHelper(a.cursorAt),this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]},this.helper[0]!==this.currentItem[0]&&this.currentItem.hide(),this._createPlaceholder(),a.containment&&this._setContainment(),a.cursor&&"auto"!==a.cursor&&(o=this.document.find("body"),this.storedCursor=o.css("cursor"),o.css("cursor",a.cursor),this.storedStylesheet=t("<style>*{ cursor: "+a.cursor+" !important; }</style>").appendTo(o)),a.opacity&&(this.helper.css("opacity")&&(this._storedOpacity=this.helper.css("opacity")),this.helper.css("opacity",a.opacity)),a.zIndex&&(this.helper.css("zIndex")&&(this._storedZIndex=this.helper.css("zIndex")),this.helper.css("zIndex",a.zIndex)),this.scrollParent[0]!==this.document[0]&&"HTML"!==this.scrollParent[0].tagName&&(this.overflowOffset=this.scrollParent.offset()),this._trigger("start",e,this._uiHash()),this._preserveHelperProportions||this._cacheHelperProportions(),!s)for(n=this.containers.length-1;n>=0;n--)this.containers[n]._trigger("activate",e,this._uiHash(this));return t.ui.ddmanager&&(t.ui.ddmanager.current=this),t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this.dragging=!0,this._addClass(this.helper,"ui-sortable-helper"),this._mouseDrag(e),!0},_mouseDrag:function(e){var i,s,n,o,a=this.options,r=!1;for(this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),this.lastPositionAbs||(this.lastPositionAbs=this.positionAbs),this.options.scroll&&(this.scrollParent[0]!==this.document[0]&&"HTML"!==this.scrollParent[0].tagName?(this.overflowOffset.top+this.scrollParent[0].offsetHeight-e.pageY<a.scrollSensitivity?this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop+a.scrollSpeed:e.pageY-this.overflowOffset.top<a.scrollSensitivity&&(this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop-a.scrollSpeed),this.overflowOffset.left+this.scrollParent[0].offsetWidth-e.pageX<a.scrollSensitivity?this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft+a.scrollSpeed:e.pageX-this.overflowOffset.left<a.scrollSensitivity&&(this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft-a.scrollSpeed)):(e.pageY-this.document.scrollTop()<a.scrollSensitivity?r=this.document.scrollTop(this.document.scrollTop()-a.scrollSpeed):this.window.height()-(e.pageY-this.document.scrollTop())<a.scrollSensitivity&&(r=this.document.scrollTop(this.document.scrollTop()+a.scrollSpeed)),e.pageX-this.document.scrollLeft()<a.scrollSensitivity?r=this.document.scrollLeft(this.document.scrollLeft()-a.scrollSpeed):this.window.width()-(e.pageX-this.document.scrollLeft())<a.scrollSensitivity&&(r=this.document.scrollLeft(this.document.scrollLeft()+a.scrollSpeed))),r!==!1&&t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e)),this.positionAbs=this._convertPositionTo("absolute"),this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),i=this.items.length-1;i>=0;i--)if(s=this.items[i],n=s.item[0],o=this._intersectsWithPointer(s),o&&s.instance===this.currentContainer&&n!==this.currentItem[0]&&this.placeholder[1===o?"next":"prev"]()[0]!==n&&!t.contains(this.placeholder[0],n)&&("semi-dynamic"===this.options.type?!t.contains(this.element[0],n):!0)){if(this.direction=1===o?"down":"up","pointer"!==this.options.tolerance&&!this._intersectsWithSides(s))break;
        this._rearrange(e,s),this._trigger("change",e,this._uiHash());break}return this._contactContainers(e),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),this._trigger("sort",e,this._uiHash()),this.lastPositionAbs=this.positionAbs,!1},_mouseStop:function(e,i){if(e){if(t.ui.ddmanager&&!this.options.dropBehaviour&&t.ui.ddmanager.drop(this,e),this.options.revert){var s=this,n=this.placeholder.offset(),o=this.options.axis,a={};o&&"x"!==o||(a.left=n.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollLeft)),o&&"y"!==o||(a.top=n.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollTop)),this.reverting=!0,t(this.helper).animate(a,parseInt(this.options.revert,10)||500,function(){s._clear(e)})}else this._clear(e,i);return!1}},cancel:function(){if(this.dragging){this._mouseUp(new t.Event("mouseup",{target:null})),"original"===this.options.helper?(this.currentItem.css(this._storedCSS),this._removeClass(this.currentItem,"ui-sortable-helper")):this.currentItem.show();for(var e=this.containers.length-1;e>=0;e--)this.containers[e]._trigger("deactivate",null,this._uiHash(this)),this.containers[e].containerCache.over&&(this.containers[e]._trigger("out",null,this._uiHash(this)),this.containers[e].containerCache.over=0)}return this.placeholder&&(this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]),"original"!==this.options.helper&&this.helper&&this.helper[0].parentNode&&this.helper.remove(),t.extend(this,{helper:null,dragging:!1,reverting:!1,_noFinalSort:null}),this.domPosition.prev?t(this.domPosition.prev).after(this.currentItem):t(this.domPosition.parent).prepend(this.currentItem)),this},serialize:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},t(i).each(function(){var i=(t(e.item||this).attr(e.attribute||"id")||"").match(e.expression||/(.+)[\-=_](.+)/);i&&s.push((e.key||i[1]+"[]")+"="+(e.key&&e.expression?i[1]:i[2]))}),!s.length&&e.key&&s.push(e.key+"="),s.join("&")},toArray:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},i.each(function(){s.push(t(e.item||this).attr(e.attribute||"id")||"")}),s},_intersectsWith:function(t){var e=this.positionAbs.left,i=e+this.helperProportions.width,s=this.positionAbs.top,n=s+this.helperProportions.height,o=t.left,a=o+t.width,r=t.top,l=r+t.height,h=this.offset.click.top,c=this.offset.click.left,u="x"===this.options.axis||s+h>r&&l>s+h,d="y"===this.options.axis||e+c>o&&a>e+c,p=u&&d;return"pointer"===this.options.tolerance||this.options.forcePointerForContainers||"pointer"!==this.options.tolerance&&this.helperProportions[this.floating?"width":"height"]>t[this.floating?"width":"height"]?p:e+this.helperProportions.width/2>o&&a>i-this.helperProportions.width/2&&s+this.helperProportions.height/2>r&&l>n-this.helperProportions.height/2},_intersectsWithPointer:function(t){var e,i,s="x"===this.options.axis||this._isOverAxis(this.positionAbs.top+this.offset.click.top,t.top,t.height),n="y"===this.options.axis||this._isOverAxis(this.positionAbs.left+this.offset.click.left,t.left,t.width),o=s&&n;return o?(e=this._getDragVerticalDirection(),i=this._getDragHorizontalDirection(),this.floating?"right"===i||"down"===e?2:1:e&&("down"===e?2:1)):!1},_intersectsWithSides:function(t){var e=this._isOverAxis(this.positionAbs.top+this.offset.click.top,t.top+t.height/2,t.height),i=this._isOverAxis(this.positionAbs.left+this.offset.click.left,t.left+t.width/2,t.width),s=this._getDragVerticalDirection(),n=this._getDragHorizontalDirection();return this.floating&&n?"right"===n&&i||"left"===n&&!i:s&&("down"===s&&e||"up"===s&&!e)},_getDragVerticalDirection:function(){var t=this.positionAbs.top-this.lastPositionAbs.top;return 0!==t&&(t>0?"down":"up")},_getDragHorizontalDirection:function(){var t=this.positionAbs.left-this.lastPositionAbs.left;return 0!==t&&(t>0?"right":"left")},refresh:function(t){return this._refreshItems(t),this._setHandleClassName(),this.refreshPositions(),this},_connectWith:function(){var t=this.options;return t.connectWith.constructor===String?[t.connectWith]:t.connectWith},_getItemsAsjQuery:function(e){function i(){r.push(this)}var s,n,o,a,r=[],l=[],h=this._connectWith();if(h&&e)for(s=h.length-1;s>=0;s--)for(o=t(h[s],this.document[0]),n=o.length-1;n>=0;n--)a=t.data(o[n],this.widgetFullName),a&&a!==this&&!a.options.disabled&&l.push([t.isFunction(a.options.items)?a.options.items.call(a.element):t(a.options.items,a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),a]);for(l.push([t.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):t(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]),s=l.length-1;s>=0;s--)l[s][0].each(i);return t(r)},_removeCurrentsFromItems:function(){var e=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=t.grep(this.items,function(t){for(var i=0;e.length>i;i++)if(e[i]===t.item[0])return!1;return!0})},_refreshItems:function(e){this.items=[],this.containers=[this];var i,s,n,o,a,r,l,h,c=this.items,u=[[t.isFunction(this.options.items)?this.options.items.call(this.element[0],e,{item:this.currentItem}):t(this.options.items,this.element),this]],d=this._connectWith();if(d&&this.ready)for(i=d.length-1;i>=0;i--)for(n=t(d[i],this.document[0]),s=n.length-1;s>=0;s--)o=t.data(n[s],this.widgetFullName),o&&o!==this&&!o.options.disabled&&(u.push([t.isFunction(o.options.items)?o.options.items.call(o.element[0],e,{item:this.currentItem}):t(o.options.items,o.element),o]),this.containers.push(o));for(i=u.length-1;i>=0;i--)for(a=u[i][1],r=u[i][0],s=0,h=r.length;h>s;s++)l=t(r[s]),l.data(this.widgetName+"-item",a),c.push({item:l,instance:a,width:0,height:0,left:0,top:0})},refreshPositions:function(e){this.floating=this.items.length?"x"===this.options.axis||this._isFloating(this.items[0].item):!1,this.offsetParent&&this.helper&&(this.offset.parent=this._getParentOffset());var i,s,n,o;for(i=this.items.length-1;i>=0;i--)s=this.items[i],s.instance!==this.currentContainer&&this.currentContainer&&s.item[0]!==this.currentItem[0]||(n=this.options.toleranceElement?t(this.options.toleranceElement,s.item):s.item,e||(s.width=n.outerWidth(),s.height=n.outerHeight()),o=n.offset(),s.left=o.left,s.top=o.top);if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(i=this.containers.length-1;i>=0;i--)o=this.containers[i].element.offset(),this.containers[i].containerCache.left=o.left,this.containers[i].containerCache.top=o.top,this.containers[i].containerCache.width=this.containers[i].element.outerWidth(),this.containers[i].containerCache.height=this.containers[i].element.outerHeight();return this},_createPlaceholder:function(e){e=e||this;var i,s=e.options;s.placeholder&&s.placeholder.constructor!==String||(i=s.placeholder,s.placeholder={element:function(){var s=e.currentItem[0].nodeName.toLowerCase(),n=t("<"+s+">",e.document[0]);return e._addClass(n,"ui-sortable-placeholder",i||e.currentItem[0].className)._removeClass(n,"ui-sortable-helper"),"tbody"===s?e._createTrPlaceholder(e.currentItem.find("tr").eq(0),t("<tr>",e.document[0]).appendTo(n)):"tr"===s?e._createTrPlaceholder(e.currentItem,n):"img"===s&&n.attr("src",e.currentItem.attr("src")),i||n.css("visibility","hidden"),n},update:function(t,n){(!i||s.forcePlaceholderSize)&&(n.height()||n.height(e.currentItem.innerHeight()-parseInt(e.currentItem.css("paddingTop")||0,10)-parseInt(e.currentItem.css("paddingBottom")||0,10)),n.width()||n.width(e.currentItem.innerWidth()-parseInt(e.currentItem.css("paddingLeft")||0,10)-parseInt(e.currentItem.css("paddingRight")||0,10)))}}),e.placeholder=t(s.placeholder.element.call(e.element,e.currentItem)),e.currentItem.after(e.placeholder),s.placeholder.update(e,e.placeholder)},_createTrPlaceholder:function(e,i){var s=this;e.children().each(function(){t("<td>&#160;</td>",s.document[0]).attr("colspan",t(this).attr("colspan")||1).appendTo(i)})},_contactContainers:function(e){var i,s,n,o,a,r,l,h,c,u,d=null,p=null;for(i=this.containers.length-1;i>=0;i--)if(!t.contains(this.currentItem[0],this.containers[i].element[0]))if(this._intersectsWith(this.containers[i].containerCache)){if(d&&t.contains(this.containers[i].element[0],d.element[0]))continue;d=this.containers[i],p=i}else this.containers[i].containerCache.over&&(this.containers[i]._trigger("out",e,this._uiHash(this)),this.containers[i].containerCache.over=0);if(d)if(1===this.containers.length)this.containers[p].containerCache.over||(this.containers[p]._trigger("over",e,this._uiHash(this)),this.containers[p].containerCache.over=1);else{for(n=1e4,o=null,c=d.floating||this._isFloating(this.currentItem),a=c?"left":"top",r=c?"width":"height",u=c?"pageX":"pageY",s=this.items.length-1;s>=0;s--)t.contains(this.containers[p].element[0],this.items[s].item[0])&&this.items[s].item[0]!==this.currentItem[0]&&(l=this.items[s].item.offset()[a],h=!1,e[u]-l>this.items[s][r]/2&&(h=!0),n>Math.abs(e[u]-l)&&(n=Math.abs(e[u]-l),o=this.items[s],this.direction=h?"up":"down"));if(!o&&!this.options.dropOnEmpty)return;if(this.currentContainer===this.containers[p])return this.currentContainer.containerCache.over||(this.containers[p]._trigger("over",e,this._uiHash()),this.currentContainer.containerCache.over=1),void 0;o?this._rearrange(e,o,null,!0):this._rearrange(e,null,this.containers[p].element,!0),this._trigger("change",e,this._uiHash()),this.containers[p]._trigger("change",e,this._uiHash(this)),this.currentContainer=this.containers[p],this.options.placeholder.update(this.currentContainer,this.placeholder),this.containers[p]._trigger("over",e,this._uiHash(this)),this.containers[p].containerCache.over=1}},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e,this.currentItem])):"clone"===i.helper?this.currentItem.clone():this.currentItem;return s.parents("body").length||t("parent"!==i.appendTo?i.appendTo:this.currentItem[0].parentNode)[0].appendChild(s[0]),s[0]===this.currentItem[0]&&(this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}),(!s[0].style.width||i.forceHelperSize)&&s.width(this.currentItem.width()),(!s[0].style.height||i.forceHelperSize)&&s.height(this.currentItem.height()),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===this.document[0].body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.currentItem.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;"parent"===n.containment&&(n.containment=this.helper[0].parentNode),("document"===n.containment||"window"===n.containment)&&(this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,"document"===n.containment?this.document.width():this.window.width()-this.helperProportions.width-this.margins.left,("document"===n.containment?this.document.height()||document.body.parentNode.scrollHeight:this.window.height()||this.document[0].body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]),/^(document|window|parent)$/.test(n.containment)||(e=t(n.containment)[0],i=t(n.containment).offset(),s="hidden"!==t(e).css("overflow"),this.containment=[i.left+(parseInt(t(e).css("borderLeftWidth"),10)||0)+(parseInt(t(e).css("paddingLeft"),10)||0)-this.margins.left,i.top+(parseInt(t(e).css("borderTopWidth"),10)||0)+(parseInt(t(e).css("paddingTop"),10)||0)-this.margins.top,i.left+(s?Math.max(e.scrollWidth,e.offsetWidth):e.offsetWidth)-(parseInt(t(e).css("borderLeftWidth"),10)||0)-(parseInt(t(e).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,i.top+(s?Math.max(e.scrollHeight,e.offsetHeight):e.offsetHeight)-(parseInt(t(e).css("borderTopWidth"),10)||0)-(parseInt(t(e).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top])},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,o=/(html|body)/i.test(n[0].tagName);return{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():o?0:n.scrollTop())*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():o?0:n.scrollLeft())*s}},_generatePosition:function(e){var i,s,n=this.options,o=e.pageX,a=e.pageY,r="absolute"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=/(html|body)/i.test(r[0].tagName);return"relative"!==this.cssPosition||this.scrollParent[0]!==this.document[0]&&this.scrollParent[0]!==this.offsetParent[0]||(this.offset.relative=this._getRelativeOffset()),this.originalPosition&&(this.containment&&(e.pageX-this.offset.click.left<this.containment[0]&&(o=this.containment[0]+this.offset.click.left),e.pageY-this.offset.click.top<this.containment[1]&&(a=this.containment[1]+this.offset.click.top),e.pageX-this.offset.click.left>this.containment[2]&&(o=this.containment[2]+this.offset.click.left),e.pageY-this.offset.click.top>this.containment[3]&&(a=this.containment[3]+this.offset.click.top)),n.grid&&(i=this.originalPageY+Math.round((a-this.originalPageY)/n.grid[1])*n.grid[1],a=this.containment?i-this.offset.click.top>=this.containment[1]&&i-this.offset.click.top<=this.containment[3]?i:i-this.offset.click.top>=this.containment[1]?i-n.grid[1]:i+n.grid[1]:i,s=this.originalPageX+Math.round((o-this.originalPageX)/n.grid[0])*n.grid[0],o=this.containment?s-this.offset.click.left>=this.containment[0]&&s-this.offset.click.left<=this.containment[2]?s:s-this.offset.click.left>=this.containment[0]?s-n.grid[0]:s+n.grid[0]:s)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():l?0:r.scrollTop()),left:o-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():l?0:r.scrollLeft())}},_rearrange:function(t,e,i,s){i?i[0].appendChild(this.placeholder[0]):e.item[0].parentNode.insertBefore(this.placeholder[0],"down"===this.direction?e.item[0]:e.item[0].nextSibling),this.counter=this.counter?++this.counter:1;var n=this.counter;this._delay(function(){n===this.counter&&this.refreshPositions(!s)})},_clear:function(t,e){function i(t,e,i){return function(s){i._trigger(t,s,e._uiHash(e))}}this.reverting=!1;var s,n=[];if(!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem),this._noFinalSort=null,this.helper[0]===this.currentItem[0]){for(s in this._storedCSS)("auto"===this._storedCSS[s]||"static"===this._storedCSS[s])&&(this._storedCSS[s]="");this.currentItem.css(this._storedCSS),this._removeClass(this.currentItem,"ui-sortable-helper")}else this.currentItem.show();for(this.fromOutside&&!e&&n.push(function(t){this._trigger("receive",t,this._uiHash(this.fromOutside))}),!this.fromOutside&&this.domPosition.prev===this.currentItem.prev().not(".ui-sortable-helper")[0]&&this.domPosition.parent===this.currentItem.parent()[0]||e||n.push(function(t){this._trigger("update",t,this._uiHash())}),this!==this.currentContainer&&(e||(n.push(function(t){this._trigger("remove",t,this._uiHash())}),n.push(function(t){return function(e){t._trigger("receive",e,this._uiHash(this))}}.call(this,this.currentContainer)),n.push(function(t){return function(e){t._trigger("update",e,this._uiHash(this))}}.call(this,this.currentContainer)))),s=this.containers.length-1;s>=0;s--)e||n.push(i("deactivate",this,this.containers[s])),this.containers[s].containerCache.over&&(n.push(i("out",this,this.containers[s])),this.containers[s].containerCache.over=0);if(this.storedCursor&&(this.document.find("body").css("cursor",this.storedCursor),this.storedStylesheet.remove()),this._storedOpacity&&this.helper.css("opacity",this._storedOpacity),this._storedZIndex&&this.helper.css("zIndex","auto"===this._storedZIndex?"":this._storedZIndex),this.dragging=!1,e||this._trigger("beforeStop",t,this._uiHash()),this.placeholder[0].parentNode.removeChild(this.placeholder[0]),this.cancelHelperRemoval||(this.helper[0]!==this.currentItem[0]&&this.helper.remove(),this.helper=null),!e){for(s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!this.cancelHelperRemoval},_trigger:function(){t.Widget.prototype._trigger.apply(this,arguments)===!1&&this.cancel()},_uiHash:function(e){var i=e||this;return{helper:i.helper,placeholder:i.placeholder||t([]),position:i.position,originalPosition:i.originalPosition,offset:i.positionAbs,item:i.currentItem,sender:e?e.element:null}}})});
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin dragon_order:", (error.stack || error));
    }
})();

// JS assets for plugin eeprom_repetier
(function () {
    try {
        // source: plugin/eeprom_repetier/js/eeprom_repetier.js
        /**
         * Created by Salandora on 27.07.2015.
         */
        $(function() {
            function EepromRepetierViewModel(parameters) {
                var self = this;
        
                self.control = parameters[0];
                self.connection = parameters[1];
        
                self.firmwareRegEx = /FIRMWARE_NAME:([^\s]+)/i;
                self.repetierRegEx = /Repetier_([^\s]*)/i;
        
                self.eepromDataRegEx = /EPR:(\d+) (\d+) ([^\s]+) (.+)/;
        
                self.isRepetierFirmware = ko.observable(false);
        
                self.isConnected = ko.computed(function() {
                    return self.connection.isOperational() || self.connection.isPrinting() ||
                           self.connection.isReady() || self.connection.isPaused();
                });
        
                self.eepromData = ko.observableArray([]);
        
                self.onStartup = function() {
                    $('#settings_plugin_eeprom_repetier_link a').on('show', function(e) {
                        if (self.isConnected() && !self.isRepetierFirmware())
                            self._requestFirmwareInfo();
                    });
                }
        
                self.fromHistoryData = function(data) {
                    _.each(data.logs, function(line) {
                        var match = self.firmwareRegEx.exec(line);
                        if (match != null) {
                            if (self.repetierRegEx.exec(match[0]))
                                self.isRepetierFirmware(true);
                        }
                    });
                };
        
                self.fromCurrentData = function(data) {
                    if (!self.isRepetierFirmware()) {
                        _.each(data.logs, function (line) {
                            var match = self.firmwareRegEx.exec(line);
                            if (match) {
                                if (self.repetierRegEx.exec(match[0]))
                                    self.isRepetierFirmware(true);
                            }
                        });
                    }
                    else
                    {
                        _.each(data.logs, function (line) {
                            var match = self.eepromDataRegEx.exec(line);
                            if (match) {
                                self.eepromData.push({
                                    dataType: match[1],
                                    position: match[2],
                                    origValue: match[3],
                                    value: match[3],
                                    description: match[4]
                                });
                            }
        		    else if (line.includes("Info:Configuration stored to EEPROM")) {
        			self.showPopup("success", "Configuration stored to EEPROM.", "");
        		    }
        		    else if (line.includes("Info:Configuration reset to defaults")) {
        			self.showPopup("success", "Configuration reset to defaults.", "");
        		    }
                        });
                    }
                };
        
                self.onEventConnected = function() {
                    self._requestFirmwareInfo();
                }
        
                self.onEventDisconnected = function() {
                    self.isRepetierFirmware(false);
                };
        
                self.loadEeprom = function() {
                    self.eepromData([]);
                    self._requestEepromData();
                };
        
                self.saveEeprom = function()  {
                    var eepromData = self.eepromData();
                    var changed = false;
                    _.each(eepromData, function(data) {
                        if (data.origValue != data.value) {
                            self._requestSaveDataToEeprom(data.dataType, data.position, data.value);
                            data.origValue = data.value;
        		            changed = true;
                        }
                    });
                    if (changed) {
                        self.showPopup("success", "All changed values stored to EEPROM.", "");
                    }
                };
        
                self.resetEeprom = function () {
                    showConfirmationDialog({
                        message: "Are you sure? Also remember to reset printer to take effect.",
                        onproceed: function() {
                            self.control.sendCustomCommand({ command: "M502"});
                            self.control.sendCustomCommand({ command: "M500"});
                        },
                    });
                }
        
                self._requestFirmwareInfo = function() {
                    self.control.sendCustomCommand({ command: "M115" });
                };
        
                self._requestEepromData = function() {
                    self.control.sendCustomCommand({ command: "M205" });
                }
        
                self._requestSaveDataToEeprom = function(data_type, position, value) {
                    var cmd = "M206 T" + data_type + " P" + position;
                    if (data_type == 3) {
                        cmd += " X" + value;
                        self.control.sendCustomCommand({ command: cmd });
                    }
                    else {
                        cmd += " S" + value;
                        self.control.sendCustomCommand({ command: cmd });
                    }
                }
        
                self.showPopup = function(message_type, title, text){
                    if (self.popup !== undefined){
                            self.closePopup();
                    }
                    self.popup = new PNotify({
                            title: gettext(title),
                            text: text,
                            type: message_type,
                            hide: false
                    });
                }
        
                self.closePopup = function() {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                };
            }
        
            OCTOPRINT_VIEWMODELS.push([
                EepromRepetierViewModel,
                ["controlViewModel", "connectionViewModel"],
                "#settings_plugin_eeprom_repetier"
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin eeprom_repetier:", (error.stack || error));
    }
})();

// JS assets for plugin extradistance
(function () {
    try {
        // source: plugin/extradistance/js/extradistance.js
        /*
         * Author: ntoff
         * License: AGPLv3
         */
        $(function() {
            function ExtraDistanceViewModel(parameters) {
                var self = this;
                
                self.control = parameters[0];
        
                self.control.distances1 = ko.observableArray([0.01, 0.1, 1, 10]);
                self.control.distances2 = ko.observableArray([5, 50, 100, 150]);
        
                if ($("#touch body").length == 0) {
                    $(".jog-panel .distance").remove();
                    $("#control-jog-z").after("\
                        <div class=\"distance\" id=\"distance-selector\">\
                            <div class=\"btn-group\" data-toggle=\"buttons-radio\" id=\"jog_distance1\">\
                                <!-- ko foreach: distances1 -->\
                                    <button type=\"button\" class=\"btn distance\" data-bind=\"enable: $root.isOperational() && !$root.isPrinting() && $root.loginState.isUser(), text: $data, click: function() { $root.distance($data) }, css: { active: $root.distance() === $data }, attr: { id: 'control-distance' + $root.stripDistanceDecimal($data) }\"></button>\
                                <!-- /ko -->\
                            </div>\
                            <div class=\"btn-group\" data-toggle=\"buttons-radio\" id=\"jog_distance2\">\
                            <!-- ko foreach: distances2 -->\
                                <button type=\"button\" class=\"btn distance\" data-bind=\"enable: $root.isOperational() && !$root.isPrinting() && $root.loginState.isUser(), text: $data, click: function() { $root.distance($data) }, css: { active: $root.distance() === $data }, attr: { id: 'control-distance' + $root.stripDistanceDecimal($data) }\"></button>\
                            <!-- /ko -->\
                        </div>\
                        </div>\
                    ");
                }
            }
        
            OCTOPRINT_VIEWMODELS.push({
                construct: ExtraDistanceViewModel,
                dependencies: [ "controlViewModel"]
            });
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin extradistance:", (error.stack || error));
    }
})();

// JS assets for plugin fanspeedslider
(function () {
    try {
        // source: plugin/fanspeedslider/js/fanslider.js
        /*
         * Author: ntoff
         * License: AGPLv3
         */
        $(function () {
        
        	function FanSliderPluginViewModel(parameters) {
        		//'use strict';
        		var self = this;
        
        		self.settings = parameters[0];
        		self.control = parameters[1];
        		self.loginState = parameters[2];
        
        		self.settings.defaultFanSpeed = new ko.observable(100);	//this,
        		self.control.fanSpeed = new ko.observable(100);			//this,
        		self.settings.minFanSpeed = new ko.observable(0); 		//this,
        		self.settings.maxFanSpeed = new ko.observable(100);		//and this are percents 0 - 100%
        		self.settings.notifyDelay = new ko.observable(4000); 	//time in milliseconds
        		self.settings.lockfan = new ko.observable(false);		//ignore fan inputs from gcode and lock the fan buttons
        		self.settings.defaultLastSpeed = new ko.observable(false); //options page option to set the slider to the last sent fan speed value on load/refresh
        		self.settings.lastSentSpeed = new ko.observable(null);	//the last speed value that was sent to the printer
        
        		self.control.lockTitle = new ko.observable(gettext("Unlocked")); //will set the hover title info for the fan lock button
        
        		//Not sure why I put these here, I swear I had a plan when I did it, something about dynamic text? I dunno, should move it back to the settings page
        		self.settings.commonTitle = ko.observable(gettext("\n\nThis allows limiting the cooling fan without having to re-slice your model.\n\nLimited to prints controlled by OctoPrint."));
        		self.settings.defaultTitle = ko.observable(gettext("This is the value the slider will default to when the UI is loaded / refreshed."));
        		self.settings.minTitle = ko.observable(gettext("Set this to the lowest value at which your fan will spin.") + self.settings.commonTitle());
        		self.settings.maxTitle = ko.observable(gettext("Set this <100% if your cooling fan is too strong on full.") + self.settings.commonTitle());
        		self.settings.noticeTitle = ko.observable(gettext("Notifications only apply when setting the speed via the slider + button in the UI. Set to 0 (zero) to disable notifications."));
        		self.settings.lastspeedTitle = ko.observable(gettext("Instead of defaulting to the speed set by \"Default Value\", the slider will be set to the last sent speed on load / refresh. \n\n Note: It takes into account the min/max value setting and overrides the \"Default Value\" setting."));
        
        		self.showNotify = function (self, options) {
        			options.title = "Fan Speed Control";
        			options.delay = options.delay || self.settings.notifyDelay();
        			options.type = options.type || "info";
        			if (options.delay != "0") {
        				new PNotify(options);
        			}
        		};
        
        		self.control.fanSpeedToPwm = ko.pureComputed(function () {
        			self.speed = self.control.fanSpeed() * 255 / 100 //don't forget to limit this to 2 decimal places at some point.
        			return self.speed;
        		});
        
        		self.control.checkSliderValue = ko.pureComputed(function () {
        			if (self.control.fanSpeed() < self.settings.minFanSpeed() && self.control.fanSpeed() != "0") {
        				console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is less than the minimum speed (" + self.settings.minFanSpeed() + "%), increasing.");
        				self.control.fanSpeed(self.settings.minFanSpeed());
        				var options = {
        					hide: true,
        					text: gettext('Fan speed increased to meet minimum speed requirement.'),
        					addclass:  'fan_speed_notice_low',
        				}
        				if ($(".fan_speed_notice_low").length <1) {
        					self.showNotify(self, options);
        				}
        			}
        			else if (self.control.fanSpeed() > self.settings.maxFanSpeed()) {
        				console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is more than the maximum speed (" + self.settings.maxFanSpeed() + "%), decreasing.");
        				self.control.fanSpeed(self.settings.maxFanSpeed());
        				var options = {
        					hide: true,
        					text: gettext('Fan speed decreased to meet maximum speed requirement.'),
        					addclass:  'fan_speed_notice_high',
        				}
        				if ($(".fan_speed_notice_high").length <1) {
        					self.showNotify(self, options);
        				}
        			}
        		});
        
        		//send gcode to set fan speed
        		self.control.sendFanSpeed = function () {
        			self.control.checkSliderValue();
        			self.control.sendCustomCommand({ command: "M106 S" + self.control.fanSpeedToPwm() });
        
        			if (self.settings.defaultLastSpeed()) {
        				self.settings.settings.plugins.fanspeedslider.lastSentSpeed(self.control.fanSpeed());
        				self.settings.saveData();
        				self.updateSettings();
        			}
        		};
        
        		self.control.lockFanInput = function () {
        			self.settings.settings.plugins.fanspeedslider.lockfan(!self.settings.settings.plugins.fanspeedslider.lockfan());
        			self.settings.saveData();
        			self.updateSettings();
        			
        			var options = {
        				type: "info",
        				hide: true,
        				delay: 1000*60,
        				text: gettext('CAUTION!! Fan speed commands are now being ignored! \n This includes commands sent via gcode and the terminal!'),
        				addclass:  'fan_speed_notice_fanlocked',
        			}
        			if (self.settings.lockfan() && $(".fan_speed_notice_fanlocked").length <1) {
        				self.showNotify(self, options);
        			}
        		}
        		//disables the on/off buttons if the lock is enabled
        		self.control.islocked = ko.pureComputed(function () {
        			return self.settings.settings.plugins.fanspeedslider.lockfan();
        		});
        
        		//ph34r
        		try {
        			//for some reason touchui uses "jog general" for the fan controls? Oh well, makes my job easier
        			$("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
        			$("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
        			$("#control-jog-general").find("button").eq(2).attr("id", "fan-off");
        			//If not TouchUI then remove standard buttons + add slider + new buttons
        			if ($("#touch body").length == 0) {
        				//remove original fan on/off buttons
        				$("#fan-on").remove();
        				$("#fan-off").remove();
        				//add new fan controls
        				$("#control-jog-general").find("button").eq(0).before("\
        					<input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
        					<button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
        					<div class=\"btn-group\">\
        						<button class=\"btn \" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
        						<button class=\"btn \" id=\"fan-lock\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.lockFanInput() }, attr: { title: lockTitle } \">\
        							<i class=\"fa fa-unlock\" data-bind=\"css: {'fa-lock': islocked(), 'fa-unlock': !islocked()}\"></i>\
        						</button>\
        					</div>\
        				");
        			} else {
        				//replace touch UI's fan on button with one that sends whatever speed is set in this plugin
        				$("#fan-on").remove();
        				$("#control-jog-general").find("button").eq(0).after("\
        					<button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan on") + "</button>\
        				");
        				//also add spin box + button below in its own section, button is redundant but convenient
        				$("#control-jog-feedrate").append("\
        					<input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
        					<button class=\"btn btn-block\" style=\"width: 169px\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed:") + "<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
        					<button class=\"btn \" id=\"fan-lock\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.lockFanInput() }, attr: { title: lockTitle } \">\
        						Fan Control Lock: <i class=\"fa fa-unlock\" data-bind=\"css: {'fa-lock': islocked(), 'fa-unlock': !islocked()}\"></i>\
        					</button>\
        					");
        			}
        		}
        		catch (error) {
        			console.log(error);
        		}
        
        		self.updateSettings = function () {
        			try {
        				self.settings.minFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.minSpeed()));
        				self.settings.maxFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.maxSpeed()));
        				self.settings.notifyDelay(parseInt(self.settings.settings.plugins.fanspeedslider.notifyDelay()));
        				self.settings.lockfan(self.settings.settings.plugins.fanspeedslider.lockfan());
        
        				if (self.settings.lockfan()) {
        					self.control.lockTitle( gettext("Lock or unlock the cooling fan controls. When locked, no cooling fan commands will be sent to the printer. \n\n Fan controls are locked."));
        				}
        				else if (!self.settings.lockfan()) {
        					self.control.lockTitle( gettext("Lock or unlock the cooling fan controls. When locked, no cooling fan commands will be sent to the printer. \n\n Fan controls are unlocked"))
        				}
        				self.settings.defaultLastSpeed(self.settings.settings.plugins.fanspeedslider.defaultLastSpeed());
        			}
        			catch (error) {
        				console.log(error);
        			}
        		}
        
        		self.onBeforeBinding = function () {
        			self.settings.defaultFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.defaultFanSpeed()));
        			self.settings.lastSentSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.lastSentSpeed()));
        			self.updateSettings();
        			//if the default fan speed is above or below max/min then set to either max or min
        			if (self.settings.defaultFanSpeed() < self.settings.minFanSpeed()) {
        				self.control.fanSpeed(self.settings.minFanSpeed());
        			}
        			else if (self.settings.defaultFanSpeed() > self.settings.maxFanSpeed()) {
        				self.control.fanSpeed(self.settings.maxFanSpeed());
        			}
        			else if (self.settings.defaultLastSpeed()) {
        				self.control.fanSpeed(self.settings.lastSentSpeed());
        			}
        			else {
        				self.control.fanSpeed(self.settings.defaultFanSpeed());
        			}			
        		}
        
        		//update settings in case user changes them, otherwise a refresh of the UI is required
        		self.onSettingsHidden = function () {
        			self.updateSettings();
        		}
        	}
        
        	OCTOPRINT_VIEWMODELS.push({
        		construct: FanSliderPluginViewModel,
        		additionalNames: [],
        		dependencies: ["settingsViewModel", "controlViewModel", "loginStateViewModel"],
        		optional: [],
        		elements: []
        	});
        });
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin fanspeedslider:", (error.stack || error));
    }
})();

// JS assets for plugin filamentmanager
(function () {
    try {
        // source: plugin/filamentmanager/js/filamentmanager.bundled.js
        /*
         * View model for OctoPrint-FilamentManager
         *
         * Author: Sven Lohrmann <malnvenshorn@gmail.com>
         * License: AGPLv3
         */
        
        var FilamentManager = function FilamentManager() {
            this.core.client.call(this);
            return this.core.bridge.call(this);
        };
        
        FilamentManager.prototype = {
            constructor: FilamentManager,
            core: {},
            viewModels: {},
            selectedSpools: undefined
        };
        var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
        
        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
        
        var Utils = function () {
            function Utils() {
                _classCallCheck(this, Utils);
            }
        
            _createClass(Utils, null, [{
                key: "validInt",
                // eslint-disable-line no-unused-vars
                value: function validInt(value, def) {
                    var v = Number.parseInt(value, 10);
                    return Number.isNaN(v) ? def : v;
                }
            }, {
                key: "validFloat",
                value: function validFloat(value, def) {
                    var v = Number.parseFloat(value);
                    return Number.isNaN(v) ? def : v;
                }
            }, {
                key: "runRequestChain",
                value: function runRequestChain(requests) {
                    var index = 0;
        
                    var next = function callNextRequest() {
                        if (index < requests.length) {
                            // Do the next, increment the call index
                            requests[index]().done(function () {
                                index += 1;
                                next();
                            });
                        }
                    };
        
                    next(); // Start chain
                }
            }, {
                key: "extractToolIDFromName",
                value: function extractToolIDFromName(name) {
                    var result = /(\d+)/.exec(name);
                    return result === null ? 0 : result[1];
                }
            }]);
        
            return Utils;
        }();
        /* global FilamentManager  _ */
        
        FilamentManager.prototype.core.bridge = function pluginBridge() {
            var self = this;
        
            self.core.bridge = {
                allViewModels: {},
        
                REQUIRED_VIEWMODELS: ['settingsViewModel', 'printerStateViewModel', 'loginStateViewModel', 'temperatureViewModel', 'filesViewModel'],
        
                BINDINGS: ['#settings_plugin_filamentmanager', '#settings_plugin_filamentmanager_profiledialog', '#settings_plugin_filamentmanager_spooldialog', '#settings_plugin_filamentmanager_configurationdialog', '#sidebar_plugin_filamentmanager_wrapper', '#plugin_filamentmanager_confirmationdialog'],
        
                viewModel: function FilamentManagerViewModel(viewModels) {
                    self.core.bridge.allViewModels = _.object(self.core.bridge.REQUIRED_VIEWMODELS, viewModels);
                    self.core.callbacks.call(self);
        
                    Object.values(self.viewModels).forEach(function (viewModel) {
                        return viewModel.call(self);
                    });
        
                    self.viewModels.profiles.updateCallbacks.push(self.viewModels.spools.requestSpools);
                    self.viewModels.profiles.updateCallbacks.push(self.viewModels.selections.requestSelectedSpools);
                    self.viewModels.spools.updateCallbacks.push(self.viewModels.selections.requestSelectedSpools);
                    self.viewModels.import.afterImportCallbacks.push(self.viewModels.profiles.requestProfiles);
                    self.viewModels.import.afterImportCallbacks.push(self.viewModels.spools.requestSpools);
                    self.viewModels.import.afterImportCallbacks.push(self.viewModels.selections.requestSelectedSpools);
        
                    self.selectedSpools = self.viewModels.selections.selectedSpools; // for backwards compatibility
                    return self;
                }
            };
        
            return self.core.bridge;
        };
        /* global FilamentManager Utils */
        
        FilamentManager.prototype.core.callbacks = function octoprintCallbacks() {
            var self = this;
        
            self.onStartup = function onStartupCallback() {
                self.viewModels.warning.replaceFilamentView();
            };
        
            self.onBeforeBinding = function onBeforeBindingCallback() {
                self.viewModels.config.loadData();
                self.viewModels.selections.setArraySize();
                self.viewModels.selections.setSubscriptions();
                self.viewModels.warning.setSubscriptions();
            };
        
            self.onStartupComplete = function onStartupCompleteCallback() {
                var requests = [self.viewModels.profiles.requestProfiles, self.viewModels.spools.requestSpools, self.viewModels.selections.requestSelectedSpools];
        
                // We chain them because, e.g. selections depends on spools
                Utils.runRequestChain(requests);
            };
        
            self.onDataUpdaterPluginMessage = function onDataUpdaterPluginMessageCallback(plugin, data) {
                if (plugin !== 'filamentmanager') return;
        
                var messageType = data.type;
                // const messageData = data.data;
                // TODO needs improvement
                if (messageType === 'data_changed') {
                    self.viewModels.profiles.requestProfiles();
                    self.viewModels.spools.requestSpools();
                    self.viewModels.selections.requestSelectedSpools();
                }
            };
        };
        /* global FilamentManager OctoPrint */
        
        FilamentManager.prototype.core.client = function apiClient() {
            var self = this.core.client;
        
            var pluginUrl = 'plugin/filamentmanager';
        
            var profileUrl = function apiProfileNamespace(profile) {
                var url = pluginUrl + '/profiles';
                return profile === undefined ? url : url + '/' + profile;
            };
        
            var spoolUrl = function apiSpoolNamespace(spool) {
                var url = pluginUrl + '/spools';
                return spool === undefined ? url : url + '/' + spool;
            };
        
            var selectionUrl = function apiSelectionNamespace(selection) {
                var url = pluginUrl + '/selections';
                return selection === undefined ? url : url + '/' + selection;
            };
        
            self.profile = {
                list: function list() {
                    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                    var opts = arguments[1];
        
                    var query = force ? { force: force } : {};
                    return OctoPrint.getWithQuery(profileUrl(), query, opts);
                },
                get: function get(id, opts) {
                    return OctoPrint.get(profileUrl(id), opts);
                },
                add: function add(profile, opts) {
                    var data = { profile: profile };
                    return OctoPrint.postJson(profileUrl(), data, opts);
                },
                update: function update(id, profile, opts) {
                    var data = { profile: profile };
                    return OctoPrint.patchJson(profileUrl(id), data, opts);
                },
                delete: function _delete(id, opts) {
                    return OctoPrint.delete(profileUrl(id), opts);
                }
            };
        
            self.spool = {
                list: function list() {
                    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                    var opts = arguments[1];
        
                    var query = force ? { force: force } : {};
                    return OctoPrint.getWithQuery(spoolUrl(), query, opts);
                },
                get: function get(id, opts) {
                    return OctoPrint.get(spoolUrl(id), opts);
                },
                add: function add(spool, opts) {
                    var data = { spool: spool };
                    return OctoPrint.postJson(spoolUrl(), data, opts);
                },
                update: function update(id, spool, opts) {
                    var data = { spool: spool };
                    return OctoPrint.patchJson(spoolUrl(id), data, opts);
                },
                delete: function _delete(id, opts) {
                    return OctoPrint.delete(spoolUrl(id), opts);
                }
            };
        
            self.selection = {
                list: function list(opts) {
                    return OctoPrint.get(selectionUrl(), opts);
                },
                update: function update(id, selection, opts) {
                    var data = { selection: selection };
                    return OctoPrint.patchJson(selectionUrl(id), data, opts);
                }
            };
        
            self.database = {
                test: function test(config, opts) {
                    var url = pluginUrl + '/database/test';
                    var data = { config: config };
                    return OctoPrint.postJson(url, data, opts);
                }
            };
        };
        /* global FilamentManager ko $ */
        
        FilamentManager.prototype.viewModels.config = function configurationViewModel() {
            var self = this.viewModels.config;
            var api = this.core.client;
            var settingsViewModel = this.core.bridge.allViewModels.settingsViewModel;
        
        
            var dialog = $('#settings_plugin_filamentmanager_configurationdialog');
        
            self.showDialog = function showConfigurationDialog() {
                self.loadData();
                dialog.modal('show');
            };
        
            self.hideDialog = function hideConfigurationDialog() {
                dialog.modal('hide');
            };
        
            self.config = ko.mapping.fromJS({});
        
            self.saveData = function savePluginConfiguration(viewModel, event) {
                var target = $(event.target);
                target.prepend('<i class="fa fa-spinner fa-spin"></i> ');
        
                var data = {
                    plugins: {
                        filamentmanager: ko.mapping.toJS(self.config)
                    }
                };
        
                settingsViewModel.saveData(data, {
                    success: function success() {
                        self.hideDialog();
                    },
                    complete: function complete() {
                        $('i.fa-spinner', target).remove();
                    },
        
                    sending: true
                });
            };
        
            self.loadData = function mapPluginConfigurationToObservables() {
                var pluginSettings = settingsViewModel.settings.plugins.filamentmanager;
                ko.mapping.fromJS(ko.toJS(pluginSettings), self.config);
            };
        
            self.connectionTest = function runExternalDatabaseConnectionTest(viewModel, event) {
                var target = $(event.target);
                target.removeClass('btn-success btn-danger');
                target.prepend('<i class="fa fa-spinner fa-spin"></i> ');
                target.prop('disabled', true);
        
                var data = ko.mapping.toJS(self.config.database);
        
                api.database.test(data).done(function () {
                    target.addClass('btn-success');
                }).fail(function () {
                    target.addClass('btn-danger');
                }).always(function () {
                    $('i.fa-spinner', target).remove();
                    target.prop('disabled', false);
                });
            };
        };
        /* global FilamentManager gettext $ ko Utils OctoPrint */
        
        FilamentManager.prototype.viewModels.confirmation = function spoolSelectionConfirmationViewModel() {
            var self = this.viewModels.confirmation;
            var _core$bridge$allViewM = this.core.bridge.allViewModels,
                printerStateViewModel = _core$bridge$allViewM.printerStateViewModel,
                settingsViewModel = _core$bridge$allViewM.settingsViewModel,
                filesViewModel = _core$bridge$allViewM.filesViewModel;
            var selections = this.viewModels.selections;
        
        
            var dialog = $('#plugin_filamentmanager_confirmationdialog');
            var button = $('#plugin_filamentmanager_confirmationdialog_print');
        
            self.selections = ko.observableArray([]);
        
            self.print = function startResumePrintDummy() {};
        
            self.checkSelection = function checkIfSpoolSelectionsMatchesSelectedSpoolsInSidebar() {
                var match = true;
                self.selections().forEach(function (value) {
                    if (selections.tools()[value.tool]() !== value.spool) match = false;
                });
                button.attr('disabled', !match);
            };
        
            var showDialog = function showSpoolConfirmationDialog() {
                var s = [];
                printerStateViewModel.filament().forEach(function (value) {
                    var toolID = Utils.extractToolIDFromName(value.name());
                    s.push({ spool: undefined, tool: toolID });
                });
                self.selections(s);
                button.attr('disabled', true);
                dialog.modal('show');
            };
        
            var startPrint = printerStateViewModel.print;
        
            printerStateViewModel.print = function confirmSpoolSelectionBeforeStartPrint() {
                if (settingsViewModel.settings.plugins.filamentmanager.confirmSpoolSelection()) {
                    showDialog();
                    button.html(gettext('Start Print'));
                    self.print = function continueToStartPrint() {
                        dialog.modal('hide');
                        startPrint();
                    };
                } else {
                    startPrint();
                }
            };
        
            var resumePrint = printerStateViewModel.resume;
        
            printerStateViewModel.resume = function confirmSpoolSelectionBeforeResumePrint() {
                if (settingsViewModel.settings.plugins.filamentmanager.confirmSpoolSelection()) {
                    showDialog();
                    button.html(gettext('Resume Print'));
                    self.print = function continueToResumePrint() {
                        dialog.modal('hide');
                        resumePrint();
                    };
                } else {
                    resumePrint();
                }
            };
        
            filesViewModel.loadFile = function confirmSpoolSelectionOnLoadAndPrint(data, printAfterLoad) {
                if (!data) {
                    return;
                }
        
                if (printAfterLoad && filesViewModel.listHelper.isSelected(data) && filesViewModel.enablePrint(data)) {
                    // file was already selected, just start the print job
                    printerStateViewModel.print();
                } else {
                    // select file, start print job (if requested and within dimensions)
                    var withinPrintDimensions = filesViewModel.evaluatePrintDimensions(data, true);
                    var print = printAfterLoad && withinPrintDimensions;
        
                    OctoPrint.files.select(data.origin, data.path, false).done(function () {
                        if (print) printerStateViewModel.print();
                    });
                }
            };
        };
        /* global FilamentManager ko $ PNotify gettext */
        
        FilamentManager.prototype.viewModels.import = function importDataViewModel() {
            var self = this.viewModels.import;
        
            var importButton = $('#settings_plugin_filamentmanager_import_button');
            var importElement = $('#settings_plugin_filamentmanager_import');
        
            self.importFilename = ko.observable();
            self.importInProgress = ko.observable(false);
        
            self.afterImportCallbacks = [];
        
            self.invalidArchive = ko.pureComputed(function () {
                var name = self.importFilename();
                return name !== undefined && !name.toLocaleLowerCase().endsWith('.zip');
            });
        
            self.enableImport = ko.pureComputed(function () {
                var name = self.importFilename();
                return name !== undefined && name.trim() !== '' && !self.invalidArchive();
            });
        
            importElement.fileupload({
                dataType: 'json',
                maxNumberOfFiles: 1,
                autoUpload: false,
                add: function add(e, data) {
                    if (data.files.length === 0) return;
        
                    self.importFilename(data.files[0].name);
        
                    importButton.unbind('click');
                    importButton.bind('click', function (event) {
                        self.importInProgress(true);
                        event.preventDefault();
                        data.submit();
                    });
                },
                done: function done() {
                    self.afterImportCallbacks.forEach(function (callback) {
                        callback();
                    });
                },
                fail: function fail() {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Data import failed'),
                        text: gettext('Something went wrong, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                },
                always: function always() {
                    importButton.unbind('click');
                    self.importFilename(undefined);
                    self.importInProgress(false);
                }
            });
        };
        /* global FilamentManager ko gettext showConfirmationDialog PNotify $ Utils */
        
        FilamentManager.prototype.viewModels.profiles = function profilesViewModel() {
            var self = this.viewModels.profiles;
            var api = this.core.client;
        
            self.allProfiles = ko.observableArray([]);
        
            self.cleanProfile = function getDefaultValuesForNewProfile() {
                return {
                    id: undefined,
                    material: '',
                    vendor: '',
                    density: 1.25,
                    diameter: 1.75
                };
            };
        
            self.loadedProfile = {
                id: ko.observable(),
                vendor: ko.observable(),
                material: ko.observable(),
                density: ko.observable(),
                diameter: ko.observable(),
                isNew: ko.observable(true)
            };
        
            self.vendorInvalid = ko.pureComputed(function () {
                return !self.loadedProfile.vendor();
            });
            self.materialInvalid = ko.pureComputed(function () {
                return !self.loadedProfile.material();
            });
        
            var loadProfile = function loadSelectedProfile() {
                if (self.loadedProfile.id() === undefined) {
                    if (!self.loadedProfile.isNew()) {
                        // selected 'new profile' in options menu, but no profile created yet
                        self.fromProfileData();
                    }
                } else {
                    // find profile data
                    var data = ko.utils.arrayFirst(self.allProfiles(), function (item) {
                        return item.id === self.loadedProfile.id();
                    });
        
                    if (!data) data = self.cleanProfile();
        
                    // populate data
                    self.fromProfileData(data);
                }
            };
        
            self.loadedProfile.id.subscribe(loadProfile);
        
            self.fromProfileData = function setLoadedProfileFromJSObject() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cleanProfile();
        
                self.loadedProfile.isNew(data.id === undefined);
                self.loadedProfile.id(data.id);
                self.loadedProfile.vendor(data.vendor);
                self.loadedProfile.material(data.material);
                self.loadedProfile.density(data.density);
                self.loadedProfile.diameter(data.diameter);
            };
        
            self.toProfileData = function getLoadedProfileAsJSObject() {
                var defaultProfile = self.cleanProfile();
        
                return {
                    id: self.loadedProfile.id(),
                    vendor: self.loadedProfile.vendor(),
                    material: self.loadedProfile.material(),
                    density: Utils.validFloat(self.loadedProfile.density(), defaultProfile.density),
                    diameter: Utils.validFloat(self.loadedProfile.diameter(), defaultProfile.diameter)
                };
            };
        
            var dialog = $('#settings_plugin_filamentmanager_profiledialog');
        
            self.showProfileDialog = function showProfileDialog() {
                self.fromProfileData();
                dialog.modal('show');
            };
        
            self.requestInProgress = ko.observable(false);
        
            self.processProfiles = function processRequestedProfiles(data) {
                self.allProfiles(data.profiles);
            };
        
            self.requestProfiles = function requestAllProfilesFromBackend() {
                var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        
                self.requestInProgress(true);
                return api.profile.list(force).done(function (response) {
                    self.processProfiles(response);
                }).always(function () {
                    self.requestInProgress(false);
                });
            };
        
            self.saveProfile = function saveProfileToBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toProfileData();
        
                return self.loadedProfile.isNew() ? self.addProfile(data) : self.updateProfile(data);
            };
        
            self.addProfile = function addProfileToBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toProfileData();
        
                self.requestInProgress(true);
                api.profile.add(data).done(function (response) {
                    var id = response.profile.id;
        
                    self.requestProfiles().done(function () {
                        self.loadedProfile.id(id);
                    });
                }).fail(function () {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Could not add profile'),
                        text: gettext('There was an unexpected error while saving the filament profile, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                    self.requestInProgress(false);
                });
            };
        
            self.updateCallbacks = [];
        
            self.updateProfile = function updateProfileInBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toProfileData();
        
                self.requestInProgress(true);
                api.profile.update(data.id, data).done(function () {
                    self.requestProfiles();
                    self.updateCallbacks.forEach(function (callback) {
                        callback();
                    });
                }).fail(function () {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Could not update profile'),
                        text: gettext('There was an unexpected error while updating the filament profile, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                    self.requestInProgress(false);
                });
            };
        
            self.removeProfile = function removeProfileFromBackend(data) {
                var perform = function performProfileRemoval() {
                    api.profile.delete(data.id).done(function () {
                        self.requestProfiles();
                    }).fail(function () {
                        new PNotify({ // eslint-disable-line no-new
                            title: gettext('Could not delete profile'),
                            text: gettext('There was an unexpected error while removing the filament profile, please consult the logs.'),
                            type: 'error',
                            hide: false
                        });
                        self.requestInProgress(false);
                    });
                };
        
                showConfirmationDialog({
                    title: gettext('Delete profile?'),
                    message: gettext('You are about to delete the filament profile <strong>' + data.material + ' (' + data.vendor + ')</strong>. Please note that it is not possible to delete profiles with associated spools.'),
                    proceed: gettext('Delete'),
                    onproceed: perform
                });
            };
        };
        /* global FilamentManager ko gettext PNotify */
        
        FilamentManager.prototype.viewModels.selections = function selectedSpoolsViewModel() {
            var self = this.viewModels.selections;
            var api = this.core.client;
            var settingsViewModel = this.core.bridge.allViewModels.settingsViewModel;
        
        
            self.selectedSpools = ko.observableArray([]);
        
            // selected spool id for each tool
            self.tools = ko.observableArray([]);
            // set to false if querying selections to prevent triggering the change event again when setting selected spools
            self.enableSpoolUpdate = false;
        
            self.setArraySize = function setArraySizeToNumberOfTools() {
                var currentProfileData = settingsViewModel.printerProfiles.currentProfileData();
                var numExtruders = currentProfileData ? currentProfileData.extruder.count() : 0;
        
                if (self.tools().length === numExtruders) return;
        
                if (self.tools().length < numExtruders) {
                    // number of extruders has increased
                    for (var i = self.tools().length; i < numExtruders; i += 1) {
                        self.selectedSpools().push(undefined);
                        self.tools().push(ko.observable(undefined));
                    }
                } else {
                    // number of extruders has decreased
                    for (var _i = numExtruders; _i < self.tools().length; _i += 1) {
                        self.tools().pop();
                        self.selectedSpools().pop();
                    }
                }
        
                // notify observers
                self.tools.valueHasMutated();
                self.selectedSpools.valueHasMutated();
            };
        
            self.setSubscriptions = function subscribeToProfileDataObservable() {
                settingsViewModel.printerProfiles.currentProfileData.subscribe(self.setArraySize);
            };
        
            self.requestInProgress = ko.observable(false);
        
            self.setSelectedSpools = function setSelectedSpoolsReceivedFromBackend(data) {
                self.enableSpoolUpdate = false;
                data.selections.forEach(function (selection) {
                    self.updateSelectedSpoolData(selection);
                });
                self.enableSpoolUpdate = true;
            };
        
            self.requestSelectedSpools = function requestSelectedSpoolsFromBackend() {
                self.requestInProgress(true);
                return api.selection.list().done(function (data) {
                    self.setSelectedSpools(data);
                }).always(function () {
                    self.requestInProgress(false);
                });
            };
        
            self.updateSelectedSpool = function updateSelectedSpoolInBackend(tool) {
                var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        
                if (!self.enableSpoolUpdate) return;
        
                var data = { tool: tool, spool: { id: id } };
        
                self.requestInProgress(true);
                api.selection.update(tool, data).done(function (response) {
                    self.updateSelectedSpoolData(response.selection);
                }).fail(function () {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Could not select spool'),
                        text: gettext('There was an unexpected error while selecting the spool, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                }).always(function () {
                    self.requestInProgress(false);
                });
            };
        
            self.updateSelectedSpoolData = function updateSelectedSpoolData(data) {
                if (data.tool < self.tools().length) {
                    self.tools()[data.tool](data.spool !== null ? data.spool.id : undefined);
                    self.selectedSpools()[data.tool] = data.spool !== null ? data.spool : undefined;
                    self.selectedSpools.valueHasMutated(); // notifies observers
                }
            };
        };
        /* global FilamentManager ItemListHelper ko Utils $ PNotify gettext showConfirmationDialog */
        
        FilamentManager.prototype.viewModels.spools = function spoolsViewModel() {
            var self = this.viewModels.spools;
            var api = this.core.client;
        
            var profilesViewModel = this.viewModels.profiles;
        
            self.allSpools = new ItemListHelper('filamentSpools', {
                name: function name(a, b) {
                    // sorts ascending
                    if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) return -1;
                    if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) return 1;
                    return 0;
                },
                material: function material(a, b) {
                    // sorts ascending
                    if (a.profile.material.toLocaleLowerCase() < b.profile.material.toLocaleLowerCase()) return -1;
                    if (a.profile.material.toLocaleLowerCase() > b.profile.material.toLocaleLowerCase()) return 1;
                    return 0;
                },
                vendor: function vendor(a, b) {
                    // sorts ascending
                    if (a.profile.vendor.toLocaleLowerCase() < b.profile.vendor.toLocaleLowerCase()) return -1;
                    if (a.profile.vendor.toLocaleLowerCase() > b.profile.vendor.toLocaleLowerCase()) return 1;
                    return 0;
                },
                remaining: function remaining(a, b) {
                    // sorts descending
                    var ra = parseFloat(a.weight) - parseFloat(a.used);
                    var rb = parseFloat(b.weight) - parseFloat(b.used);
                    if (ra > rb) return -1;
                    if (ra < rb) return 1;
                    return 0;
                }
            }, {}, 'name', [], [], 10);
        
            self.pageSize = ko.pureComputed({
                read: function read() {
                    return self.allSpools.pageSize();
                },
                write: function write(value) {
                    self.allSpools.pageSize(Utils.validInt(value, self.allSpools.pageSize()));
                }
            });
        
            self.cleanSpool = function getDefaultValuesForNewSpool() {
                return {
                    id: undefined,
                    name: '',
                    cost: 20,
                    weight: 1000,
                    used: 0,
                    temp_offset: 0,
                    profile: {
                        id: profilesViewModel.allProfiles().length > 0 ? profilesViewModel.allProfiles()[0].id : undefined
                    }
                };
            };
        
            self.loadedSpool = {
                id: ko.observable(),
                name: ko.observable(),
                profile: ko.observable(),
                cost: ko.observable(),
                totalWeight: ko.observable(),
                remaining: ko.observable(),
                temp_offset: ko.observable(),
                isNew: ko.observable(true)
            };
        
            self.nameInvalid = ko.pureComputed(function () {
                return !self.loadedSpool.name();
            });
        
            self.fromSpoolData = function setLoadedSpoolsFromJSObject() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cleanSpool();
        
                self.loadedSpool.isNew(data.id === undefined);
                self.loadedSpool.id(data.id);
                self.loadedSpool.name(data.name);
                self.loadedSpool.profile(data.profile.id);
                self.loadedSpool.totalWeight(data.weight);
                self.loadedSpool.cost(data.cost);
                self.loadedSpool.remaining(data.weight - data.used);
                self.loadedSpool.temp_offset(data.temp_offset);
            };
        
            self.toSpoolData = function getLoadedProfileAsJSObject() {
                var defaultSpool = self.cleanSpool();
                var totalWeight = Utils.validFloat(self.loadedSpool.totalWeight(), defaultSpool.weight);
                var remaining = Math.min(Utils.validFloat(self.loadedSpool.remaining(), defaultSpool.weight), totalWeight);
        
                return {
                    id: self.loadedSpool.id(),
                    name: self.loadedSpool.name(),
                    cost: Utils.validFloat(self.loadedSpool.cost(), defaultSpool.cost),
                    weight: totalWeight,
                    used: totalWeight - remaining,
                    temp_offset: self.loadedSpool.temp_offset(),
                    profile: {
                        id: self.loadedSpool.profile()
                    }
                };
            };
        
            var dialog = $('#settings_plugin_filamentmanager_spooldialog');
        
            self.showSpoolDialog = function showSpoolDialog(data) {
                self.fromSpoolData(data);
                dialog.modal('show');
            };
        
            self.hideSpoolDialog = function hideSpoolDialog() {
                dialog.modal('hide');
            };
        
            self.requestInProgress = ko.observable(false);
        
            self.processSpools = function processRequestedSpools(data) {
                self.allSpools.updateItems(data.spools);
            };
        
            self.requestSpools = function requestAllSpoolsFromBackend(force) {
                self.requestInProgress(true);
                return api.spool.list(force).done(function (response) {
                    self.processSpools(response);
                }).always(function () {
                    self.requestInProgress(false);
                });
            };
        
            self.saveSpool = function saveSpoolToBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toSpoolData();
        
                return self.loadedSpool.isNew() ? self.addSpool(data) : self.updateSpool(data);
            };
        
            self.addSpool = function addSpoolToBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toSpoolData();
        
                self.requestInProgress(true);
                api.spool.add(data).done(function () {
                    self.hideSpoolDialog();
                    self.requestSpools();
                }).fail(function () {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Could not add spool'),
                        text: gettext('There was an unexpected error while saving the filament spool, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                    self.requestInProgress(false);
                });
            };
        
            self.updateCallbacks = [];
        
            self.updateSpool = function updateSpoolInBackend() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.toSpoolData();
        
                self.requestInProgress(true);
                api.spool.update(data.id, data).done(function () {
                    self.hideSpoolDialog();
                    self.requestSpools();
                    self.updateCallbacks.forEach(function (callback) {
                        callback();
                    });
                }).fail(function () {
                    new PNotify({ // eslint-disable-line no-new
                        title: gettext('Could not update spool'),
                        text: gettext('There was an unexpected error while updating the filament spool, please consult the logs.'),
                        type: 'error',
                        hide: false
                    });
                    self.requestInProgress(false);
                });
            };
        
            self.removeSpool = function removeSpoolFromBackend(data) {
                var perform = function performSpoolRemoval() {
                    self.requestInProgress(true);
                    api.spool.delete(data.id).done(function () {
                        self.requestSpools();
                    }).fail(function () {
                        new PNotify({ // eslint-disable-line no-new
                            title: gettext('Could not delete spool'),
                            text: gettext('There was an unexpected error while removing the filament spool, please consult the logs.'),
                            type: 'error',
                            hide: false
                        });
                        self.requestInProgress(false);
                    });
                };
        
                showConfirmationDialog({
                    title: gettext('Delete spool?'),
                    message: gettext('You are about to delete the filament spool <strong>' + data.name + ' - ' + data.profile.material + ' (' + data.profile.vendor + ')</strong>.'),
                    proceed: gettext('Delete'),
                    onproceed: perform
                });
            };
        
            self.duplicateSpool = function duplicateAndAddSpoolToBackend(data) {
                var newData = data;
                newData.used = 0;
                self.addSpool(newData);
            };
        };
        /* global FilamentManager ko Node $ gettext PNotify Utils */
        
        FilamentManager.prototype.viewModels.warning = function insufficientFilamentWarningViewModel() {
            var self = this.viewModels.warning;
            var _core$bridge$allViewM = this.core.bridge.allViewModels,
                printerStateViewModel = _core$bridge$allViewM.printerStateViewModel,
                settingsViewModel = _core$bridge$allViewM.settingsViewModel;
            var selections = this.viewModels.selections;
        
        
            printerStateViewModel.filamentWithWeight = ko.observableArray([]);
        
            printerStateViewModel.formatFilamentWithWeight = function formatFilamentWithWeightInSidebar(filament) {
                if (!filament || !filament.length) return '-';
        
                var result = (filament.length / 1000).toFixed(2) + 'm';
        
                if (Object.prototype.hasOwnProperty.call(filament, 'weight') && filament.weight) {
                    result += ' / ' + filament.weight.toFixed(2) + 'g';
                }
        
                return result;
            };
        
            self.replaceFilamentView = function replaceFilamentViewInSidebar() {
                $('#state').find('.accordion-inner').contents().each(function (index, item) {
                    if (item.nodeType === Node.COMMENT_NODE) {
                        if (item.nodeValue === ' ko foreach: filament ') {
                            item.nodeValue = ' ko foreach: [] '; // eslint-disable-line no-param-reassign
                            var element = '<!-- ko foreach: filamentWithWeight --> <span data-bind="text: \'Filament (\' + name() + \'): \', title: \'Filament usage for \' + name()"></span><strong data-bind="text: $root.formatFilamentWithWeight(data())"></strong><br> <!-- /ko -->';
                            $(element).insertBefore(item);
                            return false; // exit loop
                        }
                    }
                    return true;
                });
            };
        
            var filename = void 0;
            var waitForFilamentData = false;
        
            var warning = null;
        
            var updateFilament = function updateFilamentWeightAndCheckRemainingFilament() {
                var calculateWeight = function calculateFilamentWeight(length, diameter, density) {
                    var radius = diameter / 2;
                    var volume = length * Math.PI * radius * radius / 1000;
                    return volume * density;
                };
        
                var showWarning = function showWarningIfRequiredFilamentExceedsRemaining(required, remaining) {
                    if (required < remaining) return false;
        
                    if (warning) {
                        // fade out notification if one is still shown
                        warning.options.delay = 1000;
                        warning.queueRemove();
                    }
        
                    warning = new PNotify({
                        title: gettext('Insufficient filament'),
                        text: gettext("The current print job needs more material than what's left on the selected spool."),
                        type: 'warning',
                        hide: false
                    });
        
                    return true;
                };
        
                var filament = printerStateViewModel.filament();
                var spoolData = selections.selectedSpools();
        
                var warningIsShown = false; // used to prevent a separate warning message for each tool
        
                for (var i = 0; i < filament.length; i += 1) {
                    var toolID = Utils.extractToolIDFromName(filament[i].name());
        
                    if (!spoolData[toolID]) {
                        filament[i].data().weight = 0;
                    } else {
                        var _filament$i$data = filament[i].data(),
                            length = _filament$i$data.length;
        
                        var _spoolData$toolID$pro = spoolData[toolID].profile,
                            diameter = _spoolData$toolID$pro.diameter,
                            density = _spoolData$toolID$pro.density;
        
        
                        var requiredFilament = calculateWeight(length, diameter, density);
                        var remainingFilament = spoolData[toolID].weight - spoolData[toolID].used;
        
                        filament[i].data().weight = requiredFilament;
        
                        if (!warningIsShown && settingsViewModel.settings.plugins.filamentmanager.enableWarning()) {
                            warningIsShown = showWarning(requiredFilament, remainingFilament);
                        }
                    }
                }
        
                filename = printerStateViewModel.filename();
                printerStateViewModel.filamentWithWeight(filament);
            };
        
            self.setSubscriptions = function subscribeToObservablesWhichTriggerAnUpdate() {
                selections.selectedSpools.subscribe(updateFilament);
        
                printerStateViewModel.filament.subscribe(function () {
                    // OctoPrint constantly updates the filament observable, to prevent invocing the warning message
                    // on every update we only call the updateFilament() method if the selected file has changed
                    if (filename !== printerStateViewModel.filename()) {
                        if (printerStateViewModel.filename() !== undefined && printerStateViewModel.filament().length < 1) {
                            // file selected, but no filament data found, probably because it's still in analysis queue
                            waitForFilamentData = true;
                        } else {
                            waitForFilamentData = false;
                            updateFilament();
                        }
                    } else if (waitForFilamentData && printerStateViewModel.filament().length > 0) {
                        waitForFilamentData = false;
                        updateFilament();
                    }
                });
            };
        };
        /* global FilamentManager OCTOPRINT_VIEWMODELS */
        
        (function registerViewModel() {
            var Plugin = new FilamentManager();
        
            OCTOPRINT_VIEWMODELS.push({
                construct: Plugin.viewModel,
                dependencies: Plugin.REQUIRED_VIEWMODELS,
                elements: Plugin.BINDINGS
            });
        })();
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin filamentmanager:", (error.stack || error));
    }
})();

// JS assets for plugin firmwareupdater
(function () {
    try {
        // source: plugin/firmwareupdater/js/firmwareupdater.js
        $(function() {
            function FirmwareUpdaterViewModel(parameters) {
                var self = this;
        
                self.settingsViewModel = parameters[0];
                self.loginState = parameters[1];
                self.connection = parameters[2];
                self.printerState = parameters[3];
        
                // General settings
                self.configFlashMethod = ko.observable();
                self.showAdvancedConfig = ko.observable(false);
                self.showAvrdudeConfig = ko.observable(false);
                self.showBossacConfig = ko.observable(false);
                self.showLpc1768Config = ko.observable(false);
                self.showPostflashConfig = ko.observable(false);
                self.configEnablePostflashDelay = ko.observable();
                self.configPostflashDelay = ko.observable();
                self.configEnablePostflashGcode = ko.observable();
                self.configPostflashGcode = ko.observable();
                self.configDisableBootloaderCheck = ko.observable();
                self.configEnablePreflashCommandline = ko.observable();
                self.configPreflashCommandline = ko.observable();
                self.configEnablePostflashCommandline = ko.observable();
                self.configPostflashCommandline = ko.observable();
        
                // Config settings for avrdude
                self.configAvrdudeMcu = ko.observable();
                self.configAvrdudePath = ko.observable();
                self.configAvrdudeConfigFile = ko.observable();
                self.configAvrdudeProgrammer = ko.observable();
                self.configAvrdudeBaudRate = ko.observable();
                self.configAvrdudeDisableVerification = ko.observable();
                self.configAvrdudeCommandLine = ko.observable();
                self.avrdudePathBroken = ko.observable(false);
                self.avrdudePathOk = ko.observable(false);
                self.avrdudePathText = ko.observable();
                self.avrdudePathHelpVisible = ko.computed(function() {
                    return self.avrdudePathBroken() || self.avrdudePathOk();
                });
        
                self.avrdudeConfPathBroken = ko.observable(false);
                self.avrdudeConfPathOk = ko.observable(false);
                self.avrdudeConfPathText = ko.observable();
                self.avrdudeConfPathHelpVisible = ko.computed(function() {
                    return self.avrdudeConfPathBroken() || self.avrdudeConfPathOk();
                });
        
                // Config settings for bossac
                self.configBossacPath = ko.observable();
                self.configBossacDisableVerification = ko.observable()
                self.configBossacCommandLine = ko.observable();
        
                self.bossacPathBroken = ko.observable(false);
                self.bossacPathOk = ko.observable(false);
                self.bossacPathText = ko.observable();
                self.bossacPathHelpVisible = ko.computed(function() {
                    return self.bossacPathBroken() || self.bossacPathOk();
                });
        
                // Config settings for lpc1768
                self.configLpc1768Path = ko.observable();
                self.configLpc1768ResetBeforeFlash = ko.observable();
        
                self.lpc1768PathBroken = ko.observable(false);
                self.lpc1768PathOk = ko.observable(false);
                self.lpc1768PathText = ko.observable();
                self.lpc1768PathHelpVisible = ko.computed(function() {
                    return self.lpc1768PathBroken() || self.lpc1768PathOk();
                });
        
                self.flashPort = ko.observable(undefined);
        
                self.firmwareFileName = ko.observable(undefined);
                self.firmwareFileURL = ko.observable(undefined);
        
                self.alertMessage = ko.observable("");
                self.alertType = ko.observable("alert-warning");
                self.showAlert = ko.observable(false);
                self.missingParamToFlash = ko.observable(false);
                self.progressBarText = ko.observable();
                self.isBusy = ko.observable(false);
                self.fileFlashButtonText = ko.observable("");
                self.urlFlashButtonText = ko.observable("");
        
                self.selectFilePath = undefined;
                self.configurationDialog = undefined;
        
                self.inSettingsDialog = false;
        
                self.connection.selectedPort.subscribe(function(value) {
                    if (value === undefined) return;
                    self.flashPort(value);
                });
        
                self.toggleAdvancedConfig = function(){
                    self.showAdvancedConfig(!self.showAdvancedConfig());
                }
        
                self.togglePostflashConfig = function(){
                    self.showPostflashConfig(!self.showPostflashConfig());
                }
        
                self.configFlashMethod.subscribe(function(value) {
                    if(value == 'avrdude') {
                        self.showAvrdudeConfig(true);
                        self.showBossacConfig(false);
                        self.showLpc1768Config(false);
                    } else if(value == 'bossac') {
                        self.showAvrdudeConfig(false);
                        self.showBossacConfig(true);
                        self.showLpc1768Config(false);
                    } else if(value == 'lpc1768'){
                        self.showAvrdudeConfig(false);
                        self.showBossacConfig(false);
                        self.showLpc1768Config(true);
                    } else {
                        self.showAvrdudeConfig(false);
                        self.showBossacConfig(false);
                        self.showLpc1768Config(false);
                    }
                 });
        
                 self.firmwareFileName.subscribe(function(value) {
                    if (!self.settingsViewModel.settings.plugins.firmwareupdater.disable_bootloadercheck()) {
                        if (self._checkForBootloader(value)) {
                            self.bootloaderWarningDialog.modal();
                        }
                    }
                 });
        
                self.onStartup = function() {
                    self.selectFilePath = $("#settings_firmwareupdater_selectFilePath");
                    self.configurationDialog = $("#settings_plugin_firmwareupdater_configurationdialog");
                    self.bootloaderWarningDialog = $("#BootLoaderWarning");
        
                    self.selectFilePath.fileupload({
                        dataType: "hex",
                        maxNumberOfFiles: 1,
                        autoUpload: false,
                        add: function(e, data) {
                            if (data.files.length === 0) {
                                return false;
                            }
                            self.hexData = data;
                            self.firmwareFileName(data.files[0].name);
                        }
                    });
                };
        
                self._checkIfReadyToFlash = function(source) {
                    var alert = undefined;
        
                    if (!self.loginState.isAdmin()){
                        alert = gettext("You need administrator privileges to flash firmware.");
                    }
        
                    if (self.printerState.isPrinting() || self.printerState.isPaused()){
                        alert = gettext("Printer is printing. Please wait for the print to be finished.");
                    }
        
                    if (!self.settingsViewModel.settings.plugins.firmwareupdater.flash_method()){
                        alert = gettext("The flash method is not selected.");
                    }
        
                    if (self.settingsViewModel.settings.plugins.firmwareupdater.flash_method() == "avrdude" && !self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_avrmcu()) {
                        alert = gettext("The AVR MCU type is not selected.");
                    }
        
                    if (self.settingsViewModel.settings.plugins.firmwareupdater.flash_method() == "avrdude" && !self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_path()) {
                        alert = gettext("The avrdude path is not configured.");
                    }
        
                    if (self.settingsViewModel.settings.plugins.firmwareupdater.flash_method() == "avrdude" && !self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_programmer()) {
                        alert = gettext("The AVR programmer is not selected.");
                    }
        
                    if (self.settingsViewModel.settings.plugins.firmwareupdater.flash_method() == "bossac" && !self.settingsViewModel.settings.plugins.firmwareupdater.bossac_path()) {
                        alert = gettext("The bossac path is not configured.");
                    }
        
                    if (self.settingsViewModel.settings.plugins.firmwareupdater.flash_method() == "lpc1768" && !self.settingsViewModel.settings.plugins.firmwareupdater.lpc1768_path()) {
                        alert = gettext("The lpc1768 firmware folder path is not configured.");
                    }
        
                    if (!self.flashPort()) {
                        alert = gettext("The printer port is not selected.");
                    }
        
                    if (source === "file" && !self.firmwareFileName()) {
                        alert = gettext("Firmware file is not specified");
                    } else if (source === "url" && !self.firmwareFileURL()) {
                        alert = gettext("Firmware URL is not specified");
                    }
        
                    if (alert !== undefined) {
                        self.alertType("alert-warning");
                        self.alertMessage(alert);
                        self.showAlert(true);
                        return false;
                    } else {
                        self.alertMessage(undefined);
                        self.showAlert(false);
                    }
        
                    return true;
                };
        
                self._checkForBootloader = function(filename) {
                    if (filename.search(/bootloader/i) > -1) {
                        return true;
                    } else {
                        return false;
                    }
                }
        
                self.returnTrue = function() {
                    return true;
                }
        
                self.returnFalse = function() {
                    return false;
                }
        
                self.startFlashFromFile = function() {
                    if (!self._checkIfReadyToFlash("file")) {
                        return;
                    }
        
                    self.progressBarText("Flashing firmware...");
                    self.isBusy(true);
                    self.showAlert(false);
        
                    self.hexData.formData = {
                        port: self.flashPort()
                    };
                    self.hexData.submit();
                };
        
                self.startFlashFromURL = function() {
                    if (!self._checkIfReadyToFlash("url")) {
                        return;
                    }
        
                    self.isBusy(true);
                    self.showAlert(false);
                    self.progressBarText("Flashing firmware...");
        
                    $.ajax({
                        url: PLUGIN_BASEURL + "firmwareupdater/flash",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            port: self.flashPort(),
                            url: self.firmwareFileURL()
                        }),
                        contentType: "application/json; charset=UTF-8"
                    })
                };
        
                self.onDataUpdaterPluginMessage = function(plugin, data) {
                    if (plugin !== "firmwareupdater") {
                        return;
                    }
        
                    var message;
        
                    if (data.type === "status") {
                        switch (data.status) {
                            case "flasherror": {
                                if (data.message) {
                                    message = gettext(data.message);
                                } else {
                                    message = gettext("Unknown error");
                                }
        
                                if (data.subtype) {
                                    switch (data.subtype) {
                                        case "busy": {
                                            message = gettext("Printer is busy.");
                                            break;
                                        }
                                        case "port": {
                                            message = gettext("Printer port is not available.");
                                            break;
                                        }
                                        case "method": {
                                            message = gettext("Flash method is not properly configured.");
                                            break;
                                        }
                                        case "hexfile": {
                                            message = gettext("Cannot read file to flash.");
                                            break;
                                        }
                                        case "already_flashing": {
                                            message = gettext("Already flashing.");
                                        }
                                    }
                                }
        
                                self.showPopup("error", gettext("Flashing failed"), message);
                                self.isBusy(false);
                                self.showAlert(false);
                                self.firmwareFileName("");
                                self.firmwareFileURL("");
                                break;
                            }
                            case "success": {
                                self.showPopup("success", gettext("Flashing successful"), "");
                                self.isBusy(false);
                                self.showAlert(false);
                                self.firmwareFileName("");
                                self.firmwareFileURL("");
                                break;
                            }
                            case "progress": {
                                if (data.subtype) {
                                    switch (data.subtype) {
                                        case "disconnecting": {
                                            message = gettext("Disconnecting printer...");
                                            break;
                                        }
                                        case "startingflash": {
                                            self.isBusy(true);
                                            message = gettext("Starting flash...");
                                            break;
                                        }
                                        case "waitforsd": {
                                            message = gettext("Waiting for SD card to mount on host...");
                                            break;
                                        }
                                        case "writing": {
                                            message = gettext("Writing memory...");
                                            break;
                                        }
                                        case "erasing": {
                                            message = gettext("Erasing memory...");
                                            break;
                                        }
                                        case "verifying": {
                                            message = gettext("Verifying memory...");
                                            break;
                                        }
                                        case "postflashdelay": {
                                            message = gettext("Post-flash delay...");
                                            break;
                                        }
                                        case "boardreset": {
                                                message = gettext("Resetting the board...");
                                                break;
                                        }
                                        case "reconnecting": {
                                            message = gettext("Reconnecting to printer...");
                                            break;
                                        }
                                    }
                                }
        
                                if (message) {
                                    self.progressBarText(message);
                                }
                                break;
                            }
                            case "info": {
                                self.alertType("alert-info");
                                self.alertMessage(data.status_description);
                                self.showAlert(true);
                                break;
                            }
                        }
                    }
                };
        
                self.showPluginConfig = function() {
                    // Load the general settings
                    self.configFlashMethod(self.settingsViewModel.settings.plugins.firmwareupdater.flash_method());
                    self.configPreflashCommandline(self.settingsViewModel.settings.plugins.firmwareupdater.preflash_commandline());
                    self.configPostflashCommandline(self.settingsViewModel.settings.plugins.firmwareupdater.postflash_commandline());
                    self.configPostflashDelay(self.settingsViewModel.settings.plugins.firmwareupdater.postflash_delay());
                    self.configPostflashGcode(self.settingsViewModel.settings.plugins.firmwareupdater.postflash_gcode());
        
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.enable_preflash_commandline() != 'false') {
                        self.configEnablePreflashCommandline(self.settingsViewModel.settings.plugins.firmwareupdater.enable_preflash_commandline());
                    }
        
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_commandline() != 'false') {
                        self.configEnablePostflashCommandline(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_commandline());
                    }
        
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_delay() != 'false') {
                        self.configEnablePostflashDelay(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_delay());
                    }
                    
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_gcode() != 'false') {
                        self.configEnablePostflashGcode(self.settingsViewModel.settings.plugins.firmwareupdater.enable_postflash_gcode());
                    }
                    
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.disable_bootloadercheck() != 'false') {
                        self.configDisableBootloaderCheck(self.settingsViewModel.settings.plugins.firmwareupdater.disable_bootloadercheck());
                    }
        
                    // Load the avrdude settings
                    self.configAvrdudePath(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_path());
                    self.configAvrdudeConfigFile(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_conf());
                    self.configAvrdudeMcu(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_avrmcu());
                    self.configAvrdudeProgrammer(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_programmer());
                    self.configAvrdudeBaudRate(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_baudrate());
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_disableverify() != 'false') {
                        self.configAvrdudeDisableVerification(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_disableverify());
                    }
                    self.configAvrdudeCommandLine(self.settingsViewModel.settings.plugins.firmwareupdater.avrdude_commandline());
        
                    // Load the bossac settings
                    self.configBossacPath(self.settingsViewModel.settings.plugins.firmwareupdater.bossac_path());
                    self.configBossacDisableVerification(self.settingsViewModel.settings.plugins.firmwareupdater.bossac_disableverify());
                    self.configBossacCommandLine(self.settingsViewModel.settings.plugins.firmwareupdater.bossac_commandline());
                    
                    // Load the lpc1768 settings
                    self.configLpc1768Path(self.settingsViewModel.settings.plugins.firmwareupdater.lpc1768_path());
                    if(self.settingsViewModel.settings.plugins.firmwareupdater.lpc1768_preflashreset() != 'false') {
                        self.configLpc1768ResetBeforeFlash(self.settingsViewModel.settings.plugins.firmwareupdater.lpc1768_preflashreset());
                    }
                    self.configurationDialog.modal();
                };
        
                self.onConfigClose = function() {
                    self._saveConfig();
        
                    self.configurationDialog.modal("hide");
                    self.alertMessage(undefined);
                    self.showAlert(false);
                };
        
                self._saveConfig = function() {
                    var data = {
                        plugins: {
                            firmwareupdater: {
                                flash_method: self.configFlashMethod(),
                                avrdude_path: self.configAvrdudePath(),
                                avrdude_conf: self.configAvrdudeConfigFile(),
                                avrdude_avrmcu: self.configAvrdudeMcu(),
                                avrdude_programmer: self.configAvrdudeProgrammer(),
                                avrdude_baudrate: self.configAvrdudeBaudRate(),
                                avrdude_disableverify: self.configAvrdudeDisableVerification(),
                                avrdude_commandline: self.configAvrdudeCommandLine(),
                                bossac_path: self.configBossacPath(),
                                bossac_disableverify: self.configBossacDisableVerification(),
                                bossac_commandline: self.configBossacCommandLine(),
                                lpc1768_path: self.configLpc1768Path(),
                                lpc1768_preflashreset: self.configLpc1768ResetBeforeFlash(),
                                enable_preflash_commandline: self.configEnablePreflashCommandline(),
                                preflash_commandline: self.configPreflashCommandline(),
                                enable_postflash_commandline: self.configEnablePostflashCommandline(),
                                postflash_commandline: self.configPostflashCommandline(),
                                postflash_delay: self.configPostflashDelay(),
                                postflash_gcode: self.configPostflashGcode(),
                                enable_postflash_delay: self.configEnablePostflashDelay(),
                                enable_postflash_gcode: self.configEnablePostflashGcode(),
                                disable_bootloadercheck: self.configDisableBootloaderCheck()
                            }
                        }
                    };
                    self.settingsViewModel.saveData(data);
                };
        
                self.onConfigHidden = function() {
                    self.avrdudePathBroken(false);
                    self.avrdudePathOk(false);
                    self.avrdudePathText("");
                    self.bossacPathBroken(false);
                    self.bossacPathOk(false);
                    self.bossacPathText("");
                };
        
                self.testAvrdudePath = function() {
                    var filePathRegEx = new RegExp("^(\/[^\0/]+)+$");
        
                    if (!filePathRegEx.test(self.configAvrdudePath())) {
                        self.avrdudePathText(gettext("The path is not valid"));
                        self.avrdudePathOk(false);
                        self.avrdudePathBroken(true);
                    } else {
                        $.ajax({
                            url: API_BASEURL + "util/test",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify({
                                command: "path",
                                path: self.configAvrdudePath(),
                                check_type: "file",
                                check_access: "x"
                            }),
                            contentType: "application/json; charset=UTF-8",
                            success: function(response) {
                                if (!response.result) {
                                    if (!response.exists) {
                                        self.avrdudePathText(gettext("The path doesn't exist"));
                                    } else if (!response.typeok) {
                                        self.avrdudePathText(gettext("The path is not a file"));
                                    } else if (!response.access) {
                                        self.avrdudePathText(gettext("The path is not an executable"));
                                    }
                                } else {
                                    self.avrdudePathText(gettext("The path is valid"));
                                }
                                self.avrdudePathOk(response.result);
                                self.avrdudePathBroken(!response.result);
                            }
                        })
                    }
                };
        
                self.resetAvrdudeCommandLine = function() {
                    self.configAvrdudeCommandLine("{avrdude} -v -q -p {mcu} -c {programmer} -P {port} -D -C {conffile} -b {baudrate} {disableverify} -U flash:w:{firmware}:i");
                };
        
                self.testBossacPath = function() {
                    var filePathRegEx = new RegExp("^(\/[^\0/]+)+$");
        
                    if (!filePathRegEx.test(self.configBossacPath())) {
                        self.bossacPathText(gettext("The path is not valid"));
                        self.bossacPathOk(false);
                        self.bossacPathBroken(true);
                    } else {
                        $.ajax({
                            url: API_BASEURL + "util/test",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify({
                                command: "path",
                                path: self.configBossacPath(),
                                check_type: "file",
                                check_access: "x"
                            }),
                            contentType: "application/json; charset=UTF-8",
                            success: function(response) {
                                if (!response.result) {
                                    if (!response.exists) {
                                        self.bossacPathText(gettext("The path doesn't exist"));
                                    } else if (!response.typeok) {
                                        self.bossacPathText(gettext("The path is not a file"));
                                    } else if (!response.access) {
                                        self.bossacPathText(gettext("The path is not an executable"));
                                    }
                                } else {
                                    self.bossacPathText(gettext("The path is valid"));
                                }
                                self.bossacPathOk(response.result);
                                self.bossacPathBroken(!response.result);
                            }
                        })
                    }
                };
        
                self.resetBossacCommandLine = function() {
                    self.configBossacCommandLine("{bossac} -i -p {port} -U true -e -w {disableverify} -b {firmware} -R");
                };
        
                self.testAvrdudeConf = function() {
                    $.ajax({
                        url: API_BASEURL + "util/test",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "path",
                            path: self.configAvrdudeConfigFile(),
                            check_type: "file",
                            check_access: "r"
                        }),
                        contentType: "application/json; charset=UTF-8",
                        success: function(response) {
                            if (!response.result) {
                                if (!response.exists) {
                                    self.avrdudeConfPathText(gettext("The path doesn't exist"));
                                } else if (!response.typeok) {
                                    self.avrdudeConfPathText(gettext("The path is not a file"));
                                } else if (!response.access) {
                                    self.avrdudeConfPathText(gettext("The path is not readable"));
                                }
                            } else {
                                self.avrdudeConfPathText(gettext("The path is valid"));
                            }
                            self.avrdudeConfPathOk(response.result);
                            self.avrdudeConfPathBroken(!response.result);
                        }
                    })
                };
        
                self.testLpc1768Path = function() {
                    $.ajax({
                        url: API_BASEURL + "util/test",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "path",
                            path: self.configLpc1768Path(),
                            check_type: "path",
                            check_access: ["r", "w"],
                            check_writable_dir: "true"
                        }),
                        contentType: "application/json; charset=UTF-8",
                        success: function(response) {
                            if (!response.result) {
                                if (!response.exists) {
                                    self.lpc1768PathText(gettext("The path doesn't exist"));
                                } else if (!response.typeok) {
                                    self.lpc1768PathText(gettext("The path is not a folder"));
                                } else if (!response.access) {
                                    self.lpc1768PathText(gettext("The path is not writeable"));
                                }
                            } else {
                                self.lpc1768PathText(gettext("The path is valid"));
                            }
                            self.lpc1768PathOk(response.result);
                            self.lpc1768PathBroken(!response.result);
                        }
                    })
                };
        
                self.onSettingsShown = function() {
                    self.inSettingsDialog = true;
                };
        
                self.onSettingsHidden = function() {
                    self.inSettingsDialog = false;
                    self.showAlert(false);
                };
        
                // Popup Messages
        
                self.showPopup = function(message_type, title, text){
                    if (self.popup !== undefined){
                        self.closePopup();
                    }
                    self.popup = new PNotify({
                        title: gettext(title),
                        text: text,
                        type: message_type,
                        hide: false
                    });
                };
        
                self.closePopup = function() {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                };
            }
        
            OCTOPRINT_VIEWMODELS.push([
                FirmwareUpdaterViewModel,
                ["settingsViewModel", "loginStateViewModel", "connectionViewModel", "printerStateViewModel"],
                [document.getElementById("settings_plugin_firmwareupdater")]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin firmwareupdater:", (error.stack || error));
    }
})();

// JS assets for plugin fullscreen
(function () {
    try {
        // source: plugin/fullscreen/js/fullscreen.js
        /*
         * View model for OctoPrint-Fullscreen
         *
         * Based on: NavbarTemp credits to Jarek Szczepanski
         * (Other stuff) Author: Paul de Vries
         * License: AGPLv3
         */
        $(function() {
        	function FullscreenViewModel(parameters) {
        		var self = this;
        		var $container, $fullscreenContainer;
        		var $webcam = $('#webcam_image');
        		var $info = $('#fullscreen-bar');
        		var $body = $('body');
        		
        		if($(".webcam_fixed_ratio").length > 0) {
        			$container = $('.webcam_fixed_ratio');
        			$fullscreenContainer = $("#webcam_rotator");
        		} else {
        			$container = $('#webcam_rotator');
        			$fullscreenContainer = $("#webcam_container");
        		}
        		
        		self.tempModel = parameters[0];
        		self.printer = parameters[2];
        		self.settings = parameters[1];
        		
        		self.printer.isFullscreen = ko.observable(false);
        		self.printer.fullscreen = function() {
        			$fullscreenContainer.toggleFullScreen();
        		}
        		
        		self.formatBarTemperatureFullscreen = function(toolName, actual, target) {
        			var output = toolName + ": " + _.sprintf("%.1f&deg;C", actual);
        
        			if (target) {
        				var sign = (target >= actual) ? " \u21D7 " : " \u21D8 ";
        				output += sign + _.sprintf("%.1f&deg;C", target);
        			}
        
        			return output;
        		};
        
        
        		var touchtime = 0;
        		$webcam.on("click", function() {
        			if (touchtime == 0) {
        				touchtime = new Date().getTime();
        			} else {
        				if (((new Date().getTime()) - touchtime) < 800) {
        					$body.toggleClass('inlineFullscreen');
        					$container.toggleClass("inline fullscreen");
        					
        					if(self.printer.isFullscreen()) {
        						$fullscreenContainer.toggleFullScreen();
        					}
        					touchtime = 0;
        				} else {
        					touchtime = new Date().getTime();
        				}
        			}
        		});
        		
        		$(document).bind("fullscreenchange", function() {
        			if (!$(document).fullScreen()) {
        				self.printer.isFullscreen(false);
        			} else {
        				self.printer.isFullscreen(true);
        			}
        		});
        		
        		$info.insertAfter($container);
        		$("#job_pause").clone().appendTo(".user-buttons");
        		
        		ko.applyBindings(self.printer, document.getElementById("fullscreen-cancel"))
        	}
        
        	OCTOPRINT_VIEWMODELS.push([
        		FullscreenViewModel,
        		["temperatureViewModel", "settingsViewModel", "printerStateViewModel"],
        		["#fullscreen-info"]
        	]);
        });
        
        ;
        
        // source: plugin/fullscreen/js/jquery-fullscreen.js
        /**
         * @preserve jquery.fullscreen 1.1.5
         * https://github.com/kayahr/jquery-fullscreen-plugin
         * Copyright (C) 2012-2013 Klaus Reimer <k@ailis.de>
         * Licensed under the MIT license
         * (See http://www.opensource.org/licenses/mit-license)
         */
         
        (function(jQuery) {
        
        /**
         * Sets or gets the fullscreen state.
         * 
         * @param {boolean=} state
         *            True to enable fullscreen mode, false to disable it. If not
         *            specified then the current fullscreen state is returned.
         * @return {boolean|Element|jQuery|null}
         *            When querying the fullscreen state then the current fullscreen
         *            element (or true if browser doesn't support it) is returned
         *            when browser is currently in full screen mode. False is returned
         *            if browser is not in full screen mode. Null is returned if 
         *            browser doesn't support fullscreen mode at all. When setting 
         *            the fullscreen state then the current jQuery selection is 
         *            returned for chaining.
         * @this {jQuery}
         */
        function fullScreen(state)
        {
            var e, func, doc;
            
            // Do nothing when nothing was selected
            if (!this.length) return this;
            
            // We only use the first selected element because it doesn't make sense
            // to fullscreen multiple elements.
            e = (/** @type {Element} */ this[0]);
            
            // Find the real element and the document (Depends on whether the
            // document itself or a HTML element was selected)
            if (e.ownerDocument)
            {
                doc = e.ownerDocument;
            }
            else
            {
                doc = e;
                e = doc.documentElement;
            }
            
            // When no state was specified then return the current state.
            if (state == null)
            {
                // When fullscreen mode is not supported then return null
                if (!((/** @type {?Function} */ doc["exitFullscreen"])
                    || (/** @type {?Function} */ doc["webkitExitFullscreen"])
                    || (/** @type {?Function} */ doc["webkitCancelFullScreen"])
                    || (/** @type {?Function} */ doc["msExitFullscreen"])
                    || (/** @type {?Function} */ doc["mozCancelFullScreen"])))
                {
                    return null;
                }
                
                // Check fullscreen state
                state = !!doc["fullscreenElement"]
                    || !!doc["msFullscreenElement"]
                    || !!doc["webkitIsFullScreen"]
                    || !!doc["mozFullScreen"];
                if (!state) return state;
                
                // Return current fullscreen element or "true" if browser doesn't
                // support this
                return (/** @type {?Element} */ doc["fullscreenElement"])
                    || (/** @type {?Element} */ doc["webkitFullscreenElement"])
                    || (/** @type {?Element} */ doc["webkitCurrentFullScreenElement"])
                    || (/** @type {?Element} */ doc["msFullscreenElement"])
                    || (/** @type {?Element} */ doc["mozFullScreenElement"])
                    || state;
            }
            
            // When state was specified then enter or exit fullscreen mode.
            if (state)
            {
                // Enter fullscreen
                func = (/** @type {?Function} */ e["requestFullscreen"])
                    || (/** @type {?Function} */ e["webkitRequestFullscreen"])
                    || (/** @type {?Function} */ e["webkitRequestFullScreen"])
                    || (/** @type {?Function} */ e["msRequestFullscreen"])
                    || (/** @type {?Function} */ e["mozRequestFullScreen"]);
                if (func) 
                {
                    func.call(e);
                }
                return this;
            }
            else
            {
                // Exit fullscreen
                func = (/** @type {?Function} */ doc["exitFullscreen"])
                    || (/** @type {?Function} */ doc["webkitExitFullscreen"])
                    || (/** @type {?Function} */ doc["webkitCancelFullScreen"])
                    || (/** @type {?Function} */ doc["msExitFullscreen"])
                    || (/** @type {?Function} */ doc["mozCancelFullScreen"]);
                if (func) func.call(doc);
                return this;
            }
        }
        
        /**
         * Toggles the fullscreen mode.
         * 
         * @return {!jQuery}
         *            The jQuery selection for chaining.
         * @this {jQuery}
         */
        function toggleFullScreen()
        {
            return (/** @type {!jQuery} */ fullScreen.call(this, 
                !fullScreen.call(this)));
        }
        
        /**
         * Handles the browser-specific fullscreenchange event and triggers
         * a jquery event for it.
         *
         * @param {?Event} event
         *            The fullscreenchange event.
         */
        function fullScreenChangeHandler(event)
        {
            jQuery(document).trigger(new jQuery.Event("fullscreenchange"));
        }
        
        /**
         * Handles the browser-specific fullscreenerror event and triggers
         * a jquery event for it.
         *
         * @param {?Event} event
         *            The fullscreenerror event.
         */
        function fullScreenErrorHandler(event)
        {
            jQuery(document).trigger(new jQuery.Event("fullscreenerror"));
        }
        
        /**
         * Installs the fullscreenchange event handler.
         */
        function installFullScreenHandlers()
        {
            var e, change, error;
            
            // Determine event name
            e = document;
            if (e["webkitCancelFullScreen"])
            {
                change = "webkitfullscreenchange";
                error = "webkitfullscreenerror";
            }
            else if (e["msExitFullscreen"])
            {
                change = "MSFullscreenChange";
                error = "MSFullscreenError";
            }
            else if (e["mozCancelFullScreen"])
            {
                change = "mozfullscreenchange";
                error = "mozfullscreenerror";
            }
            else 
            {
                change = "fullscreenchange";
                error = "fullscreenerror";
            }
        
            // Install the event handlers
            jQuery(document).bind(change, fullScreenChangeHandler);
            jQuery(document).bind(error, fullScreenErrorHandler);
        }
        
        jQuery.fn["fullScreen"] = fullScreen;
        jQuery.fn["toggleFullScreen"] = toggleFullScreen;
        installFullScreenHandlers();
        
        })(jQuery);
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin fullscreen:", (error.stack || error));
    }
})();

// JS assets for plugin marlin_flasher
(function () {
    try {
        // source: plugin/marlin_flasher/js/marlin_flasher.js
        $(function() {
            function MarlinFlasherViewModel(parameters) {
                var self = this;
                self.settingsViewModel = parameters[0];
                self.loginStateViewModel = parameters[1];
                self.sketchFileButton = $("#sketch_file");
                self.flashButton = $("#flash-button");
                self.searchCoreButton = $("#search-core-btn");
                self.searchLibButton = $("#search-lib-btn");
                self.stderrModal = $("#marlin_flasher_modal");
        
                self.coreSearchResult = ko.observableArray();
                self.libSearchResult = ko.observableArray();
                self.boardList = ko.observableArray();
                self.selectedBoard = ko.observable();
                self.boardOptions = ko.observableArray();
                self.stderr = ko.observable();
                self.uploadProgress = ko.observable(0);
                self.flashingProgress = ko.observable(0);
                self.progressStep = ko.observable();
        
                self.sketchFileButton.fileupload({
                    maxNumberOfFiles: 1,
                    headers: OctoPrint.getRequestHeaders(),
                    done: function(e, data) {
                        new PNotify({
                            title: gettext("Sketch upload successful"),
                            text: data.result.file,
                            type: "success"
                        });
                        self.uploadProgress(0);
                    },
                    error: function(jqXHR, status, error) {
                        if(error === "") {
                            new PNotify({
                                title: gettext("Sketch upload failed"),
                                text: gettext("Check the maximum sketch size"),
                                type: "error"
                            });
                        } else {
                            new PNotify({
                                title: gettext("Sketch upload failed"),
                                text: jqXHR.responseJSON.message,
                                type: "error"
                            });
                        };
                        self.uploadProgress(0);
                    },
                    progress: function(e, data) {
                        self.uploadProgress((data.loaded / data.total) * 100);
                    }
                });
                self.searchCore = function(form) {
                    self.searchCoreButton.button("loading");
                    $.ajax({
                        type: "GET",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/cores/search",
                        data: $(form).serialize()
                    }).done(function (data) {
                        if(data.hasOwnProperty("Platforms")) {
                            self.coreSearchResult(data.Platforms);
                        } else {
                            self.coreSearchResult([]);
                        }
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Core search failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        self.searchCoreButton.button("reset");
                    });
                };
                self.installCore = function(data, event) {
                    $(event.currentTarget).button("loading");
                    $.ajax({
                        type: "POST",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/cores/install",
                        data: {
                            core: data.ID
                        }
                    }).done(function(data) {
                        self.loadBoardList();
                        new PNotify({
                            title: gettext("Core install successful"),
                            text: gettext("Successfully installed {core}").replace("{core}", data.core),
                            type: "success"
                        });
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Core install failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        $(event.currentTarget).button("reset");
                    });
                };
                self.uninstallCore = function(data, event) {
                    $(event.currentTarget).button("loading");
                    $.ajax({
                        type: "POST",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/cores/uninstall",
                        data: {
                            core: data.ID
                        }
                    }).done(function(data) {
                        self.loadBoardList();
                        new PNotify({
                            title: gettext("Core uninstall successful"),
                            text: gettext("Successfully uninstalled {core}").replace("{core}", data.core),
                            type: "success"
                        });
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Core uninstall failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        $(event.currentTarget).button("reset");
                    });
                };
                self.searchLib = function(form) {
                    self.searchLibButton.button("loading");
                    $.ajax({
                        type: "GET",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/libs/search",
                        data: $(form).serialize()
                    }).done(function (data) {
                        if(data.hasOwnProperty("libraries")) {
                            self.libSearchResult(data.libraries);
                        } else {
                            self.libSearchResult([]);
                        }
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Lib search failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        self.searchLibButton.button("reset");
                    });
                };
                self.installLib = function(data, event) {
                    $(event.currentTarget).button("loading");
                    $.ajax({
                        type: "POST",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/libs/install",
                        data: {
                            lib: data.Name
                        }
                    }).done(function(data) {
                        new PNotify({
                            title: gettext("Lib install successful"),
                            text: gettext("Successfully installed {lib}").replace("{lib}", data.lib),
                            type: "success"
                        });
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Lib install failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        $(event.currentTarget).button("reset");
                    });
                };
                self.uninstallLib =  function(data, event) {
                    $(event.currentTarget).button("loading");
                    $.ajax({
                        type: "POST",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/libs/uninstall",
                        data: {
                            lib: data.Name
                        }
                    }).done(function(data) {
                        new PNotify({
                            title: gettext("Lib uninstall successful"),
                            text: gettext("Successfully uninstalled {lib}").replace("{lib}", data.lib),
                            type: "success"
                        });
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Lib uninstall failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    }).always(function() {
                        $(event.currentTarget).button("reset");
                    });
                };
                self.loadBoardList = function() {
                    $.ajax({
                        type: "GET",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/board/listall",
                    }).done(function (data) {
                        if(data.boards) {
                            self.boardList(data.boards);
                        } else {
                            self.boardList([]);
                        }
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Board list fetch failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                    });
                };
                self.flash = function(form) {
                    self.flashButton.button("loading");
                    $.ajax({
                        type: "POST",
                        headers: OctoPrint.getRequestHeaders(),
                        url: "/plugin/marlin_flasher/flash",
                        data: $(form).serialize()
                    }).done(function (data) {
                        new PNotify({
                            title: gettext("Flashing successful"),
                            text: data.message,
                            type: "success"
                        });
                    }).fail(function(jqXHR, status, error) {
                        new PNotify({
                            title: gettext("Flashing failed"),
                            text: jqXHR.responseJSON.message,
                            type: "error"
                        });
                        self.progressStep(null);
                        self.flashingProgress(0);
                        if(jqXHR.responseJSON.stderr) {
                            self.stderr(jqXHR.responseJSON.stderr);
                            self.stderrModal.modal("show");
                        } else {
                            self.stderr(null);
                        }
                    }).always(function() {
                        self.flashButton.button("reset");
                    });
                };
                self.selectedBoard.subscribe(function(newValue) {
                    self.boardOptions([]);
                    if (newValue) {
                        $.ajax({
                            type: "GET",
                            headers: OctoPrint.getRequestHeaders(),
                            url: "/plugin/marlin_flasher/board/details",
                            data: {
                                fqbn: newValue
                            }
                        }).done(function (data) {
                            if(data) {
                                self.boardOptions(data.ConfigOptions);
                            }
                        }).fail(function(jqXHR, status, error) {
                            new PNotify({
                                title: gettext("Board option fetch failed"),
                                text: jqXHR.responseJSON.message,
                                type: "error"
                            });
                        });
                    }
                });
                self.onAllBound = function(viewModels) {
                    if(self.loginStateViewModel.isAdmin()) {
                        self.loadBoardList();
                    }
                };
                self.onDataUpdaterPluginMessage = function(plugin, message) {
                    if(plugin == "marlin_flasher") {
                        self.progressStep(message.step);
                        self.flashingProgress(message.progress);
                    }
                };
            }
        
            OCTOPRINT_VIEWMODELS.push({
                construct: MarlinFlasherViewModel,
                dependencies: [
                    "settingsViewModel",
                    "loginStateViewModel"
                ],
                elements: [
                    "#settings_plugin_marlin_flasher",
                    "#wizard_plugin_marlin_flasher",
                    "#tab_plugin_marlin_flasher",
                    "#marlin_flasher_modal"
                ]
            });
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin marlin_flasher:", (error.stack || error));
    }
})();

// JS assets for plugin mqtt
(function () {
    try {
        // source: plugin/mqtt/js/mqtt.js
        $(function() {
            function MQTTViewModel(parameters) {
                
                var self = this;
        
                self.global_settings = parameters[0];
        
                self.showUserCredentials = ko.observable(false);
                self.showSsl = ko.observable(false);
        
                self.settings = undefined;
                self.availableProtocols = ko.observableArray(['MQTTv31','MQTTv311']);
              
                self.onBeforeBinding = function () {
                    self.settings = self.global_settings.settings.plugins.mqtt;
        
                    // show credential options if username is set
                    self.showUserCredentials(!!self.settings.broker.username());
        
                    // show SSL/TLS config options if any of the corresponding settings are set
                    self.showSsl(!!self.settings.broker.tls && !!self.settings.broker.tls.cacerts && !!self.settings.broker.tls.cacerts())
                };
            }
        
            ADDITIONAL_VIEWMODELS.push([
                MQTTViewModel,
                ["settingsViewModel"],
                ["#settings_plugin_mqtt"]
            ]);
        });
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin mqtt:", (error.stack || error));
    }
})();

// JS assets for plugin navbartemp
(function () {
    try {
        // source: plugin/navbartemp/js/navbartemp.js
        $(function() {
            function NavbarTempViewModel(parameters) {
                var self = this;
        
                self.temperatureModel = parameters[0];
                self.global_settings = parameters[1];
                self.socTemp = ko.observable(null);
                /* 
                 * raspi and awinner should be combined into something like hasSoc in the python
                 * source, there's no need for this part to know or care what the sbc is made of
                 * 
                 */
                self.isSupported = ko.observable(false);
                //hassoc should be taken care of in the python source before it gets this far
                self.hasSoc = ko.pureComputed(function() {
                    return self.isSupported;
                });
                
                self.onBeforeBinding = function () {
                    self.settings = self.global_settings.settings.plugins.navbartemp;
                };
        
                self.formatBarTemperature = function(toolName, actual, target) {
                    var output = toolName + ": " + _.sprintf("%.1f&deg;C", actual);
                
                    if (target) {
                        var sign = (target >= actual) ? " \u21D7 " : " \u21D8 ";
                        output += sign + _.sprintf("%.1f&deg;C", target);
                    }
                
                    return output;
                };
                
                self.onDataUpdaterPluginMessage = function(plugin, data) {
                    if (plugin != "navbartemp") {
                        return;
                    }
                    else {
                        self.isSupported(data.isSupported);
                        self.socTemp(_.sprintf("SoC: %.1f&deg;C", data.soctemp));
                    }
                };
            }
        
            OCTOPRINT_VIEWMODELS.push({
                construct: NavbarTempViewModel, 
                dependencies: ["temperatureViewModel", "settingsViewModel"],
                elements: ["#navbar_plugin_navbartemp", "#settings_plugin_navbartemp",]
            });
        });
        
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin navbartemp:", (error.stack || error));
    }
})();

// JS assets for plugin psucontrol
(function () {
    try {
        // source: plugin/psucontrol/js/psucontrol.js
        $(function() {
            function PSUControlViewModel(parameters) {
                var self = this;
        
                self.settingsViewModel = parameters[0]
                self.loginState = parameters[1];
                self.settings = undefined;
                self.hasGPIO = ko.observable(undefined);
                self.isPSUOn = ko.observable(undefined);
                self.psu_indicator = $("#psucontrol_indicator");
        
                self.onBeforeBinding = function() {
                    self.settings = self.settingsViewModel.settings;
                };
        
                self.onStartup = function () {
                    self.isPSUOn.subscribe(function() {
                        if (self.isPSUOn()) {
                            self.psu_indicator.removeClass("off").addClass("on");
                        } else {
                            self.psu_indicator.removeClass("on").addClass("off");
                        }   
                    });
                    
                    $.ajax({
                        url: API_BASEURL + "plugin/psucontrol",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "getPSUState"
                        }),
                        contentType: "application/json; charset=UTF-8"
                    }).done(function(data) {
                        self.isPSUOn(data.isPSUOn);
                    });
                }
        
                self.onDataUpdaterPluginMessage = function(plugin, data) {
                    if (plugin != "psucontrol") {
                        return;
                    }
        
                    self.hasGPIO(data.hasGPIO);
                    self.isPSUOn(data.isPSUOn);
                };
        
                self.togglePSU = function() {
                    if (self.isPSUOn()) {
                        if (self.settings.plugins.psucontrol.enablePowerOffWarningDialog()) {
                            showConfirmationDialog({
                                message: "You are about to turn off the PSU.",
                                onproceed: function() {
                                    self.turnPSUOff();
                                }
                            });
                        } else {
                            self.turnPSUOff();
                        }
                    } else {
                        self.turnPSUOn();
                    }
                };
        
                self.turnPSUOn = function() {
                    $.ajax({
                        url: API_BASEURL + "plugin/psucontrol",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "turnPSUOn"
                        }),
                        contentType: "application/json; charset=UTF-8"
                    })
                };
        
            	self.turnPSUOff = function() {
                    $.ajax({
                        url: API_BASEURL + "plugin/psucontrol",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "turnPSUOff"
                        }),
                        contentType: "application/json; charset=UTF-8"
                    })
                };   
            }
        
            ADDITIONAL_VIEWMODELS.push([
                PSUControlViewModel,
                ["settingsViewModel", "loginStateViewModel"],
                ["#navbar_plugin_psucontrol", "#settings_plugin_psucontrol"]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin psucontrol:", (error.stack || error));
    }
})();

// JS assets for plugin requestspinner
(function () {
    try {
        // source: plugin/requestspinner/js/requestspinner.js
        $(function() {
            var requestSpinner = $("#requestspinner");
            if (requestSpinner.length > 0) {
                $(document).ajaxStart(function() {
                    log.debug("Requests started...");
                    requestSpinner.show("slow");
                });
                $(document).ajaxStop(function() {
                    log.debug("Requests done");
                    requestSpinner.hide("slow");
                });
            }
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin requestspinner:", (error.stack || error));
    }
})();

// JS assets for plugin simpleemergencystop
(function () {
    try {
        // source: plugin/simpleemergencystop/js/simpleemergencystop.js
        /*
         * View model for OctoPrint-Simpleemergencystop
         *
         * Author: Sebastien Clement
         * License: AGPLv3
         */
        $(function() {
            function SimpleemergencystopViewModel(parameters) {
                var self = this;
                self.settings = undefined;
                self.allSettings = parameters[0];
                self.loginState = parameters[1];
                self.printerState = parameters[2];
                self.confirmation = undefined;
        
                self.onAfterBinding = function() {
                    self.confirmation = $("#confirmation");
                    self.settings = self.allSettings.settings.plugins.simpleemergencystop;
                };
        
                self.click = function () {
                    if(self.settings.confirmationDialog())
                        self.confirmation.modal("show");
                    else
                        self.sendCommand()
        
                };
        
                self.sendCommand = function () {
                    $.ajax({
                         url: API_BASEURL+"plugin/simpleemergencystop",
                         type: "POST",
                         dataType: "json",
                         data: JSON.stringify({
                             command: "emergencyStop"
                         }),
                         contentType: "application/json; charset=UTF-8",
                         success: function (data,status) {
        
                         }
                    });
                    self.confirmation.modal("hide");
        
                };
        
                self.visibleTest = function () {
                    return  self.loginState.isUser() && self.printerState.isOperational()
                };
        
        
            }
        
            // view model class, parameters for constructor, container to bind to
            OCTOPRINT_VIEWMODELS.push([
                SimpleemergencystopViewModel,
        
                ["settingsViewModel","loginStateViewModel","printerStateViewModel"],
        
                ["#navbar_plugin_simpleemergencystop"]
            ]);
        });
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin simpleemergencystop:", (error.stack || error));
    }
})();

// JS assets for plugin stats
(function () {
    try {
        // source: plugin/stats/js/stats.js
        $(function() {
            var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
        
            function StatsViewModel(parameters) {
                var self = this;
                self.loginState = parameters[0];
                self.settings = parameters[1];
        
                self.tabVisible = false;
        
                self.pollingEnabled = false;
                self.pollingTimeoutId = undefined;
        
                window.statFull = undefined;
                window.statHourly = undefined;
                window.statPrint = undefined;
                window.statdkWh = undefined;
                window.statmkWh = undefined;
        
                self.onAfterTabChange = function(current, previous) {
                    if (current != "#tab_plugin_stats") {
                        self.tabVisible = false;
                        return;
                    }
                    self.tabVisible = true;
        
                    self.requestData();
                };
        
                self.renderCharts = function () {
        
                }
        
                self.fromResponse = function (response) {
                    // Full Stats
                    self.setFullChart(response.fullDataset);
                    // Hour Stats
                    self.setHourChart(response.hourDataset);
                    // Day Stats
                    self.setPrintChart(response.printDataset);
                    // Day kWh
                    self.setDaykWhChart(response.dkwhDataset);
                    // Month kWh
                    self.setMonthkWhChart(response.mkwhDataset);
        
                    if (self.pollingEnabled) {
                        self.pollingTimeoutId = setTimeout(function() {
                            self.requestData();
                        }, 30000)
                    }
                };
        
                self.requestData = function () {
                    if (self.pollingTimeoutId != undefined) {
                        clearTimeout(self.pollingTimeoutId);
                        self.pollingTimeoutId = undefined;
                    }
        
                    $.ajax({
                        url: API_BASEURL + "plugin/stats",
                        type: "GET",
                        dataType: "json",
                        success: self.fromResponse
                    });
                };
        
                self.onDataUpdaterPluginMessage = function(plugin, message) {
                    if (plugin != 'stats')
                        return;
        
                    self.fullDataset = message.fullDataset;
                    self.hourDataset = message.hourDataset;
                    self.printDataset = message.printDataset;
                    self.dkwhDataset = message.dkwhDataset;
                    self.mkwhDataset = message.mkwhDataset;
                    self.setFullChart(self.fullDataset);
                    self.setHourChart(self.hourDataset);
                    self.setPrintChart(self.printDataset);
                    self.setDaykWhChart(self.dkwhDataset);
                    self.setMonthkWhChart(self.mkwhDataset);
                };
        
                self.setFullChart = function(ds) {
                    if (ds == undefined)
                        return;
        
                    self.statfull = {
                      labels : ds.month,
                      datasets : [//Connections
                        {
                          fillColor : "rgba(46,204,113,0.5)",
                          strokeColor : "rgba(46,204,113,0.8)",
                          highlightFill: "rgba(46,204,113,0.75)",
                          highlightStroke: "rgba(46,204,113,1)",
                          data : ds.connected,
                          label : "Connection"
                        },// Uploads
                        {
                          fillColor : "rgba(52,152,219,0.5)",
                          strokeColor : "rgba(52,152,219,0.8)",
                          highlightFill: "rgba(52,152,219,0.75)",
                          highlightStroke: "rgba(52,152,219,1)",
                          data : ds.upload,
                          label : "Upload"
                        },// Prints
                        {
                          fillColor : "rgba(41,128,185,0.5)",
                          strokeColor : "rgba(41,128,185,0.8)",
                          highlightFill: "rgba(41,128,185,0.75)",
                          highlightStroke: "rgba(41,128,185,1)",
                          data : ds.print_started,
                          label : "Print"
                        },// Dones
                        {
                          fillColor : "rgba(26,188,156,0.5)",
                          strokeColor : "rgba(26,188,156,0.8)",
                          highlightFill: "rgba(26,188,156,0.75)",
                          highlightStroke: "rgba(26,188,156,1)",
                          data : ds.print_done,
                          label : "Print complete"
                        },// Failed
                        {
                          fillColor : "rgba(231,76,60,0.5)",
                          strokeColor : "rgba(231,76,60,0.8)",
                          highlightFill: "rgba(231,76,60,0.75)",
                          highlightStroke: "rgba(231,76,60,1)",
                          data : ds.print_failed,
                          label : "Print failed"
                        },// Cancelled
                        {
                          fillColor : "rgba(189,195,199,0.5)",
                          strokeColor : "rgba(189,195,199,0.8)",
                          highlightFill: "rgba(189,195,199,0.75)",
                          highlightStroke: "rgba(189,195,199,1)",
                          data : ds.print_cancelled,
                          label : "Print cancelled"
                        },// Error
                        {
                          fillColor : "rgba(241,196,15,0.5)",
                          strokeColor : "rgba(241,196,15,0.8)",
                          highlightFill: "rgba(241,196,15,0.75)",
                          highlightStroke: "rgba(241,196,15,1)",
                          data : ds.error,
                          label : "Error"
                        }
                      ]
                    }
        
                    if (self.tabVisible == true) {
                        var ctx = document.getElementById("canvas_fullstat").getContext("2d");
                        if (window.statFull != undefined)
                            window.statFull.clear();
        
                        window.statFull = new Chart(ctx).Bar(self.statfull, {
                          responsive : true,
                          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                        });
        
                        document.getElementById("legend_full").innerHTML = window.statFull.generateLegend();
                    }
                };
        
                self.setHourChart = function(ds) {
                    if (ds == undefined)
                        return;
        
                    self.stathour = {
                      labels : ds.hour,
                      datasets : [//Connections
                        {
                          fillColor : "rgba(46,204,113,0.5)",
                          strokeColor : "rgba(46,204,113,0.8)",
                          pointColor: "rgba(46,204,113,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(46,204,113,1)",
                          data : ds.connected,
                          label : "Connection"
                        },// Uploads
                        {
                          fillColor : "rgba(52,152,219,0.5)",
                          strokeColor : "rgba(52,152,219,0.8)",
                          pointColor: "rgba(52,152,219,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(52,152,219,1)",
                          data : ds.upload,
                          label : "Upload"
                        },// Prints
                        {
                          fillColor : "rgba(41,128,185,0.5)",
                          strokeColor : "rgba(41,128,185,0.8)",
                          pointColor: "rgba(41,128,185,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(41,128,185,1)",
                          data : ds.print_started,
                          label : "Print"
                        },// Dones
                        {
                          fillColor : "rgba(26,188,156,0.5)",
                          strokeColor : "rgba(26,188,156,0.8)",
                          pointColor: "rgba(26,188,156,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(26,188,156,1)",
                          data : ds.print_done,
                          label : "Print complete"
                        },// Failed
                        {
                          fillColor : "rgba(231,76,60,0.5)",
                          strokeColor : "rgba(231,76,60,0.8)",
                          pointColor: "rgba(231,76,60,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(231,76,60,1)",
                          data : ds.print_failed,
                          label : "Print failed"
                        },// Cancelled
                        {
                          fillColor : "rgba(189,195,199,0.5)",
                          strokeColor : "rgba(189,195,199,0.8)",
                          pointColor: "rgba(189,195,199,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(189,195,199,1)",
                          data : ds.print_cancelled,
                          label : "Print cancelled"
                        },// Error
                        {
                          fillColor : "rgba(241,196,15,0.5)",
                          strokeColor : "rgba(241,196,15,0.8)",
                          pointColor: "rgba(241,196,15,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(241,196,15,1)",
                          data : ds.error,
                          label : "Error"
                        }
                      ]
                    }
        
                    if (self.tabVisible == true) {
                        var ctx = document.getElementById("canvas_hourlystat").getContext("2d");
                        if (window.statHourly != undefined)
                            window.statHourly.clear();
        
                        window.statHourly = new Chart(ctx).Radar(self.stathour, {
                          responsive : true,
                          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                        });
        
                        document.getElementById("legend_hour").innerHTML = window.statHourly.generateLegend();
                    }
                };
        
                self.setPrintChart = function(ds) {
                    if (ds == undefined)
                        return;
        
                    self.statprint = [
                        {// Uploads
                          color : "rgba(52,152,219,0.5)",
                          highlight: "rgba(52,152,219,1)",
                          value : ds.upload,
                          label : "Upload"
                        },// Prints
                        {
                          color : "rgba(41,128,185,0.5)",
                          highlight: "rgba(41,128,185,1)",
                          value : ds.print_started,
                          label : "Print"
                        },// Dones
                        {
                          color : "rgba(26,188,156,0.5)",
                          highlight: "rgba(26,188,156,1)",
                          value : ds.print_done,
                          label : "Print complete"
                        },// Failed
                        {
                          color : "rgba(231,76,60,0.5)",
                          highlight: "rgba(231,76,60,1)",
                          value : ds.print_failed,
                          label : "Print failed"
                        },// Cancelled
                        {
                          color : "rgba(189,195,199,0.5)",
                          highlight: "rgba(189,195,199,1)",
                          value : ds.print_cancelled,
                          label : "Print cancelled"
                        },
                    ];
        
                    if (self.tabVisible == true) {
                        var ctx = document.getElementById("canvas_printstat").getContext("2d");
                        if (window.statPrint != undefined)
                            window.statPrint.clear();
        
                        window.statPrint = new Chart(ctx).PolarArea(self.statprint, {
                          segmentStrokeColor: "#000000",
                          responsive : true,
                          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                        });
        
                        //document.getElementById("legend_print").innerHTML = window.statPrint.generateLegend();
                    }
                };
        
                self.setDaykWhChart = function(ds) {
                    if (ds == undefined)
                        return;
        
                    self.statdkwh = {
                      labels : ds.day,
                      datasets : [
                        {// kWh
                          fillColor : "rgba(241,196,15,0.5)",
                          strokeColor : "rgba(241,196,15,0.8)",
                          pointColor: "rgba(241,196,15,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(241,196,15,1)",
                          data : ds.kwh,
                          label : "kWh"
                        },// Print Time
                        {
                          fillColor : "rgba(52,152,219,0.5)",
                          strokeColor : "rgba(52,152,219,0.8)",
                          pointColor: "rgba(52,152,219,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(52,152,219,1)",
                          data : ds.phour,
                          label : "Hours"
                        },
                      ]
                    };
        
                    if (self.tabVisible == true) {
                        var ctx = document.getElementById("canvas_dkwhstat").getContext("2d");
                        if (window.statdkWh != undefined)
                            window.statdkWh.clear();
        
                        window.statdkWh = new Chart(ctx).Line(self.statdkwh, {
                          responsive : true,
                          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                        });
        
                        document.getElementById("legend_dkwh").innerHTML = window.statdkWh.generateLegend();
                    }
                };
        
                self.setMonthkWhChart = function(ds) {
                    if (ds == undefined)
                        return;
        
                    self.statmkwh = {
                      labels : ds.month,
                      datasets : [
                        {// kWh
                          fillColor : "rgba(241,196,15,0.5)",
                          strokeColor : "rgba(241,196,15,0.8)",
                          pointColor: "rgba(241,196,15,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(241,196,15,1)",
                          data : ds.kwh,
                          label : "kWh"
                        },// Print Time
                        {
                          fillColor : "rgba(52,152,219,0.5)",
                          strokeColor : "rgba(52,152,219,0.8)",
                          pointColor: "rgba(52,152,219,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(52,152,219,1)",
                          data : ds.phour,
                          label : "Hours"
                        },
                      ]
                    };
        
                    if (self.tabVisible == true) {
                        var ctx = document.getElementById("canvas_mkwhstat").getContext("2d");
                        if (window.statmkWh != undefined)
                            window.statmkWh.clear();
        
                        window.statmkWh = new Chart(ctx).Line(self.statmkwh, {
                          responsive : true,
                          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                        });
        
                        document.getElementById("legend_mkwh").innerHTML = window.statmkWh.generateLegend();
                    }
                };
        
            }
        
        
            ADDITIONAL_VIEWMODELS.push([
                StatsViewModel,
                ["loginStateViewModel", "settingsViewModel"],
                [document.getElementById("tab_plugin_stats")]
            ]);
        });
        
        function printObject(o) {
          var out = '';
          for (var p in o) {
            out += p + ': ' + o[p] + '\n';
          }
          alert(out);
        }
        
        ;
        
        // source: plugin/stats/js/Chart.js
        /*!
         * Chart.js
         * http://chartjs.org/
         * Version: 1.0.2
         *
         * Copyright 2015 Nick Downie
         * Released under the MIT license
         * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
         */
        (function(){"use strict";var t=this,i=t.Chart,e=function(t){this.canvas=t.canvas,this.ctx=t;var i=function(t,i){return t["offset"+i]?t["offset"+i]:document.defaultView.getComputedStyle(t).getPropertyValue(i)},e=this.width=i(t.canvas,"Width"),n=this.height=i(t.canvas,"Height");t.canvas.width=e,t.canvas.height=n;var e=this.width=t.canvas.width,n=this.height=t.canvas.height;return this.aspectRatio=this.width/this.height,s.retinaScale(this),this};e.defaults={global:{animation:!0,animationSteps:60,animationEasing:"easeOutQuart",showScale:!0,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleIntegersOnly:!0,scaleBeginAtZero:!1,scaleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",responsive:!1,maintainAspectRatio:!0,showTooltips:!0,customTooltips:!1,tooltipEvents:["mousemove","touchstart","touchmove","mouseout"],tooltipFillColor:"rgba(0,0,0,0.8)",tooltipFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipFontSize:14,tooltipFontStyle:"normal",tooltipFontColor:"#fff",tooltipTitleFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",tooltipTitleFontSize:14,tooltipTitleFontStyle:"bold",tooltipTitleFontColor:"#fff",tooltipYPadding:6,tooltipXPadding:6,tooltipCaretSize:8,tooltipCornerRadius:6,tooltipXOffset:10,tooltipTemplate:"<%if (label){%><%=label%>: <%}%><%= value %>",multiTooltipTemplate:"<%= value %>",multiTooltipKeyBackground:"#fff",onAnimationProgress:function(){},onAnimationComplete:function(){}}},e.types={};var s=e.helpers={},n=s.each=function(t,i,e){var s=Array.prototype.slice.call(arguments,3);if(t)if(t.length===+t.length){var n;for(n=0;n<t.length;n++)i.apply(e,[t[n],n].concat(s))}else for(var o in t)i.apply(e,[t[o],o].concat(s))},o=s.clone=function(t){var i={};return n(t,function(e,s){t.hasOwnProperty(s)&&(i[s]=e)}),i},a=s.extend=function(t){return n(Array.prototype.slice.call(arguments,1),function(i){n(i,function(e,s){i.hasOwnProperty(s)&&(t[s]=e)})}),t},h=s.merge=function(){var t=Array.prototype.slice.call(arguments,0);return t.unshift({}),a.apply(null,t)},l=s.indexOf=function(t,i){if(Array.prototype.indexOf)return t.indexOf(i);for(var e=0;e<t.length;e++)if(t[e]===i)return e;return-1},r=(s.where=function(t,i){var e=[];return s.each(t,function(t){i(t)&&e.push(t)}),e},s.findNextWhere=function(t,i,e){e||(e=-1);for(var s=e+1;s<t.length;s++){var n=t[s];if(i(n))return n}},s.findPreviousWhere=function(t,i,e){e||(e=t.length);for(var s=e-1;s>=0;s--){var n=t[s];if(i(n))return n}},s.inherits=function(t){var i=this,e=t&&t.hasOwnProperty("constructor")?t.constructor:function(){return i.apply(this,arguments)},s=function(){this.constructor=e};return s.prototype=i.prototype,e.prototype=new s,e.extend=r,t&&a(e.prototype,t),e.__super__=i.prototype,e}),c=s.noop=function(){},u=s.uid=function(){var t=0;return function(){return"chart-"+t++}}(),d=s.warn=function(t){window.console&&"function"==typeof window.console.warn&&console.warn(t)},p=s.amd="function"==typeof define&&define.amd,f=s.isNumber=function(t){return!isNaN(parseFloat(t))&&isFinite(t)},g=s.max=function(t){return Math.max.apply(Math,t)},m=s.min=function(t){return Math.min.apply(Math,t)},v=(s.cap=function(t,i,e){if(f(i)){if(t>i)return i}else if(f(e)&&e>t)return e;return t},s.getDecimalPlaces=function(t){return t%1!==0&&f(t)?t.toString().split(".")[1].length:0}),S=s.radians=function(t){return t*(Math.PI/180)},x=(s.getAngleFromPoint=function(t,i){var e=i.x-t.x,s=i.y-t.y,n=Math.sqrt(e*e+s*s),o=2*Math.PI+Math.atan2(s,e);return 0>e&&0>s&&(o+=2*Math.PI),{angle:o,distance:n}},s.aliasPixel=function(t){return t%2===0?0:.5}),y=(s.splineCurve=function(t,i,e,s){var n=Math.sqrt(Math.pow(i.x-t.x,2)+Math.pow(i.y-t.y,2)),o=Math.sqrt(Math.pow(e.x-i.x,2)+Math.pow(e.y-i.y,2)),a=s*n/(n+o),h=s*o/(n+o);return{inner:{x:i.x-a*(e.x-t.x),y:i.y-a*(e.y-t.y)},outer:{x:i.x+h*(e.x-t.x),y:i.y+h*(e.y-t.y)}}},s.calculateOrderOfMagnitude=function(t){return Math.floor(Math.log(t)/Math.LN10)}),C=(s.calculateScaleRange=function(t,i,e,s,n){var o=2,a=Math.floor(i/(1.5*e)),h=o>=a,l=g(t),r=m(t);l===r&&(l+=.5,r>=.5&&!s?r-=.5:l+=.5);for(var c=Math.abs(l-r),u=y(c),d=Math.ceil(l/(1*Math.pow(10,u)))*Math.pow(10,u),p=s?0:Math.floor(r/(1*Math.pow(10,u)))*Math.pow(10,u),f=d-p,v=Math.pow(10,u),S=Math.round(f/v);(S>a||a>2*S)&&!h;)if(S>a)v*=2,S=Math.round(f/v),S%1!==0&&(h=!0);else if(n&&u>=0){if(v/2%1!==0)break;v/=2,S=Math.round(f/v)}else v/=2,S=Math.round(f/v);return h&&(S=o,v=f/S),{steps:S,stepValue:v,min:p,max:p+S*v}},s.template=function(t,i){function e(t,i){var e=/\W/.test(t)?new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+t.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):s[t]=s[t];return i?e(i):e}if(t instanceof Function)return t(i);var s={};return e(t,i)}),w=(s.generateLabels=function(t,i,e,s){var o=new Array(i);return labelTemplateString&&n(o,function(i,n){o[n]=C(t,{value:e+s*(n+1)})}),o},s.easingEffects={linear:function(t){return t},easeInQuad:function(t){return t*t},easeOutQuad:function(t){return-1*t*(t-2)},easeInOutQuad:function(t){return(t/=.5)<1?.5*t*t:-0.5*(--t*(t-2)-1)},easeInCubic:function(t){return t*t*t},easeOutCubic:function(t){return 1*((t=t/1-1)*t*t+1)},easeInOutCubic:function(t){return(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},easeInQuart:function(t){return t*t*t*t},easeOutQuart:function(t){return-1*((t=t/1-1)*t*t*t-1)},easeInOutQuart:function(t){return(t/=.5)<1?.5*t*t*t*t:-0.5*((t-=2)*t*t*t-2)},easeInQuint:function(t){return 1*(t/=1)*t*t*t*t},easeOutQuint:function(t){return 1*((t=t/1-1)*t*t*t*t+1)},easeInOutQuint:function(t){return(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},easeInSine:function(t){return-1*Math.cos(t/1*(Math.PI/2))+1},easeOutSine:function(t){return 1*Math.sin(t/1*(Math.PI/2))},easeInOutSine:function(t){return-0.5*(Math.cos(Math.PI*t/1)-1)},easeInExpo:function(t){return 0===t?1:1*Math.pow(2,10*(t/1-1))},easeOutExpo:function(t){return 1===t?1:1*(-Math.pow(2,-10*t/1)+1)},easeInOutExpo:function(t){return 0===t?0:1===t?1:(t/=.5)<1?.5*Math.pow(2,10*(t-1)):.5*(-Math.pow(2,-10*--t)+2)},easeInCirc:function(t){return t>=1?t:-1*(Math.sqrt(1-(t/=1)*t)-1)},easeOutCirc:function(t){return 1*Math.sqrt(1-(t=t/1-1)*t)},easeInOutCirc:function(t){return(t/=.5)<1?-0.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},easeInElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),-(s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)))},easeOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:1==(t/=1)?1:(e||(e=.3),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),s*Math.pow(2,-10*t)*Math.sin(2*(1*t-i)*Math.PI/e)+1)},easeInOutElastic:function(t){var i=1.70158,e=0,s=1;return 0===t?0:2==(t/=.5)?1:(e||(e=.3*1.5),s<Math.abs(1)?(s=1,i=e/4):i=e/(2*Math.PI)*Math.asin(1/s),1>t?-.5*s*Math.pow(2,10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e):s*Math.pow(2,-10*(t-=1))*Math.sin(2*(1*t-i)*Math.PI/e)*.5+1)},easeInBack:function(t){var i=1.70158;return 1*(t/=1)*t*((i+1)*t-i)},easeOutBack:function(t){var i=1.70158;return 1*((t=t/1-1)*t*((i+1)*t+i)+1)},easeInOutBack:function(t){var i=1.70158;return(t/=.5)<1?.5*t*t*(((i*=1.525)+1)*t-i):.5*((t-=2)*t*(((i*=1.525)+1)*t+i)+2)},easeInBounce:function(t){return 1-w.easeOutBounce(1-t)},easeOutBounce:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?1*(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1*(7.5625*(t-=2.25/2.75)*t+.9375):1*(7.5625*(t-=2.625/2.75)*t+.984375)},easeInOutBounce:function(t){return.5>t?.5*w.easeInBounce(2*t):.5*w.easeOutBounce(2*t-1)+.5}}),b=s.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)}}(),P=s.cancelAnimFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame||function(t){return window.clearTimeout(t,1e3/60)}}(),L=(s.animationLoop=function(t,i,e,s,n,o){var a=0,h=w[e]||w.linear,l=function(){a++;var e=a/i,r=h(e);t.call(o,r,e,a),s.call(o,r,e),i>a?o.animationFrame=b(l):n.apply(o)};b(l)},s.getRelativePosition=function(t){var i,e,s=t.originalEvent||t,n=t.currentTarget||t.srcElement,o=n.getBoundingClientRect();return s.touches?(i=s.touches[0].clientX-o.left,e=s.touches[0].clientY-o.top):(i=s.clientX-o.left,e=s.clientY-o.top),{x:i,y:e}},s.addEvent=function(t,i,e){t.addEventListener?t.addEventListener(i,e):t.attachEvent?t.attachEvent("on"+i,e):t["on"+i]=e}),k=s.removeEvent=function(t,i,e){t.removeEventListener?t.removeEventListener(i,e,!1):t.detachEvent?t.detachEvent("on"+i,e):t["on"+i]=c},F=(s.bindEvents=function(t,i,e){t.events||(t.events={}),n(i,function(i){t.events[i]=function(){e.apply(t,arguments)},L(t.chart.canvas,i,t.events[i])})},s.unbindEvents=function(t,i){n(i,function(i,e){k(t.chart.canvas,e,i)})}),R=s.getMaximumWidth=function(t){var i=t.parentNode;return i.clientWidth},T=s.getMaximumHeight=function(t){var i=t.parentNode;return i.clientHeight},A=(s.getMaximumSize=s.getMaximumWidth,s.retinaScale=function(t){var i=t.ctx,e=t.canvas.width,s=t.canvas.height;window.devicePixelRatio&&(i.canvas.style.width=e+"px",i.canvas.style.height=s+"px",i.canvas.height=s*window.devicePixelRatio,i.canvas.width=e*window.devicePixelRatio,i.scale(window.devicePixelRatio,window.devicePixelRatio))}),M=s.clear=function(t){t.ctx.clearRect(0,0,t.width,t.height)},W=s.fontString=function(t,i,e){return i+" "+t+"px "+e},z=s.longestText=function(t,i,e){t.font=i;var s=0;return n(e,function(i){var e=t.measureText(i).width;s=e>s?e:s}),s},B=s.drawRoundedRectangle=function(t,i,e,s,n,o){t.beginPath(),t.moveTo(i+o,e),t.lineTo(i+s-o,e),t.quadraticCurveTo(i+s,e,i+s,e+o),t.lineTo(i+s,e+n-o),t.quadraticCurveTo(i+s,e+n,i+s-o,e+n),t.lineTo(i+o,e+n),t.quadraticCurveTo(i,e+n,i,e+n-o),t.lineTo(i,e+o),t.quadraticCurveTo(i,e,i+o,e),t.closePath()};e.instances={},e.Type=function(t,i,s){this.options=i,this.chart=s,this.id=u(),e.instances[this.id]=this,i.responsive&&this.resize(),this.initialize.call(this,t)},a(e.Type.prototype,{initialize:function(){return this},clear:function(){return M(this.chart),this},stop:function(){return P(this.animationFrame),this},resize:function(t){this.stop();var i=this.chart.canvas,e=R(this.chart.canvas),s=this.options.maintainAspectRatio?e/this.chart.aspectRatio:T(this.chart.canvas);return i.width=this.chart.width=e,i.height=this.chart.height=s,A(this.chart),"function"==typeof t&&t.apply(this,Array.prototype.slice.call(arguments,1)),this},reflow:c,render:function(t){return t&&this.reflow(),this.options.animation&&!t?s.animationLoop(this.draw,this.options.animationSteps,this.options.animationEasing,this.options.onAnimationProgress,this.options.onAnimationComplete,this):(this.draw(),this.options.onAnimationComplete.call(this)),this},generateLegend:function(){return C(this.options.legendTemplate,this)},destroy:function(){this.clear(),F(this,this.events);var t=this.chart.canvas;t.width=this.chart.width,t.height=this.chart.height,t.style.removeProperty?(t.style.removeProperty("width"),t.style.removeProperty("height")):(t.style.removeAttribute("width"),t.style.removeAttribute("height")),delete e.instances[this.id]},showTooltip:function(t,i){"undefined"==typeof this.activeElements&&(this.activeElements=[]);var o=function(t){var i=!1;return t.length!==this.activeElements.length?i=!0:(n(t,function(t,e){t!==this.activeElements[e]&&(i=!0)},this),i)}.call(this,t);if(o||i){if(this.activeElements=t,this.draw(),this.options.customTooltips&&this.options.customTooltips(!1),t.length>0)if(this.datasets&&this.datasets.length>1){for(var a,h,r=this.datasets.length-1;r>=0&&(a=this.datasets[r].points||this.datasets[r].bars||this.datasets[r].segments,h=l(a,t[0]),-1===h);r--);var c=[],u=[],d=function(){var t,i,e,n,o,a=[],l=[],r=[];return s.each(this.datasets,function(i){t=i.points||i.bars||i.segments,t[h]&&t[h].hasValue()&&a.push(t[h])}),s.each(a,function(t){l.push(t.x),r.push(t.y),c.push(s.template(this.options.multiTooltipTemplate,t)),u.push({fill:t._saved.fillColor||t.fillColor,stroke:t._saved.strokeColor||t.strokeColor})},this),o=m(r),e=g(r),n=m(l),i=g(l),{x:n>this.chart.width/2?n:i,y:(o+e)/2}}.call(this,h);new e.MultiTooltip({x:d.x,y:d.y,xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,xOffset:this.options.tooltipXOffset,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,titleTextColor:this.options.tooltipTitleFontColor,titleFontFamily:this.options.tooltipTitleFontFamily,titleFontStyle:this.options.tooltipTitleFontStyle,titleFontSize:this.options.tooltipTitleFontSize,cornerRadius:this.options.tooltipCornerRadius,labels:c,legendColors:u,legendColorBackground:this.options.multiTooltipKeyBackground,title:t[0].label,chart:this.chart,ctx:this.chart.ctx,custom:this.options.customTooltips}).draw()}else n(t,function(t){var i=t.tooltipPosition();new e.Tooltip({x:Math.round(i.x),y:Math.round(i.y),xPadding:this.options.tooltipXPadding,yPadding:this.options.tooltipYPadding,fillColor:this.options.tooltipFillColor,textColor:this.options.tooltipFontColor,fontFamily:this.options.tooltipFontFamily,fontStyle:this.options.tooltipFontStyle,fontSize:this.options.tooltipFontSize,caretHeight:this.options.tooltipCaretSize,cornerRadius:this.options.tooltipCornerRadius,text:C(this.options.tooltipTemplate,t),chart:this.chart,custom:this.options.customTooltips}).draw()},this);return this}},toBase64Image:function(){return this.chart.canvas.toDataURL.apply(this.chart.canvas,arguments)}}),e.Type.extend=function(t){var i=this,s=function(){return i.apply(this,arguments)};if(s.prototype=o(i.prototype),a(s.prototype,t),s.extend=e.Type.extend,t.name||i.prototype.name){var n=t.name||i.prototype.name,l=e.defaults[i.prototype.name]?o(e.defaults[i.prototype.name]):{};e.defaults[n]=a(l,t.defaults),e.types[n]=s,e.prototype[n]=function(t,i){var o=h(e.defaults.global,e.defaults[n],i||{});return new s(t,o,this)}}else d("Name not provided for this chart, so it hasn't been registered");return i},e.Element=function(t){a(this,t),this.initialize.apply(this,arguments),this.save()},a(e.Element.prototype,{initialize:function(){},restore:function(t){return t?n(t,function(t){this[t]=this._saved[t]},this):a(this,this._saved),this},save:function(){return this._saved=o(this),delete this._saved._saved,this},update:function(t){return n(t,function(t,i){this._saved[i]=this[i],this[i]=t},this),this},transition:function(t,i){return n(t,function(t,e){this[e]=(t-this._saved[e])*i+this._saved[e]},this),this},tooltipPosition:function(){return{x:this.x,y:this.y}},hasValue:function(){return f(this.value)}}),e.Element.extend=r,e.Point=e.Element.extend({display:!0,inRange:function(t,i){var e=this.hitDetectionRadius+this.radius;return Math.pow(t-this.x,2)+Math.pow(i-this.y,2)<Math.pow(e,2)},draw:function(){if(this.display){var t=this.ctx;t.beginPath(),t.arc(this.x,this.y,this.radius,0,2*Math.PI),t.closePath(),t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.fillStyle=this.fillColor,t.fill(),t.stroke()}}}),e.Arc=e.Element.extend({inRange:function(t,i){var e=s.getAngleFromPoint(this,{x:t,y:i}),n=e.angle>=this.startAngle&&e.angle<=this.endAngle,o=e.distance>=this.innerRadius&&e.distance<=this.outerRadius;return n&&o},tooltipPosition:function(){var t=this.startAngle+(this.endAngle-this.startAngle)/2,i=(this.outerRadius-this.innerRadius)/2+this.innerRadius;return{x:this.x+Math.cos(t)*i,y:this.y+Math.sin(t)*i}},draw:function(t){var i=this.ctx;i.beginPath(),i.arc(this.x,this.y,this.outerRadius,this.startAngle,this.endAngle),i.arc(this.x,this.y,this.innerRadius,this.endAngle,this.startAngle,!0),i.closePath(),i.strokeStyle=this.strokeColor,i.lineWidth=this.strokeWidth,i.fillStyle=this.fillColor,i.fill(),i.lineJoin="bevel",this.showStroke&&i.stroke()}}),e.Rectangle=e.Element.extend({draw:function(){var t=this.ctx,i=this.width/2,e=this.x-i,s=this.x+i,n=this.base-(this.base-this.y),o=this.strokeWidth/2;this.showStroke&&(e+=o,s-=o,n+=o),t.beginPath(),t.fillStyle=this.fillColor,t.strokeStyle=this.strokeColor,t.lineWidth=this.strokeWidth,t.moveTo(e,this.base),t.lineTo(e,n),t.lineTo(s,n),t.lineTo(s,this.base),t.fill(),this.showStroke&&t.stroke()},height:function(){return this.base-this.y},inRange:function(t,i){return t>=this.x-this.width/2&&t<=this.x+this.width/2&&i>=this.y&&i<=this.base}}),e.Tooltip=e.Element.extend({draw:function(){var t=this.chart.ctx;t.font=W(this.fontSize,this.fontStyle,this.fontFamily),this.xAlign="center",this.yAlign="above";var i=this.caretPadding=2,e=t.measureText(this.text).width+2*this.xPadding,s=this.fontSize+2*this.yPadding,n=s+this.caretHeight+i;this.x+e/2>this.chart.width?this.xAlign="left":this.x-e/2<0&&(this.xAlign="right"),this.y-n<0&&(this.yAlign="below");var o=this.x-e/2,a=this.y-n;if(t.fillStyle=this.fillColor,this.custom)this.custom(this);else{switch(this.yAlign){case"above":t.beginPath(),t.moveTo(this.x,this.y-i),t.lineTo(this.x+this.caretHeight,this.y-(i+this.caretHeight)),t.lineTo(this.x-this.caretHeight,this.y-(i+this.caretHeight)),t.closePath(),t.fill();break;case"below":a=this.y+i+this.caretHeight,t.beginPath(),t.moveTo(this.x,this.y+i),t.lineTo(this.x+this.caretHeight,this.y+i+this.caretHeight),t.lineTo(this.x-this.caretHeight,this.y+i+this.caretHeight),t.closePath(),t.fill()}switch(this.xAlign){case"left":o=this.x-e+(this.cornerRadius+this.caretHeight);break;case"right":o=this.x-(this.cornerRadius+this.caretHeight)}B(t,o,a,e,s,this.cornerRadius),t.fill(),t.fillStyle=this.textColor,t.textAlign="center",t.textBaseline="middle",t.fillText(this.text,o+e/2,a+s/2)}}}),e.MultiTooltip=e.Element.extend({initialize:function(){this.font=W(this.fontSize,this.fontStyle,this.fontFamily),this.titleFont=W(this.titleFontSize,this.titleFontStyle,this.titleFontFamily),this.height=this.labels.length*this.fontSize+(this.labels.length-1)*(this.fontSize/2)+2*this.yPadding+1.5*this.titleFontSize,this.ctx.font=this.titleFont;var t=this.ctx.measureText(this.title).width,i=z(this.ctx,this.font,this.labels)+this.fontSize+3,e=g([i,t]);this.width=e+2*this.xPadding;var s=this.height/2;this.y-s<0?this.y=s:this.y+s>this.chart.height&&(this.y=this.chart.height-s),this.x>this.chart.width/2?this.x-=this.xOffset+this.width:this.x+=this.xOffset},getLineHeight:function(t){var i=this.y-this.height/2+this.yPadding,e=t-1;return 0===t?i+this.titleFontSize/2:i+(1.5*this.fontSize*e+this.fontSize/2)+1.5*this.titleFontSize},draw:function(){if(this.custom)this.custom(this);else{B(this.ctx,this.x,this.y-this.height/2,this.width,this.height,this.cornerRadius);var t=this.ctx;t.fillStyle=this.fillColor,t.fill(),t.closePath(),t.textAlign="left",t.textBaseline="middle",t.fillStyle=this.titleTextColor,t.font=this.titleFont,t.fillText(this.title,this.x+this.xPadding,this.getLineHeight(0)),t.font=this.font,s.each(this.labels,function(i,e){t.fillStyle=this.textColor,t.fillText(i,this.x+this.xPadding+this.fontSize+3,this.getLineHeight(e+1)),t.fillStyle=this.legendColorBackground,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize),t.fillStyle=this.legendColors[e].fill,t.fillRect(this.x+this.xPadding,this.getLineHeight(e+1)-this.fontSize/2,this.fontSize,this.fontSize)},this)}}}),e.Scale=e.Element.extend({initialize:function(){this.fit()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}));this.yLabelWidth=this.display&&this.showLabels?z(this.ctx,this.font,this.yLabels):0},addXLabel:function(t){this.xLabels.push(t),this.valuesCount++,this.fit()},removeXLabel:function(){this.xLabels.shift(),this.valuesCount--,this.fit()},fit:function(){this.startPoint=this.display?this.fontSize:0,this.endPoint=this.display?this.height-1.5*this.fontSize-5:this.height,this.startPoint+=this.padding,this.endPoint-=this.padding;var t,i=this.endPoint-this.startPoint;for(this.calculateYRange(i),this.buildYLabels(),this.calculateXLabelRotation();i>this.endPoint-this.startPoint;)i=this.endPoint-this.startPoint,t=this.yLabelWidth,this.calculateYRange(i),this.buildYLabels(),t<this.yLabelWidth&&this.calculateXLabelRotation()},calculateXLabelRotation:function(){this.ctx.font=this.font;var t,i,e=this.ctx.measureText(this.xLabels[0]).width,s=this.ctx.measureText(this.xLabels[this.xLabels.length-1]).width;if(this.xScalePaddingRight=s/2+3,this.xScalePaddingLeft=e/2>this.yLabelWidth+10?e/2:this.yLabelWidth+10,this.xLabelRotation=0,this.display){var n,o=z(this.ctx,this.font,this.xLabels);this.xLabelWidth=o;for(var a=Math.floor(this.calculateX(1)-this.calculateX(0))-6;this.xLabelWidth>a&&0===this.xLabelRotation||this.xLabelWidth>a&&this.xLabelRotation<=90&&this.xLabelRotation>0;)n=Math.cos(S(this.xLabelRotation)),t=n*e,i=n*s,t+this.fontSize/2>this.yLabelWidth+8&&(this.xScalePaddingLeft=t+this.fontSize/2),this.xScalePaddingRight=this.fontSize/2,this.xLabelRotation++,this.xLabelWidth=n*o;this.xLabelRotation>0&&(this.endPoint-=Math.sin(S(this.xLabelRotation))*o+3)}else this.xLabelWidth=0,this.xScalePaddingRight=this.padding,this.xScalePaddingLeft=this.padding},calculateYRange:c,drawingArea:function(){return this.startPoint-this.endPoint},calculateY:function(t){var i=this.drawingArea()/(this.min-this.max);return this.endPoint-i*(t-this.min)},calculateX:function(t){var i=(this.xLabelRotation>0,this.width-(this.xScalePaddingLeft+this.xScalePaddingRight)),e=i/Math.max(this.valuesCount-(this.offsetGridLines?0:1),1),s=e*t+this.xScalePaddingLeft;return this.offsetGridLines&&(s+=e/2),Math.round(s)},update:function(t){s.extend(this,t),this.fit()},draw:function(){var t=this.ctx,i=(this.endPoint-this.startPoint)/this.steps,e=Math.round(this.xScalePaddingLeft);this.display&&(t.fillStyle=this.textColor,t.font=this.font,n(this.yLabels,function(n,o){var a=this.endPoint-i*o,h=Math.round(a),l=this.showHorizontalLines;t.textAlign="right",t.textBaseline="middle",this.showLabels&&t.fillText(n,e-10,a),0!==o||l||(l=!0),l&&t.beginPath(),o>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),h+=s.aliasPixel(t.lineWidth),l&&(t.moveTo(e,h),t.lineTo(this.width,h),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(e-5,h),t.lineTo(e,h),t.stroke(),t.closePath()},this),n(this.xLabels,function(i,e){var s=this.calculateX(e)+x(this.lineWidth),n=this.calculateX(e-(this.offsetGridLines?.5:0))+x(this.lineWidth),o=this.xLabelRotation>0,a=this.showVerticalLines;0!==e||a||(a=!0),a&&t.beginPath(),e>0?(t.lineWidth=this.gridLineWidth,t.strokeStyle=this.gridLineColor):(t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor),a&&(t.moveTo(n,this.endPoint),t.lineTo(n,this.startPoint-3),t.stroke(),t.closePath()),t.lineWidth=this.lineWidth,t.strokeStyle=this.lineColor,t.beginPath(),t.moveTo(n,this.endPoint),t.lineTo(n,this.endPoint+5),t.stroke(),t.closePath(),t.save(),t.translate(s,o?this.endPoint+12:this.endPoint+8),t.rotate(-1*S(this.xLabelRotation)),t.font=this.font,t.textAlign=o?"right":"center",t.textBaseline=o?"middle":"top",t.fillText(i,0,0),t.restore()},this))}}),e.RadialScale=e.Element.extend({initialize:function(){this.size=m([this.height,this.width]),this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2},calculateCenterOffset:function(t){var i=this.drawingArea/(this.max-this.min);return(t-this.min)*i},update:function(){this.lineArc?this.drawingArea=this.display?this.size/2-(this.fontSize/2+this.backdropPaddingY):this.size/2:this.setScaleSize(),this.buildYLabels()},buildYLabels:function(){this.yLabels=[];for(var t=v(this.stepValue),i=0;i<=this.steps;i++)this.yLabels.push(C(this.templateString,{value:(this.min+i*this.stepValue).toFixed(t)}))},getCircumference:function(){return 2*Math.PI/this.valuesCount},setScaleSize:function(){var t,i,e,s,n,o,a,h,l,r,c,u,d=m([this.height/2-this.pointLabelFontSize-5,this.width/2]),p=this.width,g=0;for(this.ctx.font=W(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),i=0;i<this.valuesCount;i++)t=this.getPointPosition(i,d),e=this.ctx.measureText(C(this.templateString,{value:this.labels[i]})).width+5,0===i||i===this.valuesCount/2?(s=e/2,t.x+s>p&&(p=t.x+s,n=i),t.x-s<g&&(g=t.x-s,a=i)):i<this.valuesCount/2?t.x+e>p&&(p=t.x+e,n=i):i>this.valuesCount/2&&t.x-e<g&&(g=t.x-e,a=i);l=g,r=Math.ceil(p-this.width),o=this.getIndexAngle(n),h=this.getIndexAngle(a),c=r/Math.sin(o+Math.PI/2),u=l/Math.sin(h+Math.PI/2),c=f(c)?c:0,u=f(u)?u:0,this.drawingArea=d-(u+c)/2,this.setCenterPoint(u,c)},setCenterPoint:function(t,i){var e=this.width-i-this.drawingArea,s=t+this.drawingArea;this.xCenter=(s+e)/2,this.yCenter=this.height/2},getIndexAngle:function(t){var i=2*Math.PI/this.valuesCount;return t*i-Math.PI/2},getPointPosition:function(t,i){var e=this.getIndexAngle(t);return{x:Math.cos(e)*i+this.xCenter,y:Math.sin(e)*i+this.yCenter}},draw:function(){if(this.display){var t=this.ctx;if(n(this.yLabels,function(i,e){if(e>0){var s,n=e*(this.drawingArea/this.steps),o=this.yCenter-n;if(this.lineWidth>0)if(t.strokeStyle=this.lineColor,t.lineWidth=this.lineWidth,this.lineArc)t.beginPath(),t.arc(this.xCenter,this.yCenter,n,0,2*Math.PI),t.closePath(),t.stroke();else{t.beginPath();for(var a=0;a<this.valuesCount;a++)s=this.getPointPosition(a,this.calculateCenterOffset(this.min+e*this.stepValue)),0===a?t.moveTo(s.x,s.y):t.lineTo(s.x,s.y);t.closePath(),t.stroke()}if(this.showLabels){if(t.font=W(this.fontSize,this.fontStyle,this.fontFamily),this.showLabelBackdrop){var h=t.measureText(i).width;t.fillStyle=this.backdropColor,t.fillRect(this.xCenter-h/2-this.backdropPaddingX,o-this.fontSize/2-this.backdropPaddingY,h+2*this.backdropPaddingX,this.fontSize+2*this.backdropPaddingY)}t.textAlign="center",t.textBaseline="middle",t.fillStyle=this.fontColor,t.fillText(i,this.xCenter,o)}}},this),!this.lineArc){t.lineWidth=this.angleLineWidth,t.strokeStyle=this.angleLineColor;for(var i=this.valuesCount-1;i>=0;i--){if(this.angleLineWidth>0){var e=this.getPointPosition(i,this.calculateCenterOffset(this.max));t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(e.x,e.y),t.stroke(),t.closePath()}var s=this.getPointPosition(i,this.calculateCenterOffset(this.max)+5);t.font=W(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily),t.fillStyle=this.pointLabelFontColor;var o=this.labels.length,a=this.labels.length/2,h=a/2,l=h>i||i>o-h,r=i===h||i===o-h;t.textAlign=0===i?"center":i===a?"center":a>i?"left":"right",t.textBaseline=r?"middle":l?"bottom":"top",t.fillText(this.labels[i],s.x,s.y)}}}}}),s.addEvent(window,"resize",function(){var t;return function(){clearTimeout(t),t=setTimeout(function(){n(e.instances,function(t){t.options.responsive&&t.resize(t.render,!0)})},50)}}()),p?define(function(){return e}):"object"==typeof module&&module.exports&&(module.exports=e),t.Chart=e,e.noConflict=function(){return t.Chart=i,e}}).call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleBeginAtZero:!0,scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,barShowStroke:!0,barStrokeWidth:2,barValueSpacing:5,barDatasetSpacing:1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Bar",defaults:s,initialize:function(t){var s=this.options;this.ScaleClass=i.Scale.extend({offsetGridLines:!0,calculateBarX:function(t,i,e){var n=this.calculateBaseWidth(),o=this.calculateX(e)-n/2,a=this.calculateBarWidth(t);return o+a*i+i*s.barDatasetSpacing+a/2},calculateBaseWidth:function(){return this.calculateX(1)-this.calculateX(0)-2*s.barValueSpacing},calculateBarWidth:function(t){var i=this.calculateBaseWidth()-(t-1)*s.barDatasetSpacing;return i/t}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getBarsAtEvent(t):[];this.eachBars(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),this.BarClass=i.Rectangle.extend({strokeWidth:this.options.barStrokeWidth,showStroke:this.options.barShowStroke,ctx:this.chart.ctx}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,bars:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.bars.push(new this.BarClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.strokeColor,fillColor:i.fillColor,highlightFill:i.highlightFill||i.fillColor,highlightStroke:i.highlightStroke||i.strokeColor}))},this)},this),this.buildScale(t.labels),this.BarClass.prototype.base=this.scale.endPoint,this.eachBars(function(t,i,s){e.extend(t,{width:this.scale.calculateBarWidth(this.datasets.length),x:this.scale.calculateBarX(this.datasets.length,s,i),y:this.scale.endPoint}),t.save()},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachBars(function(t){t.save()}),this.render()},eachBars:function(t){e.each(this.datasets,function(i,s){e.each(i.bars,t,this,s)},this)},getBarsAtEvent:function(t){for(var i,s=[],n=e.getRelativePosition(t),o=function(t){s.push(t.bars[i])},a=0;a<this.datasets.length;a++)for(i=0;i<this.datasets[a].bars.length;i++)if(this.datasets[a].bars[i].inRange(n.x,n.y))return e.each(this.datasets,o),s;return s},buildScale:function(t){var i=this,s=function(){var t=[];return i.eachBars(function(i){t.push(i.value)}),t},n={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(s(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.barShowStroke?this.options.barStrokeWidth:0,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(n,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new this.ScaleClass(n)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].bars.push(new this.BarClass({value:t,label:i,x:this.scale.calculateBarX(this.datasets.length,e,this.scale.valuesCount+1),y:this.scale.endPoint,width:this.scale.calculateBarWidth(this.datasets.length),base:this.scale.endPoint,strokeColor:this.datasets[e].strokeColor,fillColor:this.datasets[e].fillColor}))
        },this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.bars.shift()},this),this.update()},reflow:function(){e.extend(this.BarClass.prototype,{y:this.scale.endPoint,base:this.scale.endPoint});var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();this.chart.ctx;this.scale.draw(i),e.each(this.datasets,function(t,s){e.each(t.bars,function(t,e){t.hasValue()&&(t.base=this.scale.endPoint,t.transition({x:this.scale.calculateBarX(this.datasets.length,s,e),y:this.scale.calculateY(t.value),width:this.scale.calculateBarWidth(this.datasets.length)},i).draw())},this)},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,percentageInnerCutout:50,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Doughnut",defaults:s,initialize:function(t){this.segments=[],this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,this.SegmentArc=i.Arc.extend({ctx:this.chart.ctx,x:this.chart.width/2,y:this.chart.height/2}),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.calculateTotal(t),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({value:t.value,outerRadius:this.options.animateScale?0:this.outerRadius,innerRadius:this.options.animateScale?0:this.outerRadius/100*this.options.percentageInnerCutout,fillColor:t.color,highlightColor:t.highlight||t.color,showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,startAngle:1.5*Math.PI,circumference:this.options.animateRotate?0:this.calculateCircumference(t.value),label:t.label})),e||(this.reflow(),this.update())},calculateCircumference:function(t){return 2*Math.PI*(Math.abs(t)/this.total)},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=Math.abs(t.value)},this)},update:function(){this.calculateTotal(this.segments),e.each(this.activeElements,function(t){t.restore(["fillColor"])}),e.each(this.segments,function(t){t.save()}),this.render()},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.outerRadius=(e.min([this.chart.width,this.chart.height])-this.options.segmentStrokeWidth/2)/2,e.each(this.segments,function(t){t.update({outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout})},this)},draw:function(t){var i=t?t:1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.calculateCircumference(t.value),outerRadius:this.outerRadius,innerRadius:this.outerRadius/100*this.options.percentageInnerCutout},i),t.endAngle=t.startAngle+t.circumference,t.draw(),0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle)},this)}}),i.types.Doughnut.extend({name:"Pie",defaults:e.merge(s,{percentageInnerCutout:0})})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,scaleShowHorizontalLines:!0,scaleShowVerticalLines:!0,bezierCurve:!0,bezierCurveTension:.4,pointDot:!0,pointDotRadius:4,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"Line",defaults:s,initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx,inRange:function(t){return Math.pow(t-this.x,2)<Math.pow(this.radius+this.hitDetectionRadius,2)}}),this.datasets=[],this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this),this.buildScale(t.labels),this.eachPoints(function(t,i){e.extend(t,{x:this.scale.calculateX(i),y:this.scale.endPoint}),t.save()},this)},this),this.render()},update:function(){this.scale.update(),e.each(this.activeElements,function(t){t.restore(["fillColor","strokeColor"])}),this.eachPoints(function(t){t.save()}),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.datasets,function(t){e.each(t.points,function(t){t.inRange(s.x,s.y)&&i.push(t)})},this),i},buildScale:function(t){var s=this,n=function(){var t=[];return s.eachPoints(function(i){t.push(i.value)}),t},o={templateString:this.options.scaleLabel,height:this.chart.height,width:this.chart.width,ctx:this.chart.ctx,textColor:this.options.scaleFontColor,fontSize:this.options.scaleFontSize,fontStyle:this.options.scaleFontStyle,fontFamily:this.options.scaleFontFamily,valuesCount:t.length,beginAtZero:this.options.scaleBeginAtZero,integersOnly:this.options.scaleIntegersOnly,calculateYRange:function(t){var i=e.calculateScaleRange(n(),t,this.fontSize,this.beginAtZero,this.integersOnly);e.extend(this,i)},xLabels:t,font:e.fontString(this.options.scaleFontSize,this.options.scaleFontStyle,this.options.scaleFontFamily),lineWidth:this.options.scaleLineWidth,lineColor:this.options.scaleLineColor,showHorizontalLines:this.options.scaleShowHorizontalLines,showVerticalLines:this.options.scaleShowVerticalLines,gridLineWidth:this.options.scaleShowGridLines?this.options.scaleGridLineWidth:0,gridLineColor:this.options.scaleShowGridLines?this.options.scaleGridLineColor:"rgba(0,0,0,0)",padding:this.options.showScale?0:this.options.pointDotRadius+this.options.pointDotStrokeWidth,showLabels:this.options.scaleShowLabels,display:this.options.showScale};this.options.scaleOverride&&e.extend(o,{calculateYRange:e.noop,steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}),this.scale=new i.Scale(o)},addData:function(t,i){e.each(t,function(t,e){this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:this.scale.calculateX(this.scale.valuesCount+1),y:this.scale.endPoint,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.addXLabel(i),this.update()},removeData:function(){this.scale.removeXLabel(),e.each(this.datasets,function(t){t.points.shift()},this),this.update()},reflow:function(){var t=e.extend({height:this.chart.height,width:this.chart.width});this.scale.update(t)},draw:function(t){var i=t||1;this.clear();var s=this.chart.ctx,n=function(t){return null!==t.value},o=function(t,i,s){return e.findNextWhere(i,n,s)||t},a=function(t,i,s){return e.findPreviousWhere(i,n,s)||t};this.scale.draw(i),e.each(this.datasets,function(t){var h=e.where(t.points,n);e.each(t.points,function(t,e){t.hasValue()&&t.transition({y:this.scale.calculateY(t.value),x:this.scale.calculateX(e)},i)},this),this.options.bezierCurve&&e.each(h,function(t,i){var s=i>0&&i<h.length-1?this.options.bezierCurveTension:0;t.controlPoints=e.splineCurve(a(t,h,i),t,o(t,h,i),s),t.controlPoints.outer.y>this.scale.endPoint?t.controlPoints.outer.y=this.scale.endPoint:t.controlPoints.outer.y<this.scale.startPoint&&(t.controlPoints.outer.y=this.scale.startPoint),t.controlPoints.inner.y>this.scale.endPoint?t.controlPoints.inner.y=this.scale.endPoint:t.controlPoints.inner.y<this.scale.startPoint&&(t.controlPoints.inner.y=this.scale.startPoint)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(h,function(t,i){if(0===i)s.moveTo(t.x,t.y);else if(this.options.bezierCurve){var e=a(t,h,i);s.bezierCurveTo(e.controlPoints.outer.x,e.controlPoints.outer.y,t.controlPoints.inner.x,t.controlPoints.inner.y,t.x,t.y)}else s.lineTo(t.x,t.y)},this),s.stroke(),this.options.datasetFill&&h.length>0&&(s.lineTo(h[h.length-1].x,this.scale.endPoint),s.lineTo(h[0].x,this.scale.endPoint),s.fillStyle=t.fillColor,s.closePath(),s.fill()),e.each(h,function(t){t.draw()})},this)}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers,s={scaleShowLabelBackdrop:!0,scaleBackdropColor:"rgba(255,255,255,0.75)",scaleBeginAtZero:!0,scaleBackdropPaddingY:2,scaleBackdropPaddingX:2,scaleShowLine:!0,segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};i.Type.extend({name:"PolarArea",defaults:s,initialize:function(t){this.segments=[],this.SegmentArc=i.Arc.extend({showStroke:this.options.segmentShowStroke,strokeWidth:this.options.segmentStrokeWidth,strokeColor:this.options.segmentStrokeColor,ctx:this.chart.ctx,innerRadius:0,x:this.chart.width/2,y:this.chart.height/2}),this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,lineArc:!0,width:this.chart.width,height:this.chart.height,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,valuesCount:t.length}),this.updateScaleRange(t),this.scale.update(),e.each(t,function(t,i){this.addData(t,i,!0)},this),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getSegmentsAtEvent(t):[];e.each(this.segments,function(t){t.restore(["fillColor"])}),e.each(i,function(t){t.fillColor=t.highlightColor}),this.showTooltip(i)}),this.render()},getSegmentsAtEvent:function(t){var i=[],s=e.getRelativePosition(t);return e.each(this.segments,function(t){t.inRange(s.x,s.y)&&i.push(t)},this),i},addData:function(t,i,e){var s=i||this.segments.length;this.segments.splice(s,0,new this.SegmentArc({fillColor:t.color,highlightColor:t.highlight||t.color,label:t.label,value:t.value,outerRadius:this.options.animateScale?0:this.scale.calculateCenterOffset(t.value),circumference:this.options.animateRotate?0:this.scale.getCircumference(),startAngle:1.5*Math.PI})),e||(this.reflow(),this.update())},removeData:function(t){var i=e.isNumber(t)?t:this.segments.length-1;this.segments.splice(i,1),this.reflow(),this.update()},calculateTotal:function(t){this.total=0,e.each(t,function(t){this.total+=t.value},this),this.scale.valuesCount=this.segments.length},updateScaleRange:function(t){var i=[];e.each(t,function(t){i.push(t.value)});var s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s,{size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2})},update:function(){this.calculateTotal(this.segments),e.each(this.segments,function(t){t.save()}),this.reflow(),this.render()},reflow:function(){e.extend(this.SegmentArc.prototype,{x:this.chart.width/2,y:this.chart.height/2}),this.updateScaleRange(this.segments),this.scale.update(),e.extend(this.scale,{xCenter:this.chart.width/2,yCenter:this.chart.height/2}),e.each(this.segments,function(t){t.update({outerRadius:this.scale.calculateCenterOffset(t.value)})},this)},draw:function(t){var i=t||1;this.clear(),e.each(this.segments,function(t,e){t.transition({circumference:this.scale.getCircumference(),outerRadius:this.scale.calculateCenterOffset(t.value)},i),t.endAngle=t.startAngle+t.circumference,0===e&&(t.startAngle=1.5*Math.PI),e<this.segments.length-1&&(this.segments[e+1].startAngle=t.endAngle),t.draw()},this),this.scale.draw()}})}.call(this),function(){"use strict";var t=this,i=t.Chart,e=i.helpers;i.Type.extend({name:"Radar",defaults:{scaleShowLine:!0,angleShowLineOut:!0,scaleShowLabels:!1,scaleBeginAtZero:!0,angleLineColor:"rgba(0,0,0,.1)",angleLineWidth:1,pointLabelFontFamily:"'Arial'",pointLabelFontStyle:"normal",pointLabelFontSize:10,pointLabelFontColor:"#666",pointDot:!0,pointDotRadius:3,pointDotStrokeWidth:1,pointHitDetectionRadius:20,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,legendTemplate:'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'},initialize:function(t){this.PointClass=i.Point.extend({strokeWidth:this.options.pointDotStrokeWidth,radius:this.options.pointDotRadius,display:this.options.pointDot,hitDetectionRadius:this.options.pointHitDetectionRadius,ctx:this.chart.ctx}),this.datasets=[],this.buildScale(t),this.options.showTooltips&&e.bindEvents(this,this.options.tooltipEvents,function(t){var i="mouseout"!==t.type?this.getPointsAtEvent(t):[];this.eachPoints(function(t){t.restore(["fillColor","strokeColor"])}),e.each(i,function(t){t.fillColor=t.highlightFill,t.strokeColor=t.highlightStroke}),this.showTooltip(i)}),e.each(t.datasets,function(i){var s={label:i.label||null,fillColor:i.fillColor,strokeColor:i.strokeColor,pointColor:i.pointColor,pointStrokeColor:i.pointStrokeColor,points:[]};this.datasets.push(s),e.each(i.data,function(e,n){var o;this.scale.animation||(o=this.scale.getPointPosition(n,this.scale.calculateCenterOffset(e))),s.points.push(new this.PointClass({value:e,label:t.labels[n],datasetLabel:i.label,x:this.options.animation?this.scale.xCenter:o.x,y:this.options.animation?this.scale.yCenter:o.y,strokeColor:i.pointStrokeColor,fillColor:i.pointColor,highlightFill:i.pointHighlightFill||i.pointColor,highlightStroke:i.pointHighlightStroke||i.pointStrokeColor}))},this)},this),this.render()},eachPoints:function(t){e.each(this.datasets,function(i){e.each(i.points,t,this)},this)},getPointsAtEvent:function(t){var i=e.getRelativePosition(t),s=e.getAngleFromPoint({x:this.scale.xCenter,y:this.scale.yCenter},i),n=2*Math.PI/this.scale.valuesCount,o=Math.round((s.angle-1.5*Math.PI)/n),a=[];return(o>=this.scale.valuesCount||0>o)&&(o=0),s.distance<=this.scale.drawingArea&&e.each(this.datasets,function(t){a.push(t.points[o])}),a},buildScale:function(t){this.scale=new i.RadialScale({display:this.options.showScale,fontStyle:this.options.scaleFontStyle,fontSize:this.options.scaleFontSize,fontFamily:this.options.scaleFontFamily,fontColor:this.options.scaleFontColor,showLabels:this.options.scaleShowLabels,showLabelBackdrop:this.options.scaleShowLabelBackdrop,backdropColor:this.options.scaleBackdropColor,backdropPaddingY:this.options.scaleBackdropPaddingY,backdropPaddingX:this.options.scaleBackdropPaddingX,lineWidth:this.options.scaleShowLine?this.options.scaleLineWidth:0,lineColor:this.options.scaleLineColor,angleLineColor:this.options.angleLineColor,angleLineWidth:this.options.angleShowLineOut?this.options.angleLineWidth:0,pointLabelFontColor:this.options.pointLabelFontColor,pointLabelFontSize:this.options.pointLabelFontSize,pointLabelFontFamily:this.options.pointLabelFontFamily,pointLabelFontStyle:this.options.pointLabelFontStyle,height:this.chart.height,width:this.chart.width,xCenter:this.chart.width/2,yCenter:this.chart.height/2,ctx:this.chart.ctx,templateString:this.options.scaleLabel,labels:t.labels,valuesCount:t.datasets[0].data.length}),this.scale.setScaleSize(),this.updateScaleRange(t.datasets),this.scale.buildYLabels()},updateScaleRange:function(t){var i=function(){var i=[];return e.each(t,function(t){t.data?i=i.concat(t.data):e.each(t.points,function(t){i.push(t.value)})}),i}(),s=this.options.scaleOverride?{steps:this.options.scaleSteps,stepValue:this.options.scaleStepWidth,min:this.options.scaleStartValue,max:this.options.scaleStartValue+this.options.scaleSteps*this.options.scaleStepWidth}:e.calculateScaleRange(i,e.min([this.chart.width,this.chart.height])/2,this.options.scaleFontSize,this.options.scaleBeginAtZero,this.options.scaleIntegersOnly);e.extend(this.scale,s)},addData:function(t,i){this.scale.valuesCount++,e.each(t,function(t,e){var s=this.scale.getPointPosition(this.scale.valuesCount,this.scale.calculateCenterOffset(t));this.datasets[e].points.push(new this.PointClass({value:t,label:i,x:s.x,y:s.y,strokeColor:this.datasets[e].pointStrokeColor,fillColor:this.datasets[e].pointColor}))},this),this.scale.labels.push(i),this.reflow(),this.update()},removeData:function(){this.scale.valuesCount--,this.scale.labels.shift(),e.each(this.datasets,function(t){t.points.shift()},this),this.reflow(),this.update()},update:function(){this.eachPoints(function(t){t.save()}),this.reflow(),this.render()},reflow:function(){e.extend(this.scale,{width:this.chart.width,height:this.chart.height,size:e.min([this.chart.width,this.chart.height]),xCenter:this.chart.width/2,yCenter:this.chart.height/2}),this.updateScaleRange(this.datasets),this.scale.setScaleSize(),this.scale.buildYLabels()},draw:function(t){var i=t||1,s=this.chart.ctx;this.clear(),this.scale.draw(),e.each(this.datasets,function(t){e.each(t.points,function(t,e){t.hasValue()&&t.transition(this.scale.getPointPosition(e,this.scale.calculateCenterOffset(t.value)),i)},this),s.lineWidth=this.options.datasetStrokeWidth,s.strokeStyle=t.strokeColor,s.beginPath(),e.each(t.points,function(t,i){0===i?s.moveTo(t.x,t.y):s.lineTo(t.x,t.y)},this),s.closePath(),s.stroke(),s.fillStyle=t.fillColor,s.fill(),e.each(t.points,function(t){t.hasValue()&&t.draw()})},this)}})}.call(this);
        
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin stats:", (error.stack || error));
    }
})();

// JS assets for plugin status_line
(function () {
    try {
        // source: plugin/status_line/js/status_line.js
        $(function() {
            function StatusLineViewModel(parameters) {
                var self = this;
        
                self.status_line = ko.observable();
                self.show_status = ko.observable(false);
        
                self.initialMessage = function(data) {
                    self.status_line(data.status_line);
                    self.show_status(data.status_line ? true : false);
                };
        
                self.onStartupComplete = function() {
                    // WebApp started, get message if any
                    $.ajax({
                        url: API_BASEURL + "plugin/status_line",
                        type: "GET",
                        dataType: "json",
                        success: self.initialMessage
                    });
                }
        
                self.onDataUpdaterPluginMessage = function(plugin, data) {
                    if (plugin != "status_line") {
                        return;
                    }
        
                    self.status_line(data.status_line);
                    self.show_status(true);
                };
            }
        
            OCTOPRINT_VIEWMODELS.push([
                StatusLineViewModel,
                [ ],
                ["#status_line"]
            ]);
        })
        ;
        
    } catch (error) {
        log.error("Error in JS assets for plugin status_line:", (error.stack || error));
    }
})();

// JS assets for plugin systemcommandeditor
(function () {
    try {
        // source: plugin/systemcommandeditor/js/jquery.ui.sortable.js
        /*! jQuery UI - v1.9.2 - 2015-06-04
        * http://jqueryui.com
        * Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.sortable.js
        * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */
        
        (function( $, undefined ) {
        
        var uuid = 0,
        	runiqueId = /^ui-id-\d+$/;
        
        // prevent duplicate loading
        // this is only a problem because we proxy existing functions
        // and we don't want to double proxy them
        $.ui = $.ui || {};
        if ( $.ui.version ) {
        	return;
        }
        
        $.extend( $.ui, {
        	version: "1.9.2",
        
        	keyCode: {
        		BACKSPACE: 8,
        		COMMA: 188,
        		DELETE: 46,
        		DOWN: 40,
        		END: 35,
        		ENTER: 13,
        		ESCAPE: 27,
        		HOME: 36,
        		LEFT: 37,
        		NUMPAD_ADD: 107,
        		NUMPAD_DECIMAL: 110,
        		NUMPAD_DIVIDE: 111,
        		NUMPAD_ENTER: 108,
        		NUMPAD_MULTIPLY: 106,
        		NUMPAD_SUBTRACT: 109,
        		PAGE_DOWN: 34,
        		PAGE_UP: 33,
        		PERIOD: 190,
        		RIGHT: 39,
        		SPACE: 32,
        		TAB: 9,
        		UP: 38
        	}
        });
        
        // plugins
        $.fn.extend({
        	_focus: $.fn.focus,
        	focus: function( delay, fn ) {
        		return typeof delay === "number" ?
        			this.each(function() {
        				var elem = this;
        				setTimeout(function() {
        					$( elem ).focus();
        					if ( fn ) {
        						fn.call( elem );
        					}
        				}, delay );
        			}) :
        			this._focus.apply( this, arguments );
        	},
        
        	scrollParent: function() {
        		var scrollParent;
        		if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
        			scrollParent = this.parents().filter(function() {
        				return (/(relative|absolute|fixed)/).test($.css(this,'position')) && (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
        			}).eq(0);
        		} else {
        			scrollParent = this.parents().filter(function() {
        				return (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
        			}).eq(0);
        		}
        
        		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        	},
        
        	zIndex: function( zIndex ) {
        		if ( zIndex !== undefined ) {
        			return this.css( "zIndex", zIndex );
        		}
        
        		if ( this.length ) {
        			var elem = $( this[ 0 ] ), position, value;
        			while ( elem.length && elem[ 0 ] !== document ) {
        				// Ignore z-index if position is set to a value where z-index is ignored by the browser
        				// This makes behavior of this function consistent across browsers
        				// WebKit always returns auto if the element is positioned
        				position = elem.css( "position" );
        				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
        					// IE returns 0 when zIndex is not specified
        					// other browsers return a string
        					// we ignore the case of nested elements with an explicit value of 0
        					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
        					value = parseInt( elem.css( "zIndex" ), 10 );
        					if ( !isNaN( value ) && value !== 0 ) {
        						return value;
        					}
        				}
        				elem = elem.parent();
        			}
        		}
        
        		return 0;
        	},
        
        	uniqueId: function() {
        		return this.each(function() {
        			if ( !this.id ) {
        				this.id = "ui-id-" + (++uuid);
        			}
        		});
        	},
        
        	removeUniqueId: function() {
        		return this.each(function() {
        			if ( runiqueId.test( this.id ) ) {
        				$( this ).removeAttr( "id" );
        			}
        		});
        	}
        });
        
        // selectors
        function focusable( element, isTabIndexNotNaN ) {
        	var map, mapName, img,
        		nodeName = element.nodeName.toLowerCase();
        	if ( "area" === nodeName ) {
        		map = element.parentNode;
        		mapName = map.name;
        		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
        			return false;
        		}
        		img = $( "img[usemap=#" + mapName + "]" )[0];
        		return !!img && visible( img );
        	}
        	return ( /input|select|textarea|button|object/.test( nodeName ) ?
        		!element.disabled :
        		"a" === nodeName ?
        			element.href || isTabIndexNotNaN :
        			isTabIndexNotNaN) &&
        		// the element and all of its ancestors must be visible
        		visible( element );
        }
        
        function visible( element ) {
        	return $.expr.filters.visible( element ) &&
        		!$( element ).parents().andSelf().filter(function() {
        			return $.css( this, "visibility" ) === "hidden";
        		}).length;
        }
        
        $.extend( $.expr[ ":" ], {
        	data: $.expr.createPseudo ?
        		$.expr.createPseudo(function( dataName ) {
        			return function( elem ) {
        				return !!$.data( elem, dataName );
        			};
        		}) :
        		// support: jQuery <1.8
        		function( elem, i, match ) {
        			return !!$.data( elem, match[ 3 ] );
        		},
        
        	focusable: function( element ) {
        		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        	},
        
        	tabbable: function( element ) {
        		var tabIndex = $.attr( element, "tabindex" ),
        			isTabIndexNaN = isNaN( tabIndex );
        		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        	}
        });
        
        // support
        $(function() {
        	var body = document.body,
        		div = body.appendChild( div = document.createElement( "div" ) );
        
        	// access offsetHeight before setting the style to prevent a layout bug
        	// in IE 9 which causes the element to continue to take up space even
        	// after it is removed from the DOM (#8026)
        	div.offsetHeight;
        
        	$.extend( div.style, {
        		minHeight: "100px",
        		height: "auto",
        		padding: 0,
        		borderWidth: 0
        	});
        
        	$.support.minHeight = div.offsetHeight === 100;
        	$.support.selectstart = "onselectstart" in div;
        
        	// set display to none to avoid a layout bug in IE
        	// http://dev.jquery.com/ticket/4014
        	body.removeChild( div ).style.display = "none";
        });
        
        // support: jQuery <1.8
        if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
        	$.each( [ "Width", "Height" ], function( i, name ) {
        		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
        			type = name.toLowerCase(),
        			orig = {
        				innerWidth: $.fn.innerWidth,
        				innerHeight: $.fn.innerHeight,
        				outerWidth: $.fn.outerWidth,
        				outerHeight: $.fn.outerHeight
        			};
        
        		function reduce( elem, size, border, margin ) {
        			$.each( side, function() {
        				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
        				if ( border ) {
        					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
        				}
        				if ( margin ) {
        					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
        				}
        			});
        			return size;
        		}
        
        		$.fn[ "inner" + name ] = function( size ) {
        			if ( size === undefined ) {
        				return orig[ "inner" + name ].call( this );
        			}
        
        			return this.each(function() {
        				$( this ).css( type, reduce( this, size ) + "px" );
        			});
        		};
        
        		$.fn[ "outer" + name] = function( size, margin ) {
        			if ( typeof size !== "number" ) {
        				return orig[ "outer" + name ].call( this, size );
        			}
        
        			return this.each(function() {
        				$( this).css( type, reduce( this, size, true, margin ) + "px" );
        			});
        		};
        	});
        }
        
        // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
        if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
        	$.fn.removeData = (function( removeData ) {
        		return function( key ) {
        			if ( arguments.length ) {
        				return removeData.call( this, $.camelCase( key ) );
        			} else {
        				return removeData.call( this );
        			}
        		};
        	})( $.fn.removeData );
        }
        
        
        
        
        
        // deprecated
        
        (function() {
        	var uaMatch = /msie ([\w.]+)/.exec( navigator.userAgent.toLowerCase() ) || [];
        	$.ui.ie = uaMatch.length ? true : false;
        	$.ui.ie6 = parseFloat( uaMatch[ 1 ], 10 ) === 6;
        })();
        
        $.fn.extend({
        	disableSelection: function() {
        		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
        			".ui-disableSelection", function( event ) {
        				event.preventDefault();
        			});
        	},
        
        	enableSelection: function() {
        		return this.unbind( ".ui-disableSelection" );
        	}
        });
        
        $.extend( $.ui, {
        	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
        	plugin: {
        		add: function( module, option, set ) {
        			var i,
        				proto = $.ui[ module ].prototype;
        			for ( i in set ) {
        				proto.plugins[ i ] = proto.plugins[ i ] || [];
        				proto.plugins[ i ].push( [ option, set[ i ] ] );
        			}
        		},
        		call: function( instance, name, args ) {
        			var i,
        				set = instance.plugins[ name ];
        			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
        				return;
        			}
        
        			for ( i = 0; i < set.length; i++ ) {
        				if ( instance.options[ set[ i ][ 0 ] ] ) {
        					set[ i ][ 1 ].apply( instance.element, args );
        				}
        			}
        		}
        	},
        
        	contains: $.contains,
        
        	// only used by resizable
        	hasScroll: function( el, a ) {
        
        		//If overflow is hidden, the element might have extra content, but the user wants to hide it
        		if ( $( el ).css( "overflow" ) === "hidden") {
        			return false;
        		}
        
        		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
        			has = false;
        
        		if ( el[ scroll ] > 0 ) {
        			return true;
        		}
        
        		// TODO: determine which cases actually cause this to happen
        		// if the element doesn't have the scroll set, see if it's possible to
        		// set the scroll
        		el[ scroll ] = 1;
        		has = ( el[ scroll ] > 0 );
        		el[ scroll ] = 0;
        		return has;
        	},
        
        	// these are odd functions, fix the API or move into individual plugins
        	isOverAxis: function( x, reference, size ) {
        		//Determines when x coordinate is over "b" element axis
        		return ( x > reference ) && ( x < ( reference + size ) );
        	},
        	isOver: function( y, x, top, left, height, width ) {
        		//Determines when x, y coordinates is over "b" element
        		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
        	}
        });
        
        })( jQuery );
        (function( $, undefined ) {
        
        var uuid = 0,
        	slice = Array.prototype.slice,
        	_cleanData = $.cleanData;
        $.cleanData = function( elems ) {
        	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
        		try {
        			$( elem ).triggerHandler( "remove" );
        		// http://bugs.jquery.com/ticket/8235
        		} catch( e ) {}
        	}
        	_cleanData( elems );
        };
        
        $.widget = function( name, base, prototype ) {
        	var fullName, existingConstructor, constructor, basePrototype,
        		namespace = name.split( "." )[ 0 ];
        
        	name = name.split( "." )[ 1 ];
        	fullName = namespace + "-" + name;
        
        	if ( !prototype ) {
        		prototype = base;
        		base = $.Widget;
        	}
        
        	// create selector for plugin
        	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
        		return !!$.data( elem, fullName );
        	};
        
        	$[ namespace ] = $[ namespace ] || {};
        	existingConstructor = $[ namespace ][ name ];
        	constructor = $[ namespace ][ name ] = function( options, element ) {
        		// allow instantiation without "new" keyword
        		if ( !this._createWidget ) {
        			return new constructor( options, element );
        		}
        
        		// allow instantiation without initializing for simple inheritance
        		// must use "new" keyword (the code above always passes args)
        		if ( arguments.length ) {
        			this._createWidget( options, element );
        		}
        	};
        	// extend with the existing constructor to carry over any static properties
        	$.extend( constructor, existingConstructor, {
        		version: prototype.version,
        		// copy the object used to create the prototype in case we need to
        		// redefine the widget later
        		_proto: $.extend( {}, prototype ),
        		// track widgets that inherit from this widget in case this widget is
        		// redefined after a widget inherits from it
        		_childConstructors: []
        	});
        
        	basePrototype = new base();
        	// we need to make the options hash a property directly on the new instance
        	// otherwise we'll modify the options hash on the prototype that we're
        	// inheriting from
        	basePrototype.options = $.widget.extend( {}, basePrototype.options );
        	$.each( prototype, function( prop, value ) {
        		if ( $.isFunction( value ) ) {
        			prototype[ prop ] = (function() {
        				var _super = function() {
        						return base.prototype[ prop ].apply( this, arguments );
        					},
        					_superApply = function( args ) {
        						return base.prototype[ prop ].apply( this, args );
        					};
        				return function() {
        					var __super = this._super,
        						__superApply = this._superApply,
        						returnValue;
        
        					this._super = _super;
        					this._superApply = _superApply;
        
        					returnValue = value.apply( this, arguments );
        
        					this._super = __super;
        					this._superApply = __superApply;
        
        					return returnValue;
        				};
        			})();
        		}
        	});
        	constructor.prototype = $.widget.extend( basePrototype, {
        		// TODO: remove support for widgetEventPrefix
        		// always use the name + a colon as the prefix, e.g., draggable:start
        		// don't prefix for widgets that aren't DOM-based
        		widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
        	}, prototype, {
        		constructor: constructor,
        		namespace: namespace,
        		widgetName: name,
        		// TODO remove widgetBaseClass, see #8155
        		widgetBaseClass: fullName,
        		widgetFullName: fullName
        	});
        
        	// If this widget is being redefined then we need to find all widgets that
        	// are inheriting from it and redefine all of them so that they inherit from
        	// the new version of this widget. We're essentially trying to replace one
        	// level in the prototype chain.
        	if ( existingConstructor ) {
        		$.each( existingConstructor._childConstructors, function( i, child ) {
        			var childPrototype = child.prototype;
        
        			// redefine the child widget using the same prototype that was
        			// originally used, but inherit from the new version of the base
        			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
        		});
        		// remove the list of existing child constructors from the old constructor
        		// so the old child constructors can be garbage collected
        		delete existingConstructor._childConstructors;
        	} else {
        		base._childConstructors.push( constructor );
        	}
        
        	$.widget.bridge( name, constructor );
        };
        
        $.widget.extend = function( target ) {
        	var input = slice.call( arguments, 1 ),
        		inputIndex = 0,
        		inputLength = input.length,
        		key,
        		value;
        	for ( ; inputIndex < inputLength; inputIndex++ ) {
        		for ( key in input[ inputIndex ] ) {
        			value = input[ inputIndex ][ key ];
        			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
        				// Clone objects
        				if ( $.isPlainObject( value ) ) {
        					target[ key ] = $.isPlainObject( target[ key ] ) ?
        						$.widget.extend( {}, target[ key ], value ) :
        						// Don't extend strings, arrays, etc. with objects
        						$.widget.extend( {}, value );
        				// Copy everything else by reference
        				} else {
        					target[ key ] = value;
        				}
        			}
        		}
        	}
        	return target;
        };
        
        $.widget.bridge = function( name, object ) {
        	var fullName = object.prototype.widgetFullName || name;
        	$.fn[ name ] = function( options ) {
        		var isMethodCall = typeof options === "string",
        			args = slice.call( arguments, 1 ),
        			returnValue = this;
        
        		// allow multiple hashes to be passed on init
        		options = !isMethodCall && args.length ?
        			$.widget.extend.apply( null, [ options ].concat(args) ) :
        			options;
        
        		if ( isMethodCall ) {
        			this.each(function() {
        				var methodValue,
        					instance = $.data( this, fullName );
        				if ( !instance ) {
        					return $.error( "cannot call methods on " + name + " prior to initialization; " +
        						"attempted to call method '" + options + "'" );
        				}
        				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
        					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
        				}
        				methodValue = instance[ options ].apply( instance, args );
        				if ( methodValue !== instance && methodValue !== undefined ) {
        					returnValue = methodValue && methodValue.jquery ?
        						returnValue.pushStack( methodValue.get() ) :
        						methodValue;
        					return false;
        				}
        			});
        		} else {
        			this.each(function() {
        				var instance = $.data( this, fullName );
        				if ( instance ) {
        					instance.option( options || {} )._init();
        				} else {
        					$.data( this, fullName, new object( options, this ) );
        				}
        			});
        		}
        
        		return returnValue;
        	};
        };
        
        $.Widget = function( /* options, element */ ) {};
        $.Widget._childConstructors = [];
        
        $.Widget.prototype = {
        	widgetName: "widget",
        	widgetEventPrefix: "",
        	defaultElement: "<div>",
        	options: {
        		disabled: false,
        
        		// callbacks
        		create: null
        	},
        	_createWidget: function( options, element ) {
        		element = $( element || this.defaultElement || this )[ 0 ];
        		this.element = $( element );
        		this.uuid = uuid++;
        		this.eventNamespace = "." + this.widgetName + this.uuid;
        		this.options = $.widget.extend( {},
        			this.options,
        			this._getCreateOptions(),
        			options );
        
        		this.bindings = $();
        		this.hoverable = $();
        		this.focusable = $();
        
        		if ( element !== this ) {
        			// 1.9 BC for #7810
        			// TODO remove dual storage
        			$.data( element, this.widgetName, this );
        			$.data( element, this.widgetFullName, this );
        			this._on( true, this.element, {
        				remove: function( event ) {
        					if ( event.target === element ) {
        						this.destroy();
        					}
        				}
        			});
        			this.document = $( element.style ?
        				// element within the document
        				element.ownerDocument :
        				// element is window or document
        				element.document || element );
        			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
        		}
        
        		this._create();
        		this._trigger( "create", null, this._getCreateEventData() );
        		this._init();
        	},
        	_getCreateOptions: $.noop,
        	_getCreateEventData: $.noop,
        	_create: $.noop,
        	_init: $.noop,
        
        	destroy: function() {
        		this._destroy();
        		// we can probably remove the unbind calls in 2.0
        		// all event bindings should go through this._on()
        		this.element
        			.unbind( this.eventNamespace )
        			// 1.9 BC for #7810
        			// TODO remove dual storage
        			.removeData( this.widgetName )
        			.removeData( this.widgetFullName )
        			// support: jquery <1.6.3
        			// http://bugs.jquery.com/ticket/9413
        			.removeData( $.camelCase( this.widgetFullName ) );
        		this.widget()
        			.unbind( this.eventNamespace )
        			.removeAttr( "aria-disabled" )
        			.removeClass(
        				this.widgetFullName + "-disabled " +
        				"ui-state-disabled" );
        
        		// clean up events and states
        		this.bindings.unbind( this.eventNamespace );
        		this.hoverable.removeClass( "ui-state-hover" );
        		this.focusable.removeClass( "ui-state-focus" );
        	},
        	_destroy: $.noop,
        
        	widget: function() {
        		return this.element;
        	},
        
        	option: function( key, value ) {
        		var options = key,
        			parts,
        			curOption,
        			i;
        
        		if ( arguments.length === 0 ) {
        			// don't return a reference to the internal hash
        			return $.widget.extend( {}, this.options );
        		}
        
        		if ( typeof key === "string" ) {
        			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        			options = {};
        			parts = key.split( "." );
        			key = parts.shift();
        			if ( parts.length ) {
        				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
        				for ( i = 0; i < parts.length - 1; i++ ) {
        					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
        					curOption = curOption[ parts[ i ] ];
        				}
        				key = parts.pop();
        				if ( value === undefined ) {
        					return curOption[ key ] === undefined ? null : curOption[ key ];
        				}
        				curOption[ key ] = value;
        			} else {
        				if ( value === undefined ) {
        					return this.options[ key ] === undefined ? null : this.options[ key ];
        				}
        				options[ key ] = value;
        			}
        		}
        
        		this._setOptions( options );
        
        		return this;
        	},
        	_setOptions: function( options ) {
        		var key;
        
        		for ( key in options ) {
        			this._setOption( key, options[ key ] );
        		}
        
        		return this;
        	},
        	_setOption: function( key, value ) {
        		this.options[ key ] = value;
        
        		if ( key === "disabled" ) {
        			this.widget()
        				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
        				.attr( "aria-disabled", value );
        			this.hoverable.removeClass( "ui-state-hover" );
        			this.focusable.removeClass( "ui-state-focus" );
        		}
        
        		return this;
        	},
        
        	enable: function() {
        		return this._setOption( "disabled", false );
        	},
        	disable: function() {
        		return this._setOption( "disabled", true );
        	},
        
        	_on: function( suppressDisabledCheck, element, handlers ) {
        		var delegateElement,
        			instance = this;
        
        		// no suppressDisabledCheck flag, shuffle arguments
        		if ( typeof suppressDisabledCheck !== "boolean" ) {
        			handlers = element;
        			element = suppressDisabledCheck;
        			suppressDisabledCheck = false;
        		}
        
        		// no element argument, shuffle and use this.element
        		if ( !handlers ) {
        			handlers = element;
        			element = this.element;
        			delegateElement = this.widget();
        		} else {
        			// accept selectors, DOM elements
        			element = delegateElement = $( element );
        			this.bindings = this.bindings.add( element );
        		}
        
        		$.each( handlers, function( event, handler ) {
        			function handlerProxy() {
        				// allow widgets to customize the disabled handling
        				// - disabled as an array instead of boolean
        				// - disabled class as method for disabling individual parts
        				if ( !suppressDisabledCheck &&
        						( instance.options.disabled === true ||
        							$( this ).hasClass( "ui-state-disabled" ) ) ) {
        					return;
        				}
        				return ( typeof handler === "string" ? instance[ handler ] : handler )
        					.apply( instance, arguments );
        			}
        
        			// copy the guid so direct unbinding works
        			if ( typeof handler !== "string" ) {
        				handlerProxy.guid = handler.guid =
        					handler.guid || handlerProxy.guid || $.guid++;
        			}
        
        			var match = event.match( /^(\w+)\s*(.*)$/ ),
        				eventName = match[1] + instance.eventNamespace,
        				selector = match[2];
        			if ( selector ) {
        				delegateElement.delegate( selector, eventName, handlerProxy );
        			} else {
        				element.bind( eventName, handlerProxy );
        			}
        		});
        	},
        
        	_off: function( element, eventName ) {
        		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        		element.unbind( eventName ).undelegate( eventName );
        	},
        
        	_delay: function( handler, delay ) {
        		function handlerProxy() {
        			return ( typeof handler === "string" ? instance[ handler ] : handler )
        				.apply( instance, arguments );
        		}
        		var instance = this;
        		return setTimeout( handlerProxy, delay || 0 );
        	},
        
        	_hoverable: function( element ) {
        		this.hoverable = this.hoverable.add( element );
        		this._on( element, {
        			mouseenter: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-hover" );
        			},
        			mouseleave: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-hover" );
        			}
        		});
        	},
        
        	_focusable: function( element ) {
        		this.focusable = this.focusable.add( element );
        		this._on( element, {
        			focusin: function( event ) {
        				$( event.currentTarget ).addClass( "ui-state-focus" );
        			},
        			focusout: function( event ) {
        				$( event.currentTarget ).removeClass( "ui-state-focus" );
        			}
        		});
        	},
        
        	_trigger: function( type, event, data ) {
        		var prop, orig,
        			callback = this.options[ type ];
        
        		data = data || {};
        		event = $.Event( event );
        		event.type = ( type === this.widgetEventPrefix ?
        			type :
        			this.widgetEventPrefix + type ).toLowerCase();
        		// the original event may come from any element
        		// so we need to reset the target on the new event
        		event.target = this.element[ 0 ];
        
        		// copy original event properties over to the new event
        		orig = event.originalEvent;
        		if ( orig ) {
        			for ( prop in orig ) {
        				if ( !( prop in event ) ) {
        					event[ prop ] = orig[ prop ];
        				}
        			}
        		}
        
        		this.element.trigger( event, data );
        		return !( $.isFunction( callback ) &&
        			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
        			event.isDefaultPrevented() );
        	}
        };
        
        $.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
        	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        		if ( typeof options === "string" ) {
        			options = { effect: options };
        		}
        		var hasOptions,
        			effectName = !options ?
        				method :
        				options === true || typeof options === "number" ?
        					defaultEffect :
        					options.effect || defaultEffect;
        		options = options || {};
        		if ( typeof options === "number" ) {
        			options = { duration: options };
        		}
        		hasOptions = !$.isEmptyObject( options );
        		options.complete = callback;
        		if ( options.delay ) {
        			element.delay( options.delay );
        		}
        		if ( hasOptions && $.effects && ( $.effects.effect[ effectName ] || $.uiBackCompat !== false && $.effects[ effectName ] ) ) {
        			element[ method ]( options );
        		} else if ( effectName !== method && element[ effectName ] ) {
        			element[ effectName ]( options.duration, options.easing, callback );
        		} else {
        			element.queue(function( next ) {
        				$( this )[ method ]();
        				if ( callback ) {
        					callback.call( element[ 0 ] );
        				}
        				next();
        			});
        		}
        	};
        });
        
        // DEPRECATED
        if ( $.uiBackCompat !== false ) {
        	$.Widget.prototype._getCreateOptions = function() {
        		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
        	};
        }
        
        })( jQuery );
        (function( $, undefined ) {
        
        var mouseHandled = false;
        $( document ).mouseup( function( e ) {
        	mouseHandled = false;
        });
        
        $.widget("ui.mouse", {
        	version: "1.9.2",
        	options: {
        		cancel: 'input,textarea,button,select,option',
        		distance: 1,
        		delay: 0
        	},
        	_mouseInit: function() {
        		var that = this;
        
        		this.element
        			.bind('mousedown.'+this.widgetName, function(event) {
        				return that._mouseDown(event);
        			})
        			.bind('click.'+this.widgetName, function(event) {
        				if (true === $.data(event.target, that.widgetName + '.preventClickEvent')) {
        					$.removeData(event.target, that.widgetName + '.preventClickEvent');
        					event.stopImmediatePropagation();
        					return false;
        				}
        			});
        
        		this.started = false;
        	},
        
        	// TODO: make sure destroying one instance of mouse doesn't mess with
        	// other instances of mouse
        	_mouseDestroy: function() {
        		this.element.unbind('.'+this.widgetName);
        		if ( this._mouseMoveDelegate ) {
        			$(document)
        				.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
        				.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
        		}
        	},
        
        	_mouseDown: function(event) {
        		// don't let more than one widget handle mouseStart
        		if( mouseHandled ) { return; }
        
        		// we may have missed mouseup (out of window)
        		(this._mouseStarted && this._mouseUp(event));
        
        		this._mouseDownEvent = event;
        
        		var that = this,
        			btnIsLeft = (event.which === 1),
        			// event.target.nodeName works around a bug in IE 8 with
        			// disabled inputs (#7620)
        			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
        		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
        			return true;
        		}
        
        		this.mouseDelayMet = !this.options.delay;
        		if (!this.mouseDelayMet) {
        			this._mouseDelayTimer = setTimeout(function() {
        				that.mouseDelayMet = true;
        			}, this.options.delay);
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted = (this._mouseStart(event) !== false);
        			if (!this._mouseStarted) {
        				event.preventDefault();
        				return true;
        			}
        		}
        
        		// Click event may never have fired (Gecko & Opera)
        		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
        			$.removeData(event.target, this.widgetName + '.preventClickEvent');
        		}
        
        		// these delegates are required to keep context
        		this._mouseMoveDelegate = function(event) {
        			return that._mouseMove(event);
        		};
        		this._mouseUpDelegate = function(event) {
        			return that._mouseUp(event);
        		};
        		$(document)
        			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
        			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);
        
        		event.preventDefault();
        
        		mouseHandled = true;
        		return true;
        	},
        
        	_mouseMove: function(event) {
        		// IE mouseup check - mouseup happened when mouse was out of window
        		if ($.ui.ie && !(document.documentMode >= 9) && !event.button) {
        			return this._mouseUp(event);
        		}
        
        		if (this._mouseStarted) {
        			this._mouseDrag(event);
        			return event.preventDefault();
        		}
        
        		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
        			this._mouseStarted =
        				(this._mouseStart(this._mouseDownEvent, event) !== false);
        			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
        		}
        
        		return !this._mouseStarted;
        	},
        
        	_mouseUp: function(event) {
        		$(document)
        			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
        			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
        
        		if (this._mouseStarted) {
        			this._mouseStarted = false;
        
        			if (event.target === this._mouseDownEvent.target) {
        				$.data(event.target, this.widgetName + '.preventClickEvent', true);
        			}
        
        			this._mouseStop(event);
        		}
        
        		return false;
        	},
        
        	_mouseDistanceMet: function(event) {
        		return (Math.max(
        				Math.abs(this._mouseDownEvent.pageX - event.pageX),
        				Math.abs(this._mouseDownEvent.pageY - event.pageY)
        			) >= this.options.distance
        		);
        	},
        
        	_mouseDelayMet: function(event) {
        		return this.mouseDelayMet;
        	},
        
        	// These are placeholder methods, to be overriden by extending plugin
        	_mouseStart: function(event) {},
        	_mouseDrag: function(event) {},
        	_mouseStop: function(event) {},
        	_mouseCapture: function(event) { return true; }
        });
        
        })(jQuery);
        (function( $, undefined ) {
        
        $.widget("ui.sortable", $.ui.mouse, {
        	version: "1.9.2",
        	widgetEventPrefix: "sort",
        	ready: false,
        	options: {
        		appendTo: "parent",
        		axis: false,
        		connectWith: false,
        		containment: false,
        		cursor: 'auto',
        		cursorAt: false,
        		dropOnEmpty: true,
        		forcePlaceholderSize: false,
        		forceHelperSize: false,
        		grid: false,
        		handle: false,
        		helper: "original",
        		items: '> *',
        		opacity: false,
        		placeholder: false,
        		revert: false,
        		scroll: true,
        		scrollSensitivity: 20,
        		scrollSpeed: 20,
        		scope: "default",
        		tolerance: "intersect",
        		zIndex: 1000
        	},
        	_create: function() {
        
        		var o = this.options;
        		this.containerCache = {};
        		this.element.addClass("ui-sortable");
        
        		//Get the items
        		this.refresh();
        
        		//Let's determine if the items are being displayed horizontally
        		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;
        
        		//Let's determine the parent's offset
        		this.offset = this.element.offset();
        
        		//Initialize mouse events for interaction
        		this._mouseInit();
        
        		//We're ready to go
        		this.ready = true
        
        	},
        
        	_destroy: function() {
        		this.element
        			.removeClass("ui-sortable ui-sortable-disabled");
        		this._mouseDestroy();
        
        		for ( var i = this.items.length - 1; i >= 0; i-- )
        			this.items[i].item.removeData(this.widgetName + "-item");
        
        		return this;
        	},
        
        	_setOption: function(key, value){
        		if ( key === "disabled" ) {
        			this.options[ key ] = value;
        
        			this.widget().toggleClass( "ui-sortable-disabled", !!value );
        		} else {
        			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
        			$.Widget.prototype._setOption.apply(this, arguments);
        		}
        	},
        
        	_mouseCapture: function(event, overrideHandle) {
        		var that = this;
        
        		if (this.reverting) {
        			return false;
        		}
        
        		if(this.options.disabled || this.options.type == 'static') return false;
        
        		//We have to refresh the items data once first
        		this._refreshItems(event);
        
        		//Find out if the clicked node (or one of its parents) is a actual item in this.items
        		var currentItem = null, nodes = $(event.target).parents().each(function() {
        			if($.data(this, that.widgetName + '-item') == that) {
        				currentItem = $(this);
        				return false;
        			}
        		});
        		if($.data(event.target, that.widgetName + '-item') == that) currentItem = $(event.target);
        
        		if(!currentItem) return false;
        		if(this.options.handle && !overrideHandle) {
        			var validHandle = false;
        
        			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
        			if(!validHandle) return false;
        		}
        
        		this.currentItem = currentItem;
        		this._removeCurrentsFromItems();
        		return true;
        
        	},
        
        	_mouseStart: function(event, overrideHandle, noActivation) {
        
        		var o = this.options;
        		this.currentContainer = this;
        
        		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
        		this.refreshPositions();
        
        		//Create and append the visible helper
        		this.helper = this._createHelper(event);
        
        		//Cache the helper size
        		this._cacheHelperProportions();
        
        		/*
        		 * - Position generation -
        		 * This block generates everything position related - it's the core of draggables.
        		 */
        
        		//Cache the margins of the original element
        		this._cacheMargins();
        
        		//Get the next scrolling parent
        		this.scrollParent = this.helper.scrollParent();
        
        		//The element's absolute position on the page minus margins
        		this.offset = this.currentItem.offset();
        		this.offset = {
        			top: this.offset.top - this.margins.top,
        			left: this.offset.left - this.margins.left
        		};
        
        		$.extend(this.offset, {
        			click: { //Where the click happened, relative to the element
        				left: event.pageX - this.offset.left,
        				top: event.pageY - this.offset.top
        			},
        			parent: this._getParentOffset(),
        			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
        		});
        
        		// Only after we got the offset, we can change the helper's position to absolute
        		// TODO: Still need to figure out a way to make relative sorting possible
        		this.helper.css("position", "absolute");
        		this.cssPosition = this.helper.css("position");
        
        		//Generate the original position
        		this.originalPosition = this._generatePosition(event);
        		this.originalPageX = event.pageX;
        		this.originalPageY = event.pageY;
        
        		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
        		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
        
        		//Cache the former DOM position
        		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };
        
        		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
        		if(this.helper[0] != this.currentItem[0]) {
        			this.currentItem.hide();
        		}
        
        		//Create the placeholder
        		this._createPlaceholder();
        
        		//Set a containment if given in the options
        		if(o.containment)
        			this._setContainment();
        
        		if(o.cursor) { // cursor option
        			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
        			$('body').css("cursor", o.cursor);
        		}
        
        		if(o.opacity) { // opacity option
        			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
        			this.helper.css("opacity", o.opacity);
        		}
        
        		if(o.zIndex) { // zIndex option
        			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
        			this.helper.css("zIndex", o.zIndex);
        		}
        
        		//Prepare scrolling
        		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
        			this.overflowOffset = this.scrollParent.offset();
        
        		//Call callbacks
        		this._trigger("start", event, this._uiHash());
        
        		//Recache the helper size
        		if(!this._preserveHelperProportions)
        			this._cacheHelperProportions();
        
        
        		//Post 'activate' events to possible containers
        		if(!noActivation) {
        			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, this._uiHash(this)); }
        		}
        
        		//Prepare possible droppables
        		if($.ui.ddmanager)
        			$.ui.ddmanager.current = this;
        
        		if ($.ui.ddmanager && !o.dropBehaviour)
        			$.ui.ddmanager.prepareOffsets(this, event);
        
        		this.dragging = true;
        
        		this.helper.addClass("ui-sortable-helper");
        		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
        		return true;
        
        	},
        
        	_mouseDrag: function(event) {
        
        		//Compute the helpers position
        		this.position = this._generatePosition(event);
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		if (!this.lastPositionAbs) {
        			this.lastPositionAbs = this.positionAbs;
        		}
        
        		//Do scrolling
        		if(this.options.scroll) {
        			var o = this.options, scrolled = false;
        			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {
        
        				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
        				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
        					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
        
        				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
        				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
        					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
        
        			} else {
        
        				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
        					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
        				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
        					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
        
        				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
        					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
        				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
        					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
        
        			}
        
        			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
        				$.ui.ddmanager.prepareOffsets(this, event);
        		}
        
        		//Regenerate the absolute position used for position checks
        		this.positionAbs = this._convertPositionTo("absolute");
        
        		//Set the helper position
        		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
        		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
        
        		//Rearrange
        		for (var i = this.items.length - 1; i >= 0; i--) {
        
        			//Cache variables and intersection, continue if no intersection
        			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
        			if (!intersection) continue;
        
        			// Only put the placeholder inside the current Container, skip all
        			// items form other containers. This works because when moving
        			// an item from one container to another the
        			// currentContainer is switched before the placeholder is moved.
        			//
        			// Without this moving items in "sub-sortables" can cause the placeholder to jitter
        			// beetween the outer and inner container.
        			if (item.instance !== this.currentContainer) continue;
        
        			if (itemElement != this.currentItem[0] //cannot intersect with itself
        				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
        				&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
        				&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
        				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
        			) {
        
        				this.direction = intersection == 1 ? "down" : "up";
        
        				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
        					this._rearrange(event, item);
        				} else {
        					break;
        				}
        
        				this._trigger("change", event, this._uiHash());
        				break;
        			}
        		}
        
        		//Post events to containers
        		this._contactContainers(event);
        
        		//Interconnect with droppables
        		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);
        
        		//Call callbacks
        		this._trigger('sort', event, this._uiHash());
        
        		this.lastPositionAbs = this.positionAbs;
        		return false;
        
        	},
        
        	_mouseStop: function(event, noPropagation) {
        
        		if(!event) return;
        
        		//If we are using droppables, inform the manager about the drop
        		if ($.ui.ddmanager && !this.options.dropBehaviour)
        			$.ui.ddmanager.drop(this, event);
        
        		if(this.options.revert) {
        			var that = this;
        			var cur = this.placeholder.offset();
        
        			this.reverting = true;
        
        			$(this.helper).animate({
        				left: cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
        				top: cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
        			}, parseInt(this.options.revert, 10) || 500, function() {
        				that._clear(event);
        			});
        		} else {
        			this._clear(event, noPropagation);
        		}
        
        		return false;
        
        	},
        
        	cancel: function() {
        
        		if(this.dragging) {
        
        			this._mouseUp({ target: null });
        
        			if(this.options.helper == "original")
        				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        			else
        				this.currentItem.show();
        
        			//Post deactivating events to containers
        			for (var i = this.containers.length - 1; i >= 0; i--){
        				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", null, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		if (this.placeholder) {
        			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();
        
        			$.extend(this, {
        				helper: null,
        				dragging: false,
        				reverting: false,
        				_noFinalSort: null
        			});
        
        			if(this.domPosition.prev) {
        				$(this.domPosition.prev).after(this.currentItem);
        			} else {
        				$(this.domPosition.parent).prepend(this.currentItem);
        			}
        		}
        
        		return this;
        
        	},
        
        	serialize: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected);
        		var str = []; o = o || {};
        
        		$(items).each(function() {
        			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
        			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
        		});
        
        		if(!str.length && o.key) {
        			str.push(o.key + '=');
        		}
        
        		return str.join('&');
        
        	},
        
        	toArray: function(o) {
        
        		var items = this._getItemsAsjQuery(o && o.connected);
        		var ret = []; o = o || {};
        
        		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
        		return ret;
        
        	},
        
        	/* Be careful with the following core functions */
        	_intersectsWith: function(item) {
        
        		var x1 = this.positionAbs.left,
        			x2 = x1 + this.helperProportions.width,
        			y1 = this.positionAbs.top,
        			y2 = y1 + this.helperProportions.height;
        
        		var l = item.left,
        			r = l + item.width,
        			t = item.top,
        			b = t + item.height;
        
        		var dyClick = this.offset.click.top,
        			dxClick = this.offset.click.left;
        
        		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;
        
        		if(	   this.options.tolerance == "pointer"
        			|| this.options.forcePointerForContainers
        			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
        		) {
        			return isOverElement;
        		} else {
        
        			return (l < x1 + (this.helperProportions.width / 2) // Right Half
        				&& x2 - (this.helperProportions.width / 2) < r // Left Half
        				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
        				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half
        
        		}
        	},
        
        	_intersectsWithPointer: function(item) {
        
        		var isOverElementHeight = (this.options.axis === 'x') || $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
        			isOverElementWidth = (this.options.axis === 'y') || $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
        			isOverElement = isOverElementHeight && isOverElementWidth,
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (!isOverElement)
        			return false;
        
        		return this.floating ?
        			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
        			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );
        
        	},
        
        	_intersectsWithSides: function(item) {
        
        		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
        			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
        			verticalDirection = this._getDragVerticalDirection(),
        			horizontalDirection = this._getDragHorizontalDirection();
        
        		if (this.floating && horizontalDirection) {
        			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
        		} else {
        			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
        		}
        
        	},
        
        	_getDragVerticalDirection: function() {
        		var delta = this.positionAbs.top - this.lastPositionAbs.top;
        		return delta != 0 && (delta > 0 ? "down" : "up");
        	},
        
        	_getDragHorizontalDirection: function() {
        		var delta = this.positionAbs.left - this.lastPositionAbs.left;
        		return delta != 0 && (delta > 0 ? "right" : "left");
        	},
        
        	refresh: function(event) {
        		this._refreshItems(event);
        		this.refreshPositions();
        		return this;
        	},
        
        	_connectWith: function() {
        		var options = this.options;
        		return options.connectWith.constructor == String
        			? [options.connectWith]
        			: options.connectWith;
        	},
        
        	_getItemsAsjQuery: function(connected) {
        
        		var items = [];
        		var queries = [];
        		var connectWith = this._connectWith();
        
        		if(connectWith && connected) {
        			for (var i = connectWith.length - 1; i >= 0; i--){
        				var cur = $(connectWith[i]);
        				for (var j = cur.length - 1; j >= 0; j--){
        					var inst = $.data(cur[j], this.widgetName);
        					if(inst && inst != this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
        					}
        				};
        			};
        		}
        
        		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);
        
        		for (var i = queries.length - 1; i >= 0; i--){
        			queries[i][0].each(function() {
        				items.push(this);
        			});
        		};
        
        		return $(items);
        
        	},
        
        	_removeCurrentsFromItems: function() {
        
        		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");
        
        		this.items = $.grep(this.items, function (item) {
        			for (var j=0; j < list.length; j++) {
        				if(list[j] == item.item[0])
        					return false;
        			};
        			return true;
        		});
        
        	},
        
        	_refreshItems: function(event) {
        
        		this.items = [];
        		this.containers = [this];
        		var items = this.items;
        		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
        		var connectWith = this._connectWith();
        
        		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
        			for (var i = connectWith.length - 1; i >= 0; i--){
        				var cur = $(connectWith[i]);
        				for (var j = cur.length - 1; j >= 0; j--){
        					var inst = $.data(cur[j], this.widgetName);
        					if(inst && inst != this && !inst.options.disabled) {
        						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
        						this.containers.push(inst);
        					}
        				};
        			};
        		}
        
        		for (var i = queries.length - 1; i >= 0; i--) {
        			var targetData = queries[i][1];
        			var _queries = queries[i][0];
        
        			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
        				var item = $(_queries[j]);
        
        				item.data(this.widgetName + '-item', targetData); // Data for target checking (mouse manager)
        
        				items.push({
        					item: item,
        					instance: targetData,
        					width: 0, height: 0,
        					left: 0, top: 0
        				});
        			};
        		};
        
        	},
        
        	refreshPositions: function(fast) {
        
        		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
        		if(this.offsetParent && this.helper) {
        			this.offset.parent = this._getParentOffset();
        		}
        
        		for (var i = this.items.length - 1; i >= 0; i--){
        			var item = this.items[i];
        
        			//We ignore calculating positions of all connected containers when we're not over them
        			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
        				continue;
        
        			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
        
        			if (!fast) {
        				item.width = t.outerWidth();
        				item.height = t.outerHeight();
        			}
        
        			var p = t.offset();
        			item.left = p.left;
        			item.top = p.top;
        		};
        
        		if(this.options.custom && this.options.custom.refreshContainers) {
        			this.options.custom.refreshContainers.call(this);
        		} else {
        			for (var i = this.containers.length - 1; i >= 0; i--){
        				var p = this.containers[i].element.offset();
        				this.containers[i].containerCache.left = p.left;
        				this.containers[i].containerCache.top = p.top;
        				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
        				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
        			};
        		}
        
        		return this;
        	},
        
        	_createPlaceholder: function(that) {
        		that = that || this;
        		var o = that.options;
        
        		if(!o.placeholder || o.placeholder.constructor == String) {
        			var className = o.placeholder;
        			o.placeholder = {
        				element: function() {
        
        					var el = $(document.createElement(that.currentItem[0].nodeName))
        						.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
        						.removeClass("ui-sortable-helper")[0];
        
        					if(!className)
        						el.style.visibility = "hidden";
        
        					return el;
        				},
        				update: function(container, p) {
        
        					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
        					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
        					if(className && !o.forcePlaceholderSize) return;
        
        					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
        					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css('paddingTop')||0, 10) - parseInt(that.currentItem.css('paddingBottom')||0, 10)); };
        					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css('paddingLeft')||0, 10) - parseInt(that.currentItem.css('paddingRight')||0, 10)); };
        				}
        			};
        		}
        
        		//Create the placeholder
        		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));
        
        		//Append it after the actual current item
        		that.currentItem.after(that.placeholder);
        
        		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
        		o.placeholder.update(that, that.placeholder);
        
        	},
        
        	_contactContainers: function(event) {
        
        		// get innermost container that intersects with item
        		var innermostContainer = null, innermostIndex = null;
        
        
        		for (var i = this.containers.length - 1; i >= 0; i--){
        
        			// never consider a container that's located within the item itself
        			if($.contains(this.currentItem[0], this.containers[i].element[0]))
        				continue;
        
        			if(this._intersectsWith(this.containers[i].containerCache)) {
        
        				// if we've already found a container and it's more "inner" than this, then continue
        				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0]))
        					continue;
        
        				innermostContainer = this.containers[i];
        				innermostIndex = i;
        
        			} else {
        				// container doesn't intersect. trigger "out" event if necessary
        				if(this.containers[i].containerCache.over) {
        					this.containers[i]._trigger("out", event, this._uiHash(this));
        					this.containers[i].containerCache.over = 0;
        				}
        			}
        
        		}
        
        		// if no intersecting containers found, return
        		if(!innermostContainer) return;
        
        		// move the item into the container if it's not there already
        		if(this.containers.length === 1) {
        			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        			this.containers[innermostIndex].containerCache.over = 1;
        		} else {
        
        			//When entering a new container, we will find the item with the least distance and append our item near it
        			var dist = 10000; var itemWithLeastDistance = null;
        			var posProperty = this.containers[innermostIndex].floating ? 'left' : 'top';
        			var sizeProperty = this.containers[innermostIndex].floating ? 'width' : 'height';
        			var base = this.positionAbs[posProperty] + this.offset.click[posProperty];
        			for (var j = this.items.length - 1; j >= 0; j--) {
        				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue;
        				if(this.items[j].item[0] == this.currentItem[0]) continue;
        				var cur = this.items[j].item.offset()[posProperty];
        				var nearBottom = false;
        				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
        					nearBottom = true;
        					cur += this.items[j][sizeProperty];
        				}
        
        				if(Math.abs(cur - base) < dist) {
        					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
        					this.direction = nearBottom ? "up": "down";
        				}
        			}
        
        			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
        				return;
        
        			this.currentContainer = this.containers[innermostIndex];
        			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
        			this._trigger("change", event, this._uiHash());
        			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
        
        			//Update the placeholder
        			this.options.placeholder.update(this.currentContainer, this.placeholder);
        
        			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
        			this.containers[innermostIndex].containerCache.over = 1;
        		}
        
        
        	},
        
        	_createHelper: function(event) {
        
        		var o = this.options;
        		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);
        
        		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
        			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
        
        		if(helper[0] == this.currentItem[0])
        			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
        
        		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
        		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());
        
        		return helper;
        
        	},
        
        	_adjustOffsetFromHelper: function(obj) {
        		if (typeof obj == 'string') {
        			obj = obj.split(' ');
        		}
        		if ($.isArray(obj)) {
        			obj = {left: +obj[0], top: +obj[1] || 0};
        		}
        		if ('left' in obj) {
        			this.offset.click.left = obj.left + this.margins.left;
        		}
        		if ('right' in obj) {
        			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        		}
        		if ('top' in obj) {
        			this.offset.click.top = obj.top + this.margins.top;
        		}
        		if ('bottom' in obj) {
        			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        		}
        	},
        
        	_getParentOffset: function() {
        
        
        		//Get the offsetParent and cache its position
        		this.offsetParent = this.helper.offsetParent();
        		var po = this.offsetParent.offset();
        
        		// This is a special case where we need to modify a offset calculated on start, since the following happened:
        		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
        		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
        		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
        		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
        			po.left += this.scrollParent.scrollLeft();
        			po.top += this.scrollParent.scrollTop();
        		}
        
        		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
        		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
        			po = { top: 0, left: 0 };
        
        		return {
        			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
        			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
        		};
        
        	},
        
        	_getRelativeOffset: function() {
        
        		if(this.cssPosition == "relative") {
        			var p = this.currentItem.position();
        			return {
        				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
        				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
        			};
        		} else {
        			return { top: 0, left: 0 };
        		}
        
        	},
        
        	_cacheMargins: function() {
        		this.margins = {
        			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
        			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
        		};
        	},
        
        	_cacheHelperProportions: function() {
        		this.helperProportions = {
        			width: this.helper.outerWidth(),
        			height: this.helper.outerHeight()
        		};
        	},
        
        	_setContainment: function() {
        
        		var o = this.options;
        		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
        		if(o.containment == 'document' || o.containment == 'window') this.containment = [
        			0 - this.offset.relative.left - this.offset.parent.left,
        			0 - this.offset.relative.top - this.offset.parent.top,
        			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
        			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
        		];
        
        		if(!(/^(document|window|parent)$/).test(o.containment)) {
        			var ce = $(o.containment)[0];
        			var co = $(o.containment).offset();
        			var over = ($(ce).css("overflow") != 'hidden');
        
        			this.containment = [
        				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
        				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
        				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
        				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
        			];
        		}
        
        	},
        
        	_convertPositionTo: function(d, pos) {
        
        		if(!pos) pos = this.position;
        		var mod = d == "absolute" ? 1 : -1;
        		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		return {
        			top: (
        				pos.top																	// The absolute mouse position
        				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
        				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
        				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
        			),
        			left: (
        				pos.left																// The absolute mouse position
        				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
        				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
        				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
        			)
        		};
        
        	},
        
        	_generatePosition: function(event) {
        
        		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
        
        		// This is another very weird special case that only happens for relative elements:
        		// 1. If the css position is relative
        		// 2. and the scroll parent is the document or similar to the offset parent
        		// we have to refresh the relative offset during the scroll so there are no jumps
        		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
        			this.offset.relative = this._getRelativeOffset();
        		}
        
        		var pageX = event.pageX;
        		var pageY = event.pageY;
        
        		/*
        		 * - Position constraining -
        		 * Constrain the position to a mix of grid, containment.
        		 */
        
        		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
        
        			if(this.containment) {
        				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
        				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
        				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
        				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
        			}
        
        			if(o.grid) {
        				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
        
        				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        			}
        
        		}
        
        		return {
        			top: (
        				pageY																// The absolute mouse position
        				- this.offset.click.top													// Click offset (relative to the element)
        				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
        				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
        				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
        			),
        			left: (
        				pageX																// The absolute mouse position
        				- this.offset.click.left												// Click offset (relative to the element)
        				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
        				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
        				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
        			)
        		};
        
        	},
        
        	_rearrange: function(event, i, a, hardRefresh) {
        
        		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));
        
        		//Various things done here to improve the performance:
        		// 1. we create a setTimeout, that calls refreshPositions
        		// 2. on the instance, we have a counter variable, that get's higher after every append
        		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
        		// 4. this lets only the last addition to the timeout stack through
        		this.counter = this.counter ? ++this.counter : 1;
        		var counter = this.counter;
        
        		this._delay(function() {
        			if(counter == this.counter) this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
        		});
        
        	},
        
        	_clear: function(event, noPropagation) {
        
        		this.reverting = false;
        		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
        		// everything else normalized again
        		var delayedTriggers = [];
        
        		// We first have to update the dom position of the actual currentItem
        		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
        		if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
        		this._noFinalSort = null;
        
        		if(this.helper[0] == this.currentItem[0]) {
        			for(var i in this._storedCSS) {
        				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
        			}
        			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
        		} else {
        			this.currentItem.show();
        		}
        
        		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
        		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
        
        		// Check if the items Container has Changed and trigger appropriate
        		// events.
        		if (this !== this.currentContainer) {
        			if(!noPropagation) {
        				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
        			}
        		}
        
        
        		//Post events to containers
        		for (var i = this.containers.length - 1; i >= 0; i--){
        			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
        			if(this.containers[i].containerCache.over) {
        				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
        				this.containers[i].containerCache.over = 0;
        			}
        		}
        
        		//Do what was originally in plugins
        		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
        		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
        		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index
        
        		this.dragging = false;
        		if(this.cancelHelperRemoval) {
        			if(!noPropagation) {
        				this._trigger("beforeStop", event, this._uiHash());
        				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
        				this._trigger("stop", event, this._uiHash());
        			}
        
        			this.fromOutside = false;
        			return false;
        		}
        
        		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());
        
        		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
        		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
        
        		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;
        
        		if(!noPropagation) {
        			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
        			this._trigger("stop", event, this._uiHash());
        		}
        
        		this.fromOutside = false;
        		return true;
        
        	},
        
        	_trigger: function() {
        		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
        			this.cancel();
        		}
        	},
        
        	_uiHash: function(_inst) {
        		var inst = _inst || this;
        		return {
        			helper: inst.helper,
        			placeholder: inst.placeholder || $([]),
        			position: inst.position,
        			originalPosition: inst.originalPosition,
        			offset: inst.positionAbs,
        			item: inst.currentItem,
        			sender: _inst ? _inst.element : null
        		};
        	}
        
        });
        
        })(jQuery);
        
        ;
        
        // source: plugin/systemcommandeditor/js/systemcommandeditor.js
        ﻿$(function() {
            function SystemCommandEditorViewModel(parameters) {
                var self = this;
        
                self.settingsViewModel = parameters[0];
                self.systemCommandEditorDialogViewModel = parameters[1];
        
                self.actionsFromServer = [];
                self.systemActions = ko.observableArray([]);
        
                self.popup = undefined;
        
                self.dividerID = 0;
        
                self.onSettingsShown = function () {
                    self.requestData();
                };
        
                self.requestData = function () {
                    $.ajax({
                        url: API_BASEURL + "settings",
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            self.fromResponse(response);
                        }
                    });
                };
        
                self.fromResponse = function (response) {
                    self.actionsFromServer = response.system.actions || [];
                    self.rerenderActions();
        
                    $("#systemActions").sortable({
                        items: '> li:not(.static)',
                        cursor: 'move',
                        update: function(event, ui) {
                            var data = ko.dataFor(ui.item[0]);
                            var item = _.find(self.actionsFromServer, function(e) {
                                return e.action == data.action();
                            });
        
                            var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]) - 1;
                            if (position >= 0) {
                                self.actionsFromServer = _.without(self.actionsFromServer, item);
                                self.actionsFromServer.splice(position, 0, item);
                            }
                            ui.item.remove();
                            self.rerenderActions();
                        },
                        start: function(){
                            $('.static', this).each(function(){
                                var $this = $(this);
                                $this.data('pos', $this.index());
                            });
                        },
                        change: function(){
                            $sortable = $(this);
                            $statics = $('.static', this).detach();
                            $helper = $('<li></li>').prependTo(this);
                            $statics.each(function(){
                                var $this = $(this);
                                var target = $this.data('pos');
        
                                $this.insertAfter($('li', $sortable).eq(target));
                            });
                            $helper.remove();
                        }
                    });
                };
        
                self.rerenderActions = function() {
                    self.dividerID = 0;
        
                    var array = []
                    _.each(self.actionsFromServer, function(e) {
                        var element = {};
        
                        if (!e.action.startsWith("divider")) {
                            element = _.extend(element, {
                                name: ko.observable(e.name),
                                action: ko.observable(e.action),
                                command: ko.observable(e.command)
                            });
        
                            if (e.hasOwnProperty("confirm"))
                                element.confirm = ko.observable(e.confirm);
                        }
                        else
                        {
                            e.action = "divider" + (++self.dividerID);
                            element.action = ko.observable(e.action);
                        }
                        array.push(element);
                    })
                    self.systemActions(array);
                }
        
                self._showPopup = function (options, eventListeners) {
                    if (self.popup !== undefined) {
                        self.popup.remove();
                    }
                    self.popup = new PNotify(options);
        
                    if (eventListeners) {
                        var popupObj = self.popup.get();
                        _.each(eventListeners, function (value, key) {
                            popupObj.on(key, value);
                        })
                    }
                };
        
                self.createElement = function (invokedOn, contextParent, selectedMenu) {
                    self.systemCommandEditorDialogViewModel.reset();
                    self.systemCommandEditorDialogViewModel.title(gettext("Create Command"));
        
                    self.systemCommandEditorDialogViewModel.show(function (ret) {
                        self.actionsFromServer.push(ret);
                        self.rerenderActions();
                    });
                }
                self.deleteElement = function (invokedOn, contextParent, selectedMenu) {
                    var elementID = contextParent.attr('id');
                    var element = _.find(self.actionsFromServer, function(e) {
                        return e.action == elementID;
                    });
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    showConfirmationDialog("", function (e) {
                        self.actionsFromServer = _.without(self.actionsFromServer, element);
                        self.rerenderActions();
                    });
                }
                self.editElement = function (invokedOn, contextParent, selectedMenu) {
                    var elementID = contextParent.attr('id');
                    var element = self.element = _.find(self.actionsFromServer, function(e) {
                        return e.action == elementID;
                    });
                    if (element == undefined) {
                        self._showPopup({
                            title: gettext("Something went wrong while creating the new Element"),
                            type: "error"
                        });
                        return;
                    }
        
                    var data = ko.mapping.toJS(element);
        
                    self.systemCommandEditorDialogViewModel.reset(data);
                    self.systemCommandEditorDialogViewModel.title(gettext("Edit Command"));
        
                    self.systemCommandEditorDialogViewModel.show(function (ret) {
                        var element = self.element;
        
                        element.name = ret.name;
                        element.action = ret.action;
                        element.command = ret.command;
        
                        if (ret.hasOwnProperty("confirm"))
                            element.confirm = ret.confirm;
                        else
                            delete element.confirm;
    }