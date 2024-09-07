<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { 
        onMount,
        onDestroy
    } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import RangeSlider from 'svelte-range-slider-pips';
    import { ArrowLeft } from 'lucide-svelte';
    import {
        graphUpdateListener
    } from "$lib/store.js"
    import {
        GREEN,
        RED,
        GREEN_SECONDARY,
        RED_SECONDARY,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";
    import {
        formatTimestampToAMPM,
        formatTime
    } from "$lib/FormatTime.js"

    export let data;

    const range = 86400000;
    const rangeMin = convertToMidnightTimestamp(data.date);
    const rangeMax = convertToMidnightTimestamp(data.date) + range;
    let viewRange = [rangeMin, rangeMax];
    let timelineChart;
    let timelineChartObject;
    let rangeChart;
    let rangeChartObject;
    let selectedTime;
    let selectedAnalysis;
    let appDetails = {};
    let pageDetails = {};
    let selectedApps = [];
    let selectedPages = {};
    let expandedState = {};

    const unsubscribeListener = graphUpdateListener.subscribe((value) => {
        updateCharts();
    });

    function convertToMidnightTimestamp(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);
        return date.getTime();
    }

    async function createCharts() {
        await Highlight.appStorage.whenHydrated();
        let datasets = [];
        for (let i = rangeMin; i <= rangeMax; i += ANALYSIS_DELAY) {
            const analysisTimeKey = Math.round(i / ANALYSIS_DELAY) * ANALYSIS_DELAY;
            const analysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
            if (analysis) {
                const productivityColor = analysis.productive ? GREEN : RED;
                const hoverColor = analysis.productive ? GREEN_SECONDARY : RED_SECONDARY;
                datasets.push({
                    label: analysis.startTime,
                    data: [
                        {
                            x: [new Date(analysis.startTime), new Date(analysis.endTime)],
                            y: "Status",
                        },
                    ],
                    backgroundColor: productivityColor,
                    hoverBackgroundColor: hoverColor,
                });
            }
        }

        timelineChartObject = new Chart(timelineChart, {
            type: 'bar',
            data: {
                datasets: datasets
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                        },
                        ticks: {
                            stepSize: 30,
                            color: '#888888'
                        },
                        border: {
                            display: false
                        },
                        grid: {
                            tickColor: '#888888',
                            tickWidth: 2,
                            lineWidth: 0,
                        },
                        min: new Date(convertToMidnightTimestamp(data.date)),
                        max: new Date(convertToMidnightTimestamp(data.date) + range),
                    },
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        ticks: {
                            display: false
                        },
                        border: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                onHover: (e, element) => {
                    if (element.length) {
                        e.native.target.style.cursor = "pointer";
                        timelineChartObject.update();
                    } else {
                        e.native.target.style.cursor = "default";
                    }
                },
                animation: false,
                onClick: async (e, element) => {
                    if (element.length) {
                        await Highlight.appStorage.whenHydrated();
                        selectedTime = timelineChartObject.data.datasets[element.at(0).datasetIndex].label;
                        const analysisTimeKey = Math.floor(selectedTime / ANALYSIS_DELAY) * ANALYSIS_DELAY;
                        selectedAnalysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
                        appDetails = {};
                        pageDetails = {};
                        for (let i = analysisTimeKey; i < analysisTimeKey + ANALYSIS_DELAY; i += SNAPSHOT_DELAY) {
                            let snapshot = Highlight.appStorage.get(`snapshots/${i}`);
                            if (snapshot) {
                                if (appDetails[snapshot.focusedWindowApp]) {
                                    appDetails[snapshot.focusedWindowApp].time += snapshot.endTime - snapshot.startTime;
                                } else {
                                    appDetails[snapshot.focusedWindowApp] = {
                                        time: snapshot.endTime - snapshot.startTime,
                                        icon: Highlight.appStorage.get(`appIcons/${snapshot.focusedWindowApp}`)
                                    }
                                    pageDetails[snapshot.focusedWindowApp] = {};
                                    expandedState[snapshot.focusedWindowApp] = false;
                                }
                                if (snapshot.focusedWindowTitle) {
                                    const pageTitle = snapshot.focusedWindowTitle.split(" - ").at(0);
                                    if (pageTitle) {
                                        if (pageDetails[snapshot.focusedWindowApp][pageTitle]) {
                                            pageDetails[snapshot.focusedWindowApp][pageTitle].time += snapshot.endTime - snapshot.startTime;
                                        } else {
                                            pageDetails[snapshot.focusedWindowApp][pageTitle] = {
                                                time: snapshot.endTime - snapshot.startTime
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        selectedApps = Object.entries(appDetails);
                        selectedApps.sort((a, b) => b[1].time - a[1].time);
                        selectedApps.forEach(([appName, _]) => {
                            selectedPages[appName] = Object.entries(pageDetails[appName]);
                            selectedPages[appName].sort((a, b) => b[1].time - a[1].time);
                        });

                    } else {
                        selectedTime = null;
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    },
                },
                maintainAspectRatio: false,
            },
        });

        rangeChartObject = new Chart(rangeChart, {
            type: 'bar',
            data: {
                datasets: datasets
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                        },
                        ticks: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        grid: {
                            display: false,
                        },
                        min: new Date(convertToMidnightTimestamp(data.date)),
                        max: new Date(convertToMidnightTimestamp(data.date) + range),
                    },
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        ticks: {
                            display: false
                        },
                        border: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                animation: false,
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    },
                },
                maintainAspectRatio: false,
            },
        });

        await updateCharts();
    }

    async function updateCharts() {
        if (timelineChartObject) {
            timelineChartObject.options.scales.x.min = new Date(viewRange[0]);
            timelineChartObject.options.scales.x.max = new Date(viewRange[1]);
            timelineChartObject.update();
        }
    }

    onMount(async () => {
        await createCharts();
    });

    onDestroy(() => {
        unsubscribeListener();
    });

    $: if (range) {
        updateCharts();
    }
