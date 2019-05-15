/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];     
             
        // Add WebFont Icons
        $("link").eq(0).after('\
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">\
        ');
        
        // <!-- XY jogging control panel -->

        self.control.filamentChange = function () {
			self.control.sendCustomCommand({ command: "M114"});
		};
        
        self.control.filamentLoad = function () {
			self.control.sendCustomCommand({ command: "M114"});
		};
        
        // <!-- XY jogging control panel -->      
        var html=`
        <h1>X/Y</h1>
            <div>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendHomeCommand(['x']) }" disabled=""><span class="button-text">X</span></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('y',1) }" disabled=""><i class="fa fa-arrow-up"></i></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendHomeCommand(['y']) }" disabled=""><span class="button-text">Y</span></button>
            </div>
            <div>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('x',-1) }" disabled=""><i class="fa fa-arrow-left"></i></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendCenterCommand() }" disabled=""><i class="fa fa-circle-o"></i></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('x',1) }" disabled=""><i class="fa fa-arrow-right"></i></button>
            </div>
            <div>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendHomeCommand(['x','y','z']) }" disabled=""><i class="fa fa-home"></i></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('y',-1) }" disabled=""><i class="fa fa-arrow-down"></i></button>
                <button class="btn box pull-left" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendHomeCommand(['z']) }" disabled=""><span class="button-text">Z</span></button>
            </div>
        `;        
        $("#control-jog-xy").html(html);
        
        // <!-- Z jogging control panel -->
        var html=`
        <h1>Z</h1>
        <div>
            <button id="control-zinc" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('z',1) }" disabled=""><i class="fa fa-arrow-up"></i></button>
            <button id="control-zinc1" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('z',1) }" disabled=""><i class="fa fa-arrow-up"></i></button>
        </div>
        <div>
            <button id="control-zhome" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendCenterCommand() }" disabled=""><i class="fa fa-circle-o"></i></button>
            <button id="control-zhome1" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendCenterCommand() }" disabled=""><i class="fa fa-circle-o"></i></button>
        </div>
        <div>
            <button id="control-zdec" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('z',-1) }" disabled=""><i class="fa fa-arrow-down"></i></button>
            <button id="control-zdec1" class="btn box" data-bind="enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendJogCommand('z',-1) }" disabled=""><i class="fa fa-arrow-down"></i></button>
        </div>
        `;
        $("#control-jog-z").html(html);
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
