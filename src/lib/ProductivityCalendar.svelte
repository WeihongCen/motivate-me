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
    import { EllipsisVertical } from 'lucide-svelte';
    
    let calendar = [];

    const unsubscribeListener = graphUpdateListener.subscribe(async (value) => {
		await generateMonthCalendar();
	});

    function formatDate() {
        const options = { month: 'long', day: 'numeric' };
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', options);
        return formattedDate;
    }

    async function generateMonthCalendar() {
        if (Highlight.isRunningInHighlight()) {
            await Highlight.appStorage.whenHydrated();
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const daysInMonth = new Date(year, month, 0).getDate();
            const firstDay = new Date(year, month-1, 1).getDay();
            const newCalendar = new Array(firstDay).fill({
                day: 0,
                productivity: -1,
            });
            for (let day = 1; day <= daysInMonth; day++) {
                const dayTimestamp = new Date(year, month - 1, day).getTime();
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
                if (dayTotalTime > 0) {
                    newCalendar.push({
                        day: day,
                        productivity: dayProductivity / dayTotalTime,
                    });
                } else {
                    newCalendar.push({
                        day: day,
                        productivity: -1,
                    });
                }
            }
            
            while (newCalendar.length % 7 !== 0) {
                newCalendar.push({
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

<div class="flex flex-col gap-2">
    <div class="flex justify-between items-center">
        <h2>Calendar</h2>
        <a class="size-5"
        href="/dashboard/calendar">
            <EllipsisVertical class="stroke-[#bbbbbb] hover:stroke-white" />
        </a>
    </div>
    <div class="grid grid-cols-7 w-full gap-1">
        {#each ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as day}
            <p class="w-5 text-xs text-center">{day}</p>
        {/each}
        {#each calendar as {day, productivity}, index}
            {#if day === 0}
                <div></div>
            {:else}
                <div class={`relative aspect-square bg-white rounded-md overflow-hidden`}>
                    {#if productivity !== -1}
                        <div class={`absolute top-0 size-full bg-emerald-500 rounded-md`}
                        style={`--tw-bg-opacity: ${(productivity-0.5)*2}`}>
                        </div>
                        <div class={`absolute top-0 size-full bg-red-500 rounded-md`}
                        style={`--tw-bg-opacity: ${(0.5-productivity)*2}`}>
                        </div>
                    {:else}
                        <div class={`size-[200%] bg-zinc-800`}>
                        </div>
                    {/if}
                    {#if day === new Date().getDate()}
                        <div class={`absolute top-0 size-full border-2 rounded-md`}>
                        </div>
                    {/if}
                </div>

            {/if}
        {/each}
    </div>
</div>