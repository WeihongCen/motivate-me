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
    
    export let data;
    const { supabase, user, username, occupation } = data;

    let unsubscribeRecording;
    let recordingValue;
    let productivity = [300, 50, 20];
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
        hourlyActivity += 1;
    }

    async function populateTestDataset() {
        await Highlight.appStorage.whenHydrated();
        Highlight.appStorage.clear();
        let testSnapshots = [];
        let currentTime = Date.now();
        let productivity = 0;
        for (let i = currentTime - 60*60*1000; i < currentTime;) {
            const productive = Math.random() > 0.5;
            productivity += productive;
            const snapshotMetadata = {
                focusedWindowTitle: "app header - " + productive ? "productive app" : "unproductive app",
                focusedWindowApp: productive ? "productive app" : "unproductive app",
                startTime: i,
                endTime: i += 10*1000,
            }
            const timeKey = Math.round(snapshotMetadata.startTime / 10000) * 10000;
            Highlight.appStorage.set(`snapshots/${timeKey}`, snapshotMetadata);
            Highlight.appStorage.set(`appIcons/${snapshotMetadata.focusedWindowApp}`, productive ? PRODUCTIVE_ICON : UNPRODUCTIVE_ICON);
            testSnapshots = [...testSnapshots, snapshotMetadata];
            
            if (testSnapshots.length >= 30) {
                const analysisTimeKey = Math.round(testSnapshots[0].startTime / 300000) * 300000;
                const generalProductivity = productivity >= 15;
                Highlight.appStorage.set(`analysis/${analysisTimeKey}`, {
                    productive: generalProductivity,
                    description: generalProductivity ? PRODUCTIVE_DESCRIPTION : UNPRODUCTIVE_DESCRIPTION,
                    analysisStartTime: analysisTimeKey,
                    analysisEndTime: analysisTimeKey + 300000,
                });
                productivity = 0;
                testSnapshots = []
            }
        }

        for (let i = currentTime - 60*60*1000; i < currentTime; i += 5*10*1000) {

        }

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
    </div>
    <div class="col-span-2 col-start-4 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <button class="bg-red-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
        on:click={populateTestDataset}>
            generate test dataset (will blow up your computer)
        </button>
    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <h2>{getDate(Date.now())}</h2>
        <p>You are <span class={`text-[var(--color-productive)]`}>productive</span></p>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={productivity} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-gray-500 bg-opacity-30 rounded-3xl">
        <button class="bg-blue-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
        on:click={populateHourlyActivity}>
            populate
        </button>
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart statistics={hourlyActivity} />
        </div>
        <p class="relative h-full overflow-auto">
        </p>
    </div>
</div>

  
  