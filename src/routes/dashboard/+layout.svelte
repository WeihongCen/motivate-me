<script>

    let recording = false;
</script>

<div class="flex w-full h-screen">
    <div class="h-screen overflow-auto">
        <div class="flex flex-col items-center h-screen py-5 px-2 bg-[#1a1a1a] gap-5">
            <button class="flex items-center p-2 gap-2 rounded-xl hover:bg-[#444444] transition-all duration-300">
                <img class="w-8" 
                src="favicon.png" alt="icon">
                <!-- <p>Dashboard</p> -->
            </button>
        </div>
    </div>
    
    <slot />
</div>

  
