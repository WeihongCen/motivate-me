<script>
    import Highlight from "@highlight-ai/app-runtime";
    import "../../app.css";
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { 
        Gauge,
        Calendar,
        CircleUserRound,
        Settings,
        LogOut 
    } from 'lucide-svelte';
    import { 
        recording,
        recordingTimer,
        graphUpdateListener
     } from '$lib/store.js';
    import {
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY,
        SNAPSHOT_STORAGE_LIMIT
    } from '$lib/const.js';

    export let data

    $: ({ supabase, session, username, user, avatar_url } = data)

    let unsubscribeRecording;
    let snapshotTimeout;
    let analysisTimeout;
    let snapshotInterval;
    let analysisInterval;
    let timerStartTime;
    let timerInterval;
    let snapshotTimestamp;
    
    let isProfileDropdownOpen = false;

    async function test() {
        // Highlight.appStorage.clear();
        for (let i = 0; i < 10; i++) {
            Highlight.appStorage.set("test", 1);
        }
        // let storage = Highlight.appStorage.all();
        // Object.keys(storage).forEach(key => {
        //     if (key.startsWith("daySummary")) {
        //         Highlight.appStorage.delete(key);
        //     }
        // });
        // graphUpdateListener.update((n) => n + 1);
        // const windows = await Highlight.user.getWindows();
        // console.log(windows[0].windowTitle);
        // if (windows[0]) {
        //     console.log("exist");
        // }
    }

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

    async function startRecording() {
        if (Highlight.isRunningInHighlight()) {
            try {
                const screenshotPermissions = await Highlight.permissions.requestScreenshotPermission();
                const backgroundPermissions = await Highlight.permissions.requestBackgroundPermission();
                await Highlight.appStorage.whenHydrated();
                if (screenshotPermissions && backgroundPermissions) {
                    snapshotTimestamp = Date.now();
                    timerStartTime = Date.now();
                    snapshotTimeout = setTimeout(() => {
                        takeSnapshot();
                        snapshotInterval = setInterval(takeSnapshot, SNAPSHOT_DELAY);
                    }, SNAPSHOT_DELAY - (Date.now() % SNAPSHOT_DELAY));

                    analysisTimeout = setTimeout(() => {
                        analyzeSnapshots();
                        analysisInterval = setInterval(analyzeSnapshots, ANALYSIS_DELAY);
                    }, ANALYSIS_DELAY - (Date.now() % ANALYSIS_DELAY));
                    recordingTimer.set(0);
                    timerInterval = setInterval(() => {
                        recordingTimer.set(Date.now() - timerStartTime);
                    }, 1000);
                } else {
                    recording.set(false);
                }
            } catch (error) {
                console.log(error.message)
            }
        } else {
            console.log("not in highlight");
        }
    }

    function stopRecording() {
        clearTimeout(snapshotTimeout);
        clearTimeout(analysisTimeout);
        clearInterval(analysisInterval);
        clearInterval(snapshotInterval);
    }

    async function takeSnapshot() {
        const windows = await Highlight.user.getWindows();
        if (windows[0]) {
            const focusedWindowTitle = windows[0].windowTitle;
            const focusedWindowApp = focusedWindowTitle.split(" - ").at(-1);
            const focusedWindowIcon = windows[0].appIcon;
            const focusedWindowScreenshot = await Highlight.user.getWindowScreenshot(focusedWindowTitle);
            const snapshotMetadata = {
                focusedWindowTitle: focusedWindowTitle,
                focusedWindowApp: focusedWindowApp,
                startTime: snapshotTimestamp,
                endTime: snapshotTimestamp = Date.now(),
            };
            const timeKey = Math.floor(snapshotMetadata.startTime / SNAPSHOT_DELAY) * SNAPSHOT_DELAY;
            const screenshotKey = Math.floor(snapshotMetadata.startTime / SNAPSHOT_DELAY) % SNAPSHOT_STORAGE_LIMIT;
            Highlight.appStorage.set(`snapshots/${timeKey}`, snapshotMetadata);
            if (Highlight.appStorage.get(`appIcons/${focusedWindowApp}`) !== focusedWindowIcon) {
                Highlight.appStorage.set(`appIcons/${focusedWindowApp}`, focusedWindowIcon);
            }
            Highlight.appStorage.set(`screenshots/${screenshotKey}`, focusedWindowScreenshot);
            console.log(`snapshot: ${focusedWindowTitle}`);
        }
    }

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
        const screenshotKey = Math.floor(resultTimestamp / SNAPSHOT_DELAY) % SNAPSHOT_STORAGE_LIMIT;
        const resultURL = Highlight.appStorage.get(`screenshots/${screenshotKey}`);
        return { mostFrequentTitle, resultURL };
    }

    async function analyzeSnapshots() {
        const analysisTimeKey = Math.floor(Date.now() / ANALYSIS_DELAY - 1) * ANALYSIS_DELAY;
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
        graphUpdateListener.update((n) => n + 1);
    }

    function toggleProfileDropdown(event) {
        event.stopPropagation();
        isProfileDropdownOpen = !isProfileDropdownOpen;
    }

    function closeProfileDropdown() {
        isProfileDropdownOpen = false;
    }

    function handleClickOutside(event) {
        if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
            closeProfileDropdown();
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && isProfileDropdownOpen) {
            closeProfileDropdown();
        }
    }

    async function handleLogout() {
        closeProfileDropdown();
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error logging out:', error)
        } else {
            goto('/') // Redirect to home page after logout
        }
    }

    onMount(() => {
        if (Highlight.isRunningInHighlight()) {
            subscribeRecording()
        }

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeydown);

        return () => {
            unsubscribeRecording();
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="min-h-screen text-white font-sans bg-black relative">
    <nav class="fixed top-0 h-[8vh] left-0 right-0 flex justify-between items-center px-8 py-2 bg-opacity-60 backdrop-filter backdrop-blur-lg z-50 bg-black">
        <a href="/dashboard" class="flex items-center space-x-4">
            <img src="/favicon.png" alt="Logo" class="size-8">
        </a>
        <button class="bg-zinc-700 px-4 py-2 rounded-full hover:bg-zinc-600 transition-colors duration-300"
        on:click={test}>
            test
        </button>
        <div class="flex gap-10">
            <a class="flex flex-col items-center hover:text-white"
                href="/dashboard"
                class:text-white={$page.url.pathname === '/dashboard'}
                class:text-zinc-400={$page.url.pathname !== '/dashboard'}>
                <Gauge />
                <span class="text-xs">Dashboard</span>
            </a>
            <a class="flex flex-col items-center hover:text-white"
                href="/dashboard/calendar"
                class:text-white={$page.url.pathname === '/dashboard/calendar'}
                class:text-zinc-400={$page.url.pathname !== '/dashboard/calendar'}>
                <Calendar />
                <span class="text-xs">Calendar</span>
            </a>
            <div class="flex items-center space-x-6">
                <div class="relative profile-dropdown">
                    <button 
                        on:click={toggleProfileDropdown} 
                        aria-haspopup="true" 
                        aria-expanded={isProfileDropdownOpen}
                        class="flex items-center space-x-2 focus:outline-none"
                    >
                        {#if avatar_url}
                            <img src={avatar_url} alt="Profile" class="h-10 w-10 rounded-full border-2 border-zinc-600" />
                        {:else}
                            <CircleUserRound />
                        {/if}
                        <span>{username}</span>
                        <svg class="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    {#if isProfileDropdownOpen}
                        <div 
                            role="menu" 
                            aria-orientation="vertical" 
                            aria-labelledby="user-menu"
                            class="absolute right-0 mt-2 w-40 bg-zinc-800 rounded-md shadow-lg py-1"
                        >
                            <a 
                                href="/dashboard/settings" 
                                on:click={closeProfileDropdown}
                                role="menuitem"
                                class="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            >
                                <Settings />
                                <span>Settings</span>
                            </a>
                            <button 
                                on:click={handleLogout}
                                role="menuitem"
                                class="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            >
                                <LogOut />
                                <span>Log out</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </nav>
    <div class="h-[8vh]"></div>
    <div class="p-8 max-w-7xl mx-auto">
        <slot />
    </div>
</div>