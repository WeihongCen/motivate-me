<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    
    export let statistics;
    let piechartCanvas;

    const solidColors = [
        '#6df395',
        '#f3726c',
        '#ffffff'
    ];
  
    onMount(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const transparentColors = [
            rootStyles.getPropertyValue('--color-productive'),
            rootStyles.getPropertyValue('--color-unproductive'),
            rootStyles.getPropertyValue('--color-idle')
        ];
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
                    hoverOffset: 30,
                }]
            },
            options: {
                borderWidth: 0,
                layout: {
                    padding: 20
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
    });
</script>

<canvas class="max-h-full" bind:this={piechartCanvas} />