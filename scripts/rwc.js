// Detect mobile devices
var md = new MobileDetect(window.navigator.userAgent);
var isPhone = md.mobile() != null;
if (isPhone){
  console.log("Client is a phone or tablet");
} else {
  console.log("Client is not a phone or tablet");
}

// Load config of topic and action server names from 'rwc-config.json'
var configJSON;
var currentActionClient;
var JSONreq = $.getJSON("rwc-config.json", function(json){
  configJSON = json;
});

// Dictionary of listener functions, for matching 'data-listener' listener names to
// functions
var listeners = {
  "getPosition": rwcListenerGetPosition,
  "getOrientation": rwcListenerGetOrientation,
  "getNode": rwcListenerGetNode,
  "getBatteryPercentage": rwcListenerGetBatteryPercentage,
  "getVolumePercent": rwcListenerGetVolumePercent
};

// Dictionary of action functions, for matching 'data-action' action names to
// functions
var actions = {
  "setPoseRelative": rwcActionSetPoseRelative,
  "setPoseMap": rwcActionSetPoseMap,
  "goToNode": rwcActionGoToNode,
  "volumePercentChange": rwcActionVolumePercentChange,
  "say": rwcActionSay
};

// List of 'data-action' action names which require their parameter to be parsed as
// string
strActions = [
  "goToNode",
  "say"
];

// List of 'data-action' action names which require their parameter to be parsed as
// integer
intActions = [
  "volumePercentChange"
];

// List of 'data-action' action names which require their parameters to be parsed
// as an array of numbers
numArrayActions = [
  "setPoseRelative",
  "setPoseMap"
];

// List of goal status ID's and the status' corresponding names
var goalStatusNames = [
  "PENDING",
  "ACTIVE",
  "PREEMPTED",
  "SUCCEEDED",
  "ABORTED",
  "REJECTED",
  "PREEMPTING",
  "RECALLING",
  "RECALLED",
  "LOST"
];

// Array to track instances of live components for bulk updating
var liveListenerComponents = [];

// Array to track instances of static components for bulk updating
var staticListenerComponents = [];

// Array to track instances of toggleable components for bulk enabling/disabling
var toggleableComponents = [];

$(document).ready(function(){
  staticListenerComponents.forEach(function(item, index){
    item.update();
    setTimeout(function(){item.update();}, 500);
  });
  liveListenerComponents.forEach(function(item, index){
    item.update();
    setTimeout(function(){item.update();}, 500);
    window.setInterval(function(){item.update();}, 500);
  });
  spinner = document.createElement("div");
  spinner.setAttribute("class", "spin");
  document.body.appendChild(spinner);

  stopButton = document.createElement("div");
  stopButton.setAttribute("class", "cancel-button rwc-button-action-start");
  stopButtonSpan = document.createElement("span");
  stopButtonSpan.innerHTML = "Cancel action";
  stopButton.appendChild(stopButtonSpan);
  if(isPhone){
    stopButton.addEventListener('touchstart', function(event){
      cancelCurrentAction();
    });
  } else {
    stopButton.addEventListener('click', e => {
      cancelCurrentAction();
    });
  }
  document.body.appendChild(stopButton);

  window.setInterval(function(){
    interfaceEnabledParam.get(function(param){
      window.rwcInterfaceEnabled = param;
    });

    console.log(window.rwcInterfaceEnabled);

    if (window.rwcInterfaceEnabled == 1){
      toggleableComponents.forEach(function(element){element.disabled = false;});
      $(".spin").spin("hide");
    } else if(window.rwcInterfaceEnabled == 0){
      toggleableComponents.forEach(function(element){element.disabled = true;});
      $(".spin").spin("show");
    }
  }, 500);
});

// Connection to ROSbridge server websocket
var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', function(){
    console.log('Connected to websocket server.');
    enableInterface();
    $(".spin").spin("hide");
});

ros.on('error', function(){
    console.log('Error connecting to websocket server.');
    disableInterface();
    $(".spin").spin("show");
    setTimeout(function(){
      location.reload();
    }, 5000);
});

ros.on('close', function(){
    console.log('Closed connection to websocket server.');
    disableInterface();
    $(".spin").spin("show");
    setTimeout(function(){
      location.reload();
    }, 5000);
});

