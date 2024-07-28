<script>
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import {
        COLOR_PRODUCTIVE,
        COLOR_UNPRODUCTIVE,
        COLOR_IDLE
    } from "$lib/constants.js"
</script>

<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-1 p-5 bg-[#444444] rounded-3xl">

    </div>
    <div class="col-span-3 col-start-2 p-5 bg-[#444444] rounded-3xl">

    </div>
    <div class="col-span-1 col-start-5 p-5 bg-[#444444] rounded-3xl">

    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-[#444444] rounded-3xl">
        <h2>You are <span class={`text-[var(--color-productive)]`}>productive</span></h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={[300, 50, 100]} />
        </div>
    </div>
    <div class="col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-[#444444] rounded-3xl">
        <div class="flex flex-col w-full h-1/3 gap-5">
            <h2>Past hour activity</h2>
            <TimelineChart />
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc commodo mi sit amet risus bibendum lobortis. Vestibulum ornare, elit eget finibus efficitur, augue mi gravida turpis, at rutrum ligula justo eu velit. Donec tincidunt dolor quis lacus imperdiet accumsan. Aliquam vel consectetur elit. Sed ac tempus enim. Pellentesque at eros eget velit tempus sagittis. Cras quis velit eget nulla ullamcorper pharetra sed sit amet sapien.</p>
        </div>
    </div>
</div>

  
  