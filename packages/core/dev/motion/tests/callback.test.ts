import { it, describe, expect } from "@inspatial/test";
import { createMotion, createMotionTimeline, inMotion } from "../src/index.ts";

/*################################(FUNCTIONS)################################*/

function setupAnimationCallBack(
  callbackName: string,
  callbackFunc: () => void
) {
  const parameters: Record<string, any> = {
    translateX: 100,
    autoplay: false,
    delay: 10,
    duration: 80,
  };
  parameters[callbackName] = callbackFunc;
  return parameters;
}

/*################################(TESTS)################################*/
describe("InMotion Callbacks", () => {
  it("Should call onBegin in motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion(
      "#target-id",
      setupAnimationCallBack("onBegin", () => {
        callbackCheck += 1;
      })
    );

    expect(callbackCheck).toEqual(0);
    expect(inmotion.began).toEqual(false);
    // delay is not taken into account with seek(), so seek(10) actually move the playhead to 10ms + 10ms of delay
    inmotion.seek(5);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(true);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(true);
    inmotion.seek(0);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(false);
    inmotion.seek(5);
    expect(callbackCheck).toEqual(2);
    expect(inmotion.began).toEqual(true);
  });

  it("Should call onBegin on looped motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion("#target-id", {
      loop: 2,
      ...setupAnimationCallBack("onBegin", () => {
        callbackCheck += 1;
      }),
    });

    expect(callbackCheck).toEqual(0);
    expect(inmotion.began).toEqual(false);
    inmotion.seek(5);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(true);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(true);
    inmotion.seek(85);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.began).toEqual(true);
    inmotion.seek(240);
    expect(inmotion.began).toEqual(true);
    expect(callbackCheck).toEqual(1);
    inmotion.seek(100);
    expect(inmotion.began).toEqual(true);
    expect(callbackCheck).toEqual(1);
    inmotion.seek(0);
    expect(inmotion.began).toEqual(false);
    expect(callbackCheck).toEqual(1);
    inmotion.seek(5);
    expect(inmotion.began).toEqual(true);
    expect(callbackCheck).toEqual(2);
  });

  it("Should call onBegin on timeline", () => {
    let tlCallbackCheck = 0;
    let tlAnim1CallbackCheck = 0;
    let tlAnim2CallbackCheck = 0;

    const tl = createMotionTimeline(
      setupAnimationCallBack("onBegin", () => {
        tlCallbackCheck += 1;
      })
    );
    tl.add(
      "#target-id",
      setupAnimationCallBack("onBegin", () => {
        tlAnim1CallbackCheck += 1;
      })
    );
    tl.add(
      "#target-id",
      setupAnimationCallBack("onBegin", () => {
        tlAnim2CallbackCheck += 1;
      })
    );

    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(5);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(10);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(11);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(100);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(101);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(95);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(0);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(5);
    expect(tlCallbackCheck).toEqual(2);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(11);
    expect(tlCallbackCheck).toEqual(2);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(101);
    expect(tlCallbackCheck).toEqual(2);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(2);
  });

  it("Should call onBegin on looped timeline", () => {
    let tlCallbackCheck = 0;
    let tlAnim1CallbackCheck = 0;
    let tlAnim2CallbackCheck = 0;

    const tl = createMotionTimeline({
      loop: 2,
      ...setupAnimationCallBack("onBegin", () => {
        tlCallbackCheck += 1;
      }),
    })
      .add(
        "#target-id",
        setupAnimationCallBack("onBegin", () => {
          tlAnim1CallbackCheck += 1;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onBegin", () => {
          tlAnim2CallbackCheck += 1;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(5);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(10);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(11);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(101);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(191);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(160);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(10);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(11);
    expect(tlAnim1CallbackCheck).toEqual(3);
    expect(tlAnim2CallbackCheck).toEqual(1);
  });

  it("Should call onBegin and onComplete on delayed timeline", (resolve) => {
    let tlBeginCheck = 0;
    let tlCompleteCheck = 0;
    let tlAnim1BeginCheck = 0;
    let tlAnim1CompleteCheck = 0;

    const startTime = new Date().getTime();

    const tl = createMotionTimeline({
      delay: 1000,
      loop: 1,
      autoplay: false,
      onBegin: () => {
        tlBeginCheck += 1;
      },
      onComplete: () => {
        const endTime = new Date().getTime();
        tlCompleteCheck += 1;
        expect(endTime - startTime).to.be.at.least(90);
        expect(tlBeginCheck).toEqual(1);
        expect(tlCompleteCheck).toEqual(1);
        expect(tlAnim1BeginCheck).toEqual(1);
        expect(tlAnim1CompleteCheck).toEqual(1);
        resolve();
      },
    })
      .add("#target-id", {
        x: 100,
        duration: 0,
        onBegin: () => {
          tlAnim1BeginCheck += 1;
        },
        onComplete: () => {
          tlAnim1CompleteCheck += 1;
        },
      })
      .init();

    tl.seek(-100);

    expect(tlBeginCheck).toEqual(0);
    expect(tlCompleteCheck).toEqual(0);
    expect(tlAnim1BeginCheck).toEqual(0);
    expect(tlAnim1CompleteCheck).toEqual(0);

    tl.play();
  });

  it("Should call onComplete in motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion(
      "#target-id",
      setupAnimationCallBack("onComplete", () => {
        callbackCheck += 1;
      })
    );
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(50);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(0);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(100);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(true);
    inmotion.seek(50);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(100);
    expect(callbackCheck).toEqual(2);
    expect(inmotion.completed).toEqual(true);
  });

  it("Should call onComplete on looped motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion("#target-id", {
      loop: 2,
      ...setupAnimationCallBack("onComplete", () => {
        callbackCheck += 1;
      }),
    });
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(10);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(240);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(true);
    inmotion.seek(0);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(240);
    expect(callbackCheck).toEqual(2);
    expect(inmotion.completed).toEqual(true);
  });

  it("Should call onComplete on looped alternate motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion("#target-id", {
      loop: 1,
      alternate: true,
      ...setupAnimationCallBack("onComplete", () => {
        callbackCheck += 1;
      }),
    });
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(10);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(140);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(160);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(true);
  });

  it("Should call onComplete on looped revered alternate motion", () => {
    let callbackCheck = 0;
    const inmotion = createMotion("#target-id", {
      loop: 1,
      alternate: true,
      reversed: true,
      ...setupAnimationCallBack("onComplete", () => {
        callbackCheck += 1;
      }),
    });
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(10);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(80);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(140);
    expect(callbackCheck).toEqual(0);
    expect(inmotion.completed).toEqual(false);
    inmotion.seek(160);
    expect(callbackCheck).toEqual(1);
    expect(inmotion.completed).toEqual(true);
  });

  it("Should call onComplete on timeline", () => {
    let tlCallbackCheck = 0;
    let tlAnim1CallbackCheck = 0;
    let tlAnim2CallbackCheck = 0;

    const tl = createMotionTimeline(
      setupAnimationCallBack("onComplete", () => {
        tlCallbackCheck += 1;
      })
    )
      .add(
        "#target-id",
        setupAnimationCallBack("onComplete", () => {
          tlAnim1CallbackCheck += 1;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onComplete", () => {
          tlAnim2CallbackCheck += 1;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(50);
    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(150);
    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(200);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(0);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(150);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(200);
    expect(tlCallbackCheck).toEqual(2);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(2);
  });

  it("Should call onComplete on looped timeline", () => {
    let tlCallbackCheck = 0;
    let tlAnim1CallbackCheck = 0;
    let tlAnim2CallbackCheck = 0;

    const tl = createMotionTimeline({
      loop: 2,
      ...setupAnimationCallBack("onComplete", () => {
        tlCallbackCheck += 1;
      }),
    })
      .add(
        "#target-id",
        setupAnimationCallBack("onComplete", () => {
          tlAnim1CallbackCheck += 1;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onComplete", () => {
          tlAnim2CallbackCheck += 1;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(0);
    expect(tlAnim1CallbackCheck).toEqual(0);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(90);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(0);
    tl.seek(180);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(200);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(160);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(90);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(0);
    expect(tlAnim1CallbackCheck).toEqual(1);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(90);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(1);
    tl.seek(180);
    expect(tlAnim1CallbackCheck).toEqual(2);
    expect(tlAnim2CallbackCheck).toEqual(2);
    tl.seek(540);
    expect(tlCallbackCheck).toEqual(1);
    expect(tlAnim1CallbackCheck).toEqual(4);
    expect(tlAnim2CallbackCheck).toEqual(4);
  });

  it("Should call onBegin and onComplete on looped timeline", () => {
    let tlOnBeginCheck = 0;
    let tlOnCompleteCheck = 0;
    let childOnBeginCheck = 0;
    let childOnCompleteCheck = 0;

    const tl = createMotionTimeline({
      loop: 2,
      onBegin: () => {
        tlOnBeginCheck += 1;
      },
      onComplete: () => {
        tlOnCompleteCheck += 1;
      },
      loopDelay: 10,
    }).add({
      delay: 10,
      duration: 80,
      onBegin: () => {
        childOnBeginCheck += 1;
      },
      onComplete: () => {
        childOnCompleteCheck += 1;
      },
    });

    expect(tlOnBeginCheck).toEqual(0);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(childOnBeginCheck).toEqual(0);
    expect(childOnCompleteCheck).toEqual(0);
    tl.seek(5);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(childOnBeginCheck).toEqual(0);
    expect(childOnCompleteCheck).toEqual(0);
    tl.seek(11); // Delay 10
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(childOnBeginCheck).toEqual(1);
    expect(childOnCompleteCheck).toEqual(0);
    tl.seek(100);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(childOnBeginCheck).toEqual(1);
    expect(childOnCompleteCheck).toEqual(1);
    tl.seek(200);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(childOnBeginCheck).toEqual(2);
    expect(childOnCompleteCheck).toEqual(2);
    tl.seek(300);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(1);
    expect(childOnBeginCheck).toEqual(3);
    expect(childOnCompleteCheck).toEqual(3);
  });

  it("Should call onBegin and onComplete on alternate timeline", () => {
    let tlOnBeginCheck = 0;
    let tlOnCompleteCheck = 0;
    let child1OnBeginCheck = 0;
    let child1OnCompleteCheck = 0;
    let child2OnBeginCheck = 0;
    let child2OnCompleteCheck = 0;

    const tl = createMotionTimeline({
      loop: 2,
      alternate: true,
      onBegin: () => {
        tlOnBeginCheck += 1;
      },
      onComplete: () => {
        tlOnCompleteCheck += 1;
      },
    })
      .add({
        duration: 100,
        onBegin: () => {
          child1OnBeginCheck += 1;
        },
        onComplete: () => {
          child1OnCompleteCheck += 1;
        },
      })
      .add({
        duration: 100,
        onBegin: () => {
          child2OnBeginCheck += 1;
        },
        onComplete: () => {
          child2OnCompleteCheck += 1;
        },
      });

    expect(tlOnBeginCheck).toEqual(0);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(5);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(10);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(100);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(110);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(1);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(200);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(1);
    console.warn(
      "Edge case where the onComplete won't fire before an alternate loop"
    );
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(210); // Loop once and alternate to reversed playback, so no callback triggers should happen
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(1);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(400); // Loop twice and alternate back to forward playback
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(1);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(1);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(410);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(2);
    expect(child1OnCompleteCheck).toEqual(1);
    expect(child2OnBeginCheck).toEqual(1);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(600);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(1);
    expect(child1OnBeginCheck).toEqual(2);
    expect(child1OnCompleteCheck).toEqual(2);
    expect(child2OnBeginCheck).toEqual(2);
    expect(child2OnCompleteCheck).toEqual(1);
  });

  it("Should call onBegin and onComplete on alternate timeline with reversed children", () => {
    let tlOnBeginCheck = 0;
    let tlOnCompleteCheck = 0;
    let child1OnBeginCheck = 0;
    let child1OnCompleteCheck = 0;
    let child2OnBeginCheck = 0;
    let child2OnCompleteCheck = 0;

    const tl = createMotionTimeline({
      loop: 2,
      alternate: true,
      defaults: {
        ease: "linear",
        reversed: true,
        duration: 100,
      },
      // autoplay: false,
      onBegin: () => {
        tlOnBeginCheck += 1;
      },
      onComplete: () => {
        tlOnCompleteCheck += 1;
      },
    })
      .add(".target-class:nth-child(1)", {
        y: 100,
        onBegin: () => {
          child1OnBeginCheck += 1;
        },
        onComplete: () => {
          child1OnCompleteCheck += 1;
        },
      })
      .add(".target-class:nth-child(2)", {
        y: 100,
        onBegin: () => {
          child2OnBeginCheck += 1;
        },
        onComplete: () => {
          child2OnCompleteCheck += 1;
        },
      });
    // .init();

    expect(tlOnBeginCheck).toEqual(0);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(5);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(10);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(100);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(110);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(210); // Loop once and alternate to reversed playback, so no callback triggers should happen
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(380);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(0);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
    tl.seek(600);
    expect(tlOnBeginCheck).toEqual(1);
    expect(tlOnCompleteCheck).toEqual(1);
    expect(child1OnBeginCheck).toEqual(0);
    expect(child1OnCompleteCheck).toEqual(0);
    expect(child2OnBeginCheck).toEqual(0);
    expect(child2OnCompleteCheck).toEqual(0);
  });

  it("Should call onComplete on timeline with inmotions of the same duration as the timeline", (resolve) => {
    let tlCallbackCheck = 0;
    let tlAnim1CallbackCheck = 0;
    let tlAnim2CallbackCheck = 0;
    let tlAnim3CallbackCheck = 0;
    let tlAnim4CallbackCheck = 0;

    const target = { value: 1 };

    const tl = createMotionTimeline({
      onComplete: () => {
        tlCallbackCheck += 1;
      },
    })
      .add(
        target,
        {
          value: 0,
          duration: 1.8,
          onComplete: () => {
            tlAnim1CallbackCheck += 1;
          },
        },
        0
      )
      .add(
        target,
        {
          value: 1,
          duration: 1.4,
          onComplete: () => {
            tlAnim2CallbackCheck += 1;
          },
        },
        0.4
      )
      .add(
        target,
        {
          value: 2,
          duration: 1,
          onComplete: () => {
            tlAnim3CallbackCheck += 1;
          },
        },
        0.8
      )
      .add(
        target,
        {
          value: 3,
          duration: 1,
          onComplete: () => {
            tlAnim4CallbackCheck += 1;
          },
        },
        0.8
      );

    tl.then(() => {
      expect(tlCallbackCheck).toEqual(1);
      expect(tlAnim1CallbackCheck).toEqual(1);
      expect(tlAnim2CallbackCheck).toEqual(1);
      expect(tlAnim3CallbackCheck).toEqual(1);
      expect(tlAnim4CallbackCheck).toEqual(1);
      expect(tl.completed).toEqual(true);
      resolve();
    });
  });

  it("Should call onBeforeUpdate in motion", () => {
    let callbackCheck = false;
    let ticks = 0;

    const inmotion = createMotion(
      "#target-id",
      setupAnimationCallBack("onBeforeUpdate", () => {
        ticks++;
        callbackCheck = true;
      })
    );

    expect(callbackCheck).toEqual(false);
    inmotion.seek(5);
    expect(ticks).toEqual(1);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(9); // delay: 10
    expect(ticks).toEqual(2);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(10); // delay: 10
    expect(callbackCheck).toEqual(true);
    expect(ticks).toEqual(3);
    inmotion.seek(15);
    expect(ticks).toEqual(4);
  });

  it("Should call onBeforeUpdate on timeline", () => {
    let tlCallbackCheck = false;
    let tlAnim1CallbackCheck = false;
    let tlAnim2CallbackCheck = false;
    let ticks = 0;

    const tl = createMotionTimeline(
      setupAnimationCallBack("onBeforeUpdate", () => {
        ticks++;
        tlCallbackCheck = true;
      })
    )
      .add(
        "#target-id",
        setupAnimationCallBack("onBeforeUpdate", () => {
          ticks++;
          tlAnim1CallbackCheck = true;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onBeforeUpdate", () => {
          ticks++;
          tlAnim2CallbackCheck = true;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(5);
    expect(ticks).toEqual(1);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(9); // delay: 10
    expect(ticks).toEqual(2);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(10); // delay: 10
    expect(ticks).toEqual(3);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(11); // delay: 10
    expect(ticks).toEqual(5);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(150);
    expect(ticks).toEqual(8);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(true);
    tl.seek(250);
    expect(ticks).toEqual(10);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(true);
  });

  it("Should call onUpdate in motion", () => {
    let callbackCheck = false;
    let ticks = 0;

    const inmotion = createMotion(
      "#target-id",
      setupAnimationCallBack("onUpdate", () => {
        ticks++;
        callbackCheck = true;
      })
    );

    expect(callbackCheck).toEqual(false);
    inmotion.seek(5);
    expect(ticks).toEqual(1);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(9); // delay: 10
    expect(ticks).toEqual(2);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(10); // delay: 10
    expect(callbackCheck).toEqual(true);
    expect(ticks).toEqual(3);
    inmotion.seek(15);
    expect(ticks).toEqual(4);
  });

  it("Should call onUpdate on timeline", () => {
    let tlCallbackCheck = false;
    let tlAnim1CallbackCheck = false;
    let tlAnim2CallbackCheck = false;
    let ticks = 0;

    const tl = createMotionTimeline(
      setupAnimationCallBack("onUpdate", () => {
        ticks++;
        tlCallbackCheck = true;
      })
    )
      .add(
        "#target-id",
        setupAnimationCallBack("onUpdate", () => {
          ticks++;
          tlAnim1CallbackCheck = true;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onUpdate", () => {
          ticks++;
          tlAnim2CallbackCheck = true;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(5);
    expect(ticks).toEqual(1);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(9); // delay: 10
    expect(ticks).toEqual(2);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(10); // delay: 10
    expect(ticks).toEqual(3);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(11); // delay: 10
    expect(ticks).toEqual(5);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(150);
    expect(ticks).toEqual(8);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(true);
    tl.seek(250);
    expect(ticks).toEqual(10);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(true);
  });

  it("Should call onRender with autoplay: false", () => {
    let callbackCheck = false;
    let renders = 0;

    createMotion("#target-id", {
      opacity: [0.5, 1],
      x: 100,
      scale: 2,
      autoplay: false,
      onRender: () => {
        renders++;
        callbackCheck = true;
      },
    });

    expect(inMotion.$("#target-id")[0].style.opacity).toEqual("0.5");
    expect(callbackCheck).toEqual(true);
  });

  it("Should call onRender on motion", () => {
    let callbackCheck = false;
    let renders = 0;

    const inmotion = createMotion(
      "#target-id",
      setupAnimationCallBack("onRender", () => {
        renders++;
        callbackCheck = true;
      })
    );

    expect(callbackCheck).toEqual(false);
    inmotion.seek(5);
    expect(renders).toEqual(1);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(9); // delay: 10
    expect(renders).toEqual(2);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(10); // delay: 10
    expect(renders).toEqual(3);
    expect(callbackCheck).toEqual(true);
    inmotion.seek(15);
    expect(callbackCheck).toEqual(true);
    expect(renders).toEqual(4);
  });

  it("onRender on timeline", () => {
    let tlCallbackCheck = false;
    let tlAnim1CallbackCheck = false;
    let tlAnim2CallbackCheck = false;

    const tl = createMotionTimeline(
      setupAnimationCallBack("onRender", () => {
        tlCallbackCheck = true;
      })
    )
      .add(
        "#target-id",
        setupAnimationCallBack("onRender", () => {
          tlAnim1CallbackCheck = true;
        })
      )
      .add(
        "#target-id",
        setupAnimationCallBack("onRender", () => {
          tlAnim2CallbackCheck = true;
        })
      )
      .init();

    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(5);
    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(9); // delay: 10
    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(10); // delay: 10
    expect(tlCallbackCheck).toEqual(false);
    expect(tlAnim1CallbackCheck).toEqual(false);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(50);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(false);
    tl.seek(150);
    expect(tlCallbackCheck).toEqual(true);
    expect(tlAnim1CallbackCheck).toEqual(true);
    expect(tlAnim2CallbackCheck).toEqual(true);
  });

  it("onLoop on inmotion", () => {
    let loops = 0;

    const inmotion = createMotion("#target-id", {
      x: 100,
      duration: 80,
      loop: 2,
      loopDelay: 20,
      autoplay: false,
      onLoop: () => loops++,
    });

    inmotion.seek(5);
    expect(loops).toEqual(0);
    inmotion.seek(80);
    expect(loops).toEqual(0);
    inmotion.seek(100);
    expect(loops).toEqual(1);
    inmotion.seek(180);
    expect(loops).toEqual(1);
    inmotion.seek(200);
    expect(loops).toEqual(2);
    inmotion.seek(280);
    expect(loops).toEqual(2);
  });

  it("refresh() inside an onLoop on inmotion", () => {
    let loops = 0;
    let data = { x: 0 };

    const inmotion = createMotion(data, {
      x: () => loops * 10,
      duration: 80,
      loop: 2,
      ease: "linear",
      loopDelay: 20,
      autoplay: false,
      onLoop: (self) => {
        loops++;
        self.refresh();
      },
    });

    inmotion.seek(5);
    expect(loops).toEqual(0);
    expect(data.x).toEqual(0);
    inmotion.seek(100);
    expect(loops).toEqual(1);
    expect(data.x).toEqual(0);
    inmotion.seek(140);
    expect(loops).toEqual(1);
    expect(data.x).toEqual(5);
    inmotion.seek(199);
    expect(loops).toEqual(1);
    expect(data.x).toEqual(10);
    inmotion.seek(200);
    expect(loops).toEqual(2);
    expect(data.x).toEqual(10);
    inmotion.seek(240);
    expect(loops).toEqual(2);
    expect(data.x).toEqual(15);
  });

  it("onLoop on timeline", () => {
    let loops = 0;

    const inmotion = createMotionTimeline({
      loop: 1,
      loopDelay: 20,
      autoplay: false,
      onLoop: () => {
        loops++;
      },
    })
      .add("#target-id", {
        x: 100,
        duration: 80,
        loop: 1,
        loopDelay: 20,
        onLoop: () => {
          loops++;
        },
      })
      .init();

    inmotion.seek(5);
    expect(loops).toEqual(0);
    inmotion.seek(100);
    expect(loops).toEqual(1);
    inmotion.seek(180);
    expect(loops).toEqual(1);
    inmotion.seek(200);
    expect(loops).toEqual(2);
    inmotion.seek(300);
    expect(loops).toEqual(3);
    inmotion.seek(380);
    expect(loops).toEqual(3);
    inmotion.seek(400);
    expect(loops).toEqual(3);
    inmotion.seek(401);
    expect(loops).toEqual(3);
  });

  it("onPause on inmotion tween override", async () => {
    let paused = 0;
    createMotion("#target-id", {
      y: 200,
      duration: 30,
      onPause: () => paused++,
    });
    createMotion("#target-id", {
      y: 100,
      duration: 30,
      delay: 10,
    }).then(() => {
      expect(paused).toEqual(1);
    });
  });

  it("onPause on timeline tween override", async () => {
    let paused = 0;
    createMotionTimeline({
      onPause: () => paused++,
    })
      .add(
        "#target-id",
        {
          x: 200,
          duration: 30,
        },
        0
      )
      .add(
        "#target-id",
        {
          y: 200,
          duration: 30,
        },
        0
      );
    createMotionTimeline({
      delay: 10,
    })
      .add(
        "#target-id",
        {
          x: 100,
          duration: 30,
        },
        0
      )
      .add(
        "#target-id",
        {
          y: 100,
          duration: 30,
        },
        0
      )
      .then(() => {
        expect(paused).toEqual(1);
        resolve();
      });
  });

  it("then() on inmotion", async () => {
    const inmotion = createMotion("#target-id", {
      y: 100,
      duration: 30,
    });
    await inmotion.then((anim) => {
      expect(anim.currentTime).toEqual(30);
    });
  });

  it("Should call then() on timeline", async () => {
    const timeline = createMotionTimeline()
      .add("#target-id", {
        x: 100,
        duration: 15,
      })
      .add("#target-id", {
        y: 100,
        duration: 15,
      })
      .then((tl) => {
        expect(tl.currentTime).toEqual(30);
      });
  });

  it("Should call onBegin, onBeforeUpdate, onUpdate, onRender, onComplete should trigger on 0 duration in motion", async () => {
    let onBeginCheck = false;
    let onBeforeUpdateCheck = false;
    let onUpdateCheck = false;
    let onRenderCheck = false;
    let onCompleteCheck = false;
    let onLoopCheck = false;

    createMotion("#target-id", {
      translateX: 100,
      duration: 0,
      onBegin: () => {
        onBeginCheck = true;
      },
      onBeforeUpdate: () => {
        onBeforeUpdateCheck = true;
      },
      onUpdate: () => {
        onUpdateCheck = true;
      },
      onRender: () => {
        onRenderCheck = true;
      },
      onLoop: () => {
        onLoopCheck = true;
      },
      onComplete: () => {
        onCompleteCheck = true;
      },
    }).then((anim) => {
      expect(onBeginCheck).toEqual(true);
      expect(onBeforeUpdateCheck).toEqual(true);
      expect(onUpdateCheck).toEqual(true);
      expect(onRenderCheck).toEqual(true);
      expect(onLoopCheck).toEqual(false);
      expect(onCompleteCheck).toEqual(true);
      expect(anim.began).toEqual(true);
      expect(anim.completed).toEqual(true);
      resolve();
    });
  });

  it("Should call onBegin, onBeforeUpdate, onUpdate, onRender, onComplete should trigger on 0 duration timeline", async () => {
    let onBeginCheck = 0;
    let onBeforeUpdateCheck = 0;
    let onUpdateCheck = 0;
    let onRenderCheck = 0;
    let onCompleteCheck = 0;
    let onLoopCheck = 0;

    let a1onBeginCheck = 0;
    let a1onBeforeUpdateCheck = 0;
    let a1onUpdateCheck = 0;
    let a1onRenderCheck = 0;
    let a1onCompleteCheck = 0;
    let a1onLoopCheck = 0;

    let a2onBeginCheck = 0;
    let a2onBeforeUpdateCheck = 0;
    let a2onUpdateCheck = 0;
    let a2onRenderCheck = 0;
    let a2onCompleteCheck = 0;
    let a2onLoopCheck = 0;

    createMotionTimeline({
      defaults: { duration: 0 },
      id: "TL",
      onBegin: () => {
        onBeginCheck++;
      },
      onBeforeUpdate: () => {
        onBeforeUpdateCheck++;
      },
      onUpdate: () => {
        onUpdateCheck++;
      },
      onRender: () => {
        onRenderCheck++;
      },
      onLoop: () => {
        onLoopCheck++;
      },
      onComplete: () => {
        onCompleteCheck++;
      },
    })
      .add("#target-id", {
        translateX: 100,
        id: "A1",
        onBegin: () => {
          a1onBeginCheck++;
        },
        onBeforeUpdate: () => {
          a1onBeforeUpdateCheck++;
        },
        onUpdate: () => {
          a1onUpdateCheck++;
        },
        onRender: () => {
          a1onRenderCheck++;
        },
        onLoop: () => {
          a1onLoopCheck++;
        },
        onComplete: () => {
          a1onCompleteCheck++;
        },
      })
      .add("#target-id", {
        translateY: 100,
        id: "A2",
        onBegin: () => {
          a2onBeginCheck++;
        },
        onBeforeUpdate: () => {
          a2onBeforeUpdateCheck++;
        },
        onUpdate: () => {
          a2onUpdateCheck++;
        },
        onRender: () => {
          a2onRenderCheck++;
        },
        onLoop: () => {
          a2onLoopCheck++;
        },
        onComplete: () => {
          a2onCompleteCheck++;
        },
      })
      .then((tl) => {
        expect(onBeginCheck).toEqual(1);
        expect(onBeforeUpdateCheck).toEqual(1);
        expect(onUpdateCheck).toEqual(1);
        expect(onRenderCheck).toEqual(1);
        expect(onLoopCheck).toEqual(0);
        expect(onCompleteCheck).toEqual(1);
        expect(tl.began).toEqual(true);
        expect(tl.completed).toEqual(true);

        expect(a1onBeginCheck).toEqual(1);
        expect(a1onBeforeUpdateCheck).toEqual(1);
        expect(a1onUpdateCheck).toEqual(1);
        expect(a1onRenderCheck).toEqual(1);
        expect(a1onLoopCheck).toEqual(0);
        expect(a1onCompleteCheck).toEqual(1);

        expect(a2onBeginCheck).toEqual(1);
        expect(a2onBeforeUpdateCheck).toEqual(1);
        expect(a2onUpdateCheck).toEqual(1);
        expect(a2onRenderCheck).toEqual(1);
        expect(a2onLoopCheck).toEqual(0);
        expect(a2onCompleteCheck).toEqual(1);
      });
  });

  it("Should call Callbacks order execution", async () => {
    let value = 0;

    const inmotion = createMotion("#target-id", {
      translateX: 100,
      autoplay: false,
      onBegin: () => {
        value = 2;
      },
      onBeforeUpdate: () => {
        value *= 3;
      },
      onRender: () => {
        value += 4;
      },
      onUpdate: () => {
        value += 10;
      },
      onComplete: () => {
        value /= 20;
      },
    });

    expect(value).toEqual(0);

    inmotion.seek(inmotion.duration);

    expect(value).toEqual(1);
  });
});
