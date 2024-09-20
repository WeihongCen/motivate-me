<script>
    import Spinner from "$lib/components/Spinner.svelte";
    let isLoading = false;

    function handleSubmit() {
        isLoading = true;
    }
</script>

<form method="POST" action="?/login" on:submit={handleSubmit}>
    <label>
        Email
        <input name="email" type="email" />
    </label>
    <label>
        Password
        <input name="password" type="password" />
    </label>
    <button type="submit" disabled={isLoading}>
        {#if isLoading}
            <Spinner size="24px" color="#ffffff" />
        {:else}
            Login
        {/if}
    </button>
    <button formaction="?/signup" disabled={isLoading}>
        {#if isLoading}
            <Spinner size="24px" color="#ffffff" />
        {:else}
            Sign up
        {/if}
    </button>
</form>