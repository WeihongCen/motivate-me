<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';

    export let data;
    const { user } = data;

    let id;
    let email = user.email;
    let username;
    let occupation;

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            await fetch(`/api/updateProfile`, {
                method: "POST",
                body: JSON.stringify({
                    id: id,
                    username: username,
                    occupation: occupation,
                }),
            });
        } catch (error) {
            console.log(error.message);
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

<form class="flex flex-col"
on:submit={handleSubmit}>
    <label for="username">Username:</label>
    <input type="text" id="username" bind:value={username} required>
  
    <label for="occupation">Occupation:</label>
    <input type="text" id="occupation" bind:value={occupation} required>
  
    <button type="submit">save</button>
</form>