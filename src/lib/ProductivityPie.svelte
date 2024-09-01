<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import {
        GREEN,
        RED,
    } from "$lib/const.js";
    
    export let statistics;
    let piechartCanvas;
    let data = [0, 0];
    let productivity = 0;
    let selectedTime;
    let selectedIndex;
    let chart;

    onMount(async () => {
        await createChart();
    });

    $: if (statistics) {
        (async () => {
            await updateChart();
        })();
    }

    function formatTime(milliseconds) {
        const totalMinutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    async function createChart() {
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
                    data: data,
                    backgroundColor: [GREEN, RED],
                    hoverBackgroundColor: [GREEN, RED],
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
                onClick: (evt, element) => {
                    if (element.length) {
                        var elements = chart.getElementsAtEventForMode(evt, 'index', { intersect: true }, false);
                        var index = elements[0].index;
                        selectedTime = formatTime(chart.data.datasets[0].data[index]);
                        selectedIndex = index;
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
                    }
                },
            },
        });

        await updateChart();
    }

    async function updateChart() {
        if (chart) {
            await Highlight.appStorage.whenHydrated();
            let now = new Date(1724968905828);
            now.setHours(0, 0, 0, 0);
            const midnightTimestamp = now.getTime();
            data = [0, 0];
            for (let i = midnightTimestamp; i < Date.now(); i += 300000) {
                let analysis = Highlight.appStorage.get(`analysis/${i}`);
                if (analysis) {
                    if (analysis.productive) {
                        data[0] += analysis.endTime - analysis.startTime; 
                    } else {
                        data[1] += analysis.endTime - analysis.startTime; 
                    }
                }
            }
            chart.data.datasets[0].data = data;
            productivity = Math.round(data[0] / data.reduce((accumulator, time) => accumulator + time, 0) * 100)
            chart.update();
        }
    }
</script>

<div
    class="relative max-h-full max-w-full h-full w-full"
>
    <canvas class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" bind:this={piechartCanvas} />
    {#if selectedTime}
    <p
        class={`${selectedIndex === 0 ? `text-[#86efac]` : `text-[#fca5a5]`} text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
    >
        {selectedTime}
    </p>
    {:else}
        <p
            class={`${productivity > 70 ? `text-[#86efac]` : `text-[#fca5a5]`} text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
        >
            {productivity}%
        </p>
    {/if}
</div>