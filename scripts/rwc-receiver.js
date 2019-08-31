// Load config of topic and action server names from 'rwc-config.json'
var configJSON;
var currentActionClient;
var JSONreq = $.getJSON("rwc-config.json", function(json){
  configJSON = json;
});

// Dictionary of listener functions, for matching 'data-listener' listener names to
// functions
var listeners = {
  "getCurrentPage": rwcListenerGetCurrentPage,
  "getPosition": rwcListenerGetPosition,
  "getOrientation": rwcListenerGetOrientation,
  "getNearestPersonPosition": rwcListenerGetNearestPersonPosition,
  "getPeoplePositions": rwcListenerGetPeoplePositions,
  "getNumberOfPeople": rwcListenerGetNumberOfPeople,
  "getNode": rwcListenerGetNode,
  "getBatteryPercentage": rwcListenerGetBatteryPercentage,
  "getVolumePercent": rwcListenerGetVolumePercent
};

// Connection to ROSbridge server websocket
var ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
});

ros.on('connection', function(){
  console.log('Connected to websocket server.');
  $(".spin").spin("hide");
});

ros.on('error', function(){
  console.log('Error connecting to websocket server.');
  $(".spin").spin("show");
  setTimeout(function(){
    location.reload();
  }, 5000);
});

ros.on('close', function(){
  console.log('Closed connection to websocket server.');
  $(".spin").spin("show");
  setTimeout(function(){
    location.reload();
  }, 5000);
});

// ROS topic for reloading page to `/rwc/page_loaded`
var pageLoadedTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/page_loaded",
  messageType : "std_msgs/String"
});

pageLoadedTopic.subscribe(function(){
  location.reload();
});

// Global var to track current page of master interface
var currentPage;

// Array to track instances of live components for bulk updating
var liveListenerComponents = [];

// Array to track instances of static components for bulk updating
var staticListenerComponents = [];

// Array to track components which may be disabled / enabled
var toggleableComponents = [];

// Variables for tracking current action in a ROS topic
var currentActionTopic = new ROSLIB.Topic({
ros : ros,
name : "/rwc/current_action",
messageType : "std_msgs/String",
});

var currentActionTopicString = new ROSLIB.Message({
data : ""
});

// Variables for tracking current page in a ROS topic
var currentPageTopic = new ROSLIB.Topic({
ros : ros,
name : "/rwc/current_page",
messageType : "std_msgs/String",
});

var currentPageTopicString = new ROSLIB.Message({
data : ""
});

// Variables for tracking object click / touch interactions in a ROS topic
var clickedTopic = new ROSLIB.Topic({
ros : ros,
name : "/rwc/components_currently_clicked",
messageType : "std_msgs/String",
});

// Variables for individually disabled components in a ROS topic
var disabledTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/disabled_components",
  messageType : "std_msgs/String",

});

var disabledTopicString = new ROSLIB.Message({
  data : ""
});

// ROS topic `/interface/showmodal` for displaying modal when prompted by Lindsey
var showModalTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/show_modal_receiver",
  messageType : "std_msgs/String"
});

// ROS topic `/interface/showmodal` for closing modal when prompted by Lindsey
var showModalCloseTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/show_modal_close_receiver",
  messageType : "std_msgs/String"
});

var disabledComponentIDs = [];

// ROS parameter '/interface_enabled'
var interfaceBusyParam = new ROSLIB.Param({
ros: ros,
name: "/rwc/interface_busy"
});

// Names of elements which appear in the head tag and should be removed from
// tags loaded from `/rwc/current_page`
var headElementNames = [
  "HTMLScriptElement",
  "HTMLLinkElement",
  "HTMLMetaElement"
];

// Modal (y/n dialogue) functions
function rwcActionYesNoModal(text) {
  $("[role=modal]").load("modal-receiver.html", function() {
    $('[role=dialog]').modal({
      backdrop: 'static',
      keyboard: false,
      focus: true
    });
    $('.modal-title').html(text.split("_").join(" "));
    $('[role=dialog]').modal('show');
  });
  console.log("showing dialog");
}

function Close_modal(text) {
  $('[role=dialog]').modal('hide');
  console.log("hiding dialog");
}

