[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components](/docs/ui-components.md)
# roswebcomponents
A JavaScript library for rapid development of [ROS](https://www.ros.org/) connected web interfaces.

This library provides [custom HTML UI components](/docs/ui-components.md) which interface with JavaScript functions to abstract [roslibjs](https://github.com/RobotWebTools/roslibjs), simplifying publishing and subscribing to topics down to making a one-line function call, or simply writing a HTML tag, for a set of common robot behaviours and data sources. The functions are split into two categories:
1. [Action functions](/docs/action-functions.md), which trigger robot behaviours.
2. [Listener functions](/docs/listener-functions.md), which return data from the robot.

## Setup
Copy this repository's files into the root of your website, and in the `<head>` tag of any pages in which you wish to use 'roswebcomponents' paste the following to include this library and its JS and CSS dependencies:
```html
<link rel="stylesheet" href="styles/jquery.spin.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="styles/rwc-styles.css">
<link rel="stylesheet" href="styles/rwc-user-styles.css">
<script
src="https://code.jquery.com/jquery-3.4.1.min.js"
integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
crossorigin="anonymous"></script>
<script src="scripts/jquery.spin.js"></script>
<script src="scripts/jsQR.js"></script>
<script src="scripts/mobile-detect.min.js"></script>
<script src="scripts/eventemitter2.js"></script>
<script src="scripts/roslib.min.js"></script>
<script src="scripts/rwc.js?v=0.18"></script>
```

You must be running [ROS (Robot Operating System)](https://www.ros.org/) and [rosbridge](http://wiki.ros.org/rosbridge_suite/Tutorials/RunningRosbridge) on your robot, and must change the value of `rosbridge_websocket_url` in [rwc-config.json](/rwc-config.json) to the URL of your rosbridge websocket, e.g. `"ws://localhost:9090"` (shown in the output from the commmand `roslaunch rosbridge_server rosbridge_websocket.launch`, as in [this tutorial](http://wiki.ros.org/rosbridge_suite/Tutorials/RunningRosbridge)).

If you wish to run an interactive UI on one device and mirror the appearance and state of this interface on other secondary devices without allowing these secondary devices to interact with the interface, simply connect the internet browser of any secondary devices to the page [rwc-receiver.html](/rwc-receiver.html), while the main interface is running on the primary device.

Lastly, the rosbridge_websocket URL, names and actions of action servers, and names and message types of topics used by the library's action and listener web components can all be configured in [rwc-config.json](/rwc-config.json). See the default configuration for examples. This configuration file can also be used to create custom definitions of actions and listeners to be used by the library's action and listener components, more on that in [UI components](/docs/ui-components.md).