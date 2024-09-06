<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { 
        onMount,
        onDestroy
    } from "svelte";
    import {
        graphUpdateListener
    } from "$lib/store.js"
    import {
        GREEN,
        RED,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";
    import { 
        ChevronLeft,
        ChevronRight
    } from 'lucide-svelte';
    
    let selectedYear = new Date().getFullYear()
    let selectedMonth = new Date().getMonth();
    let displayDate = formatDate();
    let calendar = [];

    const unsubscribeListener = graphUpdateListener.subscribe(async (value) => {
		await generateMonthCalendar();
	});

    function formatDate() {
        const options = { month: 'long', year: 'numeric' };
        const today = new Date(selectedYear, selectedMonth);
        const formattedDate = today.toLocaleDateString('en-US', options);
        return formattedDate;
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        let result = '';
        if (hours > 0) {
            result += hours + 'h ';
        }
        if (minutes > 0) {
            result += minutes + 'm ';
        }
        return result.trim();
    }

    function isCurrentDate(date) {
        const currentDate = new Date();
        return currentDate.getFullYear() === date.getFullYear() 
            && currentDate.getMonth() === date.getMonth() 
            && currentDate.getDate() === date.getDate();
    }

    function decrementMonth() {
        if (selectedMonth === 0) {
            selectedYear--;
            selectedMonth = 11;
        } else {
            selectedMonth--;
        }
        displayDate = formatDate();
        generateMonthCalendar();
    }

    function incrementMonth() {
        if (selectedMonth === 11) {
            selectedYear++;
            selectedMonth = 0;
        } else {
            selectedMonth++;
        }
        displayDate = formatDate();
        generateMonthCalendar();
    }

    async function generateMonthCalendar() {
        if (Highlight.isRunningInHighlight()) {
            await Highlight.appStorage.whenHydrated();
            const now = new Date();
            const daysInMonth = new Date(selectedYear, selectedMonth+1, 0).getDate();
            const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
            const newCalendar = new Array(firstDay).fill({
                date: new Date(0, 0, 0),
                day: 0,
                productivity: -1,
            });
            for (let day = 1; day <= daysInMonth; day++) {
                const dayTimestamp = new Date(selectedYear, selectedMonth, day).getTime();
                let dayTotalTime = 0;
                let dayProductivity = 0; 
                for (let i = dayTimestamp; i < dayTimestamp + 86400000; i += ANALYSIS_DELAY) {
                    const analysis = Highlight.appStorage.get(`analysis/${i}`);
                    if (analysis) {
                        dayTotalTime += analysis.endTime - analysis.startTime;
                        if (analysis.productive) {
                            dayProductivity += analysis.endTime - analysis.startTime;
                        }
                    }
                }
                newCalendar.push({
                    date: new Date(selectedYear, selectedMonth, day),
                    day: day,
                    productivity: dayTotalTime > 0 ? dayProductivity / dayTotalTime : -1,
                    recordedTime: dayTotalTime,
                });
            }
            
            while (newCalendar.length % 7 !== 0) {
                newCalendar.push({
                    date: new Date(0, 0, 0),
                    day: 0,
                    productivity: -1,
                });
            }
    
            calendar = newCalendar;
        }
    }

    onMount(async () => {
        await generateMonthCalendar();
    });

    onDestroy(() => {
        unsubscribeListener();
    });
</script>

<div class="flex flex-col gap-2 h-full pb-8">
    <div class="flex justify-between items-center">
        <h1>{displayDate}</h1>
        <div class="flex">
            <button
            on:click={decrementMonth}>
                <ChevronLeft />
            </button>
            <button
            on:click={incrementMonth}>
                <ChevronRight />
            </button>
        </div>
    </div>
    <div class="grid grid-cols-7 w-full">
        {#each ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as day}
            <p class="w-full text-xs text-center">{day}</p>
        {/each}
    </div>
    <div class="grid grid-cols-7 grid-rows-6 w-full h-full gap-1">
        {#each calendar as {date, day, productivity, recordedTime}, index}
            {#if day === 0}
                <div></div>
            {:else}
                <div class={`px-2 py-1 bg-zinc-800`}>
                    <p class={`
                        ml-auto w-fit text-sm text-center content-center rounded-full 
                        ${isCurrentDate(date) ? "text-orange-500 font-bold" : ""}
                    `}>
                        {day}
                    </p>
                    {#if productivity !== -1}
                        <div class="flex flex-col gap-1">
                            <p class="text-sm text-nowrap overflow-hidden">{formatTime(recordedTime)} recorded</p>
                            <div class="flex flex-row gap-2 items-center">
                                <div class={`flex-shrink-0 relative size-3 bg-white rounded-full overflow-hidden`}>
                                    <div class={`absolute top-0 size-3 bg-emerald-500`}
                                    style={`--tw-bg-opacity: ${(productivity-0.5)*2}`}>
                                    </div>
                                    <div class={`absolute top-0 size-3 bg-red-500`}
                                    style={`--tw-bg-opacity: ${(0.5-productivity)*2}`}>
                                    </div>
                                </div>
                                <p class="flex-shrink-0 text-sm">{Math.round(productivity*100)}%</p>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
</div>