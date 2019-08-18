 // Connecting to ROS
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

var moveBaseClient = new ROSLIB.ActionClient({
    ros: ros,
    serverName: '/move_base',
    actionName: 'move_base_msgs/MoveBaseAction'
});

var goal = new ROSLIB.Goal({
    actionClient: moveBaseClient,
    goalMessage: {
        target_pose: {
          header: {
            frame_id: "map"
          },
          pose: {
            position: {
              x: 2.0,
              y: 0.0,
              z: 0.0
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: 0.0,
              w: 1.0
            }
          }
        }
      }
});

goal.on('feedback', function (feedback) {
    console.log('Feedback: ' + feedback.base_position.pose.position.y);
});

goal.on('result', function (status) {    
    console.log('Final result: ' + status);
});


$(document).ready(function () {
    clickP = $("#clickForAction");
    clickP.css("cursor", "pointer");
    clickP.css("font-size", "20px");
    $(document).on('click', '#clickForAction', function () {
        goal.send();
        console.log("Goal sent!");
    });
});