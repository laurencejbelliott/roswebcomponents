[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components](/docs/ui-components.md)
# Action functions
 - rwcActionSetPoseRelative
    - Arguments: `x, y, z, quaternion = {x: 0, y: 0, z: 0, w: 1}`
    - Description: Tells the robot to move to a new pose relative to its current pose.
    - Example: `rwcActionSetPoseRelative(1, 0, 0);`
        - Tells the robot to move forward 1m. 
 - rwcActionSetPoseMap
    - Arguments: `x, y, z, quaternion = {x: 0, y: 0, z: 0, w: 1}`
    - Description: Tells the robot to move to a new pose relative to the origin of its map.
    - Example: `rwcActionSetPoseMap(5, 5, 0);`
        - Tells the robot to move to x: 5, y: 5 in its metric map. 
 - rwcActionGoToNode
    - Arguments: `node_name, no_orientation = false`
    - Description: Tells the robot to move the topological node '`node_name`'.
    - Example: `rwcActionGoToNode("WayPoint32");`
        - Tells the robot to move to the topological node 'WayPoint32'. 
 - rwcActionVolumePercentChange
    - Arguments: `percentage_change`
    - Description: Changes the master audio volume of the robot's speaker by `percentage_change` percent. Depends on the [audio-volume](https://github.com/laurencejbelliott/audio-volume) ROS package.
    - Example: `rwcActionVolumePercentChange(20);`
        - Changes the master audio volume of the robot's speaker by +20%.
    - Example: `rwcActionVolumePercentChange(-100);`
        - Changes the master audio volume of the robot's speaker by -100%, effectively muting the speaker.
- rwcActionVolumePercentSet
    - Arguments: `percentage`
    - Description: Set the master audio volume of the robot's speaker to `percentage` percent. Depends on the [audio-volume](https://github.com/laurencejbelliott/audio-volume) ROS package.
    - Example: `rwcActionVolumePercentSet(20);`
        - Sets the master audio volume of the robot's speaker at 20%.
    - Example: `rwcActionVolumePercentSet(0);`
        - Sets the master audio volume of the robot's speaker at 0%, effectively muting the speaker.
 - rwcActionSay
    - Arguments: `phrase`
    - Description: Asks the robot to speak the given `phrase` using TTS (Text To Speech). By default this library uses [MaryTTS](https://github.com/strands-project/strands_ui/tree/hydro-devel/mary_tts), but you can specify an ActionServer name and goal message type for your own TTS ActionServer in [rwc-config.json](/rwc-config.json) under "actions" > "actionServers" > "speak".
    - Example: `rwcActionSay("Hello world!");`
        - Tells the robot to speak the phrase "Hello world!" using TTS.


## Action function callbacks
Each action function returns a [ROSLIB.Goal](http://robotwebtools.org/jsdoc/roslibjs/r2/symbols/ROSLIB.Goal.html) object. By using the jQuery `.on` method, you can define a callback function to be executed when the goal is completed (sucessfully or otherwise). For example, you can define a callback function for the completion of the goal sent by `rwcActionGoToNode("WayPoint2")` with the following code:
```javascript
rwcActionGoToNode("WayPoint2").on('result', function(){
    console.log("Navigation to waypoint 2 ended!");
});
```
If you want to access the goal's status to see for example if the goal completed sucessfully, it's best to assign the goal returned by an action function to variable, then define the callback, within which you can access the goal's status as so:
```javascript
var myAction = rwcActionGoToNode("WayPoint2");
myAction.on('result', function(){console.log(myAction.status.status)});
```
This status is a number which corresponds to a particular string describing the status of the goal, as seen in the [documentation of actionlib_msgs/GoalStatus Message](http://docs.ros.org/kinetic/api/actionlib_msgs/html/msg/GoalStatus.html). This library provides a global array of these strings indexed according to their ID, so that you can quickly find the meaning of a goal's status. Using this to display the status of a goal upon its completion can be done as follows:
```javascript
var myAction = rwcActionGoToNode("WayPoint2");
myAction.on('result', function(){console.log(goalStatusNames[myActionSay.status.status])});
```

## [Lindsey](https://lcas.lincoln.ac.uk/wp/projects/lindsey-a-robot-tour-guide/) action functions
- rwcActionGazeAtPosition
    - Arguments: `x, y, z, secs`
    - Description: Tells the robot to gaze at the given position for `secs` seconds. This function relies on the ROS package [strands_gazing](https://github.com/strands-project/strands_hri/tree/hydro-devel/strands_gazing), and is intended for use with STRANDS project robots.
    - Example: `rwcActionGazeAtPosition(1, 2, 0, 60)`
        - Tells the robot to gaze at the co-ordinates x: 1, y: 2, z: 0 on its metric map for 60 seconds.
 - rwcActionDescribeExhibit
    - Arguments: `name_or_key, duration=60*5`
    - Description: Tells Lindsey to describe the exhibit corresponding to the given name or key, taking up to a maximum of `duration` seconds to complete this task. Names and keys of exhibits can be obtained with the [listener functions](/docs/listener-functions.md) `rwcListenerGetExhibitNames`, `rwcListenerGetExhibitKeys`, and `rwcListenerGetExhibitKeysAndNames`.
    - Example: `rwcActionDescribeExhibit("Claudia Crysis tombstone");`
        - Tells Lindsey to describe the exhibit titled 'Claudia Crysis tombstone'.
    - Example: `rwcActionDescribeExhibit(1.2);`
        - Tells Lindsey to describe the exhibit with the key '1.2'.
 - rwcActionGoToAndDescribeExhibit
    - Arguments: `name_or_key, duration=60*30`
    - Description: Tells Lindsey to navigate to and describe the exhibit corresponding to the given name or key, taking up to a maximum of `duration` seconds to complete this task. While doing so Lindsey will ask nearby people to follow her to the exhibit, and when at exhibit will ask if people wan't to know more via a speech and touchscreen prompt. Names and keys of exhibits can be obtained with the [listener functions](/docs/listener-functions.md) `rwcListenerGetExhibitNames`, `rwcListenerGetExhibitKeys`, and `rwcListenerGetExhibitKeysAndNames`.
    - Example: `rwcActionGoToAndDescribeExhibit("Claudia Crysis tombstone");`
        - Tells Lindsey to navigate to and describe the exhibit titled 'Claudia Crysis tombstone'.
    - Example: `rwcActionGoToAndDescribeExhibit(1.2);`
        - Tells Lindsey to navigate to and describe the exhibit with the key '1.2'.
 - rwcActionStartTour
    - Arguments: `name_or_key, duration=60*60`
    - Description: Tells Lindsey to start the tour corresponding to the given name or key, taking up to a maximum of `duration` seconds to complete this task. Names and keys of exhibits can be obtained with the [listener functions](/docs/listener-functions.md) `rwcListenerGetTourNames`, `rwcListenerGetTourKeys`, and `rwcListenerGetTourKeysAndNames`.
    - Example: `rwcActionStartTour("Death and Burial tour");`
        - Tells Lindsey to start the tour titled 'Death and Burial tour'.
    - Example: `rwcActionStartTour("religion");`
        - Tells Lindsey to start the tour with the key 'religion'.