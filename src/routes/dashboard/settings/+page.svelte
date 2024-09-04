<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';
    import Spinner from "$lib/components/Spinner.svelte";

    export let data;
    const { user } = data;

    let id;
    let email = user.email;
    let username;
    let occupation;
    let isLoading = false;

    async function handleSubmit(event) {
        event.preventDefault();
        isLoading = true;
        try {
            await fetch(`/api/updateProfile`, {
                method: "POST",
                body: JSON.stringify({
                    id: id,
                    username: username,
                    occupation: occupation,
                }),
            });
            // Add a success message or notification here
        } catch (error) {
            console.log(error.message);
            // Add an error message or notification here
        } finally {
            isLoading = false;
        }
    }

    async function populateUserData() {
        let response = await fetch(`/api/getProfile`, {
            method: "GET"
        })
            .then(res => res.json());
        id = response.userData.id;
        username = response.userData.username;
        occupation = response.userData.occupation;
    }

    onMount(() => {
        populateUserData();
    });
</script>

<div class="h-full flex items-center justify-center bg-black">
    <div class="bg-black p-8 rounded-3xl w-full max-w-md">
        <form class="flex flex-col gap-6" on:submit={handleSubmit}>
            <h1 class="text-3xl font-bold text-center text-white mb-2">Profile Settings</h1>

            <div class="flex flex-col gap-2">
                <label for="email-input" class="text-sm font-medium text-zinc-400">Email address</label>
                <input 
                    class="w-full px-4 py-3 rounded-lg text-zinc-400 placeholder-zinc-400 cursor-not-allowed"
                    type="email"
                    name="email" 
                    id="email-input" 
                    value={email}
                    disabled
                    placeholder="Email address"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label for="username-input" class="text-sm font-medium text-zinc-400">Username</label>
                <input 
                    class="w-full px-4 py-3 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
                    type="text"
                    name="username" 
                    id="username-input" 
                    bind:value={username}
                    placeholder="Username"
                    required
                />
            </div>

            <div class="flex flex-col gap-2">
                <label for="occupation-input" class="text-sm font-medium text-zinc-400">Occupation</label>
                <input 
                    class="w-full px-4 py-3 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
                    type="text"
                    name="occupation" 
                    id="occupation-input" 
                    bind:value={occupation}
                    placeholder="Occupation"
                    required
                />
            </div>

            <div class="flex justify-center mt-4">
                <button
                    type="submit"
                    class="w-1/3 bg-orange-400 text-black font-semibold py-3 rounded-lg hover:bg-orange-500 transition duration-300 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <Spinner size="24px" color="#000000" />
                    {:else}
                        Save Changes
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>