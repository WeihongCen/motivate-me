<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { createAuth0Client } from '@auth0/auth0-spa-js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms'


    
	onMount(async () => {
        // goto('/auth');
	});
</script>

<div>
    <h1 class="text-white text-4xl font-bold">Welcome</h1>
</div>
<a href="/auth">login</a>