// Variables for tracking current action in a ROS topic
var currentActionTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/current_action",
  messageType : "std_msgs/String",
  latch: true
});

var currentActionTopicString = new ROSLIB.Message({
  data : ""
});

// ROS parameter '/interface_enabled'
var interfaceEnabledParam = new ROSLIB.Param({
  ros: ros,
  name: "/interface_enabled"
});


// General functions
function disableInterface(){
  toggleableComponents.forEach(function(element){element.disabled = true;});
  interfaceEnabledParam.set(0);
}

function enableInterface(){
  toggleableComponents.forEach(function(element){element.disabled = false;});
  interfaceEnabledParam.set(1);
}

function cancelCurrentAction(){
  currentActionClient.cancel();
  enableInterface();
  $(".spin").spin("hide");
}

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

  currentActionClient = actionClient;
  currentActionTopicString.data = currentActionClient.actionName;
  currentActionTopic.publish(currentActionTopicString);

  goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {
    console.log(goal.status.text);
    enableInterface();
    $(".spin").spin("hide");
  });

  goal.send();
  disableInterface();
  $(".spin").spin("show");
  console.log("Goal '" + serverName + "/goal' sent!");

  return goal;
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

  currentActionClient = actionClient;
  currentActionTopicString.data = currentActionClient.actionName;
  currentActionTopic.publish(currentActionTopicString);

  goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {
    console.log(goal.status.text);
    enableInterface();
    $(".spin").spin("hide");
  });

  goal.send();
  disableInterface();
  $(".spin").spin("show");
  console.log("Goal '" + serverName + "/goal' sent!");

  return goal;
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

  currentActionClient = actionClient;
  currentActionTopicString.data = currentActionClient.actionName;
  currentActionTopic.publish(currentActionTopicString);

  goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {
    status = goal.status.status;
    console.log("Action status: " + goalStatusNames[status]);
    enableInterface();
    $(".spin").spin("hide");
  });

  goal.send();
  disableInterface();
  $(".spin").spin("show");
  console.log("Goal '" + serverName + "/goal' sent!");

  return goal;
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

  currentActionClient = actionClient;
  currentActionTopicString.data = currentActionClient.actionName;
  currentActionTopic.publish(currentActionTopicString);

  goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {
    status = goal.status.status;
    console.log("Action status: " + goalStatusNames[status]);
  });

  goal.send();
  console.log("Goal '" + serverName + "/goal' sent!");

  return goal;
}

// Action function 'rwcActionGazeAtPosition'
function rwcActionGazeAtPosition(x, y, z, secs){
  var rwcPoseTopic = new ROSLIB.Topic({
    ros : ros,
    name : "/rwc_gaze_pose",
    messageType : "geometry_msgs/PoseStamped"
  });

  header = {
    seq: 0,
    stamp: {
      secs: 1,
      nsecs:1},
    frame_id: "map"
  };
  position = new ROSLIB.Vector3(null);
  position.x = x;
  position.y = y;
  position.z = z;
  orientation = new ROSLIB.Quaternion({x:0, y:0, z:0, w:1.0});
  var poseStamped = new ROSLIB.Message({
    header: header,
    pose: {
      position: position,
      orientation: orientation
    }
  });
  rwcPoseTopic.publish(poseStamped);
  console.log("Gaze pose published...");

  var gazeActionClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: "/gaze_at_pose",
    actionName: "strands_gazing/GazeAtPoseAction"
  });

  currentActionClient = gazeActionClient;

  msg = {
    runtime_sec: secs,
    topic_name: "/rwc_gaze_pose"
  };

  goal = new ROSLIB.Goal({
    actionClient: gazeActionClient,
    goalMessage: msg
  });

  goal.on('result', function (status) {
    console.log("Action '/gaze_at_pose/' completed!");
  });

  goal.send();
  console.log("Goal '/gaze_at_pose/goal' sent!");

  return goal;
}


