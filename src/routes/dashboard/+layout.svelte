<script>
    import "../../app.css";
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation';

    export let data

    $: ({ supabase, session, username, user, avatar_url } = data)
    
    let isProfileDropdownOpen = false;

    function toggleProfileDropdown(event) {
        event.stopPropagation();
        isProfileDropdownOpen = !isProfileDropdownOpen;
    }

    function closeProfileDropdown() {
        isProfileDropdownOpen = false;
    }

    function handleClickOutside(event) {
        if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
            closeProfileDropdown();
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && isProfileDropdownOpen) {
            closeProfileDropdown();
        }
    }

    async function handleLogout() {
        closeProfileDropdown();
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error logging out:', error)
        } else {
            goto('/') // Redirect to home page after logout
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeydown);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="min-h-screen text-white font-sans bg-black relative">
    <nav class="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-opacity-80 backdrop-filter backdrop-blur-lg z-50 border-b border-gray-800">
        <div class="flex items-center space-x-4">
            <img src="/favicon.png" alt="Logo" class="h-8 w-8">
            <span class="text-xl font-semibold">Dashboard</span>
        </div>
        <div class="flex items-center space-x-6">
            <div class="relative profile-dropdown">
                <button 
                    on:click={toggleProfileDropdown} 
                    aria-haspopup="true" 
                    aria-expanded={isProfileDropdownOpen}
                    class="flex items-center space-x-2 focus:outline-none"
                >
                    {#if avatar_url}
                        <img src={avatar_url} alt="Profile" class="h-10 w-10 rounded-full border-2 border-gray-600" />
                    {:else}
                        <div class="h-10 w-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                            <svg class="h-7 w-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                    <span>{username}</span>
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                {#if isProfileDropdownOpen}
                    <div 
                        role="menu" 
                        aria-orientation="vertical" 
                        aria-labelledby="user-menu"
                        class="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg py-1"
                    >
                        <a 
                            href="/dashboard/settings" 
                            on:click={closeProfileDropdown}
                            role="menuitem"
                            class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Settings</span>
                        </a>
                        <button 
                            on:click={handleLogout}
                            role="menuitem"
                            class="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                            </svg>
                            <span>Log out</span>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </nav>
    <div class="pt-24 px-8 max-w-7xl mx-auto">
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