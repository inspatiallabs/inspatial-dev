# InSpatial Trigger Bridge Architecture

```ascii
+------------------------------------------------------------------------------------+
|=========================INSPATIAL TRIGGER BRIDGE SYSTEM============================|
+------------------------------------------------------------------------------------+


+----------------------+       +----------------------------+
|                      |       |                            |
| TRIGGER REGISTRY     |------>|       TriggerBridge        |<-----+
|                      |       |                            |      |
| - Touch Triggers     |       | Event Queue | Processing   |      |
| - Sensor Triggers    |       | Mappings | Handler Registry|      |
| - Mouse Triggers     |       |                            |      |
| - Keyboard Triggers  |       +----------------------------+      |
| - Scene Triggers     |                    |                      |
| - Logic Triggers     |                    |                      |
| - Area Triggers      |                    v                      |
| - Generic Triggers   |       +----------------------------+      |
| - Gesture Triggers   |       |                            |      |
| - Custom Triggers    |       |    TRIGGER ACTION API      |      |
+----------------------+       |                            |      |
          ^                    | createTrigger()            |      |
          |                    | chainTriggers()            |      |
+---------+----------+         | trigger.disable()          |      |
|                    |         | trigger.update()           |      |
| TRIGGER LIFECYCLE  |         | trigger.fire()             |      |
| MANAGER            |<--------+----------------------------+      |
|                    |                                             |
| enable/disable     |                                             |
| destroy/update     |         +----------------------------+      |
+--------------------+         |                            |      |
                               |    TRIGGER PERFORMANCE     |------+
+--------------------+         |    MONITORING              |
|                    |         |                            |
| CONFIG MANAGER     |         +----------------------------+
|                    |
+--------------------+
         |
         v
+---------------------------------------------------------------------------------+
|                            PLATFORM ADAPTERS                                    |
+--------+-------------------------+---------------------+----------------------+
         |                         |                     |
         v                         v                     v
+------------------+      +--------------------+      +------------------+
|                  |      |                    |      |                  |
|   DOM Adapter    |<---->| Hierarchical       |<---->| InReal Engine    |
|                  |      | Native Adapter     |      | Adapter          |
+------------------+      +--------------------+      +------------------+
                                   |
                                   v
               +------------------------------------------+
               |        Native Sub-Platform Adapters      |
               |                                          |
               |  +----------+  +----------+ +----------+ |
               |  |          |  |          | |          | |
               |  | iOS      |  | VisionOS | | Android  | |
               |  | Adapter  |  | Adapter  | | Adapter  | |
               |  |          |  |          | |          | |
               |  +----------+  +----------+ +----------+ |
               |                                          |
               |  +----------+  +----------+              |
               |  |          |  |          |              |
               |  | AndroidXR|  | HorizonOS|              |
               |  | Adapter  |  | Adapter  |              |
               |  |          |  |          |              |
               |  +----------+  +----------+              |
               +------------------------------------------+
                                   |
                                   v
+----------------------------------------------------------------------------------+
|                          TRIGGER CATEGORIES                                      |
+------+-------+-------+--------+--------+-------+--------+--------+-------+-------+
| Touch| Sensor| Mouse | Keyboard| Scene | Logic | Area   | Gesture| Generic| Time |
|------|-------|-------|---------|-------|-------|--------|--------|-------|-------|
| ...  | ...   | ...   | ...     | ...   | ...   | ...    | ...    | ...   | ...   |
------------------------------------------------------------------------------------
                                   |
                                   v
+---------------------------------------------------------------------------------+
|                          APPLICATION LAYER                                      |
|                                                                                 |
|   const myTrigger = createTrigger({                                             |
|     type: "onEyeGaze",                                                          |
|     target: myObject,                                                           |
|     action: () => {},                                                           |
|     throttle: 100                                                               |
|   });                                                                           |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

## Component Descriptions

### TriggerBridge → Trigger Action API
- Bridge provides the underlying event mechanism
- Action API provides a simplified developer interface
- Triggers are mapped to appropriate platform events

### Bridge Components
1. **Event Message**
   - Standard event handling
   - Hierarchical event support

2. **Event Mappings**
   - Platform-specific route management
   - Event transformation rules

3. **Node Registry**
   - Event handler management
   - Node relationship tracking

4. **Bidirectional Links**
   - Cross-platform connection management
   - Event synchronization

### Platform Adapters
1. **DOM Adapter**
   - Web browser event handling
   - Document Object Model integration

2. **Hierarchical Native Adapter**
   - Platform detection and delegation
   - Capability-aware event handling

3. **InReal Adapter**
   - 3D scene event integration
   - Spatial interaction handling

### Native Sub-Platform Adapters
- **iOS Adapter**: UIKit event integration
- **VisionOS Adapter**: Spatial computing support
- **Android/XR/Horizon**: Platform-specific implementations

### Application Layer
- Cross-platform event routing
- Unified event handling interface
- Platform-agnostic implementation 

### Trigger Categories → Application Layer
- Developers use simplified trigger API
- Triggers automatically work across compatible platforms
- Platform-specific details are abstracted away