/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];        
        
        self.control.light = new ko.observable(30);   
        self.control.fanSpeed = new ko.observable(60);      
        
		self.control.sendLight = function () {
            self.light = Math.round(self.control.light() * 255 / 100);
			self.control.sendCustomCommand({ command: "M42 P6 S" + self.speed });
		};
        
        self.control.sendFanSpeed = function () {
            self.speed = Math.round(self.control.fanSpeed() * 255 / 100);
			self.control.sendCustomCommand({ command: "M106 S" + self.speed });
		};
        
        // Atach id to elements 
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
                <button class=\"btn btn-block control-box\" id=\"light-set\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendLight() }\">" + gettext("Light") + ": <span data-bind=\"text: light() + '%'\"></span></button>\
                </div>\
            <!-- Fan Speed controll -->\
                <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
                <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ": <span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
                </div>\
           ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
