<script src="https://accounts.google.com/gsi/client">
    import Highlight from "@highlight-ai/app-runtime";
    import { page } from '$app/stores'
    import { onMount } from "svelte";
    
    const errorMessage = $page.url.searchParams.get('error');

    onMount(() => {
        return () => {
        };
    });
</script>

<div class="flex flex-col justify-center items-center w-screen h-screen bg-black">
    <form class="flex flex-col justify-center items-center min-w-96 p-10 bg-stone-900 rounded-3xl gap-5"
    method="POST" action="?/login">
        <h1>Welcome Back</h1>

        <div class="w-full relative group">
            <input 
                class="p-2 w-full text-lg bg-transparent rounded border border-stone-500 focus:outline-none focus:ring-0 focus:border-white peer" 
                type="email"
                name="email" 
                id="email-input" 
                autocomplete="username"
                placeholder
                required
            />
            <label 
                for="email-input" 
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
                placeholder
                required
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

        <div
            class="flex flex-col w-full gap-1"
        >
            <button
                class="w-full bg-[#ce7845] p-2 rounded hover:bg-opacity-80 duration-300"
            >
                Sign In
            </button>
    
            {#if errorMessage}
                <p class="text-red-500">{errorMessage}</p>
            {/if}
        </div>

        <p>Don't have an account? 
            <a 
                class="text-[#ce7845] hover:opacity-80 duration-300"
                href="/auth/signup"
            >
                Sign up
            </a>
        </p>
    </form>
    <div 
        class="size-5 bg-white"
        id="g_id_onload"
        data-client_id="137652800846-85osr2bs675mhco6q9k6hec584vcrtgu.apps.googleusercontent.com"
        data-context="signup"
        data-ux_mode="popup"
        data-callback="googleLogin"
        data-auto_prompt="false">
    </div>

    <div class="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left">
    </div>
</div>