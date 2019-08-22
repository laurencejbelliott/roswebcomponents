[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components](/docs/ui-components.md)
# UI Components
This library provides a number of custom  elements with their own unique tags and attributes. Each element connects to ROS, either to provide a graphical interface for requesting an action on the connected robot, or to continuously display the latest data from a topic published by said robot.

## Action Components
Note: Action components should each be assigned a unique ID using their HTML tag's `data-id` attribute. On top of allowing individual CSS styling of these components, these IDs are used by this library to track the state of components, such as if each component is enabled or disabled.

### cancel-button
- Description: A red button with the text 'cancel action' which is automatically added to the bottom-left corner of the page. When the button is clicked the most recently started action is cancelled.
- Example:

    ![alt text](/images/cancel-button.png "A red button with the text 'Cancel action'")
### rwc-button-action-start
- Description: A button which calls an [action function](/docs/action-functions.md) when clicked.
    - Example:

        ![alt text](/images/hello-button.png "A button with the text 'Say hello!'")

        
        ```html
        <rwc-button-action-start
        data-id="speakActionStart"
        data-text="Say hello!"
        data-action="say"
        data-action-parameters="Hello everyone!">
        </rwc-button-action-start>
        ```
        A button with the text 'Say hello!', which calls the `rwcActionSay` [action function](/docs/action-functions.md) with the parameter "Hello everyone!", resulting in the robot speaking the phrase when the button is clicked.
    
    - Attributes:
        - data-id
            - Description: Specifies an ID to be assigned to the button's child `div` for CSS styling
            - Example: `data-id="myActionButton"`
        - data-class
            - Description: Specifies a custom class to be assigned to the button's child `div` for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-class="customButtonClass"`
        - data-disabled-class
            - Description: Specifies a custom class to be assigned to the button's child `div` when the button is disabled, for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-disabled-class="customDisabledButtonClass"`
        - data-disabled
            - Description: Set this to `true` to have the button load in a disabled state. Otherwise the button is enabled when loaded, by default.
            - Example: `data-disabled="true"`
        - data-action
            - Description: The name of the [action function](/docs/action-functions.md) to be called when the button is clicked. The name should be specified in camelCase without the `rwcAction` prefix, as in the example.
            - Example: `data-action="setPoseRelative"`        
        - data-action-parameters
            - Description: The parameter(s) of the [action function](/docs/action-functions.md) specified by the `data-action` attribute. Though  tag attributes are `String` data, numerical data, and comma seperated parameters are handled by the API before calling the action function. It should be noted that at this time the optional quaternion in the parameters of the `setPose...` action functions cannot be defined in this attribute. 
            - Example: `data-action-parameters="WayPoint20"`
            - Example: `data-action-parameters="1, 0, 0"`
            - Example: `data-action-parameters="-100"`
            - Example: `data-action-parameters="Hello world!"`
        - data-text
            - Description: Defines the text which is displayed inside the button.
            - Example: `data-text="Click me!"`

