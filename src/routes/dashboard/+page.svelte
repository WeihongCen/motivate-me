<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";

    const ANALYSIS_DELAY = 300000; // 5 minutes
    const SNAPSHOT_DELAY = 5000;
    const RESCALE_WIDTH = 960;
    const RESCALE_HEIGHT = 540;

    let username;
    let recording = false;
    let canvas; // Used to rescale image in imageToDataURL
    let ctx;
    let snapshots = [];
    let timestamp;
    let analysisInterval;
    let snapshotInterval;

    export let data;

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
        const displayScreenshots = await Highlight.user.getDisplayScreenshots();
        const context = await Highlight.user.getContext();
        const screenshot = displayScreenshots[0].thumbnail;
        timestamp = Date.now();
        console.log(`taken snapshot (${timestamp})`);
        rescaleImage(screenshot, async (resizedBase64URL) => {
            console.log(context.application.focusedWindow.title);
            snapshots.push({
                focusedWindowTitle: context.application.focusedWindow.title,
                base64URL: resizedBase64URL,
            });
        });
    }

    async function analyzeSnapshots() {
        let res = await fetch(`/api/describe`, {
            method: "POST",
            body: JSON.stringify({ snapshots: snapshots }),
        });
        snapshots = [];
    }

    async function startRecording() {
        if (Highlight.isRunningInHighlight()) {
            try {
                let screenshotPermission = await Highlight.permissions.requestScreenshotPermission();
                if (screenshotPermission) {
                    recording = true;
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

    onMount(() => {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        return () => {
        };
    });
</script>

<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-2 p-5 bg-[#444444] rounded-3xl">
        <h2>Profile</h2>
        <p>{data.user.email}</p>
    </div>
    <div class="col-span-2 col-start-3 p-5 bg-[#444444] rounded-3xl">
        {#if snapshots}
            <img class="max-h-full"
            src={snapshots[snapshots.length-1]} alt="last screenshot">
        {/if}
    </div>
    <div class="flex flex-col gap-2 col-span-1 col-start-5 p-5 bg-[#444444] rounded-3xl">
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
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-[#444444] rounded-3xl">
        <h2>You are <span class={`text-[var(--color-productive)]`}>productive</span></h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={[300, 50, 20]} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-[#444444] rounded-3xl">
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart />
        </div>
        <p class="relative h-full overflow-auto">
        </p>
    </div>
</div>

  
  