<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import MonitorSVG from "$lib/icons/MonitorSVG.svelte";
    import TargetSVG from "$lib/icons/TargetSVG.svelte";
    import CommunitySVG from "$lib/icons/CommunitySVG.svelte";

    onMount(() => {
        goto('/dashboard');
    })
</script>

<main class="h-screen container mx-auto px-6 py-24 flex flex-col justify-center items-center">
    <h1 class="text-6xl font-bold mb-6 text-center leading-tight">
        Achieve Your Goals
    </h1>
    <p class="text-xl text-gray-300 mb-12 text-center max-w-2xl">Harness the power of AI-driven screen tracking</p>
    
    <div class="flex space-x-6">
        <a href="/auth/signup" class="bg-orange-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 transition-colors duration-300">Get Started for Free</a>
    </div>
</main>