/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];        
        
        
        //---- Fan Speed controll
        self.control.fanSpeed = new ko.observable(60);      

        self.control.fanSpeedToPwm = ko.pureComputed(function () {
			self.speed = self.control.fanSpeed() * 255 / 100;
			return Math.round(self.speed);
		});        

		self.control.sendFanSpeed = function () {
			self.control.sendCustomCommand({ command: "M106 S" + self.control.fanSpeedToPwm() });
		};
        
        // Atach id to elements 
        $("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
        $("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
        $("#control-jog-general").find("button").eq(2).attr("id", "fan-off");
        if ($("#touch body").length == 0) {
            // Remove original fan on/off buttons
            $("#fan-on").remove();
            $("#fan-off").remove();
            // Add new fan controls
            $("#control-jog-general").find("button").eq(0).before("\
                <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
                <div class=\"btn-group\">\
                    <button class=\"btn\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
                    <button class=\"btn \" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("off") + "</button>\
                </div>\
           ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
