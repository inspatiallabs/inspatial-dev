# Fusion TDD Implementation Log

This document tracks the execution of the phased TDD approach to resolve test failures.

## Phase 1 – Get projection tests GREEN (6 failures)
- [ ] A. Refactor `createProjection`:
    - [ ] Build a stand-alone `ProjectionWriterClass` that owns its own internal `Writing` set.
    - [ ] Inside `compute`, call `setStore(draft => { fn(draft); return draft })`.
    - [ ] Ensure `Writing.add(unwrappedStore)` wraps the call so per-key writes hit `setProperty`.
    - [ ] Add `trackSelf` for whole-store read inside projection so `selected[i]` is reactive.
    - [ ] Unit-test with minimal reproduction (picker example from tests).
- [ ] Expected result: Projection basics + selection tests pass.

## Phase 2 – Fix class / array notifications (9 failures)
- [ ] A. Set-layer: introduce `force` flag in `setProperty` signature; when caller passes `true`, skip equals check inside `nodes[property].write`.
- [ ] B. Modify store-setter helpers so every path (`push`, `splice`, etc.) calls `setProperty(..., true)` to guarantee notification.
- [ ] C. Update `set` & `deleteProperty` traps to use new `force` when writing `instanceProperties`.
- [ ] D. Add `STORE_NODE` entry for array `length` in `wrap` (so length observers exist before first write).
- [ ] E. Write two unit tests (custom class sum / basic array push) and iterate until green.
- [ ] Expected result: Class/array notification tests pass.

## Phase 3 – Recursive effects (4 failures)
- [ ] Validate that these tests pass automatically once phases 1 & 2 notify changes correctly.
- [ ] Expected result: Recursive effects tests pass.

## Phase 4 – Matcher registration (2 failures)
- [ ] In `tests/_setup.ts` (loaded by `test:store` task)
    ```typescript
    import { addMatchers } from "@inspatial/test/matchers.ts";
    addMatchers();
    ```
- [ ] Define minimal `toThrowError`, `toBeTypeOf` wrappers that delegate to `std/assert`.
- [ ] Expected result: Utilities tests with custom matchers pass.

## Test Runs & Results:
- **Initial State (Before this plan):** 14 failing steps.
- **After Phase 1:** TBD
- **After Phase 2:** TBD
- **After Phase 3:** TBD
- **After Phase 4:** TBD 