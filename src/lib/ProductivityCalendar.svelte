<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import {
        GREEN,
        RED,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";
    
    let calendar = [];

    function formatDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', options);
        return formattedDate;
    }

    async function generateMonthCalendar(year, month) {
        await Highlight.appStorage.whenHydrated();
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();
        const calendar = new Array(firstDay).fill({
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
                calendar.push({
                    day: day,
                    productivity: dayProductivity / dayTotalTime,
                });
            } else {
                calendar.push({
                    day: day,
                    productivity: -1,
                });
            }
        }
        
        while (calendar.length % 7 !== 0) {
            calendar.push({
                day: 0,
                productivity: -1,
            });
        }

        return calendar;
    }

    onMount(async () => {
        calendar = await generateMonthCalendar(2024, 9);
    });
    
</script>

<p class="text-white mb-2">{formatDate()}</p>
<div class="grid grid-cols-7 w-fit gap-1">
    {#each ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as day}
        <p class="w-5 text-xs text-center">{day}</p>
    {/each}
    {#each calendar as {day, productivity}, index}
        {#if day === 0}
            <div class={`size-5`}>
            </div>
        {:else}
            {#if productivity !== -1}
                <div class={`size-5 bg-red-500 rounded`}>
                    <div class={`size-5 bg-emerald-500 rounded ${day === new Date().getDate() ? "border" : ""}`}
                    style={`--tw-bg-opacity: ${productivity}`}
                    >
                    </div>
                </div>
            {:else}
                <div class={`size-5 bg-zinc-900 rounded`}>
                </div>
            {/if}
        {/if}
    {/each}
</div>