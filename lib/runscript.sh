#!/bin/bash
geth --exec "loadScript(\"$1\")" attach ipc:dd1/geth.ipc
