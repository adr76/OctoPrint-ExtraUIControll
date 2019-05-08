/*
 * Author: adr76
 * License: AGPLv3
 */
$(function() {
    function ExtraUIControllViewModel(parameters) {
        var self = this;
        
        self.control = parameters[0];
        
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
              <button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
              <div class=\"btn-group\">\
                <button class=\"btn \" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser() && !islocked(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
                <button class=\"btn \" id=\"fan-lock\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.lockFanInput() }, attr: { title: lockTitle } \">\
                  <i class=\"fa fa-unlock\" data-bind=\"css: {'fa-lock': islocked(), 'fa-unlock': !islocked()}\"></i>\
                </button>\
              </div>\
            ");
        }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ExtraUIControllViewModel,
        dependencies: [ "controlViewModel"]
    });
});
