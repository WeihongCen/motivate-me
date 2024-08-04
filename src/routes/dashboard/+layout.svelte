<script>
    import { onMount } from 'svelte';

    export let data;
    const { user } = data;

    onMount(() => {
        email.subscribe((value) => { emailValue = value });
        username.subscribe((value) => { usernameValue = value });
        occupation.subscribe((value) => { occupationValue = value });
        task.subscribe((value) => { taskValue = value });
        if (Highlight.isRunningInHighlight()) {
        }
    });
</script>

<div class="flex w-full h-screen">
    <div class="h-screen overflow-auto">
        <div class="flex flex-col items-center h-screen py-5 px-2 bg-[#1a1a1a] gap-5">
            <a class="flex items-center p-2 gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300"
            href="/dashboard">
                <img class="w-8" 
                src="favicon.png" alt="icon">
            </a>
            <a class="flex items-center p-2 gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300"
            href="/dashboard/settings">
                <img class="w-8" 
                src="setting-icon.svg" alt="settings">
            </a>
            <form method="POST" action="?/signOut">
                <button class="flex items-center gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300">
                    sign out
                </button>
            </form>
        </div>
    </div>
    
    <slot />
</div>

  
