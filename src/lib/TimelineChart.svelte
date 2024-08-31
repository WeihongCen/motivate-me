<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import {
        GREEN,
        RED,
        PRODUCTIVE_ICON,
        UNPRODUCTIVE_ICON,
        PRODUCTIVE_DESCRIPTION,
        UNPRODUCTIVE_DESCRIPTION
    } from "$lib/const.js";

    export let statistics;
    let timelineChart;
    let chart;
    let selectedTime;
    let appDetails = {};

    onMount(() => {
        createChart();
    });

    $: if (statistics) {
        updateChart();
    }

    function createChart() {
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
                animation: false,
                onClick: async (e, element) => {
                    if (element.length) {
                        await Highlight.appStorage.whenHydrated();
                        selectedTime = chart.data.datasets[element.at(0).datasetIndex].label;
                        appDetails = {};
                        for (let i = selectedTime; i < selectedTime + 5*60*1000; i += 10*1000) {
                            let snapshot = Highlight.appStorage.get(`snapshots/${i}`);
                            if (appDetails[snapshot.focusedWindowApp]) {
                                appDetails[snapshot.focusedWindowApp].count += snapshot.endTime - snapshot.startTime;
                            } else {
                                appDetails[snapshot.focusedWindowApp] = {
                                    time: snapshot.endTime - snapshot.startTime,
                                    icon: Highlight.appStorage.get(`appIcon/${snapshot.focusedWindowApp}`)
                                }
                            }
                        }
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
        updateChart();
    }

    function updateChart() {
        if (chart) {
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
                        label: analysis.analysisStartTime,
                        data: [
                            {
                                x: [new Date(analysis.analysisStartTime), new Date(analysis.analysisEndTime)],
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

{#if selectedTime}
    <p>{selectedTime}</p>
{/if}