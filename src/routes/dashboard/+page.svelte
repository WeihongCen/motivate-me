<script>
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

</script>

<div class="flex flex-col w-full h-full p-5 gap-5">
    <h1>Dashboard</h1>
    <div class="flex p-5 bg-[#444444] rounded-3xl gap-0 flex-wrap">
        <div class="flex flex-col w-1/2 min-w-[400px]">
            <ProductivityPie statistics={[300, 50, 100]} />
        </div>
        <div class="flex flex-col w-1/2 gap-5">
            <h2>Past hour activity</h2>
            <TimelineChart />
        </div>
    </div>
</div>


  
  