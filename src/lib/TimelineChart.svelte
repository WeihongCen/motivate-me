<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import {
        GREEN,
        RED,
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
                        selectedAnalysis = Highlight.appStorage.get(`analysis/${selectedTime}`);
                        appDetails = {};
                        for (let i = selectedAnalysis.startTime; i < selectedAnalysis.endTime; i += 10000) {
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
            let curTime = 1724968905828;
            curTime = Math.round(curTime / 300000) * 300000;
            let datasets = [];
            for (let i = curTime; i >= curTime - 60*60*1000; i -= 300000) {
                const analysisTimeKey = Math.round(i / 300000) * 300000;
                const analysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
                if (analysis) {
                    const productivityColor = analysis.productive ? GREEN : RED;
                    const hoverColor = analysis.productive ? "#96eeb6" : "#ffb7b7";
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

<canvas class="max-h-full" bind:this={timelineChart}/>

{#if selectedAnalysis}
    <p class={`${selectedAnalysis.productive ? `text-[#86efac]` : `text-[#fca5a5]`}`}>
        {selectedAnalysis.description}
    </p>
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
            <p>
                {Math.round(snapshot[1].time / selectedSnapshots.reduce((accumulator, _snapshot) => accumulator + _snapshot[1].time, 0) * 100)}%
            </p>
        </div>
    {/each}
{/if}