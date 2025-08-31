#!/bin/bash

# Shell script to run snapshot tests

if [ "$1" == "--update" ]; then
  echo "Updating snapshots..."
  deno task test:snapshot:update
else
  echo "Running snapshot tests..."
  deno task test:snapshot
fi

echo "Done!" 