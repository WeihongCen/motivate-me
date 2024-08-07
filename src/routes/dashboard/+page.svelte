<script>
    import Highlight from "@highlight-ai/app-runtime";
    import ProductivityPie from "$lib/ProductivityPie.svelte";
    import TimelineChart from "$lib/TimelineChart.svelte";
    import { onMount } from "svelte";
    import { recording } from '$lib/store.js';
    
    export let data;
    const { supabase, user } = data;

    let username = "";
    let occupation = "";
    let recordingValue;
    recording.subscribe((value) => {
		recordingValue = value;
	});

    async function populateUserData() {
        let response = await fetch(`/api/getProfile`, {
            method: "GET"
        })
            .then(res => res.json());
        username = response.userData.username;
        occupation = response.userData.occupation;
    }

    onMount(async () => {
        await populateUserData();

        return () => {
        };
    });
</script>

<div class="w-full grid grid-cols-5 grid-rows-3 gap-5 p-5">
    <div class="col-span-2 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        {#if username}
            <h2 
                class="overflow-hidden text-ellipsis"
            >
                {username}
            </h2>
            <p  
                class="overflow-hidden text-ellipsis"
            >
                {user.email}
            </p>
        {:else}
            <h2
                class="overflow-hidden text-ellipsis"
            >
                {user.email}
            </h2>
        {/if}
        {#if occupation}
            <p  
                class="overflow-hidden text-ellipsis"
            >
                {occupation}
            </p>
        {/if}
    </div>
    <div class="flex flex-col gap-2 col-span-1 col-start-3 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        {#if !recordingValue}
            <button class="bg-[#ff9457] px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ () => { recording.set(true) } }>
                Record
            </button>
        {:else}
            <button class="bg-red-500 px-4 py-2 hover:opacity-80 transition-all duration-300"
            on:click={ () => { recording.set(false) } }>
                Stop
            </button>
        {/if}
    </div>
    <div class="col-span-2 col-start-4 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
    </div>
    <div class="flex flex-col col-span-2 row-start-2 row-span-2 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        <h2>You are <span class={`text-[var(--color-productive)]`}>productive</span></h2>
        <div class="flex justify-center items-center w-full h-full">
            <ProductivityPie statistics={[300, 50, 20]} />
        </div>
    </div>
    <div class="flex flex-col gap-5 col-span-3 row-start-2 row-span-2 col-start-3 p-5 bg-stone-500 bg-opacity-30 rounded-3xl">
        <h2>Past hour activity</h2>
        <div class="flex flex-col w-full h-1/5 gap-5">
            <TimelineChart />
        </div>
        <p class="relative h-full overflow-auto">
        </p>
    </div>
</div>

  
  