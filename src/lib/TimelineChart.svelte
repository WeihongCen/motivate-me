<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';

    let timelineChart;
    
    onMount(() => {
        const rootStyles = getComputedStyle(document.documentElement);
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
                            {
                                x: [new Date('2022-12-24T00:05'), new Date('2022-12-24T00:15')],
                                y: 'Status',
                            },
                        ],
                        backgroundColor: rootStyles.getPropertyValue('--color-productive'),
                        hoverBackgroundColor: rootStyles.getPropertyValue('--color-productive'),
                    },
                    {
                        label: "unproductive",
                        data: [
                            {
                                x: [new Date('2022-12-24T00:20'), new Date('2022-12-24T00:30')],
                                y: 'Status'
                            },
                        ],
                        backgroundColor: rootStyles.getPropertyValue('--color-unproductive'),
                        hoverBackgroundColor: rootStyles.getPropertyValue('--color-unproductive'),
                    },
                    {
                        label: "idle",
                        data: [
                            {
                                x: [new Date('2022-12-24T00:15'), new Date('2022-12-24T00:20')],
                                y: 'Status'
                            },
                        ],
                        backgroundColor: rootStyles.getPropertyValue('--color-idle'),
                        hoverBackgroundColor: rootStyles.getPropertyValue('--color-idle'),
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

<canvas class="max-h-full" bind:this={timelineChart} />