<script>
    import { onMount } from 'svelte';
</script>

<div class="flex justify-center items-center w-screen h-screen">
    <div class="flex flex-col justify-center items-center p-10 bg-stone-500 bg-opacity-30 rounded-3xl gap-10">
        <h1 class="text-white text-4xl font-bold">Motivate Me</h1>
        
        <div class="flex flex-col justify-center items-center gap-5">
            <a class="w-40 p-2 text-center rounded bg-[#df8f56] hover:bg-opacity-80 transition-all duration-300"
            href="/auth/login">
                Log in
            </a>
            <a class=""
            href="/auth/signup">
                Sign up
            </a>
        </div>
    </div>
</div>