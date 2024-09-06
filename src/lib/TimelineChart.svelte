<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { 
        onMount,
        onDestroy
    } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
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

    let range = 3600000;
    let timelineChart;
    let chart;
    let selectedTime;
    let selectedAnalysis;
    let appDetails = {};
    let pageDetails = {};
    let selectedApps = [];
    let selectedPages = {};
    let expandedState = {};

    const unsubscribeListener = graphUpdateListener.subscribe((value) => {
        updateChart();
    });

    async function createChart() {
        chart = new Chart(timelineChart, {
            type: 'bar',
            data: {
                datasets: []
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
                            stepSize: 10,
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
                        min: new Date(Date.now() - range),
                        max: new Date(Date.now()),
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
                        chart.update();
                    } else {
                        e.native.target.style.cursor = "default";
                    }
                },
                animation: false,
                onClick: async (e, element) => {
                    if (element.length) {
                        await Highlight.appStorage.whenHydrated();
                        selectedTime = chart.data.datasets[element.at(0).datasetIndex].label;
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

        await updateChart();
    }

    async function updateChart() {
        if (chart) {
            await Highlight.appStorage.whenHydrated();
            const curTime = Date.now();
            const timeKey = Math.round(curTime / ANALYSIS_DELAY) * ANALYSIS_DELAY;
            let datasets = [];
            for (let i = timeKey; i >= timeKey - range; i -= ANALYSIS_DELAY) {
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

            chart.data.datasets = datasets;
            chart.options.scales.x.min = new Date(curTime - range);
            chart.options.scales.x.max = new Date(curTime);
            chart.update();
        }
    }

    function convertTimestamp(timestamp) {
        const date = new Date(timestamp);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let result = '';
        if (hours > 0) {
            result += hours + 'h ';
        }
        if (minutes > 0) {
            result += minutes + 'm ';
        }
        if (seconds > 0 || result === '') {
            result += seconds + 's';
        }
        return result.trim();
    }

    onMount(async () => {
        await createChart();
    });

    onDestroy(() => {
        unsubscribeListener();
    });

    $: if (range) {
        updateChart();
    }
</script>

<div class="flex flex-col gap-5 min-w-[500px]">
    <div class="flex justify-between">
        <h2 class="text-2xl font-bold mb-4 flex justify-between items-center">
            Recent Activity
        </h2>
        <select class="px-2 bg-zinc-800 rounded cursor-pointer"
        bind:value={range}>
            <option value={3600000}>1 hour</option>
            <option value={10800000}>3 hours</option>
            <option value={43200000}>12 hours</option>
        </select>
    </div>

    <div class="bg-zinc-800 p-4 rounded-lg h-[100px]">
        <canvas bind:this={timelineChart}/>
    </div>
    
    <div class="bg-zinc-800 p-4 rounded-lg">
        {#if selectedAnalysis}
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-5">
                    <div class={`size-4 rounded-full`}
                    style={`background-color: ${selectedAnalysis.productive ? GREEN : RED}`}>
                    </div>
                    <p class="text-white">{convertTimestamp(selectedAnalysis.startTime)}</p>
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
            <p class="h-[100px] text-white text-center content-center">
                Click on a time block to see details.
            </p>
        {/if}
    </div>
</div>