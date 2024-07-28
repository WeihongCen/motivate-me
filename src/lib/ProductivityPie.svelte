<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    
    export let statistics;
    let piechartCanvas;

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
        new Chart(piechartCanvas.getContext("2d"), {
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
                    backgroundColor: transparentColors,
                    hoverBackgroundColor: transparentColors,
                    borderColor: solidColors,
                    hoverBorderColor: solidColors,
                    borderAlign: 'center',
                    borderJoinStyle: 'round',
                    hoverOffset: 50,
                    hoverBorderWidth: 10,
                }]
            },
            options: {
                borderWidth: 4,
                layout: {
                    padding: 50
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    }
                }
            },
        });
    });
</script>

<div class="w-[400px]">
    <canvas bind:this={piechartCanvas} />
</div>