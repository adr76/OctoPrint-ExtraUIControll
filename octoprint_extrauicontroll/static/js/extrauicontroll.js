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
        
        // #control-jog-extrusion
        // -------------------- 
        self.control.filamentChange = function () {
			self.control.sendCustomCommand({ command: "M114"});
		};
        
        self.control.filamentLoad = function () {
			self.control.sendCustomCommand({ command: "M114"});
		};
        

        $("#control-jog-extrusion").find("button").eq(0).attr("id", "tool");
        $("#control-jog-extrusion").find("button").eq(1).attr("id", "extrude");
        $("#control-jog-extrusion").find("button").eq(2).attr("id", "retract");
        $("#control-jog-extrusion").find("button").eq(3).attr("id", "flow");
        $("#retract").after("\
            <div class=\"btn-group\">\
                <button class=\"btn \" id=\"f-change\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.filamentChange() }\">F-Change</button>\
                <button class=\"btn \" id=\"f-load\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.filamentLoad() }\">F-Load</button>\
            </div>\
        ");
       
        // #control-jog-general
        // --------------------
        self.control.light = new ko.observable(30);   
        self.control.fanSpeed = new ko.observable(60);      
        
		self.control.setLight = function () {
            self.light = Math.round(self.control.light() * 255 / 100);
			self.control.sendCustomCommand({ command: "M42 P6 S" + self.speed });
		};
        
        self.control.setFanSpeed = function () {
            self.speed = Math.round(self.control.fanSpeed() * 255 / 100);
			self.control.sendCustomCommand({ command: "M106 S" + self.speed });
		};
        
        $("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
        $("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
        $("#control-jog-general").find("button").eq(2).attr("id", "fan-off");

        if ($("#touch body").length == 0) {
            // Remove original fan on/off buttons
            $("#fan-on").remove();
            $("#fan-off").remove();
            // Add Fan Speed controll
            $("#control-jog-general").find("button").eq(0).before("\
            <!-- Light controll -->\
                <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: light, tooltip: 'hide'}\">\
                <button class=\"btn btn-block control-box\" id=\"light-set\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.setLight() }\">" + gettext("Set light") + ": <span data-bind=\"text: light() + '%'\"></span></button>\
                </div>\
            <!-- Fan Speed controll -->\
                <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
                <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.setFanSpeed() }\">" + gettext("Set fan") + ": <span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
                </div>\
           ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
