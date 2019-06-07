 // Connection to ROSbridge server websocket
 var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', function(){
    console.log('Connected to websocket server.');
});

ros.on('error', function(){
    console.log('Error connecting to websocket server.');
});

ros.on('close', function(){
    console.log('Closed connection to websocket server.');
});

// Class for custom element 'rwc-button-action-start'
class rwcButtonActionStart extends HTMLElement {
    connectedCallback() {
      var msgJSON;
      $.getJSON("json-msgs/forward-half-m.json", function(json){msgJSON = json;});

      var rwcActionClient = new ROSLIB.ActionClient({
        ros: ros,
        serverName: this.dataset.actionServerName,
        actionName: this.dataset.actionName
      });

      this.addEventListener('click', e => {
        var goal = new ROSLIB.Goal({
          actionClient: rwcActionClient,
          goalMessage: msgJSON
        });

        goal.on('result', function (status) {    
          console.log(goal.status.text);
        });

        goal.send();
        console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");

      });

      if (this.hasAttribute("data-class")) {
        var rwcClass = this.dataset.class;
      } else {
        var rwcClass = "rwc-button-action-start";
      }

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
      + '<style>@import url("styles/rwc-user-styles.css")</style><div id="'
      + this.dataset.id + '" class="' + rwcClass
      + '" style="cursor:pointer;"><span>' + this.dataset.text + '</span></div>';
    }
}

customElements.define("rwc-button-action-start", rwcButtonActionStart);