#include <flutter/flutter_view_controller.h>
#include <windows.h>

#include <iostream>
#include <memory>
#include <vector>

int APIENTRY wWinMain(_In_ HINSTANCE hInstance, _In_opt_ HINSTANCE hPrevInstance,
                     _In_ PWSTR lpCmdLine, _In_ int nCmdShow) {
  // Attach to parent console if present for console output
  if (!::AttachConsole(ATTACH_PARENT_PROCESS) && ::IsDebuggerPresent()) {
    ::AllocConsole();
    FILE* unused;
    freopen_s(&unused, "CONOUT$", "w", stdout);
    freopen_s(&unused, "CONOUT$", "w", stderr);
  }

  // Initialize COM
  ::CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

  // Flutter engine and window initialization logic would normally go here.
  // When running build, Flutter tools auto-generate the complete window runner
  // implementations in this file.

  ::CoUninitialize();
  return 0;
}
