// Load config of topic and action server names from 'rwc-config.json'
var configJSON;
var currentActionClient;
var JSONreq = $.getJSON("rwc-config.json", function(json){
  configJSON = json;
});

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

// Array to track components which may be disabled / enabled
var toggleableComponents = [];

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

// Variables for tracking current page in a ROS topic
var currentPageTopic = new ROSLIB.Topic({
ros : ros,
name : "/rwc/current_page",
messageType : "std_msgs/String",
latch: true
});

var currentPageTopicString = new ROSLIB.Message({
data : ""
});

// Variables for tracking object click / touch interactions in a ROS topic
var clickedTopic = new ROSLIB.Topic({
ros : ros,
name : "/rwc/components_currently_clicked",
messageType : "std_msgs/String",
latch: true
});

var clickedTopicString = new ROSLIB.Message({
data : ""
});

// Variables for individually disabled components in a ROS topic
var disabledTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/rwc/disabled_components",
  messageType : "std_msgs/String",
  latch: true
});

var disabledTopicString = new ROSLIB.Message({
  data : ""
});

var disabledComponentIDs = [];

// ROS parameter '/interface_enabled'
var interfaceEnabledParam = new ROSLIB.Param({
ros: ros,
name: "/interface_enabled"
});

// Names of elements which appear in the head tag and should be removed from
// tags loaded from `/rwc/current_page`
var headElementNames = [
  "HTMLScriptElement",
  "HTMLLinkElement",
  "HTMLMetaElement"
];

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


// Run when page has finished loading
$("document").ready(function(){

  // Get `/rwc/current_page`
  var currentPage;
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

  // Create stop button element
  stopButton = document.createElement("div");
  stopButton.setAttribute("class", "cancel-button-receiver");
  stopButtonSpan = document.createElement("span");
  stopButtonSpan.innerHTML = "Cancel action";
  stopButton.appendChild(stopButtonSpan);
  document.body.appendChild(stopButton);

  // Create spinner element
  spinner = document.createElement("div");
  spinner.setAttribute("class", "spin");
  document.body.appendChild(spinner);

  // Get `/interface_enabled` param and style elements accordingly
  window.setInterval(function(){
    interfaceEnabledParam.get(function(interface_enabled){
      if (!(interface_enabled)) {
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
});