// --- Listener functions ---
// Listener function 'rwcListenerGetPosition'
async function rwcListenerGetPosition(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPosition = await subPosition(listener);

  return rwcPosition;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subPosition(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      window.rwcPosition = [message.pose.pose.position.x,
        message.pose.pose.position.y,
        message.pose.pose.position.z];
      listener.unsubscribe();
      setTimeout(function(){
        resolve(window.rwcPosition);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetOrientation'
async function rwcListenerGetOrientation(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  rwcOrientation = await subOrientation(listener);

  return rwcOrientation;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subOrientation(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      window.rwcOrientation = [message.pose.pose.orientation.x,
        message.pose.pose.orientation.y,
        message.pose.pose.orientation.z,
        message.pose.pose.orientation.w];
      listener.unsubscribe();
      setTimeout(function(){
        resolve(window.rwcOrientation);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetNearestPersonPosition'
async function rwcListenerGetNearestPersonPosition(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.nearest_person_pose.topicName,
    messageType : configJSON.listeners.nearest_person_pose.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcNearestPersonPosition = await subNearestPersonPosition(listener);

  return rwcNearestPersonPosition;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subNearestPersonPosition(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      rwcNearestPersonPosition = [message.pose.position.x,
        message.pose.position.y,
        message.pose.position.z];
      listener.unsubscribe();
      setTimeout(function(){
        resolve(rwcNearestPersonPosition);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetPeoplePositions'
async function rwcListenerGetPeoplePositions(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.people_pose_array.topicName,
    messageType : configJSON.listeners.people_pose_array.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPeoplePoses = await subPeoplePositions(listener);

  rwcPeoplePositions = [];
  rwcPeoplePoses.forEach(function(person_pose){
    rwcPeoplePositions.push([person_pose.position.x, person_pose.position.y, person_pose.position.z]);
  });

  return rwcPeoplePositions;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subPeoplePositions(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      rwcPeoplePositions = message.poses;
      listener.unsubscribe();
      setTimeout(function(){
        resolve(rwcPeoplePositions);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetNumberOfPeople'
async function rwcListenerGetNumberOfPeople(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.people_pose_array.topicName,
    messageType : configJSON.listeners.people_pose_array.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPeoplePoses = await subPeoplePositions(listener);

  return rwcPeoplePositions.length;
}

// Listener function 'rwcListenerGetNode'
async function rwcListenerGetNode(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.current_node.topicName,
    messageType : configJSON.listeners.current_node.topicMessageType
  });

  rwcNode = await subNode(listener);

  return rwcNode;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subNode(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      window.rwcNode = message.data;
      listener.unsubscribe();
      setTimeout(function(){
        resolve(window.rwcNode);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetBatteryPercentage'
async function rwcListenerGetBatteryPercentage(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.battery_state.topicName,
    messageType : configJSON.listeners.battery_state.topicMessageType
  });

  rwcBatteryPercentage = await subBatteryPercentage(listener);

  return rwcBatteryPercentage;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subBatteryPercentage(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      window.rwcBatteryPercentage = message.lifePercent;
      listener.unsubscribe();
      setTimeout(function(){
        resolve(window.rwcBatteryPercentage);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetVolumePercent'
async function rwcListenerGetVolumePercent(){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.volume.topicName,
    messageType : configJSON.listeners.volume.topicMessageType
  });

  rwcVolumePercent = await subVolumePercent(listener);

  return rwcVolumePercent;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subVolumePercent(listener){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      window.rwcVolumePercent = message.data;
      listener.unsubscribe();
      setTimeout(function(){
        resolve(window.rwcVolumePercent);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetCameraSnapshot'
function rwcListenerGetCameraSnapshot(){
  // Latest camera image obtained from 'web_video_server'
  var img = new Image();
  img.src = configJSON.listeners.camera_snapshot.uri;
  return img;
}

// Listener function 'rwcListenerGetQRCode'
function rwcListenerGetQRCode(){
  // Latest camera image obtained from 'web_video_server'
  var img = new Image();
  img.src = configJSON.listeners.camera_snapshot.uri;

  // Temporary HTML5 canvas created to call getImageData 
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0 );
  var imgData = context.getImageData(0, 0, img.width, img.height);
  const code = jsQR(imgData.data, imgData.width, imgData.height);
  if (code) {
    return code.data;
  } else {
    return "No QR code detected!";
  }
}

// --- Web Components ---

// --- Action Components ---
// Class for custom element 'rwc-button-action-start'
class rwcButtonActionStart extends HTMLElement {
  connectedCallback() {
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

    if(isPhone){
      this.addEventListener('touchstart', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    } else {
      this.addEventListener('click', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    }

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

// Class for custom element 'rwc-button-custom-action-start'
class rwcButtonCustomActionStart extends HTMLElement {
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

      currentActionClient = rwcActionClient;
      currentActionTopicString.data = currentActionClient.actionName;
      currentActionTopic.publish(currentActionTopicString);

      if(isPhone){
        this.addEventListener('touchstart', e => {
          if (!this.isDisabled){
            var goal = new ROSLIB.Goal({
              actionClient: rwcActionClient,
              goalMessage: msgJSON
            });
  
            goal.on('result', function (status) {    
              enableInterface();
              $(".spin").spin("hide");
              console.log(goal.status.text);
              status = goal.status.status;
              console.log("Action status: " + goalStatusNames[status]);
            });
  
            goal.send();
            disableInterface();
            $(".spin").spin("show");
            console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
          }
        });
      } else {
        this.addEventListener('click', e => {
          if (!this.isDisabled){
            var goal = new ROSLIB.Goal({
              actionClient: rwcActionClient,
              goalMessage: msgJSON
            });
  
            goal.on('result', function (status) {    
              enableInterface();
              $(".spin").spin("hide");
              console.log(goal.status.text);
              status = goal.status.status;
              console.log("Action status: " + goalStatusNames[status]);
            });
  
            goal.send();
            disableInterface();
            $(".spin").spin("show");
            console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
          }
        });
      }

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

customElements.define("rwc-button-custom-action-start", rwcButtonCustomActionStart);


// Class for custom element 'rwc-text-action-start'
class rwcTextActionStart extends HTMLElement {
  connectedCallback() {
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
        this.rwcClass = "rwc-text-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-text-action-start";
      }
    }

    if(isPhone){
      this.addEventListener('touchstart', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    } else {
      this.addEventListener('click', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
    + '<style>@import url("styles/rwc-user-styles.css")</style><span id="'
    + this.dataset.id + '" class="' + this.rwcClass
    + '">' + this.dataset.text + '</span>';

    toggleableComponents.push(this);
  }

  set disabled(bool){
    this.isDisabled = bool;

    if (this.isDisabled) {
      if (this.hasAttribute("data-disabled-class")) {
        this.rwcClass = this.dataset.disabledClass;
      } else {
        this.rwcClass = "rwc-text-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-text-action-start";
      }
    }

    this.shadowRoot.querySelector("span").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }
}

customElements.define("rwc-text-action-start", rwcTextActionStart);

// Class for custom element 'rwc-text-custom-action-start'
class rwcTextCustomActionStart extends HTMLElement {
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
        this.rwcClass = "rwc-text-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-text-action-start";
      }
    }

    var rwcActionClient = new ROSLIB.ActionClient({
      ros: ros,
      serverName: this.dataset.actionServerName,
      actionName: this.dataset.actionName
    });

    currentActionClient = rwcActionClient;
    currentActionTopicString.data = currentActionClient.actionName;
    currentActionTopic.publish(currentActionTopicString);

    if(isPhone){
      this.addEventListener('touchstart', e => {
        if (!this.isDisabled){
          var goal = new ROSLIB.Goal({
            actionClient: rwcActionClient,
            goalMessage: msgJSON
          });
  
          goal.on('result', function (status) {    
            enableInterface();
            $(".spin").spin("hide");
            console.log(goal.status.text);
            status = goal.status.status;
            console.log("Action status: " + goalStatusNames[status]);
          });
  
          goal.send();
          disableInterface();
          $(".spin").spin("show");
          console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
        }
      });
    } else {
      this.addEventListener('click', e => {
        if (!this.isDisabled){
          var goal = new ROSLIB.Goal({
            actionClient: rwcActionClient,
            goalMessage: msgJSON
          });
  
          goal.on('result', function (status) {    
            enableInterface();
            $(".spin").spin("hide");
            console.log(goal.status.text);
            status = goal.status.status;
            console.log("Action status: " + goalStatusNames[status]);
          });
  
          goal.send();
          disableInterface();
          $(".spin").spin("show");
          console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
        }
      });
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
    + '<style>@import url("styles/rwc-user-styles.css")</style><span id="'
    + this.dataset.id + '" class="' + this.rwcClass
    + '">' + this.dataset.text + '</span>';

    toggleableComponents.push(this);
  }

  set disabled(bool){
    this.isDisabled = bool;

    if (this.isDisabled) {
      if (this.hasAttribute("data-disabled-class")) {
        this.rwcClass = this.dataset.disabledClass;
      } else {
        this.rwcClass = "rwc-text-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-text-action-start";
      }
    }

    this.shadowRoot.querySelector("span").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }
}

customElements.define("rwc-text-custom-action-start", rwcTextCustomActionStart);


// Class for custom element 'rwc-img-action-start'
class rwcImageActionStart extends HTMLElement {
  connectedCallback() {
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
        this.rwcClass = "rwc-img-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-img-action-start";
      }
    }

    if(isPhone){
      this.addEventListener('touchstart', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    } else {
      this.addEventListener('click', e => {
        if (!this.isDisabled){
          if (strActions.includes(this.dataset.action)) {
            actions[this.dataset.action](this.dataset.actionParameters);
          }
          if (intActions.includes(this.dataset.action)) {
            actions[this.dataset.action](parseInt(this.dataset.actionParameters));
          }
          if (numArrayActions.includes(this.dataset.action)) {
            var strArray = this.dataset.actionParameters.split(",");
            var floatArray = strArray.map(Number);
            actions[this.dataset.action](floatArray);
          }
          console.log("Action '" + this.dataset.action + "' started!\nParameter(s): " +
          this.dataset.actionParameters);
        }
      });
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
    + '<style>@import url("styles/rwc-user-styles.css")</style><img id="'
    + this.dataset.id + '" class="' + this.rwcClass
    + '" src="' + this.getAttribute("src") + '"></img>';

    toggleableComponents.push(this);
  }

  set disabled(bool){
    this.isDisabled = bool;

    if (this.isDisabled) {
      if (this.hasAttribute("data-disabled-class")) {
        this.rwcClass = this.dataset.disabledClass;
      } else {
        this.rwcClass = "rwc-img-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-img-action-start";
      }
    }

    this.shadowRoot.querySelector("img").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }
}

customElements.define("rwc-img-action-start", rwcImageActionStart);

// Class for custom element 'rwc-img-custom-action-start'
class rwcImageCustomActionStart extends HTMLElement {
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
        this.rwcClass = "rwc-img-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-img-action-start";
      }
    }

    var rwcActionClient = new ROSLIB.ActionClient({
      ros: ros,
      serverName: this.dataset.actionServerName,
      actionName: this.dataset.actionName
    });

    currentActionClient = rwcActionClient;
    currentActionTopicString.data = currentActionClient.actionName;
    currentActionTopic.publish(currentActionTopicString);

    if(isPhone){
      this.addEventListener('touchstart', e => {
        if (!this.isDisabled){
          var goal = new ROSLIB.Goal({
            actionClient: rwcActionClient,
            goalMessage: msgJSON
          });
  
          goal.on('result', function (status) {    
            enableInterface();
            $(".spin").spin("hide");
            console.log(goal.status.text);
            status = goal.status.status;
            console.log("Action status: " + goalStatusNames[status]);
          });
  
          goal.send();
          disableInterface();
          $(".spin").spin("show");
          console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
        }
      });
    } else {
      this.addEventListener('click', e => {
        if (!this.isDisabled){
          var goal = new ROSLIB.Goal({
            actionClient: rwcActionClient,
            goalMessage: msgJSON
          });
  
          goal.on('result', function (status) {    
            enableInterface();
            $(".spin").spin("hide");
            console.log(goal.status.text);
            status = goal.status.status;
            console.log("Action status: " + goalStatusNames[status]);
          });
  
          goal.send();
          disableInterface();
          $(".spin").spin("show");
          console.log("Goal '" + this.dataset.actionServerName + "/goal' sent!");
        }
      });
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = '<style>@import url("styles/rwc-styles.css")</style>'
    + '<style>@import url("styles/rwc-user-styles.css")</style><img id="'
    + this.dataset.id + '" class="' + this.rwcClass
    + '" src="' + this.getAttribute("src") + '"></img>';

    toggleableComponents.push(this);
  }

  set disabled(bool){
    this.isDisabled = bool;

    if (this.isDisabled) {
      if (this.hasAttribute("data-disabled-class")) {
        this.rwcClass = this.dataset.disabledClass;
      } else {
        this.rwcClass = "rwc-img-action-start-disabled";
      }
    } else {
      if (this.hasAttribute("data-class")) {
        this.rwcClass = this.dataset.class;
      } else {
        this.rwcClass = "rwc-img-action-start";
      }
    }

    this.shadowRoot.querySelector("img").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }
}

customElements.define("rwc-img-custom-action-start", rwcImageCustomActionStart);

// --- Listener Components ---
async function prepareListenerData (listener){
  rwcListenerData = await awaitListenerData(listener);
  return rwcListenerData;
  // setTimeout(function(){window.rwcListenerData = rwcListenerData;}, 50);
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function awaitListenerData(listener){
  return new Promise(function(resolve) {
    setTimeout(function(){
      rwcListenerData = listeners[listener]()
      resolve(rwcListenerData);
    }, 50);
  });
}

// Class for custom element 'rwc-text-listener'
class rwcTextListener extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });

    setTimeout(this.update, 50);
    if (this.dataset.live == "true" || this.dataset.live == null) {
      liveListenerComponents.push(this);
    }
    else {
      staticListenerComponents.push(this);
    }
  }

  update() {
    if (configJSON != null && this.dataset != null){
      var thisListener = this;
      prepareListenerData(this.dataset.listener).then(function(result){
        if (String(result) != "[object Promise]"){
          thisListener.shadowRoot.innerHTML = "<span>" + String(result) +"</span>";
        } else {
          thisListener.shadowRoot.innerHTML = "<span></span>";
        }
      });
    }
  }
}

customElements.define("rwc-text-listener", rwcTextListener);


// // Class for custom element 'rwc-text-custom-listener'
// class rwcTextCustomListener extends HTMLElement {
//   connectedCallback() {
//     const shadowRoot = this.attachShadow({ mode: "open" });

//     setTimeout(this.update, 50);
//     if (this.dataset.live == "true" || this.dataset.live == null) {
//       liveListenerComponents.push(this);
//     }
//     else {
//       staticListenerComponents.push(this);
//     }
//   }

//   update() {
//     if (this.dataset != null){
//       var thisListener = this;
//       prepareCustomListenerData(this.dataset.listener).then(function(result){
//         if (String(result) != "[object Promise]"){
//           thisListener.shadowRoot.innerHTML = "<span>" + String(result) +"</span>";
//         } else {
//           thisListener.shadowRoot.innerHTML = "<span></span>";
//         }
//       });
//     }
//   }
// }

// // Listener function 'rwcListenerGetCustomData'
// async function rwcListenerGetCustomData(listener, msgName = "data"){
//   rwcNode = await subCustomListenerData(listener, msgName);

//   return rwcNode;
// }

// // Promise returns value 50ms after subscribing to topic,
// // preventing old or undefined values from being returned
// function subCustomListenerData(listener, msgName){
//   return new Promise(function(resolve) {
//     listener.subscribe(function(message) {
//       msgNameArray = msgName.split("\.");
//       console.log(msgNameArray);
//       rwcListenerData = message[msgName];
//       listener.unsubscribe();
//       setTimeout(function(){
//         resolve(rwcListenerData);
//       }, 50);
//     });
//   });
// }

// async function prepareCustomListenerData (listener){
//   rwcListenerData = await awaitCustomListenerData(listener);
//   return rwcListenerData;
// }

// // Promise returns value 50ms after subscribing to topic,
// // preventing old or undefined values from being returned
// function awaitCustomListenerData(listener){
//   return new Promise(function(resolve) {
//     setTimeout(function(){
//       rwcListenerData = listeners[listener]()
//       resolve(rwcListenerData);
//     }, 50);
//   });
// }

// customElements.define("rwc-text-custom-listener", rwcTextCustomListener);