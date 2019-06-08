// Array to track instances of toggleable components for bulk enabling/disabling
var toggleableComponents = [];

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

      if (this.dataset.disabled) {
        this.isDisabled = true;
      } else {
        this.isDisabled = false;
      }

      this.rwcClass;

      if (this.isDisabled) {
        if (this.hasAttribute("data-disabled-class")) {
          this.rwcClass = this.dataset.disabledClass;
        } else {
          this.rwcClass = "rwc-button-action-start-disabled";
        }
      } else {
        if (this.hasAttribute("data-class")) {
          this.rwcClass = this.dataset.class;
        } else {
          this.rwcClass = "rwc-button-action-start";
        }
      }

      var rwcActionClient = new ROSLIB.ActionClient({
        ros: ros,
        serverName: this.dataset.actionServerName,
        actionName: this.dataset.actionName
      });

      this.addEventListener('click', e => {
        if (!this.isDisabled){
          var goal = new ROSLIB.Goal({
            actionClient: rwcActionClient,
            goalMessage: msgJSON
          });

          goal.on('result', function (status) {    
            console.log(goal.status.text);
          });

          goal.send();
          console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
        }
      });

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
      + '<style>@import url("styles/rwc-user-styles.css")</style><div id="'
      + this.dataset.id + '" class="' + this.rwcClass
      + '"><span>' + this.dataset.text + '</span></div>';

      toggleableComponents.push(this);
    }

    set disabled(bool){
      this.isDisabled = bool;
      
      if (this.isDisabled) {
        if (this.hasAttribute("data-disabled-class")) {
          this.rwcClass = this.dataset.disabledClass;
        } else {
          this.rwcClass = "rwc-button-action-start-disabled";
        }
      } else {
        if (this.hasAttribute("data-class")) {
          this.rwcClass = this.dataset.class;
        } else {
          this.rwcClass = "rwc-button-action-start";
        }
      }

      this.shadowRoot.querySelector("div").setAttribute("class", this.rwcClass);

    }

    get disabled(){
      return this.isDisabled;
    }
}

customElements.define("rwc-button-action-start", rwcButtonActionStart);