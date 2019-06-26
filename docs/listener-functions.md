[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components]()
# Listener functions
Listener functions return data from the robot. This data is obtained by subscribing to [ROS topics](http://wiki.ros.org/Topics) asynchronously using [roslibjs](https://github.com/RobotWebTools/roslibjs), and so these listener functions are [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), which return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), from which a value can be extracted once the function has obtained its value. This is done using the `then` method of the returned `Promise` object.

E.g., to obtain and log the value in the `Promise` returned by an `async function` named 'myFunction', you could write:
```
var myValue;
myFunction().then(function(value){myValue = value;});
console.log(myValue);
```

Listener functions:
 - rwcListenerGetPosition
 - rwcListenerGetOrientation
 - rwcListenerGetNode
 - rwcListenerGetBatteryPercentage
 - rwcListenerGetVolumePercent
 - rwcListenerGetCameraSnapshot (uses image from `web_video_server` ROS package, URI specified in config file)
 - rwcListenerGetQRCode (", and uses jsQR JavaScript API which detects QR codes in images and returns their data)
