<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';

    let timelineChart;
    let chart;
    let selectedData;

    // Fake data for testing
    let statistics = {
        curTime: Date.now(),
        datasets: [
            {
                label: "Productive",
                data: [
                    { x: [new Date(Date.now() - 50 * 60000), new Date(Date.now() - 40 * 60000)], y: "Status" },
                    { x: [new Date(Date.now() - 30 * 60000), new Date(Date.now() - 20 * 60000)], y: "Status" },
                ],
                backgroundColor: "rgba(76, 175, 80, 0.6)",
                hoverBackgroundColor: "rgba(76, 175, 80, 0.8)"
            },
            {
                label: "Unproductive",
                data: [
                    { x: [new Date(Date.now() - 40 * 60000), new Date(Date.now() - 30 * 60000)], y: "Status" },
                    { x: [new Date(Date.now() - 20 * 60000), new Date(Date.now() - 10 * 60000)], y: "Status" },
                ],
                backgroundColor: "rgba(244, 67, 54, 0.6)",
                hoverBackgroundColor: "rgba(244, 67, 54, 0.8)"
            }
        ]
    };

    onMount(() => {
        createChart();
    });

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
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
        });
    }
</script>

<canvas class="max-h-full" bind:this={timelineChart}/>

{#if selectedData}
    <p>{selectedData.data[0].x}</p>
    <p>{selectedData.label}</p>
{/if}