// --- Action Components ---
// Class for custom element 'rwc-button-action-start'
class rwcButtonActionStart extends HTMLElement {
  connectedCallback() {
    this.clicked = false;

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
        this.rwcClass = "rwc-button-action-start-receiver";
      }
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
        this.rwcClass = "rwc-button-action-start-receiver";
      }
    }

    this.shadowRoot.querySelector("div").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }

  disable(){
    if (!window.rwcDisabledComponents.includes(this)){
      window.rwcDisabledComponents.push(this);
    }
    this.disabled = true;
  }

  enable(){
    this.disabled = false;
    window.rwcDisabledComponents = [];
    toggleableComponents.forEach(function(element){
      if (element.disabled == true) {
        window.rwcDisabledComponents.push(element);
      }
    });
  }
}

customElements.define("rwc-button-action-start", rwcButtonActionStart);

// Class for custom element 'rwc-button-load-page'
class rwcButtonLoadPage extends rwcButtonActionStart{}
customElements.define("rwc-button-load-page", rwcButtonLoadPage);


// Class for custom element 'rwc-text-action-start'
class rwcTextActionStart extends HTMLElement {
  connectedCallback() {
    this.clicked = false;

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
        this.rwcClass = "rwc-text-action-start-receiver";
      }
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
        this.rwcClass = "rwc-text-action-start-receiver";
      }
    }

    this.shadowRoot.querySelector("span").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }

  disable(){
    if (!window.rwcDisabledComponents.includes(this)){
      window.rwcDisabledComponents.push(this);
    }
    this.disabled = true;
  }

  enable(){
    this.disabled = false;
    window.rwcDisabledComponents = [];
    toggleableComponents.forEach(function(element){
      if (element.disabled == true) {
        window.rwcDisabledComponents.push(element);
      }
    });
  }
}

customElements.define("rwc-text-action-start", rwcTextActionStart);

// Class for custom element 'rwc-text-load-page'
class rwcTextLoadPage extends rwcTextActionStart{}
customElements.define("rwc-text-load-page", rwcTextLoadPage);


// Class for custom element 'rwc-img-action-start'
class rwcImageActionStart extends HTMLElement {
  connectedCallback() {
    this.clicked = false;

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
        this.rwcClass = "rwc-img-action-start-receiver";
      }
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
        this.rwcClass = "rwc-img-action-start-receiver";
      }
    }

    this.shadowRoot.querySelector("img").setAttribute("class", this.rwcClass);

  }

  get disabled(){
    return this.isDisabled;
  }

  disable(){
    if (!window.rwcDisabledComponents.includes(this)){
      window.rwcDisabledComponents.push(this);
    }
    this.disabled = true;
  }

  enable(){
    this.disabled = false;
    window.rwcDisabledComponents = [];
    toggleableComponents.forEach(function(element){
      if (element.disabled == true) {
        window.rwcDisabledComponents.push(element);
      }
    });
  }
}

customElements.define("rwc-img-action-start", rwcImageActionStart);

// Class for custom element 'rwc-img-load-page'
class rwcImageLoadPage extends rwcImageActionStart{}
customElements.define("rwc-img-load-page", rwcImageLoadPage);


// --- Listener Components ---

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subCustom(listener, listenerComponent = null, fieldSelector = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      fieldSelectorArr = fieldSelector.split(".");
      var data = message;
      fieldSelectorArr.forEach(function(field){
        data = data[field];
      });
      data = JSON.stringify(data);
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + data + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + data + "</span>";
      }
      setTimeout(function(){
        resolve(data);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerCustom'
async function rwcListenerCustom(listenerComponent = null, fieldSelector = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners[listenerComponent.dataset.listener].topicName,
    messageType : configJSON.listeners[listenerComponent.dataset.listener].topicMessageType
  });

  rwcNode = await subCustom(listener, listenerComponent, fieldSelector);

  return rwcNode;
}

