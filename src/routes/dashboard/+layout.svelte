<script>
    import "../../app.css";
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation';

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

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error logging out:', error)
        } else {
            goto('/') // Redirect to home page after logout
        }
    }
</script>

<div class="min-h-screen text-white font-sans bg-black relative">
    <nav class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-opacity-80 backdrop-filter backdrop-blur-lg z-50">
        <div class="w-24"></div>
        <div class="flex items-center space-x-2">
            <img src="/favicon.png" alt="Logo" class="h-8 w-8">
            <span class="text-xl font-semibold">Dashboard</span>
        </div>
        <div class="flex items-center space-x-4">
            <a href="/dashboard/settings" class="text-gray-300 hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </a>
            <button 
                on:click={handleLogout}
                class="flex items-center space-x-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-full hover:bg-gray-700 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
            >
                <span class="text-sm font-medium">Log out</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </nav>
    <div class="pt-20">
        <slot />
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