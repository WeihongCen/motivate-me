<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { 
        onMount,
    } from "svelte";
    import {
        ANALYSIS_DELAY,
    } from "$lib/const.js";
    import { 
        ChevronLeft,
        ChevronRight
    } from 'lucide-svelte';
    import {
        formatDateYYYYMMDD,
        formatDateMonthYYYY
    } from "$lib/FormatTime.js"
    
    let selectedYear = new Date().getFullYear();
    let selectedMonth = new Date().getMonth();
    let displayDate = formatDateMonthYYYY(selectedYear, selectedMonth);
    let calendar = [];
    let calendarRows = 5;

    function isCurrentDate(dayTimestamp) {
        const now = new Date();
        const currentDateTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return dayTimestamp === currentDateTimestamp;
    }

    async function decrementMonth() {
        if (selectedMonth === 0) {
            selectedYear--;
            selectedMonth = 11;
        } else {
            selectedMonth--;
        }
        displayDate = formatDateMonthYYYY(selectedYear, selectedMonth);
        await generateMonthCalendar();
    }

    async function incrementMonth() {
        if (selectedMonth === 11) {
            selectedYear++;
            selectedMonth = 0;
        } else {
            selectedMonth++;
        }
        displayDate = formatDateMonthYYYY(selectedYear, selectedMonth);
        await generateMonthCalendar();
    }

    async function generateMonthCalendar() {
        if (Highlight.isRunningInHighlight()) {
            await Highlight.appStorage.whenHydrated();
            const daysInMonth = new Date(selectedYear, selectedMonth+1, 0).getDate();
            const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
            const newCalendar = new Array(firstDay).fill({
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
                    dayTimestamp: dayTimestamp,
                    day: day,
                    productivity: dayTotalTime > 0 ? dayProductivity / dayTotalTime : -1,
                    summary: Highlight.appStorage.get(`dayKeyword/${dayTimestamp}`),
                    recordedTime: dayTotalTime,
                });
            }
            
            while (newCalendar.length % 7 !== 0) {
                newCalendar.push({
                    day: 0,
                    productivity: -1,
                });
            }
    
            calendar = newCalendar;
            calendarRows = Math.ceil((firstDay + daysInMonth) / 7);

            await populateDailySummary();
        }
    }

    async function populateDailySummary() {
        calendar.forEach(async (entry, index) => {
            if (entry.productivity !== -1) {
                if (!entry.summary) {
                    calendar[index].summary = await populateDayKeyword(entry.dayTimestamp);
                }
            }
        });
    }

    async function populateDayKeyword(dayTimestamp) {
        if (!isCurrentDate(dayTimestamp)) {
            let completeAnalysis = "";
            for (let i = dayTimestamp; i < dayTimestamp + 86400000; i += ANALYSIS_DELAY) {
                const analysis = Highlight.appStorage.get(`analysis/${i}`);
                if (analysis) {
                    completeAnalysis += analysis.description + "\n";
                }
            }
            const messages = [
                {
                    role: 'system',
                    content: 'You return one keyword for the text. Only return the keyword.',
                },
                {
                    role: 'user',
                    content: completeAnalysis,
                }
            ];
            const options = {
                temperature: 0,
                maxTokens: 10,
            };
            const textPrediction = Highlight.inference.getTextPrediction(messages, options);
            let prediction = "";
            for await (const chunk of textPrediction) {
                prediction += chunk
            }
            Highlight.appStorage.set(`dayKeyword/${dayTimestamp}`, prediction);
            return prediction;
        }
        return "";
    }

    onMount(async () => {
        await generateMonthCalendar();
    });
</script>

<div class="flex flex-col gap-2 h-full pb-8">
    <div class="flex justify-end items-center">
        <div class="flex items-center gap-5">
            <button class="size-8 border border-zinc-500 hover:bg-zinc-800 rounded-md"
            on:click={decrementMonth}>
                <ChevronLeft strokeWidth={3} class="size-1/2 m-auto stroke-white" />
            </button>
            <div class="w-28">
                <h2 class="text-center text-[#bbbbbb] text-nowrap">{displayDate}</h2>
            </div>
            <button class="size-8 border border-zinc-500 hover:bg-zinc-800 rounded-md"
            on:click={incrementMonth}>
                <ChevronRight strokeWidth={3} class="size-1/2 m-auto stroke-white" />
            </button>
        </div>
    </div>
    <div class="grid grid-cols-7 w-full">
        {#each ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as day}
            <p class="w-full text-xs text-center">{day}</p>
        {/each}
    </div>
    <div class={`grid grid-cols-7 grid-rows-${calendarRows} w-full h-full gap-1`}>
        {#each calendar as {dayTimestamp, day, productivity, summary}, index}
            {#if day === 0}
                <div></div>
            {:else}
                <div class={`relative bg-white overflow-hidden`}>
                    {#if productivity === -1}
                        <div class={`size-full bg-zinc-800`}>
                        </div>
                    {:else if productivity > 0.5}
                        <div class={`size-full bg-emerald-400`}
                        style={`--tw-bg-opacity: ${(productivity-0.5)*2}`}>
                        </div>
                    {:else}
                        <div class={`size-full bg-red-400`}
                        style={`--tw-bg-opacity: ${(0.5-productivity)*2}`}>
                        </div>
                    {/if}
                    {#if isCurrentDate(dayTimestamp)}
                        <div class={`absolute top-0 size-full border-2`}>
                            <div class={`size-full border-2 border-black`}>
                            </div>
                        </div>
                    {/if}
                    <a class={`flex flex-col justify-between absolute top-0 size-full p-2 rounded-md bg-black bg-opacity-0 hover:bg-opacity-10 cursor-pointer`}
                    href={`/dashboard/calendar/${formatDateYYYYMMDD(selectedYear, selectedMonth+1, day)}`}>
                        {#if productivity === -1}
                            <p class={`ml-auto w-fit text-neutral-400 text-sm text-center rounded-full`}>
                                {day}
                            </p>
                        {:else}
                            <p class={`ml-auto w-fit text-black text-sm text-center rounded-full font-semibold`}>
                                {day}
                            </p>
                            <div>
                                <p class={`text-black text-xl font-semibold`}>{Math.round(productivity*100)}</p>
                                {#if summary}
                                    <div class="h-4">
                                        <p class={`text-black text-xs truncate`}>{summary}</p>
                                    </div>
                                {:else}
                                    <div class="flex items-center h-4">
                                        {#if !isCurrentDate(dayTimestamp)}
                                            <div class="animate-pulse h-2 w-full bg-black bg-opacity-50 rounded-full">
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/if}
                        </a>
                </div>
            {/if}
        {/each}
    </div>
</div>