async function prepareListenerData(listener, listenerComponent = null, fieldSelector = null){
  rwcListenerData = await awaitListenerData(listener, listenerComponent, fieldSelector);
  return rwcListenerData;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function awaitListenerData(listener, listenerComponent = null, fieldSelector = null){
  return new Promise(function(resolve) {
    setTimeout(function(){
      if (Object.keys(listeners).includes(listener)){
        rwcListenerData = listeners[listener](listenerComponent)
      }
      else {
        rwcListenerData = rwcListenerCustom(listenerComponent, fieldSelector);
      }
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
      prepareListenerData(this.dataset.listener, this, this.dataset.fieldSelector);
    }
  }
}

customElements.define("rwc-text-listener", rwcTextListener);


// --- Listener functions ---
// Listener function 'rwcListenerGetCurrentPage'
async function rwcListenerGetCurrentPage(listenerComponent = null){
  var listener = currentPageTopic;

  // promise function called and function execution halts until
  // the promise is resolved
  rwcCurrentPage = await subCurrentPage(listener, listenerComponent);

  return rwcCurrentPage;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subCurrentPage(listener, listenerComponent = null){
  var rwcCurrentPage = currentPage;
  return new Promise(function(resolve) {
    if (listenerComponent === null){
      listener.unsubscribe();
    }
    else if (listenerComponent.dataset.live === "false"){
      listenerComponent.shadowRoot.innerHTML = "<span>" + currentPage + "</span>";
      listener.unsubscribe();
    }
    else {
      listenerComponent.shadowRoot.innerHTML = "<span>" + currentPage + "</span>";
    }
    setTimeout(function(){
      resolve(currentPage);
    }, 50);
  });
}


// Listener function 'rwcListenerGetPosition'
async function rwcListenerGetPosition(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPosition = await subPosition(listener, listenerComponent);

  return rwcPosition;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subPosition(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      var rwcPosition = [message.pose.pose.position.x,
        message.pose.pose.position.y,
        message.pose.pose.position.z];
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcPosition + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcPosition + "</span>";
      }
      setTimeout(function(){
        resolve(rwcPosition);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetOrientation'
async function rwcListenerGetOrientation(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.odom.topicName,
    messageType : configJSON.listeners.odom.topicMessageType
  });

  rwcOrientation = await subOrientation(listener, listenerComponent);

  return rwcOrientation;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subOrientation(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      var rwcOrientation = [message.pose.pose.orientation.x,
        message.pose.pose.orientation.y,
        message.pose.pose.orientation.z,
        message.pose.pose.orientation.w];
        if (listenerComponent === null){
          listener.unsubscribe();
        }
        else if (listenerComponent.dataset.live === "false"){
          listenerComponent.shadowRoot.innerHTML = "<span>" + rwcOrientation + "</span>";
          listener.unsubscribe();
        }
        else {
          listenerComponent.shadowRoot.innerHTML = "<span>" + rwcOrientation + "</span>";
        }
      setTimeout(function(){
        resolve(rwcOrientation);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetNearestPersonPosition'
async function rwcListenerGetNearestPersonPosition(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.nearest_person_pose.topicName,
    messageType : configJSON.listeners.nearest_person_pose.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcNearestPersonPosition = await subNearestPersonPosition(listener, listenerComponent);

  return rwcNearestPersonPosition;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subNearestPersonPosition(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      rwcNearestPersonPosition = [message.pose.position.x,
        message.pose.position.y,
        message.pose.position.z];
        if (listenerComponent === null){
          listener.unsubscribe();
        }
        else if (listenerComponent.dataset.live === "false"){
          listenerComponent.shadowRoot.innerHTML = "<span>" + rwcNearestPersonPosition + "</span>";
          listener.unsubscribe();
        }
        else {
          listenerComponent.shadowRoot.innerHTML = "<span>" + rwcNearestPersonPosition + "</span>";
        }
      setTimeout(function(){
        resolve(rwcNearestPersonPosition);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetPeoplePositions'
async function rwcListenerGetPeoplePositions(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.people_pose_array.topicName,
    messageType : configJSON.listeners.people_pose_array.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPeoplePoses = await subPeoplePositions(listener, listenerComponent);

  rwcPeoplePositions = [];
  rwcPeoplePoses.forEach(function(person_pose){
    rwcPeoplePositions.push([person_pose.position.x, person_pose.position.y, person_pose.position.z]);
  });

  return rwcPeoplePositions;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subPeoplePositions(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      rwcPeoplePositions = message.poses;
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcPeoplePositions + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcPeoplePositions + "</span>";
      }
      setTimeout(function(){
        resolve(rwcPeoplePositions);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetNumberOfPeople'
async function rwcListenerGetNumberOfPeople(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.people_pose_array.topicName,
    messageType : configJSON.listeners.people_pose_array.topicMessageType
  });

  // promise function called and function execution halts until
  // the promise is resolved
  rwcPeoplePoses = await subPeoplePositions(listener, listenerComponent);

  return rwcPeoplePositions.length;
}

// Listener function 'rwcListenerGetNode'
async function rwcListenerGetNode(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.current_node.topicName,
    messageType : configJSON.listeners.current_node.topicMessageType
  });

  rwcNode = await subNode(listener, listenerComponent);

  return rwcNode;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subNode(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      var rwcNode = message.data;
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcNode + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcNode + "</span>";
      }
      setTimeout(function(){
        resolve(rwcNode);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetBatteryPercentage'
async function rwcListenerGetBatteryPercentage(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.battery_state.topicName,
    messageType : configJSON.listeners.battery_state.topicMessageType
  });

  rwcBatteryPercentage = await subBatteryPercentage(listener, listenerComponent);

  return rwcBatteryPercentage;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subBatteryPercentage(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      var rwcBatteryPercentage = message.lifePercent;
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcBatteryPercentage + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcBatteryPercentage + "</span>";
      }
      setTimeout(function(){
        resolve(rwcBatteryPercentage);
      }, 50);
    });
  });
}

// Listener function 'rwcListenerGetVolumePercent'
async function rwcListenerGetVolumePercent(listenerComponent = null){
  // Topic info loaded from rwc-config JSON file
  var listener = new ROSLIB.Topic({
    ros : ros,
    name : configJSON.listeners.volume.topicName,
    messageType : configJSON.listeners.volume.topicMessageType
  });

  rwcVolumePercent = await subVolumePercent(listener, listenerComponent);

  return rwcVolumePercent;
}

// Promise returns value 50ms after subscribing to topic,
// preventing old or undefined values from being returned
function subVolumePercent(listener, listenerComponent = null){
  return new Promise(function(resolve) {
    listener.subscribe(function(message) {
      var rwcVolumePercent = message.data;
      if (listenerComponent === null){
        listener.unsubscribe();
      }
      else if (listenerComponent.dataset.live === "false"){
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcVolumePercent + "</span>";
        listener.unsubscribe();
      }
      else {
        listenerComponent.shadowRoot.innerHTML = "<span>" + rwcVolumePercent + "</span>";
      }
      setTimeout(function(){
        resolve(rwcVolumePercent);
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


// Run when page has finished loading
$("document").ready(function(){
  // Get `/rwc/current_page`
  currentPageTopic.subscribe(function(data){
    currentPage = data.data;
    console.log("Displaying information from page '" + currentPage + "'");

    // Create div to store elements loaded from `/rwc/current_page`
    pageContainerDiv = document.createElement("div");
    pageContainerDiv.setAttribute("id", "pageContainerDiv");
    document.body.appendChild(pageContainerDiv);

    // Load elements from `/rwc/current_page` if they are not scripts / css
    $.get(currentPage, function(currentPageHTML){
      var currentPageObject = $(currentPageHTML);

      for (i = 0; i < currentPageObject.length; i++){
        if(!(headElementNames.includes(currentPageObject[i].constructor.name))){
          $("#pageContainerDiv").append(currentPageObject[i]);
        }
      }
    });
  });

  // Create spinner element
  spinner = document.createElement("div");
  spinner.setAttribute("class", "spin");
  document.body.appendChild(spinner);

  // Get `/interface_enabled` param and style elements accordingly
  window.setInterval(function(){
    interfaceBusyParam.get(function(interface_busy){
      if (interface_busy) {
        toggleableComponents.forEach(function (element) {
          element.disabled = true;
        });
        $(".spin").spin("show");
      } else {
        toggleableComponents.forEach(function (element) {
          if (!(disabledComponentIDs.includes(element.dataset.id))){
            element.enable();
          }
          $(".spin").spin("hide");
        });
      }
    });

    disabledTopic.subscribe(function(message){
      disabledComponentIDs = JSON.parse(message.data);
      toggleableComponents.forEach(function(element){
        if (disabledComponentIDs.includes(element.dataset.id)){
          element.disable();
        }
      });
    });
  }, 500);

  //Subscibe to `/rwc/components_currently_clicked` to signify clicks with CSS change
  clickedTopic.subscribe(function(message){
    var componentsClicked = JSON.parse(message.data);
    toggleableComponents.forEach(function(component){
      if (componentsClicked[component.dataset.id]){
        if (component.constructor.name === "rwcButtonActionStart" || component.constructor.name === "rwcButtonLoadPage"){
          if (component.hasAttribute("data-clicked-class")){
            component.shadowRoot.querySelector("div").setAttribute("class", component.dataset.clickedClass);  
          } else {
            component.shadowRoot.querySelector("div").setAttribute("class", "rwc-button-action-start-clicked");
          }
        } else if (component.constructor.name === "rwcTextActionStart" || component.constructor.name === "rwcTextLoadPage"){
          if (component.hasAttribute("data-clicked-class")){
            component.shadowRoot.querySelector("div").setAttribute("class", component.dataset.clickedClass);  
          } else {
            component.shadowRoot.querySelector("span").setAttribute("class", "rwc-text-action-start-clicked");
          }
        } else if (component.constructor.name === "rwcImageActionStart" || component.constructor.name === "rwcImageLoadPage"){
          if (component.hasAttribute("data-clicked-class")){
            component.shadowRoot.querySelector("div").setAttribute("class", component.dataset.clickedClass);  
          } else {
            component.shadowRoot.querySelector("img").setAttribute("class", "rwc-img-action-start-clicked");
          }
        }
      }
    });
  });


  // Subscribe text listeners
  setTimeout(function(){
    staticListenerComponents.forEach(function(item, index){
      setTimeout(function(){item.update();}, 500);
    });

    liveListenerComponents.forEach(function(item, index){
      setTimeout(function(){item.update();}, 500);
    });
  }, 500);

  // --- Speech bubbles ---
  // Load CSS
  var cssLink = $("<link rel='stylesheet' type='text/css' href='/roswebcomponents/styles/speechbubble.css'>");
  $("head").append(cssLink);

  function robot_speech_bubble(text) {
    bubble_el = '<p class="speech" style="display:none">' + text + '</p>';
    $("body").append(bubble_el);
    return $(".speech");
  }

  // List of speech bubbles to populate
  var $speech_bubbles = {};

  // show the robot's speech dialog bubble
  function Show_robot_speech(str, id, mode) {
    $speech_bubbles[id] = robot_speech_bubble(str);
    $speech_bubbles[id].slideDown();
    $speech_bubbles[id].attr("style", "display: block");
    console.log("open bubble" + id);
  }

  // close the robot's dialog bubble when the robot finished to speak
  function Receive_robot_speech_result(str, id, mode) {
    if(mode=='nonblock' && id in $speech_bubbles) {
      $speech_bubbles[id].slideUp();
      $speech_bubbles[id].remove();
      delete $speech_bubbles[id];
      console.log("removed bubble" + id);
    } else {
      for (var i=0; i<$speech_bubbles.length; i++) {
        $speech_bubbles[i].slideUp();
        $speech_bubbles[i].remove();
        delete $speech_bubbles[i];
      }
      console.log("removed all the speech bubbles")
    }
  }

  // Subscribe to `/speak` topics for speech bubbles
  var speakGoalTopic = new ROSLIB.Topic({
    ros : ros,
    name : "/speak/goal",
    messageType : "mary_tts/maryttsActionGoal"
  });

  var speakResultTopic = new ROSLIB.Topic({
    ros : ros,
    name : "/speak/result",
    messageType : "mary_tts/maryttsActionResult"
  });

  var speakCancelTopic = new ROSLIB.Topic({
    ros : ros,
    name : "/speak/cancel",
    messageType : "actionlib_msgs/GoalID"
  });

  speakGoalTopic.subscribe(function(msg) {
    console.log('listener_speech_goal msg.goal='+msg.goal.text);
    Show_robot_speech(msg.goal.text, msg.goal_id.id, 'nonblock');
  });

  speakResultTopic.subscribe(function(msg) {
    console.log('listener_speech_result msg.result='+msg.result);
    Receive_robot_speech_result(msg.result.text, msg.status.goal_id.id,'nonblock');
  });

  speakCancelTopic.subscribe(function(msg) {
    console.log('listener_speech_result msg.result='+msg);
    Receive_robot_speech_result();
  });

  // Insert modal div element
  var modalDiv = document.createElement('div');
  modalDiv.setAttribute('role', 'modal');
  document.body.appendChild(modalDiv);

  // Subscribe to modal topics
  showModalTopic.subscribe(function(msg) {
    console.log('listener interface show modal msg.data='+msg.data);
    rwcActionYesNoModal(msg.data);
  });

  showModalCloseTopic.subscribe(function(msg) {
    console.log('listener interface show modal msg.data='+msg.data);
    Close_modal(msg.data);

  // Create stop button element
  stopButton = document.createElement("div");
  stopButton.setAttribute("class", "cancel-button-receiver");
  stopButtonSpan = document.createElement("span");
  stopButtonSpan.innerHTML = "Cancel action";
  stopButton.appendChild(stopButtonSpan);
  document.body.appendChild(stopButton);
  });
});