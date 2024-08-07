<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';
    import { recording } from '$lib/store.js';

    export let data;
    const { user } = data;

    const ANALYSIS_DELAY = 20000; // 5 minutes per analysis
    const SNAPSHOT_DELAY = 5000; // 10 seconds per snapshot
    const RESCALE_WIDTH = 960;
    const RESCALE_HEIGHT = 540;

    let occupation = "";

    let canvas; // Used to rescale image in imageToDataURL
    let ctx;
    let snapshots = [];
    let timestamp;
    let analysisInterval;
    let snapshotInterval;

    recording.subscribe((bRecording) => {
		if (bRecording) {
            console.log("recording started.");
            startRecording();
        } else {
            console.log("recording ended.");
            stopRecording();
        }
	});

    async function populateUserData() {
        let response = await fetch(`/api/getProfile`, {
            method: "GET"
        })
            .then(res => res.json());
        occupation = response.userData.occupation;
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
        const context = await Highlight.user.getContext();
        const focusedWindowTitle = context.application.focusedWindow.title;
        let focusedWindowIcon;
        const windows = await Highlight.user.getWindows();
        windows.forEach(window => {
            if (window.windowTitle === focusedWindowTitle) {
                focusedWindowIcon = window.appIcon;
            }
        });
        const focusedWindowScreenshot = await Highlight.user.getWindowScreenshot(focusedWindowTitle);
        const startTime = timestamp;
        timestamp = Date.now();

        rescaleImage(focusedWindowScreenshot, async (resizedBase64URL) => {
            console.log("added screenshot");
            snapshots.push({
                focusedWindowTitle: focusedWindowTitle,
                focusedWindowIcon: focusedWindowIcon,
                base64URL: resizedBase64URL,
                startTime: startTime,
                endTime: timestamp,
            });
            snapshots = snapshots;
        });
    }

    async function analyzeSnapshots() {
        populateUserData();
        const res = await fetch(`/api/describe`, {
            method: "POST",
            body: JSON.stringify({ 
                snapshots: snapshots,
                occupation: occupation,
            }),
        });
        const analysis = await res.json();
        snapshots = [];
    }

    async function startRecording() {
        if (Highlight.isRunningInHighlight()) {
            try {
                let screenshotPermission = await Highlight.permissions.requestScreenshotPermission();
                if (screenshotPermission) {
                    timestamp = Date.now(); // Initialize start timestamp
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
        if (Highlight.isRunningInHighlight()) {
        }
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

  
