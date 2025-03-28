# InSpatial Trigger Bridge Architecture

```ascii
+------------------------------------------------------------------------------------+
|=========================INSPATIAL TRIGGER BRIDGE SYSTEM============================|
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
|                                  TriggerBridge                                     |
|                                                                                    |
|  Event Queue | Message Processing | Hierarchical Mappings | Handler Registry       |
+--------+-------------------------+------------------------+------------------------+
         |                         |                        |
         |                         |                        |
         v                         v                        v
+----------------+      +----------------------+      +-------------------+
|                |      |                      |      |                   |
| Event Messages |      |   Event Mappings     |      | Bidirectional     |
|                |      |                      |      | Links             |
+----------------+      +----------------------+      +-------------------+
         |                         |                        |
         +---------------------------------------------------+
                                   |
                                   v
+------------------+      +--------------------+      +------------------+
|                  |      |                    |      |                  |
|   DOM Adapter    |<---->| Hierarchical       |<---->| InReal Engine    |
|                  |      | Native Adapter     |      | Adapter          |
|  (Web Browser)   |      |                    |      | (3D Environment) |
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
               +------------------------------------------+
               |                                          |
               |   Universal Apps with Cross-Platform     |
               |   Event Routing                          |
               |                                          |
               +------------------------------------------+
```

## Component Descriptions

### Core Bridge Layer
- **TriggerBridge**: Central management system for event handling and routing
  - Event Queue Management
  - Platform-specific Mappings
  - Handler Registry
  - Hierarchical Platform Support

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