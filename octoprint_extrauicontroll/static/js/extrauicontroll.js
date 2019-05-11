/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];     
 /*       
        // #control-jog-general
        // -------------------- 
        self.control.filamentChange = function () {
			self.control.sendCustomCommand({ command: "\
            M104 S230 ; Set Extr Temp
            M109 S230 ; Waite Ext Temp
            G91   ; Relative XYZ
            G1 Z+10 E-3 F1500
            G1 E-150 F3000
            G1 E-150 F3000
            G1 E-150 F3000
            G1 E-150 F3000
            G1 E-100 F3000
            G1 E-100 F1200
            G90\
            "});
		};
        
        self.control.filamentLoad = function () {
			self.control.sendCustomCommand({ command: "\
            M104 S230 ; Set Extr Temp
            M109 S230 ; Waite Ext Temp
            G91   ; Relative XYZ
            G1 E150 F3000
            G1 E150 F3000
            G1 E150 F3000
            G1 E150 F3000
            G1 E100 F3000
            G1 E50 F1500
            G1 E-1 F1200
            G90\
            "});
		};
        

        $("#control-jog-extrusion").find("button").eq(0).attr("id", "tool");
        $("#control-jog-extrusion").find("button").eq(1).attr("id", "extrude");
        $("#control-jog-extrusion").find("button").eq(2).attr("id", "retract");
        $("#control-jog-extrusion").find("button").eq(3).attr("id", "flow");
        $("#retract").before("\
            <div class=\"btn-group\">\
                <button class=\"btn \" id=\"f-change\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.filamentChange() }\">F-Change</button>\
                <button class=\"btn \" id=\"f-load\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.filamentLoad() }\">F-Load</button>\
            </div>
        ");
 */       
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
