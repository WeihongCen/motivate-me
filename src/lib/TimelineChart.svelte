<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';

    export let statistics;
    let timelineChart;
    let chart;
    let selectedData;

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
                datasets: statistics.datasets
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
                        min: new Date(statistics.curTime - 60 * 60 * 1000),
                        max: new Date(statistics.curTime),
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
                onClick: (e, element) => {
                    if (element.length) {
                        selectedData = chart.data.datasets[element.at(0).datasetIndex];
                    } else {
                        selectedData = null;
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
    }

    function updateChart() {
        if (chart) {
            chart.data.datasets = statistics.datasets;
            chart.options.scales.x.min = new Date(statistics.curTime - 60 * 60 * 1000);
            chart.options.scales.x.max = new Date(statistics.curTime);
            chart.update();
        }
    }
</script>

<canvas class="max-h-full" bind:this={timelineChart}/>

{#if selectedData}
    <p>{selectedData.data[0].x}</p>
    <p>{selectedData.label}</p>
{/if}