# TCD CSU1102x Helper for Visual Studio Code

This small Visual Studio Code extension is intended for students taking the CSU11021 and CSU11022 modules in the [School of Computer Science and Statistics](https://www.scss.tcd.ie) at [Trinity College Dublin](https://www.tcd.ie).

The extension provides configuration settings for Visual Studio Code that are then used by other extensions (e.g. Cortex-Debug), tasks and launch configurations. The settings simplify cross-platform support for building and debugging ARM Assembly Language programs using the Arm GNU Toolchain and Cortex-Debug extension.

## Features

The extension provides miscellaneous features to support the CSU11021 and CSU11022 Introduction to Computing module taught in Year 1 of the Computer Science curriculum at Trinity College Dublin, the University of Dublin.

The `Apply Configuration` command allows you to choose a settings profile to add to your Visual Studio Code user settings. Default profiles are provided to support MacOS, Windows or Linux and configure Visual Studio Code for sensible default installation paths for the required tools.

In addition to the command to apply a settings profile, the extension also provides default configuration settings for students using Windows, including in SCSS Computer Labs.

The extension specifies other extensions as dependencies, making this "Helper" extension a quick way to install the other extensions that you need, including among others:

* [Arm Assembly](https://marketplace.visualstudio.com/items?itemName=dan-c-underwood.arm)
* [Cortex-Debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug)
* [Remote Development Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
* [Memory View](https://marketplace.visualstudio.com/items?itemName=mcu-debug.memory-view)

Finally, since network UNC paths are not supported by the toolchain used in the module, the extension will attempt to detect when a folder or workspace is incorrectly opened using an UNC path and, if possible, will prompt the user to re-open the folder/workspace using a mapped drive.

## Extension Settings

The extension applies the following settings and provides an "Apply Configuration" commend to change these settings for a number of pre-configures OSes and environments.

* `tcd-csu1102x-helper.armToolchainPath`: Path to the Arm GNU toolchain `bin` directory/folder.
* `tcd-csu1102x-helper.gdbPath`: Path to the GDB executable (usually ending with `arm-none-eabi-gdb.exe` on Windows, `arm-none-eabi-gdb` on MacOS or `gdb-multiarch` on Linux).
* `tcd-csu1102x-helper.qemuPath`: Path to the QEMU executable (usually ending with `qemu-system-arm.exe` on Windows or `qemu-system-arm` on MacOS or Linux).
* `tcd-csu1102x-helper.openocdPath`: Path to the OpenOCD executable (usually ending with `openocd.exe` on Windows or `openocd` on MacOS or Linux).

## Known Issues

No known issues
