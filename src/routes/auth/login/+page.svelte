<script>
    import { page } from '$app/stores'
    import { onMount } from "svelte";
    import EyeOpenSVG from "$lib/icons/EyeOpenSVG.svelte";
    import EyeClosedSVG from "$lib/icons/EyeClosedSVG.svelte";
    
    const errorMessage = $page.url.searchParams.get('error');
    let showPassword = false;

    onMount(() => {
        return () => {
        };
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center">
    <div class="bg-black p-8 rounded-3xl w-full max-w-md">
        <form class="flex flex-col gap-6" method="POST" action="?/login">
            <h1 class="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>

            <div class="relative">
                <input 
                    class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
                    type="email"
                    name="email" 
                    id="email-input" 
                    autocomplete="username"
                    placeholder="Email address"
                    required
                />
            </div>

            <div class="relative">
                <input 
                    class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 pr-10"
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    id="password"
                    placeholder="Password"
                    required
                />
                <button
                    type="button"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition duration-300"
                    on:click={() => showPassword = !showPassword}
                >
                    {#if showPassword}
                        <EyeOpenSVG width="1.5em" height="1.5em" />
                    {:else}
                        <EyeClosedSVG width="1.5em" height="1.5em" />
                    {/if}
                </button>
            </div>

            <button
                class="w-full bg-orange-400 text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition duration-300"
            >
                Sign In
            </button>

            {#if errorMessage}
                <p class="text-red-500 text-center">{errorMessage}</p>
            {/if}

            <p class="text-center text-gray-300">
                Don't have an account? 
                <a 
                    class="text-orange-400 hover:text-orange-500 transition duration-300"
                    href="/auth/signup"
                >
                    Sign up
                </a>
            </p>
        </form>
    </div>
</div>