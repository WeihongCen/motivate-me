<script>
    // import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
	onMount(async () => {
        goto('/dashboard');
	});
</script>

<div>
    <h1 class="text-white text-4xl font-bold">Welcome</h1>
</div>