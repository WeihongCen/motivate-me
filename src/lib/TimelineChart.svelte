<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import {
        COLOR_PRODUCTIVE,
        COLOR_UNPRODUCTIVE,
        COLOR_IDLE
    } from "$lib/constants.js"

    let timelineChart;

    const transparentColors = [
        '#6df395aa',
        '#f3726caa',
        '#ffffffaa'
    ];
    const solidColors = [
        '#6df395',
        '#f3726c',
        '#ffffff'
    ];

    onMount(() => {
        new Chart(timelineChart,{
            type: 'bar',
            data: {
                datasets: [
                    {
                        label: "productive",
                        data: [
                            {
                                x: [new Date('2022-12-24T00:30'), new Date('2022-12-24T01:00')],
                                y: 'Status',
                            },
                        ],
                        backgroundColor: COLOR_PRODUCTIVE,
                        hoverBackgroundColor: COLOR_PRODUCTIVE,
                    },
                    {
                        label: "unproductive",
                        data: [
                            {
                                x: [new Date('2022-12-24T00:20'), new Date('2022-12-24T00:30')],
                                y: 'Status'
                            },
                        ],
                        backgroundColor: COLOR_UNPRODUCTIVE,
                        hoverBackgroundColor: COLOR_UNPRODUCTIVE,
                    },
                    {
                        label: "idle",
                        data: [
                            {
                                x: [new Date('2022-12-24T00:00'), new Date('2022-12-24T00:20')],
                                y: 'Status'
                            },
                        ],
                        backgroundColor: COLOR_IDLE,
                        hoverBackgroundColor: COLOR_IDLE,
                    },
                ],
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
                        min: new Date('2022-12-24T00:00'),
                        max: new Date('2022-12-24T01:00'),
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
    });
</script>

<canvas bind:this={timelineChart} />