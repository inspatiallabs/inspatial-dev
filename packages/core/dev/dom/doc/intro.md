InDOM A.K.A InSpatial DOM is a high-performance, **DOM-less** environment designed for **universal rendering** across web, native, embedded and XR applications. It's designed 

## What is DOM? 

## What is InDOM 
- what 
- dom vs virtual dom vs browser

## Why InDOM

## Founders Wisdom 
- uncommon knowledge
- experiences & insights

## Features 

## Usage

## Compatibility 
- Runtime Support 
- Integration

## Testing

- Running InSpatial Test Fusion-TDD
...

- Common Testing Challenges

When testing DOM-related code, you might run into some tricky situations. Here's why: The way we test DOM behavior in a testing environment might not perfectly match how it works in a real browser. This can make testing frustrating when you're not seeing the results you expect. Here are some helpful tips:

1. Isolate DOM Tests: You will need to simulate a clean isolated DOM environement for each individual test case to run independently without interference from previous tests. In other words you have to keep each test seperate from each other.  If tests shared the same DOM instance, a modification in one test (like adding an element or an event (trigger) listener) could accidentally affect the outcome of another which could cause the test to fail. Isolating/running a function that isolates the dom before each tests ensures that every test starts with a brand new, predictable DOM.

2. Consider Real-World Testing: While testing in a production environment might sound scary, it can actually be valuable for DOM testing. This is because you'll see exactly how your code behaves in a real browser, which can help catch issues that might not show up in your test environment. Just be careful and make sure you have proper safeguards in place.

## Migration 