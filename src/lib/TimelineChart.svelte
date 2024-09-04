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

    let range = 3600000;
    let timelineChart;
    let chart;
    let selectedTime;
    let selectedAnalysis;
    let appDetails = {};
    let selectedApps = [];

    onMount(async () => {
        await createChart();
    });

    $: if (range) {
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
                                if (appDetails[snapshot.focusedWindowTitle]) {
                                }
                            }
                        }
                        selectedApps = Object.entries(appDetails);
                        selectedApps.sort((a, b) => b[1].time - a[1].time);
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
</script>

<div class="flex flex-col gap-5">
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
            <div class="flex flex-col gap-5">
                <p>{selectedAnalysis.description}</p>
                <div class="flex flex-col gap-5">
                    {#each selectedApps as snapshot}
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
                                {Math.round(snapshot[1].time / selectedApps.reduce((accumulator, app) => accumulator + app[1].time, 0) * 100)}%
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