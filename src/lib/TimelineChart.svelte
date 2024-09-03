<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import {
        GREEN,
        RED,
        GREEN_SECONDARY,
        RED_SECONDARY,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";

    export let statistics;
    let timelineChart;
    let chart;
    let selectedTime;
    let selectedAnalysis;
    let appDetails = {};
    let selectedSnapshots = [];

    onMount(async () => {
        await createChart();
    });

    $: if (statistics) {
        updateChart();
    }

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
                        min: new Date(Date.now() - 60 * 60 * 1000),
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
                animation: true,
                onClick: async (e, element) => {
                    if (element.length) {
                        await Highlight.appStorage.whenHydrated();
                        selectedTime = chart.data.datasets[element.at(0).datasetIndex].label;
                        const analysisTimeKey = Math.floor(selectedTime / ANALYSIS_DELAY) * ANALYSIS_DELAY;
                        selectedAnalysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
                        appDetails = {};
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
                                }
                            }
                        }
                        selectedSnapshots = Object.entries(appDetails);
                        selectedSnapshots.sort((a, b) => b[1].time - a[1].time);
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
            // let curTime = 1724968905828;
            let curTime = Date.now();
            curTime = Math.round(curTime / ANALYSIS_DELAY) * ANALYSIS_DELAY;
            let datasets = [];
            for (let i = curTime; i >= curTime - 60*60*1000; i -= ANALYSIS_DELAY) {
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
            chart.options.scales.x.min = new Date(curTime - 60*60*1000);
            chart.options.scales.x.max = new Date(curTime);
            chart.update();
        }
    }
</script>

<div class="flex flex-col gap-5">
    <div class="flex justify-between">
        <h2 class="text-2xl font-bold mb-4 flex justify-between items-center">
            Past Hour Activity
        </h2>
        <button 
            class="size-10 bg-gray-600 hover:bg-gray-500 rounded-full"
            on:click={updateChart}
            aria-label="Refresh Past Hour Activity"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="p-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
    </div>

    <div class="bg-zinc-800 p-4 rounded-lg h-[100px]">
        <canvas bind:this={timelineChart}/>
    </div>
    
    <div class="bg-zinc-800 p-4 rounded-lg">
        {#if selectedAnalysis}
            <div class="flex flex-col gap-5">
                <p>{selectedAnalysis.description}</p>
                <div class="flex flex-col gap-5">
                    {#each selectedSnapshots as snapshot}
                        <div
                            class="grid grid-cols-5 gap-4"
                        >
                            <img 
                                class="size-6"
                                src={snapshot[1].icon} alt="app icon">
                            <p
                                class="col-span-3"
                            >
                                {snapshot[0]}
                            </p>
                            <p class="text-right">
                                {Math.round(snapshot[1].time / selectedSnapshots.reduce((accumulator, _snapshot) => accumulator + _snapshot[1].time, 0) * 100)}%
                            </p>
                        </div>
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