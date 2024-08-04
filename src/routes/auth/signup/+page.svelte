<script>
    import { page } from '$app/stores'
    import { fade } from 'svelte/transition';
    
    const message = $page.url.searchParams.get('message');
    const errorMessage = $page.url.searchParams.get('error');

    let password;
</script>

<div class="flex justify-center items-center w-screen h-screen bg-black">
    <form class="flex flex-col justify-center items-center p-10  min-w-96 bg-stone-900 rounded-3xl gap-5"
    method="POST" action="?/signup" autocomplete="false">
        <h1>Create Account</h1>

        <div class="w-full relative group">
            <input 
                class="p-2 w-full text-lg bg-transparent rounded border border-stone-500 focus:outline-none focus:ring-0 focus:border-white peer" 
                type="email" 
                name="email" 
                id="email"
                placeholder
                required
            />
            <label 
                for="email" 
                class="pointer-events-none absolute px-2 left-4 text-stone-500 bg-stone-900 duration-200 transform -translate-x-5 -translate-y-6 scale-75 top-3 
                peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-x-2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                peer-focus:text-white peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-x-5 peer-focus:-translate-y-6"
            >
                Email address*
            </label>
        </div>

        <div class="w-full relative group">
            <input 
                class="p-2 w-full text-lg bg-transparent rounded border border-stone-500 focus:outline-none focus:ring-0 focus:border-white peer" 
                type="password" 
                name="password" 
                id="password"
                minlength="8"
                bind:value={password}
                placeholder
                required
                autocomplete="new-password"
            />
            <label 
                for="password" 
                class="pointer-events-none absolute px-2 left-4 text-stone-500 bg-stone-900 duration-200 transform -translate-x-5 -translate-y-6 scale-75 top-3 
                peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-x-2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                peer-focus:text-white peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-x-5 peer-focus:-translate-y-6"
            >
                Password*
            </label>
        </div>

        {#if password}
            <div
                class="flex flex-col w-full p-5 gap-2 rounded bg-stone-950 duration-300"
                transition:fade={{ duration: 300 }}
            >
                <p>Your password must contain:</p>
                <ul>
                    <li
                        class={`${password.length >= 8 ? "text-green-300" : "text-red-300"} duration-300`}
                    >
                        {`${password.length >= 8 ? "✓" : "•"} At least 8 characters`}
                    </li>
                </ul>
            </div>
        {/if}

        <div
            class="flex flex-col w-full gap-1"
        >
            <button
                class="w-full bg-[#ce7845] p-2 rounded hover:bg-opacity-80 duration-300"
            >
                Sign Up
            </button>
            
            {#if message}
                <p>{message}</p>
            {/if}
            {#if errorMessage}
                <p class="text-red-500">{errorMessage}</p>
            {/if}
        </div>

        <p>Already have an account? 
            <a 
                class="text-[#ce7845] hover:opacity-80 duration-300"
                href="/auth/login"
            >
                Log in
            </a>
        </p>
    </form>
</div>