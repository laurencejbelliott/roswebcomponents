[Home](https://github.com/laurencejbelliott/roswebcomponents) | [Action Functions](/docs/action-functions.md) | [Listener Functions](/docs/listener-functions.md) | [UI Components](/docs/ui-components.md)
# UI Components
This library provides a number of custom  elements with their own unique tags and attributes. Each element connects to ROS, either to provide a graphical interface for requesting an action on the connected robot, or to continuously display the latest data from a topic published by said robot.

## Action Components
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

### rwc-button-custom-action-start
- Description: A button which sends a user-specified goal with a user-specified message to a user-specified [action server](http://wiki.ros.org/actionlib) when clicked.
    - Example:

        ![alt text](/images/forward-half-m.png "A button with the text 'Forward 0.5 meters!'")

        
        ```html
        <rwc-button-custom-action-start
        data-id="moveActionStart"
        data-text="Forward 0.5m!"
        data-action-server-name="/move_base"
        data-action-name="move_base_msgs/MoveBaseAction"
        data-goal-msg-path="json-msgs/forward-half-m.json">
        </rwc-button-custom-action-start>
        ```

        JSON goal message in `json-msgs/forward-half-m.json`
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

        A button with the text 'Forward 0.5m!', which when clicked sends a goal to the `/move_base` [action server](http://wiki.ros.org/actionlib), with the message defined in JSON format in `json-msgs/forward-half-m.json` as shown above. This particular message specifies that the robot should move forward 0.5m from it's current position, and so this action is performed when the button is clicked.
    
    - Attributes:
        - data-action-server-name
            - Description: The name of the action server which you wish to send a goal to when the button is clicked.
            - Example: `data-action-server-name="/move_base"`
        - data-action-name
            - Description: The name of the action associated with the given action server. This can be obtained in ROS by using the terminal command `rostopic info /<action-server-name>/goal`, replacing `<action-server-name>` with the name of your chosen action server, and looking for the text after `Type:` in the output, e.g. `Type: move_base_msgs/MoveBaseActionGoal`. Then the `Goal` suffix should be removed leaving `move_base_msgs/MoveBaseAction` for example.
            - Example: `data-action-name="move_base_msgs/MoveBaseAction"`
        - data-goal-msg-path
            - Description: The path of a JSON file which defines the action goal message in JSON format, as in the [example file](/json-msgs/forward-half-m.json).
            - Example: `data-goal-msg-path="json-msgs/forward-half-m.json"`
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

### rwc-text-custom-action-start
- Description: Bold and underlined text which sends a user-specified goal with a user-specified message to a user-specified [action server](http://wiki.ros.org/actionlib) when clicked.
    - Example:

        ![alt text](/images/text-action-start.png "Decorated text that reads: 'Forward 0.5 meters!'")
        
        
        ```html
        <rwc-text-custom-action-start
        data-id="moveActionStart"
        data-text="Forward 0.5m!"
        data-action-server-name="/move_base"
        data-action-name="move_base_msgs/MoveBaseAction"
        data-goal-msg-path="json-msgs/forward-half-m.json">
        </rwc-text-custom-action-start>
        ```

        JSON goal message in `json-msgs/forward-half-m.json`
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

        Text 'Forward 0.5m!', which when clicked sends a goal to the `/move_base` [action server](http://wiki.ros.org/actionlib), with the message defined in JSON format in `json-msgs/forward-half-m.json` as shown above. This particular message specifies that the robot should move forward 0.5m from it's current position, and so this action is performed when the text is clicked.
    
    - Attributes:
        - data-action-server-name
            - Description: The name of the action server which you wish to send a goal to when the text is clicked.
            - Example: `data-action-server-name="/move_base"`
        - data-action-name
            - Description: The name of the action associated with the given action server. This can be obtained in ROS by using the terminal command `rostopic info /<action-server-name>/goal`, replacing `<action-server-name>` with the name of your chosen action server, and looking for the text after `Type:` in the output, e.g. `Type: move_base_msgs/MoveBaseActionGoal`. Then the `Goal` suffix should be removed leaving `move_base_msgs/MoveBaseAction` for example.
            - Example: `data-action-name="move_base_msgs/MoveBaseAction"`
        - data-goal-msg-path
            - Description: The path of a JSON file which defines the action goal message in JSON format, as in the [example file](/json-msgs/forward-half-m.json).
            - Example: `data-goal-msg-path="json-msgs/forward-half-m.json"`
        - data-id
            - Description: Specifies an ID to be assigned to the tag's child `div` for CSS styling
            - Example: `data-id="myActionText"`
        - data-class
            - Description: Specifies a custom class to be assigned to the tag's child `div` for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-class="customTextClass"`
        - data-disabled-class
            - Description: Specifies a custom class to be assigned to the tag's child `div` when the interaction is disabled, for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-disabled-class="customDisabledTextClass"`
        - data-disabled
            - Description: Set this to `true` to have the text load in a disabled state. Otherwise the interaction is enabled when loaded, by default.
            - Example: `data-disabled="true"`
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

### rwc-button-custom-action-start
- Description: An image which sends a user-specified goal with a user-specified message to a user-specified [action server](http://wiki.ros.org/actionlib) when clicked.
    - Example:

        ![alt text](/images/lcas-logo.png "The L-CAS (Lincoln Centre for Autonomous Systems) logo")

        
        ```html
        <rwc-img-custom-action-start
        src="images/lcas-logo.png"
        data-id="moveActionStart"
        data-action-server-name="/move_base"
        data-action-name="move_base_msgs/MoveBaseAction"
        data-goal-msg-path="json-msgs/forward-half-m.json">
        </rwc-img-custom-action-start>
        ```

        JSON goal message in `json-msgs/forward-half-m.json`
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

        An image which when clicked sends a goal to the `/move_base` [action server](http://wiki.ros.org/actionlib), with the message defined in JSON format in `json-msgs/forward-half-m.json` as shown above. This particular message specifies that the robot should move forward 0.5m from it's current position, and so this action is performed when the image is clicked.
    
    - Attributes:
        - src
            - Description: Specifies the path of the image to be displayed.
            - Example: `src="images/lcas-logo.png"`
        - data-action-server-name
            - Description: The name of the action server which you wish to send a goal to when the image is clicked.
            - Example: `data-action-server-name="/move_base"`
        - data-action-name
            - Description: The name of the action associated with the given action server. This can be obtained in ROS by using the terminal command `rostopic info /<action-server-name>/goal`, replacing `<action-server-name>` with the name of your chosen action server, and looking for the text after `Type:` in the output, e.g. `Type: move_base_msgs/MoveBaseActionGoal`. Then the `Goal` suffix should be removed leaving `move_base_msgs/MoveBaseAction` for example.
            - Example: `data-action-name="move_base_msgs/MoveBaseAction"`
        - data-goal-msg-path
            - Description: The path of a JSON file which defines the action goal message in JSON format, as in the [example file](/json-msgs/forward-half-m.json).
            - Example: `data-goal-msg-path="json-msgs/forward-half-m.json"`
        - data-id
            - Description: Specifies an ID to be assigned to the image for CSS styling
            - Example: `data-id="myActionImage"`
        - data-class
            - Description: Specifies a custom class to be assigned to the image for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-class="customImageClass"`
        - data-disabled-class
            - Description: Specifies a custom class to be assigned to the image when interaction is disabled, for CSS styling, overriding the default styling in `styles/rwc-styles.css`. Custom CSS should be defined in `styles/rwc-user-styles.css`.
            - Example: `data-disabled-class="customDisabledImageClass"`
        - data-disabled
            - Description: Set this to `true` to have the image load in a disabled state. Otherwise interaction is enabled when loaded, by default.
            - Example: `data-disabled="true"`