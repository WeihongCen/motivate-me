<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    
    export let statistics;
    let piechartCanvas;

    const solidColors = [
        '#86efac',
        '#fca5a5',
        '#eaeaea'
    ];

    let chart;

    onMount(() => {
        createChart();
    });

    $: if (statistics) {
        updateChart();
    }

    function createChart() {
        chart = new Chart(piechartCanvas.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: [
                    'Productive',
                    'Unproductive',
                    'Idle'
                ],
                datasets: [{
                    label: 'Productivity',
                    data: statistics,
                    backgroundColor: solidColors,
                    hoverBackgroundColor: solidColors,
                    borderColor: solidColors,
                    hoverBorderColor: solidColors,
                    borderAlign: 'center',
                    borderJoinStyle: 'round',
                    hoverOffset: 30,
                }]
            },
            options: {
                borderWidth: 0,
                layout: {
                    padding: 20
                },
                onHover: (e, element) => {
                    if (element.length) {
                        e.native.target.style.cursor = "pointer";
                    } else {
                        e.native.target.style.cursor = "default";
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    }
                },
            },
        });
    }

    function updateChart() {
        if (chart) {
            chart.data.datasets[0].data = statistics;
            chart.update();
        }
    }
</script>

<canvas class="max-h-full" bind:this={piechartCanvas} />