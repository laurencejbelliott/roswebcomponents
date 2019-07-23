[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components](/docs/ui-components.md)
# Listener functions
Listener functions return data from the robot. This data is obtained by subscribing to [ROS topics](http://wiki.ros.org/Topics) asynchronously using [roslibjs](https://github.com/RobotWebTools/roslibjs), and so these listener functions are [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), which return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), from which a value can be extracted once the function has obtained its value. This is done using the `then` method of the returned `Promise` object.

E.g., to obtain and log the value in the `Promise` returned by an `async function` named 'myFunction', you could write:
```javascript
var myValue;
myFunction().then(function(value){myValue = value;});
console.log(myValue);
```

Asynchronous Listener functions:
 - rwcListenerGetPosition
    - Return type: Number array.
    - Description: Gets the co-ordinates of the robot's position from odometry.
 - rwcListenerGetOrientation
     - Return type: Number array.
     - Description: Gets the quaternion of the robot's orientation from odometry.
 - rwcListenerGetNearestPersonPosition
    - Return type: Number array.
    - Description: Gets the co-ordinates of the nearest person's position from [the STRANDS project's Bayesian people tracker](https://strands.readthedocs.io/en/latest/strands_perception_people/bayes_people_tracker.html).
 - rwcListenerGetPeoplePositions
    - Return type: Array of Number arrays.
    - Description: Returns an array of arrays of the position co-ordinates of all people detected by [the STRANDS project's Bayesian people tracker](https://strands.readthedocs.io/en/latest/strands_perception_people/bayes_people_tracker.html).
 - rwcListenerGetNumberOfPeople
    - Return type: Number.
    - Description: Gets the number of people detected by [the STRANDS project's Bayesian people tracker](https://strands.readthedocs.io/en/latest/strands_perception_people/bayes_people_tracker.html).
 - rwcListenerGetNode
     - Return type: String.
     - Description: Gets the name of the topological node where the robot is currently positioned.
 - rwcListenerGetBatteryPercentage
     - Return type: Number.
     - Description: Gets the percentage of how completely the  robot's battery is charged.
 - rwcListenerGetVolumePercent
     - Return type: Number.
     - Description: Gets the percentage of the master audio volume of the robot's speaker.
 
 Other Listener functions (return a value instead of a `Promise`):

 - rwcListenerGetCameraSnapshot
     - Return type: Image. 
     - Description: Gets a [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement) with a `src` attribute set to the URI of a snapshot of the latest frame of video from a camera on the robot. This snapshot URI is made avaiable using the [web_video_server](http://wiki.ros.org/web_video_server) ROS package. And can be specified in [rwc-config.json](/rwc-config.json) under "listeners" > "camera_snapshot" > "uri".
 - rwcListenerGetQRCode
     - Return type: String.
     - Description:  Uses [jsQR](https://github.com/cozmo/jsQR) to detect the presence of a QR code in a snapshot of the latest frame of video from a camera on the robot. If a QR code is present then the function gets the encoded String data, otherwise the String `"No QR code detected!"` is returned. The URI of this snapshot is made avaiable using the [web_video_server](http://wiki.ros.org/web_video_server) ROS package. And can be specified in [rwc-config.json](/rwc-config.json) under "listeners" > "camera_snapshot" > "uri".
 - And more to follow shortly...
