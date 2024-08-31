<script>
    import { page } from '$app/stores'
    import { fade } from 'svelte/transition';
    import EyeOpenSVG from "$lib/icons/EyeOpenSVG.svelte";
    import EyeClosedSVG from "$lib/icons/EyeClosedSVG.svelte";
    
    const message = $page.url.searchParams.get('message');
    const errorMessage = $page.url.searchParams.get('error');

    let password = '';
    let confirmPassword = '';
    let showPassword = false;
    let showConfirmPassword = false;

    $: passwordsMatch = password === confirmPassword;
    $: formValid = password.length >= 8 && passwordsMatch && password !== '';

    function handleSubmit(event) {
        if (!formValid) {
            event.preventDefault();
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center">
    <div class="bg-black p-8 rounded-3xl w-full max-w-md">
        <form class="flex flex-col gap-6" method="POST" action="?/signup" autocomplete="off" on:submit={handleSubmit}>
            <h1 class="text-3xl font-bold text-center text-white mb-2">Create Account</h1>

            <div class="relative">
                <input 
                    class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
                    type="email" 
                    name="email" 
                    id="email"
                    placeholder="Email address"
                    required
                />
            </div>

            <div class="relative">
                {#if showPassword}
                    <input 
                        class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 pr-10"
                        type="text"
                        name="password" 
                        id="password-visible"
                        minlength="8"
                        bind:value={password}
                        placeholder="Password"
                        required
                        autocomplete="new-password"
                    />
                {:else}
                    <input 
                        class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 pr-10"
                        type="password"
                        name="password" 
                        id="password-hidden"
                        minlength="8"
                        bind:value={password}
                        placeholder="Password"
                        required
                        autocomplete="new-password"
                    />
                {/if}
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

            <div class="relative">
                {#if showConfirmPassword}
                    <input 
                        class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 pr-10"
                        type="text"
                        name="confirmPassword" 
                        id="confirm-password-visible"
                        minlength="8"
                        bind:value={confirmPassword}
                        placeholder="Confirm Password"
                        required
                    />
                {:else}
                    <input 
                        class="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 pr-10"
                        type="password"
                        name="confirmPassword" 
                        id="confirm-password-hidden"
                        minlength="8"
                        bind:value={confirmPassword}
                        placeholder="Confirm Password"
                        required
                    />
                {/if}
                <button
                    type="button"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition duration-300"
                    on:click={() => showConfirmPassword = !showConfirmPassword}
                >
                    {#if showConfirmPassword}
                        <EyeOpenSVG width="1.5em" height="1.5em" />
                    {:else}
                        <EyeClosedSVG width="1.5em" height="1.5em" />
                    {/if}
                </button>
            </div>

            {#if password || confirmPassword}
                <div
                    class="bg-white bg-opacity-5 p-4 rounded-lg"
                    transition:fade={{ duration: 300 }}
                >
                    <p class="text-gray-300 mb-2">Your password must:</p>
                    <ul>
                        <li
                            class={`${password.length >= 8 ? "text-green-400" : "text-red-400"} transition duration-300`}
                        >
                            {`${password.length >= 8 ? "✓" : "•"} Be at least 8 characters`}
                        </li>
                        <li
                            class={`${passwordsMatch ? "text-green-400" : "text-red-400"} transition duration-300`}
                        >
                            {`${passwordsMatch ? "✓" : "•"} Match the confirmation password`}
                        </li>
                    </ul>
                </div>
            {/if}

            <button
                class="w-full bg-orange-400 text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formValid}
            >
                Sign Up
            </button>
            
            {#if message}
                <p class="text-center text-green-400">{message}</p>
            {/if}
            {#if errorMessage}
                <p class="text-center text-red-500">{errorMessage}</p>
            {/if}

            <p class="text-center text-gray-300">
                Already have an account? 
                <a 
                    class="text-orange-400 hover:text-orange-500 transition duration-300"
                    href="/auth/login"
                >
                    Log in
                </a>
            </p>
        </form>
    </div>
</div>