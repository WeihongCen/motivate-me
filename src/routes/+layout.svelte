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

<div class="min-h-screen text-white font-sans bg-black mt-4">
    <div class="bg-[url('/gradient-blob.png')] bg-no-repeat bg-cover bg-center">
        <div class="bg-black bg-opacity-50 min-h-screen">
            <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a 
                    class="flex items-center gap-2"
                    href="/"
                >
                    <img
                        class="h-8 w-auto"
                        src="/favicon.png" alt="Logo"
                    >
                    Motivate Me
                </a>
                <div class="space-x-6">
                    <a href="/auth/login" class="text-white hover:text-orange-400 transition-colors duration-300">Log in</a>
                    <a href="/auth/signup" class="bg-orange-400 text-black px-6 py-2 rounded-full hover:bg-orange-500 transition-colors duration-300 font-medium">Sign up</a>
                </div>
            </nav>

            <slot />

            <footer class="py-12">
                <div class="container mx-auto px-6 text-center text-gray-400">
                    <p>&copy; 2023 Motivate Me. All rights reserved.</p>
                </div>
            </footer>
        </div>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: #000000;
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