<!-- CustomCursor.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
  
    let cursorX = 0;
    let cursorY = 0;
  
    function handleMouseMove(event) {
        cursorX = event.clientX;
        cursorY = event.clientY;
    }
  
    onMount(() => {
        window.addEventListener("mousemove", handleMouseMove);
    });
  
    onDestroy(() => {
        window.removeEventListener("mousemove", handleMouseMove);
    });
</script>
  
<style>
    .cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        background-color: black;
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 1000;
        transition: transform 0.1s ease-out;
    }
</style>
  
<div class="cursor" style="transform: translate({cursorX}px, {cursorY}px)"></div>
  