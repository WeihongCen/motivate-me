<script>
    import {
        COLOR_PRODUCTIVE,
        COLOR_UNPRODUCTIVE,
        COLOR_IDLE
    } from "$lib/constants.js"

    let recording = false;
</script>

<div class="flex w-full h-screen">
    <div class="w-20 h-screen overflow-auto">
        <div class="absolute flex flex-col items-center w-20 h-screen py-5 bg-[#1a1a1a] hover:w-40 transition-all duration-300 gap-5">
            <div class="flex">
                <img class="w-14 h-14" 
                src="favicon.png" alt="icon">
            </div>
        </div>
    </div>
    
    <slot />
</div>

  