### rwc-text-action-start
- Description: Bold and underlined text which calls an [action function](/docs/action-functions.md) when clicked.
    - Example:

        ![alt text](/images/text-action-start.png "Decorated text that reads: 'Forward 0.5 meters!'")

        
        ```html
        <rwc-text-custom-action-start
        data-id="moveActionStart"
        data-text="Forward 0.5m!"
        data-action="setPoseRelative"
        data-action-parameters="0.5, 0, 0">
        </rwc-text-custom-action-start>
        ```
        Bold and underlined text that reads: 'Forward 0.5 meters!', which calls the `rwcActionSetPoseRelative` [action function](/docs/action-functions.md) with the parameters x: 0.5, y: 0, z: 0, resulting in the robot moving forward half a meter when the text is clicked.
    
    - Attributes:
        - data-id
            - Description: Specifies an ID to be assigned to the tag's child `div` for CSS styling
            - Example: `data-id="myActionText"`
        - data-class
            - Description: Specifies a custom class to be assigned to the tag's child `div` for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-class="customTextClass"`
        - data-disabled-class
            - Description: Specifies a custom class to be assigned to the tag's child `div` when the button is disabled, for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-disabled-class="customDisabledButtonClass"`
        - data-disabled
            - Description: Set this to `true` to have the tag load in a disabled state. Otherwise the interaction is enabled when loaded, by default.
            - Example: `data-disabled="true"`
        - data-action
            - Description: The name of the [action function](/docs/action-functions.md) to be called when the text is clicked. The name should be specified in camelCase without the `rwcAction` prefix, as in the example.
            - Example: `data-action="setPoseRelative"`        
        - data-action-parameters
            - Description: The parameter(s) of the [action function](/docs/action-functions.md) specified by the `data-action` attribute. Though  tag attributes are `String` data, numerical data, and comma seperated parameters are handled by the API before calling the action function. It should be noted that at this time the optional quaternion in the parameters of the `setPose...` action functions cannot be defined in this attribute. 
            - Example: `data-action-parameters="WayPoint20"`
            - Example: `data-action-parameters="1, 0, 0"`
            - Example: `data-action-parameters="-100"`
            - Example: `data-action-parameters="Hello world!"`
        - data-text
            - Description: Defines the text which is displayed inside the tag.
            - Example: `data-text="Click me!"`

### rwc-img-action-start
- Description: An image which calls an [action function](/docs/action-functions.md) when clicked.
    - Example:

        ![alt text](/images/lcas-logo.png "The L-CAS (Lincoln Centre for Autonomous Systems) logo")
        
        
        ```html
        <rwc-img-action-start src="images/lcas-logo.png"
        data-action="say"
        data-action-parameters="You have clicked the L-CAS logo!"></rwc-img-custom-action-start>
        ```
        An image which calls the `rwcActionSay` [action function](/docs/action-functions.md) with the parameter "You have clicked the L-CAS logo!", resulting in the robot speaking the phrase when the image is clicked.
    
    - Attributes:
        - src
            - Description: Specifies the path of the image to be displayed.
            - Example: `src="images/lcas-logo.png"`
        - data-id
            - Description: Specifies an ID to be assigned to the tag for CSS styling.
            - Example: `data-id="myActionImage"`
        - data-class
            - Description: Specifies a custom class to be assigned to the tag for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-class="customImageClass"`
        - data-disabled-class
            - Description: Specifies a custom class to be assigned to the tag when interaction is disabled, for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-disabled-class="customDisabledImageClass"`
        - data-disabled
            - Description: Set this to `true` to have the image load in a disabled state. Otherwise the interaction is enabled when loaded, by default.
            - Example: `data-disabled="true"`
        - data-action
            - Description: The name of the [action function](/docs/action-functions.md) to be called when the image is clicked. The name should be specified in camelCase without the `rwcAction` prefix, as in the example.
            - Example: `data-action="setPoseRelative"`        
        - data-action-parameters
            - Description: The parameter(s) of the [action function](/docs/action-functions.md) specified by the `data-action` attribute. Though  tag attributes are `String` data, numerical data, and comma seperated parameters are handled by the API before calling the action function. It should be noted that at this time the optional quaternion in the parameters of the `setPose...` action functions cannot be defined in this attribute. 
            - Example: `data-action-parameters="WayPoint20"`
            - Example: `data-action-parameters="1, 0, 0"`
            - Example: `data-action-parameters="-100"`
            - Example: `data-action-parameters="Hello world!"`


