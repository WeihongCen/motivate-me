<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TestTimelineChart from "$lib/TestTimelineChart.svelte";
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

    let unsubscribeRecording;
    let recordingValue;
    let productivity = [300, 50, 20];
    let hourlyActivity = {
        curTime: Date.now(),
        datasets: [],
    };

    let selectedDateRange = 'Jan 08 - Aug 08';

    function getDate(timestamp) {
        const today = new Date(timestamp);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    async function populateHourlyActivity() {
        let curTime = 1724968905828;
        let newHourlyActivity = {
            curTime: curTime,
            datasets: [],
        };
        for (let i = curTime; i > curTime - 60*60*1000; i -= 30000) {
            const analysisTimeKey = Math.round(i / 30000) * 30000;
            const analysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
            if (analysis) {
                const productivityColor = analysis.productive ? GREEN : RED;
                const hoverColor = analysis.productive ? "#96eeb6" : "#ffb7b7";
                newHourlyActivity.datasets.push({
                    label: analysis.description,
                    data: [
                        {
                            x: [new Date(analysis.analysisStartTime), new Date(analysis.analysisEndTime)],
                            y: "Status",
                        },
                    ],
                    backgroundColor: productivityColor,
                    hoverBackgroundColor: hoverColor,
                });
            }
        }
        hourlyActivity = newHourlyActivity;
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

    $: hourlyActivity;
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
                <p class="mb-8 text-white">You are <span class={`text-[var(--color-productive)]`}>productive</span></p>
                
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
                </div>
            </div>

            <div class="mb-8 grid grid-cols-3 gap-4">
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
                <div class="bg-gray-800 p-4 rounded-lg">
                    <p class="text-sm text-gray-400 mb-2">Active Members</p>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-bold">4,555</span>
                        <span class="text-yellow-400 text-sm">↗ 19.8%</span>
                    </div>
                </div>
            </div>

            <div>
                <h2 class="text-2xl font-bold mb-4 flex justify-between items-center">
                    Past Hour Activity
                    <button 
                        class="p-2 bg-orange-400 hover:bg-orange-500 rounded-full transition-colors duration-300"
                        on:click={populateHourlyActivity}
                        aria-label="Refresh Past Hour Activity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </h2>
                <div class="bg-gray-800 p-4 rounded-lg h-[100px]">
                    <TestTimelineChart statistics={hourlyActivity} />
                </div>
            </div>
        </div>
    </div>
</div>