<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityCalendar from "$lib/ProductivityCalendar.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import { 
        recording,
        recordingTimer,
        graphUpdateListener
    } from '$lib/store.js';
    import {
        GREEN,
        RED,
        PRODUCTIVE_ICON,
        UNPRODUCTIVE_ICON,
        PRODUCTIVE_DESCRIPTION,
        UNPRODUCTIVE_DESCRIPTION,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";
    import { 
        UserRound,
        BriefcaseBusiness,
        EllipsisVertical
    } from 'lucide-svelte';
    import {
        formatTimer
    } from "$lib/FormatTime.js"
    
    export let data;
    const { supabase, user } = data;
    let { username, occupation } = data;

    let unsubscribeRecording;
    let unsubscribeTimer;
    let bRecording;
    let timerDisplay;

    function findMostFrequentWindowSnapshot(data) {
        const windowTitleCount = {};
        const latestTimestamp = {};

        data.forEach(item => {
            const { 
                focusedWindowTitle,
                snapshotTimeKey,
            } = item;
            if (windowTitleCount[focusedWindowTitle]) {
                windowTitleCount[focusedWindowTitle]++;
            } else {
                windowTitleCount[focusedWindowTitle] = 1;
            }
            latestTimestamp[focusedWindowTitle] = snapshotTimeKey;
        });

        let mostFrequentTitle = null;
        let maxCount = 0;
        for (const title in windowTitleCount) {
            if (windowTitleCount[title] > maxCount) {
                maxCount = windowTitleCount[title];
                mostFrequentTitle = title;
            }
        }
        const resultTimestamp = latestTimestamp[mostFrequentTitle];
        const screenshotKey = Math.floor(resultTimestamp / SNAPSHOT_DELAY) % SNAPSHOT_DELAY;
        const resultURL = Highlight.appStorage.get(`screenshots/${screenshotKey}`);
        return { mostFrequentTitle, resultURL };
    }

    async function populateTestDataset() {
        await Highlight.appStorage.whenHydrated();
        let testSnapshots = [];
        let currentTime = 1724968905828;
        let productivity = 0;
        console.log("begin");
        for (let i = currentTime - 40*60*1000; i < currentTime; i += 10*1000) {
            const productive = Math.random() > 0.5;
            productivity += productive ? 1 : -1;
            const timeKey = Math.floor(i / 10000) * 10000;
            const snapshotMetadata = {
                focusedWindowTitle: "app header - " + productive ? "productive app" : "unproductive app",
                focusedWindowApp: productive ? "productive app" : "unproductive app",
                startTime: timeKey,
                endTime: timeKey + 10*1000,
                startTime: timeKey,
                endTime: timeKey + 10*1000,
            }
            Highlight.appStorage.set(`snapshots/${timeKey}`, snapshotMetadata);
            Highlight.appStorage.set(`appIcons/${snapshotMetadata.focusedWindowApp}`, productive ? PRODUCTIVE_ICON : UNPRODUCTIVE_ICON);
            testSnapshots = [...testSnapshots, snapshotMetadata];
            
            if ((timeKey + 10000) % 300000 === 0 && testSnapshots.length > 0) {
                const analysisTimeKey = Math.floor(testSnapshots[0].startTime / 300000) * 300000;
                Highlight.appStorage.set(`analysis/${analysisTimeKey}`, {
                    productive: productivity > 0,
                    description: productivity > 0 ? PRODUCTIVE_DESCRIPTION : UNPRODUCTIVE_DESCRIPTION,
                    startTime: analysisTimeKey,
                    endTime: timeKey + 10*1000,
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

    let userDisplayName = username || user.email;

    onMount(async () => {
        unsubscribeRecording = recording.subscribe((value) => {
            bRecording = value;
        });
        unsubscribeTimer = recordingTimer.subscribe((value) => {
            if (bRecording) {
                timerDisplay = formatTimer(value);
            }
        });

        // Fetch user data if username or occupation is not available
        if (!username || !occupation) {
            const response = await fetch(`/api/getProfile`, {
                method: "GET"
            }).then(res => res.json());
            
            username = response.userData.username;
            occupation = response.userData.occupation;
            userDisplayName = username || user.email;
        }

        return () => {
            unsubscribeRecording();
            unsubscribeTimer();
        };
    });

</script>

<div class="flex h-fit overflow-hidden gap-10">
    <div class="flex-shrink-0 flex flex-col gap-5 w-[250px] h-fit bg-black">
        <div class="flex justify-between items-center">
            <button 
                class={`
                    flex items-center space-x-2 px-4 py-2 rounded-full
                    transition-colors duration-300 border-2
                    ${bRecording ? 'border-red-500 text-red-500' : 'border-white text-white'}
                    hover:bg-zinc-700
                `}
                on:click={ () => {recording.set(!bRecording)} }
            >
                <div class="relative size-3 flex items-center justify-center">
                    <div class={`
                        size-3 transition-colors duration-300
                        ${bRecording ? 'bg-red-500' : 'bg-white rounded-full'}
                    `}></div>
                </div>
                <span class="w-12">{bRecording ? 'Stop' : 'Record'}</span>
            </button>
            {#if timerDisplay && bRecording}
                <p>{timerDisplay}</p>
            {/if}
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <h2>User Info</h2>
                <a class="size-5"
                href="/dashboard/settings">
                    <EllipsisVertical class="stroke-[#bbbbbb] hover:stroke-white" />
                </a>
            </div>
            <div class="flex flex-col gap-4 bg-zinc-800 p-5 rounded-lg">
                <div class="flex items-center gap-4">
                    <div class="size-6">
                        <UserRound />
                    </div>
                    <div class="flex-1">
                        <p class="text-[#888888]">Username</p>
                        <p class="truncate">{userDisplayName}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="size-6">
                        <BriefcaseBusiness />
                    </div>
                    <div class="flex-1">
                        {#if occupation && occupation.trim() !== ''}
                            <p class="text-[#888888]">Occupation</p>
                            <p class="truncate">{occupation}</p>
                        {:else}
                            <a class="text-orange-500 px-4 py-1 border border-orange-500 hover:border-orange-300 hover:text-orange-300 rounded-full"
                            href="/dashboard/settings">
                                set occupation
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <ProductivityCalendar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 w-1/2">
        <!-- <div class="mb-8 grid grid-cols-2 gap-4">
            <div class="bg-gray-800 p-4 rounded-lg">
                <p class="text-sm text-gray-400 mb-2">Average Productive Time</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold">6 Hours</span>
                    <span class="text-green-400 text-sm">↑ 16.5%</span>
                </div>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <p class="text-sm text-gray-400 mb-2">Average Wasted Time</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold">4 Hours</span>
                    <span class="text-red-400 text-sm">↓ 13.4%</span>
                </div>
            </div>
        </div> -->

        <TimelineChart />
    </div>
</div>