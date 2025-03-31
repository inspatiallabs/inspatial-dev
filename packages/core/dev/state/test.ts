import { type as createType } from "@inspatial/type"; //arkType
import { jsx, Fragment, render } from "@inspatial/run";
import { createState } from "@inspatial/state";
import { generateUniqueId as createUniqueId } from "@inspatial/util";
import { createTrigger } from "@inspatial/trigger";
import { 
  Panel, 
  ProgressBar, 
  Text, 
  Icon, 
  Button,
  GridLayout, 
  InventorySlot 
} from "@inspatial/kit";
import { XRController } from "@inspatial/xr";


/*###############################(CREATE TYPE SCHEMA)###############################*/
// Define player type schema
const InPlayerType = createType({
    health: "0 <= number <= 100",
    maxHealth: "number >= 0",
    position: { x: "number", y: "number", z: "number" },
    inventory: createType({ id: "string", name: "string", type: "string" }, "[]"),
    isMoving: "boolean",
    "activeWeapon?": "string" // or activeWeapon: type.string.optional()
})


/*###############################(CREATE TRIGGER ACTION)###############################*/
// standalone trigger example
const dontDoAnythingWithThisJustAnExample = createTrigger({
  type: "onStart",
  action: () => doSomething()
});


/*###############################(STATE DEFINITION)##########################*/
// Create localized player state with lifecycle triggers
// append with underscore (_) to make local e.g _playerState
const playerState = createState({
  id: createUniqueId(), // optional (auto-generated) by default
  type: InPlayerType,     // schema validation type
  //  The trigger system should work as both a standalone system and as an embedded subsystem
  trigger: {
    onHealthChange: {
        type: "onValueChange",
        path: "health",
        action: (newValue, oldValue) => {
          if (newValue < oldValue) {
            playDamageAnimation();
          }
        }
      },
      onLowHealth: {
        type: "onConditionMet",
        condition: state => state.health < 20,
        action: () => showLowHealthWarning()
      }
  },


  /*##########################(INITIAL STATE)###############################*/
  initialState: {
    health: 80,
    maxHealth: 100,
    // ... rest of initial values
  },

  /*########################(STORAGE)############################*/
  persist: {
    storage: "InSpatialDB", // [InSpatialDB | InSpatialKV | LocalStorage | IndexedDB]
    key: "player_data"      // optional (auto-generated) storage namespace
  }
)}

/*############################(COMPONENT)###############################*/
export default function PlayerComponent() {
  // Component uses playerState directly and automatically handles lifecycle e.g unmount

  return (
    <Panel>
      <ProgressBar value={playerState["@healthPercentage"]} />
      {/* ... other UI elements ... */}
    </Panel>
  );
}
