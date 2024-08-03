<script>
    import Highlight from "@highlight-ai/app-runtime";
    import { onMount } from 'svelte';
    import { email, username, occupation, task } from '$lib/stores.js';

    let emailValue = '';
    let usernameValue = '';
    let occupationValue = '';
    let taskValue = '';

    function handleSubmit(event) {
        event.preventDefault();
        if (Highlight.isRunningInHighlight()) {
            Highlight.appStorage.set("user/email", emailValue);
            Highlight.appStorage.set("user/username", usernameValue);
            Highlight.appStorage.set("user/occupation", occupationValue);
            Highlight.appStorage.set("user/task", taskValue);
            email.set(emailValue);
            username.set(usernameValue);
            occupation.set(occupationValue);
            task.set(taskValue);
        }
        
    }

    // Assuming Highlight.appStorage is already initialized
    onMount(() => {
        email.subscribe((value) => { emailValue = value });
        username.subscribe((value) => { usernameValue = value });
        occupation.subscribe((value) => { occupationValue = value });
        task.subscribe((value) => { taskValue = value });
        if (Highlight.isRunningInHighlight()) {
        }
    });
</script>

<div>

</div>
<form class="flex flex-col"
on:submit={handleSubmit}>
    <label for="username">Username:</label>
    <input type="text" id="username" bind:value={usernameValue} required>
  
    <label for="email">Email:</label>
    <input type="email" id="email" bind:value={emailValue} required>
  
    <label for="occupation">Occupation:</label>
    <input type="text" id="occupation" bind:value={occupationValue} required>
  
    <label for="task">Task:</label>
    <input type="text" id="task" bind:value={taskValue} required>
  
    <button type="submit">Submit</button>
  </form>