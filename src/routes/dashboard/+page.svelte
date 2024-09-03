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
    const { supabase, user } = data;
    let { username, occupation } = data;

    const ANALYSIS_DELAY = 300000;
    const SNAPSHOT_DELAY = 10000;

    let unsubscribeRecording;
    let recordingValue;
    let productivity = [300, 50, 20];

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

    async function test() {
        const analysisTimeKey = Math.floor(Date.now() / ANALYSIS_DELAY - 2) * ANALYSIS_DELAY;
        let snapshots = [];
        for (let snapshotTimeKey = analysisTimeKey; 
             snapshotTimeKey < analysisTimeKey + ANALYSIS_DELAY; 
             snapshotTimeKey += SNAPSHOT_DELAY) {
            const snapshot = Highlight.appStorage.get(`snapshots/${snapshotTimeKey}`);
            if (snapshot) {
                snapshots.push({
                    focusedWindowTitle: snapshot.focusedWindowTitle,
                    startTime: snapshot.startTime,
                    endTime: snapshot.endTime,
                    snapshotTimeKey: snapshotTimeKey
                });
            }
        }

        if (snapshots.length > 0) {
            const { mostFrequentTitle, resultURL } = findMostFrequentWindowSnapshot(snapshots);
            const analysis = await fetch(`/api/describe`, {
                method: "POST",
                body: JSON.stringify({ 
                    focusedWindowTitle: mostFrequentTitle,
                    focusedWindowScreenshot: resultURL
                }),
            })
                .then(res => res.json())
                .then(res => JSON.parse(res));
            
            const analysisStartTime = snapshots[0].startTime;
            const analysisEndTime = snapshots.at(-1).endTime;
            Highlight.appStorage.set(`analysis/${analysisTimeKey}`, {
                ...analysis,
                startTime: analysisStartTime,
                endTime: analysisEndTime,
            });
            console.log(`analysis: ${analysis.description}`);
        }
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    async function populateTestDataset() {
        await Highlight.appStorage.whenHydrated();
        Highlight.appStorage.clear();
        let testSnapshots = [];
        let currentTime = Date.now();
        let productivity = 0;
        console.log("begin");
        for (let i = currentTime - 10*60*1000; i < currentTime; i += 10*1000) {
            const productive = Math.random() > 0.5;
            productivity += productive ? 1 : -1;
            const timeKey = Math.floor(i / 10000) * 10000;
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
                const analysisTimeKey = Math.floor(testSnapshots[0].startTime / 300000) * 300000;
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

    let userDisplayName = username || user.email;

    onMount(async () => {
        unsubscribeRecording = recording.subscribe((value) => {
            recordingValue = value;
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
        };
    });

</script>

<div class="flex h-screen bg-black text-white overflow-hidden">
    <!-- Wrapper for sidebar to maintain layout -->
    <div class="w-64 flex-shrink-0">
        <!-- Sidebar - Fixed within its original position -->
        <div class="w-64 h-screen overflow-y-auto bg-black border-r border-gray-800 fixed">
            <div class="p-8">
                <h1 class="text-2xl font-bold mb-6">Overview</h1>
                <div class="flex items-center mb-1 text-white">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm">{formatDate(Date.now())}</span>
                </div>
                
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 flex justify-between items-center">
                        User Info
                        <button class="text-gray-400 hover:text-white rounded-full p-1">:</button>
                    </h2>
                    <div class="space-y-2">
                        <p class="overflow-hidden text-ellipsis">{user.email}</p>
                        {#if username}
                            <p class="overflow-hidden text-ellipsis text-gray-400">{username}</p>
                        {/if}
                        {#if occupation}
                            <p class="overflow-hidden text-ellipsis text-gray-400">{occupation}</p>
                        {/if}
                    </div>
                </div>
                
                <div>
                    <h2 class="text-lg font-semibold mb-4 flex justify-between items-center">
                        Analytics
                        <button class="text-gray-400 hover:text-white rounded-full p-1">:</button>
                    </h2>
                    <div class="w-48 h-48 mx-auto">
                        <ProductivityPie statistics={productivity} />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
        <div class="p-8">
            <!-- User display name in the header or profile dropdown -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold">Welcome, {userDisplayName}!</h2>
            </div>

            <div class="mb-8">
                <div class="flex justify-between items-center">
                    <button 
                        class={`
                            flex items-center space-x-2 px-4 py-2 rounded-full
                            transition-colors duration-300 
                            bg-gray-800 border
                            ${recordingValue ? 'border-red-500 text-red-500' : 'border-gray-600 text-gray-400'}
                            hover:bg-gray-700
                        `}
                        on:click={() => recording.set(!recordingValue)}
                    >
                        <div class="relative w-3 h-3 flex items-center justify-center">
                            <div class={`
                                w-3 h-3
                                ${recordingValue ? 'bg-red-500' : 'bg-gray-400 rounded-full'}
                            `}></div>
                        </div>
                        <span class="w-12">{recordingValue ? 'Stop' : 'Record'}</span>
                    </button>
                    <button class="bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-600 transition-colors duration-300"
                    on:click={populateTestDataset}>
                        Generate test dataset
                    </button>
                    <button class="bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-600 transition-colors duration-300"
                    on:click={test}>
                        test
                    </button>
                </div>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-4">
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
            </div>

            <div>
                <h2 class="text-2xl font-bold mb-4 flex justify-between items-center">
                    Past Hour Activity
                </h2>
                <div class="bg-gray-800 p-4 rounded-lg">
                    <TimelineChart />
                </div>
            </div>
        </div>
    </div>
</div>