</script>

<div class="flex flex-col gap-5 min-w-[500px]">
    <div class="flex gap-5">
        <a class="size-8"
        href="/dashboard/calendar">
            <ArrowLeft class="size-full m-auto stroke-zinc-300 hover:stroke-white" />
        </a>
        <h2 class="text-2xl font-bold flex justify-between items-center">
            {data.date}
        </h2>
    </div>

    <div class="bg-zinc-800 p-4 rounded-lg h-[100px]">
        <canvas bind:this={timelineChart}/>
    </div>

    <div class="relative">
        <div class="absolute top-[25px] w-full h-[20px] px-4 pointer-events-none">
            <canvas bind:this={rangeChart}/>
        </div>
        <RangeSlider
        min={rangeMin} max={rangeMax} range 
        pips pipstep={18} step={ANALYSIS_DELAY*2} float hoverable={false} 
        formatter={(value, index, percent) => { return formatTimestampToAMPM(value) }}
        all="label" 
        bind:values={viewRange}
        on:change={updateCharts} />
    </div>
    
    <div class="bg-zinc-800 p-4 rounded-lg">
        {#if selectedAnalysis}
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-5">
                    <div class={`size-4 rounded-full`}
                    style={`background-color: ${selectedAnalysis.productive ? GREEN : RED}`}>
                    </div>
                    <p class="text-white">
                        {formatTimestampToAMPM(selectedAnalysis.startTime)}
                    </p>
                </div>
                <p class="">{selectedAnalysis.description}</p>
                <div class="flex flex-col mt-5 gap-2">
                    {#each selectedApps as [appName, appMetadata]}
                        <button class="flex flex-col gap-2 bg-zinc-900 rounded-lg p-4"
                        on:click={() => {expandedState[appName] = !expandedState[appName]}}>
                            <div class="w-full grid grid-cols-6 gap-5">
                                <img class="size-6"
                                src={appMetadata.icon} alt="app icon">
                                <p class="col-span-4 font-bold truncate text-left">
                                    {appName}
                                </p>
                                {#if expandedState[appName]}
                                    <p class="text-right">
                                        {formatTime(appMetadata.time)}
                                    </p>
                                {:else}
                                    <p class="text-right">
                                        {Math.round(appMetadata.time / selectedApps.reduce((accumulator, app) => accumulator + app[1].time, 0) * 100)}%
                                    </p>
                                {/if}
                            </div>
                            
                            {#if expandedState[appName]}
                                <div class="flex flex-col gap-2 w-full transition-all duration-300">
                                    {#each selectedPages[appName] as [pageName, pageMetadata]}
                                        <div class="grid grid-cols-6 rounded gap-5">
                                            <div></div>
                                            <p class="col-span-4 truncate text-left text-[#888888]">
                                                {pageName}
                                            </p>
                                            <p class="text-right text-[#888888]">
                                                {Math.round(pageMetadata.time / selectedPages[appName].reduce((accumulator, [_, metadata]) => accumulator + metadata.time, 0) * 100)}%
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <p class="h-[100px] text-center content-center">
                Click on a time block to see details.
            </p>
        {/if}
    </div>
</div>