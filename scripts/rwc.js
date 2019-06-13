// Load config of topic and action server names from 'rwc-config.json'
var configJSON;
$.getJSON("rwc-config.json", function(json){configJSON = json;});

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


// Call all listener functions to connect their subscribers
$( window ).on( "load", function() {
  rwcListenerGetPosition();
  rwcListenerGetOrientation();
});


// --- Action fuctions ---
// Action function 'rwcActionSetPoseRelative'
function rwcActionSetPoseRelative(x, y, z, quaternion = {x: 0, y: 0, z: 0, w: 1}){
  var msg = {
    target_pose: {
        header :{
            frame_id: "base_link"
        },
        pose: {
            position: {
                x: x,
                y: y,
                z: z
                },
            orientation: quaternion
        }
    }
  };

  // Action name and action server name loaded from rwc-config JSON file
  var serverName = configJSON.actions.actionServers.move_base.actionServerName;
  var actionName = configJSON.actions.actionServers.move_base.actionName;

  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: serverName,
    actionName: actionName
  });

  var goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {    
    console.log(goal.status.text);
  });

  goal.send();
  console.log("Goal '" + serverName + "/goal' sent!");
}


// Action function 'rwcActionSetPoseMap'
function rwcActionSetPoseMap(x, y, z, quaternion = {x: 0, y: 0, z: 0, w: 1}){
  var msg = {
    target_pose: {
        header :{
            frame_id: "map"
        },
        pose: {
            position: {
                x: x,
                y: y,
                z: z
                },
            orientation: quaternion
        }
    }
  };

  // Action name and action server name loaded from rwc-config JSON file
  var serverName = configJSON.actions.actionServers.move_base.actionServerName;
  var actionName = configJSON.actions.actionServers.move_base.actionName;

  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: serverName,
    actionName: actionName
  });

  var goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {    
    console.log(goal.status.text);
  });

  goal.send();
  console.log("Goal '" + serverName + "/goal' sent!");
}


// Action function 'rwcActionGoToNode'
function rwcActionGoToNode(node_name, no_orientation = false){
  var msg = {
    target: node_name,
    no_orientation: no_orientation
  };

  // Action name and action server name loaded from rwc-config JSON file
  var serverName = configJSON.actions.actionServers.topological_navigation.actionServerName;
  var actionName = configJSON.actions.actionServers.topological_navigation.actionName;

  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: serverName,
    actionName: actionName
  });

  var goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {    
    console.log(goal.status.text);
  });

  goal.send();
  console.log("Goal '" + serverName + "/goal' sent!");
}


// Action function 'rwcActionVolumePercentChange'
function rwcActionVolumePercentChange(percentage_change){
  // Topic info loaded from rwc-config JSON file
  var pcntChangeTopic = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.actions.topics.volume.topicName,
    messageType : configJSON.actions.topics.volume.topicMessageType
  });

  var Int8 = new ROSLIB.Message({
    data : percentage_change
  });
  pcntChangeTopic.publish(Int8);
  if(percentage_change >= 0){
    console.log("Volume changed by +" + percentage_change + "%");
  } else { 
    console.log("Volume changed by " + percentage_change + "%");
  }
}


// Action function 'rwcActionSay'
function rwcActionSay(phrase){
  var msg = {
    text: phrase
  };

  // Action name and action server name loaded from rwc-config JSON file
  var serverName = configJSON.actions.actionServers.speak.actionServerName;
  var actionName = configJSON.actions.actionServers.speak.actionName;

  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: serverName,
    actionName: actionName
  });

  var goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {    
    console.log(goal.status.text);
  });

  goal.send();
  console.log("Goal '" + serverName + "/goal' sent!");
}


// --- Listener functions ---
// Listener function 'rwcListenerGetPosition'
function rwcListenerGetPosition(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  listener.subscribe(function(message) {
    window.position = [message.pose.pose.position.x,
      message.pose.pose.position.y,
      message.pose.pose.position.z];
    listener.unsubscribe();
  });

  return window.position;
}

// Listener function 'rwcListenerGetOrientation'
function rwcListenerGetOrientation(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  listener.subscribe(function(message) {
    window.rwcOrientation = [message.pose.pose.orientation.x,
      message.pose.pose.orientation.y,
      message.pose.pose.orientation.z,
      message.pose.pose.orientation.w];
    listener.unsubscribe();
  });

  return window.rwcOrientation;
}

// Class for custom element 'rwc-button-action-start'
class rwcButtonActionStart extends HTMLElement {
    connectedCallback() {
      var msgJSON;
      $.getJSON(this.dataset.goalMsgPath, function(json){msgJSON = json;});

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