<script>
    import "../app.css";
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'

    export let data
    
    let { supabase, session } = data
    $: ({ supabase, session } = data)
    
    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        })

        return () => data.subscription.unsubscribe()
    })
</script>

<svelte:head>
    <title>Motivate Me</title>
</svelte:head>

<slot />

<style lang="postcss">
    :global(html) {
        background-color: #111111;
    }
    :global(h1) {
        color: #bbbbbb;
        font-weight: bold;
        font-size: 2.25rem;
        line-height: 2.5rem;
    }
    :global(h2) {
        color: #bbbbbb;
        font-weight: bold;
        font-size: 1.5rem;
    }
    :global(p) {
        color: #888888;
    }
    :global(button) {
        color: white;
    }
</style>