<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

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
                labels: ['2020'],
                datasets: [
                    {
                        label: '2020',
                        data: [10],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: '2021',
                        data: [15],
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: '2022',
                        data: [25],
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: '2023',
                        data: [30],
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: '2024',
                        data: [20],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            display: false,
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

<div class="w-96 h-20">
    <canvas bind:this={timelineChart} />
</div>