```ascii
+------------------------------------+    +------------------------------------+
|        @inspatial/trigger          |    |         @in/teract           |
|                                    |    |                                    |
| • Platform detection               |    | • Data validation                  |
| • Event handling & mapping         |    | • Reactivity system                |
| • Trigger registry & types         |    | • Persistence                      |
| • Adapter management               |    | • Change tracking                  |
+----------------+-------------------+    +---------------+--------------------+
                 |                                        |
                 |                                        |
                 v                                        v
        +------------------+                    +------------------+
        |                  |                    |                  |
        |  Trigger Instance|                    |  State Instance  |
        |                  |                    |                  |
        +--------+---------+                    +--------+---------+
                 |                                        |
                 |                                        |
                 |        +---------------------+         |
                 |        |                     |         |
                 +------->|  connectTriggerToState  |<----+
                          |                     |
                          +----------+----------+
                                     |
                                     |
            +----------------------+-+-------------------------+
            |                      |                           |
    +-------v--------+     +-------v--------+         +-------v--------+
    |                |     |                |         |                |
    |   Subscription |     |   Automatic    |         |   Lifecycle    |
    |   Management   |     |   Binding      |         |   Management   |
    |                |     |                |         |                |
    +----------------+     +----------------+         +----------------+
            ^                     ^                          ^
            |                     |                          |
    +-------+--------+     +------+---------+        +-------+--------+
    |                |     |                |        |                |
    | addTrigger()   |     | triggers: {...}|        | onDispose      |
    | Explicit API   |     | Implicit API   |        | Handler        |
    |                |     |                |        |                |
    +----------------+     +----------------+        +----------------+
```