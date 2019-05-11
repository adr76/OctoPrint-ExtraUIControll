/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];
        self.control.fanSpeed = new ko.observable(60);
        
        self.control.fanSpeedToPwm = ko.pureComputed(function () {
			self.speed = self.control.fanSpeed() * 255 / 100;
			return self.speed;
		});
        
        //send gcode to set fan speed
		self.control.sendFanSpeed = function () {
			//self.control.checkSliderValue();
			self.control.sendCustomCommand({ command: "M106 S" + self.control.fanSpeedToPwm() });
		};
        
        // Atach id to elements 
        $("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
        $("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
        $("#control-jog-general").find("button").eq(2).attr("id", "fan-off");
        if ($("#touch body").length == 0) {
            //remove original fan on/off buttons
            $("#fan-on").remove();
            $("#fan-off").remove();
            //add new fan controls
            $("#control-jog-general").find("button").eq(0).before("\
                <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
                <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
           ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
