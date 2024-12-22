import * as extensionConfig from '../extension.json';

export const activate = (): void => {
    eda.sys_ToastMessage.showMessage("EasyEDA Wakatime active!", ESYS_ToastMessageType.INFO, 10);
};

const EASYEDA_VERSION = "2.2.32.3";
const VERSION = extensionConfig.version;

export const about = async (): Promise<void> => {
    const message = `${extensionConfig.displayName} v${VERSION}\n${extensionConfig.description}\nCreated by Andrew (radi8) <me@radi8.dev>`;
    eda.sys_MessageBox.showInformationMessage(message);
};

export const setProjDetails = async (): Promise<void> => {
    await eda.sys_IFrame.openIFrame("iframe/edit-project.html", 500, 300);
};

export const setWakatimeSettings = async (): Promise<void> => {
    await eda.sys_IFrame.openIFrame("iframe/edit-settings.html", 500, 500);
};

export const enable = async (): Promise<void> => {
    const apiURL = await eda.sys_Storage.getExtensionUserConfig("apiURL");
    const apiKey = await eda.sys_Storage.getExtensionUserConfig("apiKey");

    if (apiURL === undefined || apiKey === undefined) {
        eda.sys_MessageBox.showInformationMessage("Please set your Wakatime API URL and API Key in the settings. You can do this by clicking EasyEDA Wakatime > Settings. After you do that, please enable EasyEDA Wakatime again.");
        return;
    }
    
    if (apiKey !== undefined && apiURL !== undefined) {
        console.log("Wakatime enabled!");
    }

    await checkLastPcbEvent();
};

const assembleBody = (projectInfo: IDMT_ProjectItem | { friendlyName: string }) => {
    const projectInfoString = JSON.stringify(projectInfo);
    console.log(projectInfoString);

    const body = [
        {
            //"branch": "master", // version control is coming to easyeda in 2025. we can change this then if it works on a branch system.
            "category": "design",
            "entity": "./" + projectInfo["friendlyName"],
            "type": "file",
            "language": "EasyEDA Project", // in the future, we need to change this so it can be detected what is currently being worked on. as now, there is a bug in easyeda preventing us from doing this.
            "project": projectInfo["friendlyName"],
            "time": Date.now() / 1000, // to adjust to how wakatime does it
            "user_agent": `easyeda/${EASYEDA_VERSION} easyeda-wakatime/${VERSION}`
        }
    ];
    return body;
};

const getProjectInfo = async (): Promise<{ friendlyName: string } | null | IDMT_ProjectItem> => {
    if (eda && eda.dmt_Project && typeof eda.dmt_Project.getCurrentProjectInfo === 'function') {
        try {
            const projectInfo = await eda.dmt_Project.getCurrentProjectInfo();
            if (projectInfo) {
                return projectInfo;
            } else {
                //eda.sys_MessageBox.showInformationMessage("No project info available. This is likely due to a bug in version of EasyEDA Pro <2.2.34.6. Unfortunately, to continue tracking your statistics you will need to restart your editor. Sorry!");
                const storedName = await eda.sys_Storage.getExtensionUserConfig("projectName");
                if (storedName === undefined) {
                    eda.sys_MessageBox.showInformationMessage("Due to a bug in EasyEDA Pro <=2.2.34.6, we're unable to identify your current project. To temporarily resolve this, you can manually set your project name by clicking EasyEDA Wakatime > Set Project Details.");
                    return null;
                }

                return { "friendlyName": storedName };
            }
        } catch (error) {
            // eda.sys_MessageBox.showInformationMessage("Error getting project info: " + String(error) + "\nThis is likely due to a bug in version of EasyEDA Pro <2.2.34.6. Unfortunately, to continue tracking your statistics you will need to restart your editor.");
            const storedName = await eda.sys_Storage.getExtensionUserConfig("projectName");
            if (storedName === undefined) {
                eda.sys_MessageBox.showInformationMessage("Due to a bug in EasyEDA Pro <=2.2.34.6, we're unable to identify your current project. To temporarily resolve this, you can manually set your project name by clicking EasyEDA Wakatime > Set Project Details.");
                return null;
            }

            return { "friendlyName": storedName };
        }
    } else {
        console.error("eda or eda.dmt_Project or getCurrentProjectInfo is not available.");
        eda?.sys_MessageBox?.showInformationMessage("Could not access project information.");
        return null;
    }
};

let lastPcbEventTime: number | null = null;

eda.pcb_Event.addMouseEventListener("mouseEvent", "all", () => {
    lastPcbEventTime = Date.now();
    console.log("PCB event occured");
});

const checkLastPcbEvent = async () => {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // Check every 10 seconds

        if (lastPcbEventTime) {
            const now = Date.now();
            const timeDiff = now - lastPcbEventTime;

            if (timeDiff <= 30000) {
                console.log("A PCB event occurred within the last 30 seconds.");

                const projectInfo = await getProjectInfo();
                if (projectInfo) {
                    const body = assembleBody(projectInfo);
                    console.log("Sending heartbeat:", JSON.stringify(body));

                    const apiURL = await eda.sys_Storage.getExtensionUserConfig("apiURL");
                    if (apiURL === undefined) {
                        eda.sys_MessageBox.showInformationMessage("Please set your Wakatime API URL in the settings. You can do this by clicking EasyEDA Wakatime > Settings.");
                    }

                    const apiKey = await eda.sys_Storage.getExtensionUserConfig("apiKey");
                    if (apiKey === undefined) {
                        eda.sys_MessageBox.showInformationMessage("Please set your Wakatime API key in the settings. You can do this by clicking EasyEDA Wakatime > Settings.");
                    }

                    if (apiKey !== undefined && apiURL !== undefined) {
                        try {
                            const response = await eda.sys_ClientUrl.request(
                                `${apiURL}/heartbeats`,
                                'POST',
                                JSON.stringify(body),
                                {
                                    headers: {
                                        Accept: 'application/json',
                                        'Accept-Language': 'en-US,en;q=0.5',
                                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                                        Authorization: `Bearer ${apiKey}`,
                                        'Content-Type': 'application/json',
                                        Connection: 'keep-alive',
                                        'Sec-Fetch-Dest': 'empty',
                                        'Sec-Fetch-Mode': 'cors',
                                        'Sec-Fetch-Site': 'same-origin',
                                        'Sec-GPC': '1',
                                        Priority: 'u=0'
                                    }
                                }
                            );

                            if (response.ok) {
                                const data = await response.json();
                                console.log("Heartbeat sent successfully:", data);
                            } else {
                                console.error("Error sending heartbeat:", response.status, await response.text());
                            }
                        } catch (err) {
                            console.error("Error sending heartbeat:", err);
                        }
                    }
                } else {
                    console.log("Could not get project info, skipping heartbeat.");
                }

            } else {
                console.log("No PCB event occurred in the last 30 seconds");
            }
        } else {
            console.log("No PCB event has occurred yet");
        }
    }
};