### Sending custom action goals with an action component
- To create an action component, e.g. a button, which sends a user-specified goal with a user-specified message to a user-specified [action server](http://wiki.ros.org/actionlib) when clicked, you must first define your own name for this custom action, as well as the name of the action server and action in [rwc-config.json](/rwc-config.json).
Example JSON in [rwc-config.json](/rwc-config.json), inside `actions.actionServers`:
    ```json
    "move_base_custom_example": {
        "actionServerName": "/move_base",
        "actionName": "move_base_msgs/MoveBaseAction"
    }
    ```
- Next you must define a goal message to send to your custom action server, in JSON format, and save this in a `.json` file somewhere within your website. Here's an example, [forward-half-m.json](/json-msgs/forward-half-m.json), a `move_base_msgs/MoveBaseActionGoal` which moves the robot 0.5m forward from its current position:
    ```json
    {
        "target_pose":{
            "header":{
                "frame_id":"base_link"
            },
            "pose":{
                "position":{
                    "x":0.5,
                    "y":0,
                    "z":0
                    },
                "orientation":{
                    "x":0,
                    "y":0,
                    "z":0,
                    "w":1
                }
            }
        }
    }
    ```
- Lastly, in the HTML tag of the action component which you want to use to send your custom action goal to your custom action server, you must define the following additional attributes:
    - `data-action`
        - Description: The name which you have given to your custom action server in [rwc-config.json](/rwc-config.json).
        - Example: `data-action="move_base_custom_example"`
    - `data-goal-msg-path`
        - Description: The path to the JSON file which defines the message of the goal to be sent to the action server when the action component is pressed / clicked.
        - Example: `data-goal-msg-path="json-msgs/forward-half-m.json"`
- Here's an example of a full HTML tag for a button which sends a custom action goal when clicked, moving the robot forward 0.5m:
    ```html
    <rwc-button-action-start
    data-id="moveActionStartCustom"
    data-text="Forward 0.5m!"
    data-action="move_base_custom_example"
    data-goal-msg-path="json-msgs/forward-half-m.json">
    </rwc-button-action-start>
    ```

## Listener Components
### rwc-text-listener
- Description: Text which displays the data returned by a [listener function](/docs/listener-functions.md), updating continuously to reflect changes in the returned data.
    - Example:

        ![alt text](/images/text-listener.png "Text that reads: 'Current node: WayPoint33'")
        
        ```html
        Current node: <rwc-text-listener data-listener="getNode"></rwc-text-listener>
        ```
        Text that reads: 'Current node: WayPoint33', calling the `getNode` [listener function](/docs/listener-functions.md) and displaying the returned value as text after 'Current node: '.
    
    - Attributes:
        - data-listener
            - Description: Specifies the name of the listener function to display data from. The name should be specified in camelCase without the `rwcListener` prefix, as in the example.
            - Example: `data-listener="getNode"`
        - data-live
            - Description: If set to false then the value returned by the chosen listener function will displayed when the element is loaded, and will not be updated thereafter.
            - Example: `data-live="false"`

### Subscribing listener components to custom topics
To create an `rwc-text-listener` which subscibes to a custom topic for which this library does not provide a listener function, you must first define this topic in the `listeners` field of [rwc-config.json](/rwc-config.json), specifying the topic name and topic message type, for example:
```json
"odom_custom_example": {
    "topicName": "/odom",
    "topicMessageType": "nav_msgs/Odometry"
}
```
Then you simply have to use the name you have given this topic, e.g. `odom_custom_example` as the value for the `data-listener` attribute of your `rwc-text-listener`'s HTML tag, and define the attribute `data-field-selector`: the selector for the particular part of the topic's message that you wish to display. Here's an example which displays the robot's position:
```html
Robot position custom: <rwc-text-listener
data-listener="odom_custom_example"
data-field-selector="pose.pose.position"></rwc-text-listener>
```
When `data-field-selector` selects a single variable within a topic's message, the variable will be displayed as expected, but it should be noted that for collections of variables, these collections will be displayed in JSON format. To illustrate this, here is what the above example displays:

![alt text](/images/text-listener-custom.png "Text which reads 'Robot position custom:', followed by coordinates")