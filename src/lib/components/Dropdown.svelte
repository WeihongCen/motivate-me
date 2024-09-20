<script>
    import { createEventDispatcher, onMount } from 'svelte';
  
    export let title = '';
    export let isOpen = false;
  
    const dispatch = createEventDispatcher();
  
    let dropdownRef;
  
    function handleClickOutside(event) {
      if (dropdownRef && !dropdownRef.contains(event.target)) {
        isOpen = false;
      }
    }
  
    onMount(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    });
  
    function toggleDropdown(event) {
      event.stopPropagation();
      isOpen = !isOpen;
    }
</script>
  
<div bind:this={dropdownRef} class="relative">
  <h2 class="text-lg font-semibold mb-4 flex justify-between items-center">
    {title}
    <button class="text-gray-400 hover:text-white" on:click={toggleDropdown}>:</button>
  </h2>
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
      <slot {isOpen}></slot>
    </div>
  {/if}
</div>