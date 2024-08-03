<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import { email, username, occupation, task } from '$lib/stores.js';
    
    export let data;

    const ANALYSIS_DELAY = 20000; // 5 minutes per analysis
    const SNAPSHOT_DELAY = 5000; // 10 seconds per snapshot
    const RESCALE_WIDTH = 960;
    const RESCALE_HEIGHT = 540;

    let emailValue;
    let usernameValue;
    let occupationValue;
    let taskValue;

    let recording = false;
    let canvas; // Used to rescale image in imageToDataURL
    let ctx;
    let snapshots = [];
    let timestamp;
    let analysisInterval;
    let snapshotInterval;

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
        const focusedWindowScreenshot = await Highlight.user.getWindowScreenshot(focusedWindowTitle);
        const startTime = timestamp
        timestamp = Date.now();

        rescaleImage(focusedWindowScreenshot, async (resizedBase64URL) => {
            console.log("added screenshot");
            snapshots.push({
                focusedWindowTitle: focusedWindowTitle,
                base64URL: resizedBase64URL,
            });
            snapshots = snapshots;
        });
    }

    async function analyzeSnapshots() {
        const res = await fetch(`/api/describe`, {
            method: "POST",
            body: JSON.stringify({ snapshots: snapshots }),
        });
        const analysis = await res.json();
        snapshots = [];
    }

    async function startRecording() {
        if (Highlight.isRunningInHighlight()) {
            try {
                let screenshotPermission = await Highlight.permissions.requestScreenshotPermission();
                if (screenshotPermission) {
                    recording = true;
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
        recording = false;
        clearInterval(analysisInterval);
        clearInterval(snapshotInterval);
    }

    onMount(async () => {
        email.set(data.user.email);
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        email.subscribe((value) => { emailValue = value });
        username.subscribe((value) => { usernameValue = value });
        occupation.subscribe((value) => { occupationValue = value });
        task.subscribe((value) => { taskValue = value });

        await Highlight.appStorage.whenHydrated();

        return () => {
        };
    });
</script>

<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-2 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        <h2>Profile</h2>
        <p>{emailValue}</p>
        <p>{usernameValue}</p>
        <p>{occupationValue}</p>
        <p>{taskValue}</p>
    </div>
    <div class="col-span-2 col-start-3 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        {#if snapshots.length > 0}
            <img class="max-h-full"
            src={snapshots[snapshots.length-1].base64URL} alt="last screenshot">
        {/if}
    </div>
    <div class="flex flex-col gap-2 col-span-1 col-start-5 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        {#if !recording}
            <button class="bg-[#ff9457] px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ startRecording }>
                Record
            </button>
        {:else}
            <button class="bg-red-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ stopRecording }>
                Stop
            </button>
        {/if}
    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        <h2>You are <span class={`text-[var(--color-productive)]`}>productive</span></h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={[300, 50, 20]} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart />
        </div>
        <p class="relative h-full overflow-auto">
        </p>
    </div>
</div>

  
  