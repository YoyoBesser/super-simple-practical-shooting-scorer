#!/bin/sh
# Stubs out the React Native DevTools Electron binary so it doesn't crash
# when running as root in WSL. The DevTools panel is non-essential.
TARGET="node_modules/@react-native/debugger-shell/bin/react-native-devtools"
if [ -f "$TARGET" ]; then
  printf '#!/bin/sh\nexit 0\n' > "$TARGET"
  chmod +x "$TARGET"
  echo "patched: $TARGET"
fi
