<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";

    function startRecording() {
        if (Highlight.app) {
            console.log("not in highlight");
        } else {
            console.log("in highlight");
        }
    }

    onMount(() => {
        // const ps = new PerfectScrollbar('#hour-description');
    });
</script>

<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-2 p-5 bg-[#444444] rounded-3xl">
        <h2>Profile</h2>
    </div>
    <div class="col-span-2 col-start-3 p-5 bg-[#444444] rounded-3xl">
        <h2>Current Task</h2>
    </div>
    <div class="col-span-1 col-start-5 p-5 bg-[#444444] rounded-3xl">
        <div class="flex justify-end items-center w-full gap-2">
            <p>recording</p>
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
        </div>
        <button class="bg-[#ff9457] px-4 py-2 hover:opacity-80 transition-all duration-300"
        on:click={ startRecording }>
            Record
        </button>
    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-[#444444] rounded-3xl">
        <h2>You are <span class={`text-[var(--color-productive)]`}>productive</span></h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={[300, 50, 20]} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-[#444444] rounded-3xl">
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart />
        </div>
        <p class="relative h-full overflow-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc 
            commodo mi sit amet risus bibendum lobortis. Vestibulum ornare, 
            elit eget finibus efficitur, augue mi gravida turpis, at rutrum 
            ligula justo eu velit. Donec tincidunt dolor quis lacus imperdiet 
            accumsan. Aliquam vel consectetur elit. Sed ac tempus enim. 
            Pellentesque at eros eget velit tempus sagittis. Cras quis velit 
            eget nulla ullamcorper pharetra sed sit amet sapien.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc 
            commodo mi sit amet risus bibendum lobortis. Vestibulum ornare, 
            elit eget finibus efficitur, augue mi gravida turpis, at rutrum 
            ligula justo eu velit. Donec tincidunt dolor quis lacus imperdiet 
            accumsan. Aliquam vel consectetur elit. Sed ac tempus enim. 
            Pellentesque at eros eget velit tempus sagittis. Cras quis velit 
            eget nulla ullamcorper pharetra sed sit amet sapien.
        </p>
    </div>
</div>

  
  