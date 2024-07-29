<script>
    import "../app.css";
</script>

<slot />

<style lang="postcss">
    :global(html) {
        background-color: #222222;
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
        color: #bbbbbb;
    }
    :global(button) {
        color: white;
    }

    /* :global(::-webkit-scrollbar) {
        width: 0.5rem
    }
    :global(::-webkit-scrollbar-track) {
        background: #444444;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #888888
    } */
</style>