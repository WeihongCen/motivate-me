<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';
    import { recording } from '$lib/store.js';

    export let data;
    const { user } = data;

    const ANALYSIS_DELAY = 300000;
    const SNAPSHOT_DELAY = 10000;
    const RESCALE_WIDTH = 960;
    const RESCALE_HEIGHT = 540;

    let occupation = "";

    let canvas; // Used to rescale image in imageToDataURL
    let ctx;
    let snapshots = [];
    let analysisInterval;
    let snapshotInterval;
    let snapshotTimestamp;

    let unsubscribeRecording;

    function subscribeRecording() {
        unsubscribeRecording = recording.subscribe((bRecording) => {
            if (bRecording) {
                console.log("recording started.");
                startRecording();
            } else {
                console.log("recording ended.");
                stopRecording();
            }
        });
    }

    async function populateUserData() {
        let response = await fetch(`/api/getProfile`, {
            method: "GET"
        })
            .then(res => res.json());
        occupation = response.userData.occupation;
    }

    function getDate(timestamp) {
        const today = new Date(timestamp);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    function rescaleImage(imageURL, callback) {
        const imageObject = new Image();
        imageObject.onload = function() {
            canvas.width = RESCALE_WIDTH;
            canvas.height = RESCALE_HEIGHT;
            ctx.clearRect(0, 0, RESCALE_WIDTH, RESCALE_HEIGHT);
            ctx.drawImage(imageObject, 0, 0, RESCALE_WIDTH, RESCALE_HEIGHT);
            const resizedBase64URL = canvas.toDataURL();
            callback(resizedBase64URL);
        };
        imageObject.src = imageURL;
    }

    async function takeSnapshot() {
        const windows = await Highlight.user.getWindows();
        const focusedWindowTitle = windows[0].windowTitle;
        const focusedWindowIcon = windows[0].appIcon;
        const focusedWindowScreenshot = await Highlight.user.getWindowScreenshot(focusedWindowTitle);
        console.log(`snapshot ${focusedWindowTitle}`);
        if (!focusedWindowTitle) {
            console.log("NO FOCUSED WINDOW");
        }
        if (!focusedWindowScreenshot) {
            console.log("NO SCREENSHOT FOUND");
        }
        let newSnapshot = {
            focusedWindowTitle: focusedWindowTitle,
            focusedWindowApp: focusedWindowTitle.split(" - ").at(-1),
            base64URL: focusedWindowScreenshot,
            startTime: snapshotTimestamp,
            endTime: snapshotTimestamp = Date.now(),
        };
        snapshots.push(newSnapshot);
        const { base64URL, ...snapshotMetadata } = newSnapshot;
        Highlight.appStorage.set(`snapshots/${newSnapshot.startTime}`, snapshotMetadata);
        Highlight.appStorage.set(`appIcons/${newSnapshot.focusedWindowApp}`, focusedWindowIcon);
        // rescaleImage(focusedWindowScreenshot, async (resizedBase64URL) => {
        // });
    }

    async function analyzeSnapshots() {
        if (snapshots.length > 0) {
            populateUserData();
            const analysis = await fetch(`/api/describe`, {
                method: "POST",
                body: JSON.stringify({ 
                    snapshots: snapshots,
                    occupation: occupation,
                }),
            })
                .then(res => res.json())
                .then(res => JSON.parse(res));
            console.log(analysis.description);
            
            const snapshotKeys = snapshots.map(snapshot => `snapshots/${snapshot.startTime}`);
            const analysisStartTime = snapshots[0].startTime;
            const analysisEndTime = snapshots.at(-1).endTime;
            const date = getDate(analysisStartTime);
            Highlight.appStorage.set(`analysis/${analysisStartTime}`, {
                ...analysis,
                snapshotKeys,
                analysisStartTime,
                analysisEndTime,
            });

            let calendarAnalysis = Highlight.appStorage.get(`calendar/${date}/analysis`);
            if (calendarAnalysis) {
                calendarAnalysis = [...calendarAnalysis, `analysis/${analysisStartTime}`];
            } else {
                calendarAnalysis = [`analysis/${analysisStartTime}`];
            }
            Highlight.appStorage.set(`calendar/${date}/analysis`, calendarAnalysis);

            snapshots = [];
        }
    }

    async function startRecording() {
        if (Highlight.isRunningInHighlight()) {
            try {
                let screenshotPermission = await Highlight.permissions.requestScreenshotPermission();
                await Highlight.appStorage.whenHydrated();
                if (screenshotPermission) {
                    snapshotTimestamp = Date.now();
                    snapshotInterval = setInterval(takeSnapshot, SNAPSHOT_DELAY);
                    analysisInterval = setInterval(analyzeSnapshots, ANALYSIS_DELAY);
                }
            } catch (error) {
                console.log(error.message)
            }
        } else {
            console.log("not in highlight");
        }
    }

    function stopRecording() {
        clearInterval(analysisInterval);
        clearInterval(snapshotInterval);
    }

    onMount(() => {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        if (Highlight.isRunningInHighlight()) {
            subscribeRecording()
        }

        return () => {
            if (Highlight.isRunningInHighlight()) {
                unsubscribeRecording();
            }
        };
    });
</script>

<div class="flex w-full h-screen">
    <div class="h-screen overflow-auto">
        <div class="flex flex-col items-center h-screen py-5 px-2 bg-[#1a1a1a] gap-5">
            <a class="flex items-center p-2 gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300"
            href="/dashboard">
                <img class="w-8" 
                src="/favicon.png" alt="icon">
            </a>
            <a class="flex items-center p-2 gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300"
            href="/dashboard/settings">
                <img class="w-8" 
                src="/setting-icon.svg" alt="settings">
            </a>
            <form method="POST" action="?/signout">
                <button class="flex items-center gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300">
                    sign out
                </button>
            </form>
        </div>
    </div>
    
    <slot />
</div>

  
