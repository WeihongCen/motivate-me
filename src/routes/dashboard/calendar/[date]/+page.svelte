<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { 
        onMount,
        onDestroy
    } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-luxon';
    import RangeSlider from 'svelte-range-slider-pips';
    import { ArrowLeft } from 'lucide-svelte';
    import {
        graphUpdateListener
    } from "$lib/store.js"
    import {
        GREEN,
        RED,
        GREEN_SECONDARY,
        RED_SECONDARY,
        ANALYSIS_DELAY,
        SNAPSHOT_DELAY
    } from "$lib/const.js";
    import {
        formatTimestampToAMPM,
        formatTime,
        isCurrentDate
    } from "$lib/FormatTime.js"
    import ColorThief from 'colorthief';

    export let data;
    let status = {
        total: 0,
        productive: 0,
        unproductive: 0,
    };
    let summary;

    const range = 86400000;
    const rangeMin = data.localTimestamp;
    const rangeMax = data.localTimestamp + range;
    let viewRange = [rangeMin, rangeMax];
    const colorThief = new ColorThief();

    let timelineChart;
    let timelineChartObject;
    let rangeChart;
    let rangeChartObject;
    let pieChart;
    let pieChartObject;

    let cumulativeApps = {};
    let orderedApps = [];
    let cumulativeDuration = 0;

    let selectedTime;
    let selectedAnalysis;
    let selectedApps = [];
    let selectedPages = {};
    let expandedState = {};

    const unsubscribeListener = graphUpdateListener.subscribe((value) => {
        updateTimelineChartRange();
    });

    function lightenHexColor(hex, percent) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.floor(r * (1 + percent / 100)));
        g = Math.min(255, Math.floor(g * (1 + percent / 100)));
        b = Math.min(255, Math.floor(b * (1 + percent / 100)));
        r = r.toString(16).padStart(2, '0');
        g = g.toString(16).padStart(2, '0');
        b = b.toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    function getDominantColor(base64Image) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64Image;
            img.onload = () => {
                const dominantColor = colorThief.getColor(img, 20);
                const hexColor = "#" + ((1 << 24) + (dominantColor[0] << 16) + (dominantColor[1] << 8) + dominantColor[2])
                    .toString(16)
                    .slice(1)
                    .toUpperCase();
                resolve(hexColor);
            };

            img.onerror = (err) => {
                resolve("#f97316");
            };
        });
    }

    async function createBarCharts() {
        let datasets = [];
        let firstAnalysisTimestamp;
        let lastAnalysisTimestamp
        for (let i = rangeMin; i <= rangeMax; i += ANALYSIS_DELAY) {
            const analysisTimeKey = Math.round(i / ANALYSIS_DELAY) * ANALYSIS_DELAY;
            const analysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
            if (analysis) {
                if (analysis.productive) {
                    status.productive += analysis.endTime - analysis.startTime;
                } else {
                    status.unproductive += analysis.endTime - analysis.startTime;
                }
                status.total += analysis.endTime - analysis.startTime;
                if (!firstAnalysisTimestamp) {
                    firstAnalysisTimestamp = i;
                }
                lastAnalysisTimestamp = i + ANALYSIS_DELAY;
                const productivityColor = analysis.productive ? GREEN : RED;
                const hoverColor = analysis.productive ? GREEN_SECONDARY : RED_SECONDARY;
                datasets.push({
                    label: analysis.startTime,
                    data: [
                        {
                            x: [new Date(analysis.startTime), new Date(analysis.endTime)],
                            y: "Status",
                        },
                    ],
                    backgroundColor: productivityColor,
                    hoverBackgroundColor: hoverColor,
                    borderRadius: 3,
                    borderSkipped: false,
                });
            }
        }
        if (firstAnalysisTimestamp) {
            viewRange = [firstAnalysisTimestamp, lastAnalysisTimestamp];
        }

        timelineChartObject = new Chart(timelineChart, {
            type: 'bar',
            data: {
                datasets: datasets
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
                            stepSize: 30,
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
                        min: new Date(rangeMin),
                        max: new Date(rangeMax),
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
                animation: false,
                onHover: (e, element) => {
                    if (element.length) {
                        e.native.target.style.cursor = "pointer";
                        timelineChartObject.update();
                    } else {
                        e.native.target.style.cursor = "default";
                    }
                },
                onClick: async (e, element) => {
                    if (element.length) {
                        await Highlight.appStorage.whenHydrated();
                        selectedTime = timelineChartObject.data.datasets[element.at(0).datasetIndex].label;
                        const analysisTimeKey = Math.floor(selectedTime / ANALYSIS_DELAY) * ANALYSIS_DELAY;
                        selectedAnalysis = Highlight.appStorage.get(`analysis/${analysisTimeKey}`);
                        let appDetails = {};
                        let pageDetails = {};
                        for (let i = analysisTimeKey; i < analysisTimeKey + ANALYSIS_DELAY; i += SNAPSHOT_DELAY) {
                            let snapshot = Highlight.appStorage.get(`snapshots/${i}`);
                            if (snapshot) {
                                if (appDetails[snapshot.focusedWindowApp]) {
                                    appDetails[snapshot.focusedWindowApp].time += snapshot.endTime - snapshot.startTime;
                                } else {
                                    appDetails[snapshot.focusedWindowApp] = {
                                        time: snapshot.endTime - snapshot.startTime,
                                        icon: Highlight.appStorage.get(`appIcons/${snapshot.focusedWindowApp}`)
                                    }
                                    pageDetails[snapshot.focusedWindowApp] = {};
                                    expandedState[snapshot.focusedWindowApp] = false;
                                }
                                if (snapshot.focusedWindowTitle) {
                                    let titleParts = snapshot.focusedWindowTitle.split(" - ");
                                    const pageTitle = titleParts.length === 1 ? titleParts[0] : titleParts.slice(0, -1).join(" - ");
                                    if (pageTitle) {
                                        if (pageDetails[snapshot.focusedWindowApp][pageTitle]) {
                                            pageDetails[snapshot.focusedWindowApp][pageTitle].time += snapshot.endTime - snapshot.startTime;
                                        } else {
                                            pageDetails[snapshot.focusedWindowApp][pageTitle] = {
                                                time: snapshot.endTime - snapshot.startTime
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        selectedApps = Object.entries(appDetails);
                        selectedApps.sort((a, b) => b[1].time - a[1].time);
                        selectedApps.forEach(([appName, _]) => {
                            selectedPages[appName] = Object.entries(pageDetails[appName]);
                            selectedPages[appName].sort((a, b) => b[1].time - a[1].time);
                        });

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

        rangeChartObject = new Chart(rangeChart, {
            type: 'bar',
            data: {
                datasets: datasets
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
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        grid: {
                            display: false,
                        },
                        min: new Date(rangeMin),
                        max: new Date(rangeMax),
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
                animation: false,
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

        await updateTimelineChartRange();
    }

    async function createPieChart() {
        cumulativeApps = {};
        for (let i = rangeMin; i <= rangeMax; i += SNAPSHOT_DELAY) {
            const snapshotTimeKey = Math.round(i / SNAPSHOT_DELAY) * SNAPSHOT_DELAY;
            const snapshot = Highlight.appStorage.get(`snapshots/${snapshotTimeKey}`);
            if (snapshot) {
                cumulativeDuration += snapshot.endTime - snapshot.startTime;
                if (cumulativeApps[snapshot.focusedWindowApp]) {
                    cumulativeApps[snapshot.focusedWindowApp].duration += snapshot.endTime - snapshot.startTime;
                } else {
                    const icon = Highlight.appStorage.get(`appIcons/${snapshot.focusedWindowApp}`);
                    const color = await getDominantColor(icon);
                    cumulativeApps[snapshot.focusedWindowApp] = {
                        icon: icon,
                        color: color,
                        hoverColor: color,
                        duration: snapshot.endTime - snapshot.startTime,
                    }
                }
            }
        }

        orderedApps = Object.entries(cumulativeApps)
            .sort(([, a], [, b]) => b.duration - a.duration)
            .map(([key, value]) => ({
                label: key,
                ...value
            }));

        pieChartObject = new Chart(pieChart.getContext("2d"), {
            type: "pie",
            data: {
                labels: orderedApps.map(app => app.label),
                datasets: [{
                    label: 'duration',
                    data: orderedApps.map(app => app.duration),
                    backgroundColor: orderedApps.map(app => app.color),
                    hoverBackgroundColor: orderedApps.map(app => app.hoverColor),
                    borderAlign: 'center',
                    borderJoinStyle: 'round',
                    hoverOffset: 30,
                }]
            },
            plugins: [{
                afterDatasetsDraw: chart => {
                    const { ctx } = chart;
                    const width = 30;
                    chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                        if (orderedApps.map(app => app.duration)[index] > cumulativeDuration*0.1) {
                            const image = new Image();
                            image.src = orderedApps.map(app => app.icon)[index];
                            const x = chart.getDatasetMeta(0).data[index].tooltipPosition().x;
                            const y = chart.getDatasetMeta(0).data[index].tooltipPosition().y;
                            ctx.save();
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                            ctx.shadowBlur = 15;
                            ctx.shadowOffsetX = 3;
                            ctx.shadowOffsetY = 3;
                            ctx.drawImage(image, x-(width/2), y-(width/2), width, width);
                            ctx.restore();
                        }
                    });
                }
            }],
            options: {
                borderWidth: 0,
                layout: {
                    padding: 15
                },
                animation: true,
                onHover: (e, element) => {
                    if (element.length) {
                        e.native.target.style.cursor = "pointer";
                    } else {
                        e.native.target.style.cursor = "default";
                    }
                },
                onClick: (evt, element) => {
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: (tooltipItem) => {
                                return "duration: " + formatTime(tooltipItem.raw);
                            },
                        }
                    },
                    legend: {
                        display: false
                    }
                },
            },
        });
    }

    async function generateSummary() {
        summary = Highlight.appStorage.get(`daySummary/${data.localTimestamp}`);
        if (!summary) {
            let completeAnalysis = "";
            for (let i = rangeMin; i < rangeMax; i += ANALYSIS_DELAY) {
                const analysis = Highlight.appStorage.get(`analysis/${i}`);
                if (analysis) {
                    completeAnalysis += analysis.description + "\n";

                }
            }
            if (completeAnalysis) {
                const system = `
                    You return a short summary for what the user did.
                    Don't preface with "You spent time".
                `;
                const messages = [
                    {
                        role: 'system',
                        content: system,
                    },
                    {
                        role: 'user',
                        content: completeAnalysis,
                    }
                ];
                const options = {
                    temperature: 0,
                };
                const textPrediction = Highlight.inference.getTextPrediction(messages, options);
                summary = "";
                for await (const chunk of textPrediction) {
                    summary += chunk;
                }
                if (!isCurrentDate(data.localTimestamp)) {
                    Highlight.appStorage.set(`daySummary/${data.localTimestamp}`, summary);
                }
            }
        }
    }

    async function updateTimelineChartRange() {
        if (timelineChartObject) {
            timelineChartObject.options.scales.x.min = new Date(viewRange[0]);
            timelineChartObject.options.scales.x.max = new Date(viewRange[1]);
            timelineChartObject.update();
        }
    }

    onMount(async () => {
        await Highlight.appStorage.whenHydrated();
        await createBarCharts();
        await createPieChart();
        if (Date.now() > data.localTimestamp) {
            await generateSummary();
        }
    });
    
    onDestroy(() => {
        unsubscribeListener();
    });
    
    $: if (range) {
        updateTimelineChartRange();
    }
</script>

<div class="flex flex-col gap-5 min-w-[500px]">
    <div class="flex gap-5">
        <a class="size-8"
        href="/dashboard/calendar">
            <ArrowLeft class="size-full m-auto stroke-zinc-300 hover:stroke-white" />
        </a>
        <h1 class="text-2xl font-bold flex justify-between items-center">
            {data.formattedDate}
        </h1>
    </div>

    <div class="grid grid-cols-3 gap-10 w-full">
        <div class="flex flex-col gap-2">
            <h2>Overview</h2>
            <div class="flex flex-col gap-5 p-4 h-80 bg-zinc-800 rounded-lg overflow-auto">
                {#if status.total > 0}
                    <div>
                        <div class="flex w-full h-20 rounded overflow-hidden">
                            <div class="h-full bg-emerald-400 overflow-hidden"
                            style={`width: ${status.productive/status.total*100}%`}>
                                {#if Math.round(status.productive/status.total*100) > 0}
                                    <p class="h-full text-2xl font-semibold text-black text-center content-center">
                                        {Math.round(status.productive/status.total*100)}
                                    </p>
                                {/if}
                            </div>
                            <div class="h-full bg-red-400 overflow-hidden"
                            style={`width: ${status.unproductive/status.total*100}%`}>
                                {#if Math.round(status.unproductive/status.total*100) > 0}
                                    <p class="h-full text-2xl font-semibold text-black text-center content-center">
                                        {Math.round(status.unproductive/status.total*100)}
                                    </p>
                                {/if}
                            </div>
                        </div>
                        <p class="text-neutral-500 text-right">{formatTime(status.total)}</p>
                    </div>
                    {#if summary}
                        <p>{summary}</p>
                    {/if}
                {:else}
                    <p>There is no activity to report.</p>
                {/if}
            </div>
        </div>

        <div class="col-span-2 flex flex-col gap-2">
            <h2>App Usage</h2>
            <div class="flex items-center gap-10 p-4 h-80 bg-zinc-800 rounded-lg">
                <div class="size-[250px]">
                    <canvas bind:this={pieChart} />
                </div>
                <div class="flex flex-col gap-6 w-full h-full py-5 pr-5 overflow-auto">
                    {#each orderedApps as { label, icon, duration, color }}
                    <div class="flex gap-5">
                        <div class="flex-shrink-0 h-full w-8 rounded-full shadow shadow-zinc-900"
                        style={`background-color: ${color}`}>
                        </div>
                        <img class="flex-shrink-0 size-6"
                        src={icon} alt="app icon">
                        <p class="flex-1 truncate">{label}</p>
                        <p class="w-8 text-right">{Math.round(duration/cumulativeDuration*100)}%</p>
                    </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-end">
            <h2>Timeline</h2>
            <p class="text-zinc-500">
                {formatTimestampToAMPM(viewRange[0])} - {formatTimestampToAMPM(viewRange[1])}
            </p>
        </div>
        <div class="bg-zinc-800 p-4 rounded-lg h-[100px]">
            <canvas bind:this={timelineChart}/>
        </div>
    </div>

    <div class="relative">
        <div class="absolute top-[25px] w-full h-[20px] px-4 pointer-events-none">
            <canvas bind:this={rangeChart}/>
        </div>
        <RangeSlider
        min={rangeMin} max={rangeMax} range 
        pips pipstep={18} step={ANALYSIS_DELAY*2} float hoverable={false} 
        formatter={(value, index, percent) => { return formatTimestampToAMPM(value) }}
        all="label" 
        bind:values={viewRange}
        on:change={updateTimelineChartRange} />
    </div>
    
    <div class="bg-zinc-800 p-4 rounded-lg">
        {#if selectedAnalysis}
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-5">
                    <div class={`size-4 rounded-full`}
                    style={`background-color: ${selectedAnalysis.productive ? GREEN : RED}`}>
                    </div>
                    <p class="text-white">
                        {formatTimestampToAMPM(selectedAnalysis.startTime)}
                    </p>
                </div>
                <p class="">{selectedAnalysis.description}</p>
                <div class="flex flex-col mt-5 gap-2">
                    {#each selectedApps as [appName, appMetadata]}
                        <button class="flex flex-col gap-2 bg-zinc-900 rounded-lg p-4"
                        on:click={() => {expandedState[appName] = !expandedState[appName]}}>
                            <div class="w-full grid grid-cols-6 gap-5">
                                <img class="size-6"
                                src={appMetadata.icon} alt="app icon">
                                <p class="col-span-4 font-bold truncate text-left">
                                    {appName}
                                </p>
                                {#if expandedState[appName]}
                                    <p class="text-right">
                                        {formatTime(appMetadata.time)}
                                    </p>
                                {:else}
                                    <p class="text-right">
                                        {Math.round(appMetadata.time / selectedApps.reduce((accumulator, app) => accumulator + app[1].time, 0) * 100)}%
                                    </p>
                                {/if}
                            </div>
                            
                            {#if expandedState[appName]}
                                <div class="flex flex-col gap-2 w-full transition-all duration-300">
                                    {#each selectedPages[appName] as [pageName, pageMetadata]}
                                        <div class="grid grid-cols-6 rounded gap-5">
                                            <div></div>
                                            <p class="col-span-4 truncate text-left text-[#888888]">
                                                {pageName}
                                            </p>
                                            <p class="text-right text-[#888888]">
                                                {Math.round(pageMetadata.time / selectedPages[appName].reduce((accumulator, [_, metadata]) => accumulator + metadata.time, 0) * 100)}%
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <p class="h-[200px] text-center content-center">
                Click on a time block to see details.
            </p>
        {/if}
    </div>
</div>