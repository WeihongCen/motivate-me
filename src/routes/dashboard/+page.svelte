<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import { 
        recording 
    } from '$lib/store.js';
    import {
        GREEN,
        RED,
        PRODUCTIVE_ICON,
        UNPRODUCTIVE_ICON,
        PRODUCTIVE_DESCRIPTION,
        UNPRODUCTIVE_DESCRIPTION
    } from "$lib/const.js";
    import { sleep } from "openai/core.js";
    
    export let data;
    const { supabase, user, username, occupation } = data;

    let unsubscribeRecording;
    let recordingValue;
    let productivity = 0;
    let hourlyActivity = 0;

    function getDate(timestamp) {
        const today = new Date(timestamp);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    async function populateHourlyActivity() {
        productivity += 1;
        hourlyActivity += 1;
    }

    async function testBtn() {
        let context = await Highlight.user.getContext()
        setTimeout(() => {
            console.log(context.application.focusedWindow.rawContents);
        }, 2000);
    }

    async function populateTestDataset() {
        await Highlight.appStorage.whenHydrated();
        Highlight.appStorage.clear();
        let testSnapshots = [];
        let currentTime = 1724968905828;
        let productivity = 0;
        console.log("begin");
        for (let i = currentTime - 30*60*1000; i < currentTime; i += 10*1000) {
            const productive = Math.random() > 0.5;
            productivity += productive ? 1 : -1;
            const timeKey = Math.round(i / 10000) * 10000;
            const snapshotMetadata = {
                focusedWindowTitle: "app header - " + productive ? "productive app" : "unproductive app",
                focusedWindowApp: productive ? "productive app" : "unproductive app",
                startTime: timeKey,
                endTime: timeKey + 10*1000,
            }
            Highlight.appStorage.set(`snapshots/${timeKey}`, snapshotMetadata);
            Highlight.appStorage.set(`appIcons/${snapshotMetadata.focusedWindowApp}`, productive ? PRODUCTIVE_ICON : UNPRODUCTIVE_ICON);
            testSnapshots = [...testSnapshots, snapshotMetadata];
            
            if ((timeKey + 10000) % 300000 === 0 && testSnapshots.length > 0) {
                const analysisTimeKey = Math.round(testSnapshots[0].startTime / 300000) * 300000;
                Highlight.appStorage.set(`analysis/${analysisTimeKey}`, {
                    productive: productivity > 0,
                    description: productivity > 0 ? PRODUCTIVE_DESCRIPTION : UNPRODUCTIVE_DESCRIPTION,
                    startTime: analysisTimeKey,
                    endTime: timeKey + 10*1000,
                });
                productivity = 0;
                testSnapshots = []
            }
        }
        console.log("complete");

    } 

    onMount(async () => {
        unsubscribeRecording = recording.subscribe((value) => {
            recordingValue = value;
	    });

        return () => {
            unsubscribeRecording();
        };
    });

    $: hourlyActivity;
</script>
<!-- <CustomCursor /> -->
<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-2 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        {#if username}
            <h2 
                class="overflow-hidden text-ellipsis"
            >
                {username}
            </h2>
        {:else if user.email}
            <h2
                class="overflow-hidden text-ellipsis"
            >
                {user.email}
            </h2>
        {/if}
        {#if occupation}
            <p  
                class="overflow-hidden text-ellipsis"
            >
                {occupation}
            </p>
        {/if}
    </div>
    <div class="flex flex-col gap-2 col-span-1 col-start-3 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        {#if !recordingValue}
            <button class="bg-[#ff9457] px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ () => { recording.set(true) } }>
                Record
            </button>
        {:else}
            <button class="bg-red-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ () => { recording.set(false) } }>
                Stop
            </button>
        {/if}
        <button class="bg-[#ff9457] px-4 py-2 hover:opacity-80 transition-all duration-300"
        on:click={testBtn}>
            test
        </button>
    </div>
    <div class="col-span-2 col-start-4 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <button class="bg-red-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
        on:click={populateTestDataset}>
            generate test dataset (will blow up your computer)
        </button>
    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <h2>{getDate(Date.now())}</h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={productivity} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart statistics={hourlyActivity} />
        </div>
        <p class="relative h-full overflow-auto">
        </p>
    </div>
</div>

  
  