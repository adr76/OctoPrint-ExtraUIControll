/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];
        
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
                <div class=\"slider slider-horizontal\" style=\"width: 114px;\">\
                <div class=\"slider-track\">\
                  <div class=\"slider-selection\" style=\"left: 0%; width: 64%;\"></div>\
                  <div class=\"slider-handle round\" style=\"left: 64%;\"></div>\
                  <div class=\"slider-handle round hide\" style=\"left: 0%;\"></div>\
                </div>\
                <div class=\"tooltip top hide\" style=\"top: -14px; left: 50.2829px;\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\"></div></div>\
                <input style=\"width: 100px; display: none;\" type=\"number\" data-bind=\"slider: {min: 00, max: 255, step: 1, value: fanSpeed, tooltip: 'hide'}\" />\
              </div>\
              <button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed()\"></span></button>\
              </div>\
              
              
              <input type=\"number\" style=\"width: 95px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
              <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
              <div class=\"btn-group\">\
                <button class=\"btn \" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Off") + "</button>\
                <button class=\"btn \" id=\"fan-30\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S76'] }) }\">" + gettext("30%") + "</button>\ 
              </div>\
 */           ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
