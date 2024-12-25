# easyeda-wakatime

**easyeda-wakatime** is a WakaTime plugin for [EasyEDA Pro](https://pro.easyeda.com/).

This extension is a fork of [EasyEDA's SDK Example](https://github.com/easyeda/pro-api-sdk).

## Installation

1. Download the latest release of easyeda-wakatime from the [releases](https://github.com/radeeyate/easyeda-wakatime/releases).
2. Open EasyEDA Pro. If you haven't already, download EasyEDA Pro - don't worry, it's **free**!
3. Go to **Settings > Extensions > Extension Manager**.
4. Click **Import Extensions**.
5. Select the downloaded extension.
6. Click the text under **"External Interactions"**. This enables the ability for the extension to send heartbeats to the Wakatime API. This **must** be done.
7. Open the easyeda-wakatime settings (**EasyEDA Wakatime > Settings**) and enter your WakaTime API URL and API Key.
8. Enable the plugin (**EasyEDA Wakatime > Enable Extension**). **This must be done every time you load up EasyEDA.**
9. Start designing!

If you still need help installing the extension, you can follow along with [this YouTube video](https://youtu.be/reHCB_J-Snk).

## Usage

Once installed, the **EasyEDA Wakatime** menu provides the following options:

* **Enable Extension:** Toggles WakaTime tracking.
* **About:** Displays extension information.
* **Today's Stats:** Displays your WakaTime stats for today.
* **Edit Project Details:** Manually set the current project name (for older EasyEDA versions).
* **Check For Updates:** Checks for updates to the extension.
* **Settings:** Configure your WakaTime API URL and API Key.

## Known Issues

> Update: I recieved access to the updated version and have mitigated *both* of these issues! Project detection and editor type detection have been fixed, though you may have to wait until the version is publicly released.

* **Project Detection Issues on Older EasyEDA Versions:** On EasyEDA Pro versions [prior to 2.2.34.6](https://github.com/easyeda/pro-api-sdk/issues/11#issuecomment-2556131855), the extension might not automatically detect the current project name. Use **EasyEDA Wakatime > Set Project Details** to manually specify the project name. Restarting EasyEDA might also help temporarily.
* **Editor Type Detection:** Currently, the extension reports the language as "EasyEDA Project" regardless of whether you are working on a schematic or PCB. This is also related to the bug specified above. Once the new EasyEDA version it has been released, we will support this detection.

## Issues

If easyeda-wakatime is not working as expected, please [open an issue](https://github.com/radeeyate/easyeda-wakatime/issues).

To confirm you've read this README, please include the magic word **"highseas"** in your bug report.

Please ensure you are using **EasyEDA Pro**, have **"External Interactions"** enabled, and have correctly configured your WakaTime API details.
