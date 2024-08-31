<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import CalendarSVG from "$lib/icons/CalendarSVG.svelte";
    import TargetSVG from "$lib/icons/TargetSVG.svelte";
    import CommunitySVG from "$lib/icons/CommunitySVG.svelte";

    onMount(() => {
        goto('/dashboard');
    })
</script>

<main class="container mx-auto px-6 py-24 flex flex-col items-center">
    <h1 class="text-6xl font-bold mb-6 text-center leading-tight">
        <span class="bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">AI-Powered</span> Motivation<br>Achieve Your Goals
    </h1>
    <p class="text-xl text-gray-300 mb-12 text-center max-w-2xl">Harness the power of AI-driven screen tracking and personalized motivation to stay focused and achieve your dreams.</p>
    
    <div class="flex space-x-6">
        <a href="/auth/signup" class="bg-orange-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 transition-colors duration-300">Get Started for Free</a>
    </div>
</main>

<section class="py-24">
    <div class="container mx-auto px-6">
        <h2 class="text-4xl font-bold mb-16 text-center">AI-Driven Goal Achievement</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="text-center">
                <div class="text-orange-400 text-5xl mb-6 flex justify-center items-center">
                    <CalendarSVG width="1.5em" height="1.5em" />
                </div>
                <h3 class="text-2xl font-semibold mb-4">Intelligent Screen Tracking</h3>
                <p class="text-gray-300">Our AI monitors your screen activity to understand your work patterns and productivity levels.</p>
            </div>
            <div class="text-center">
                <div class="text-orange-400 text-5xl mb-6 flex justify-center items-center">
                    <TargetSVG width="1.5em" height="1.5em" />
                </div>
                <h3 class="text-2xl font-semibold mb-4">Adaptive Goal Tracking</h3>
                <p class="text-gray-300">AI analyzes your progress and adjusts your goals in real-time for optimal achievement.</p>
            </div>
            <div class="text-center">
                <div class="text-orange-400 text-5xl mb-6 flex justify-center items-center">
                    <CommunitySVG width="1.5em" height="1.5em" />
                </div>
                <h3 class="text-2xl font-semibold mb-4">Supportive Discord Community</h3>
                <p class="text-gray-300">Join our vibrant Discord community to share tips, ask questions, and stay motivated alongside like-minded individuals.</p>
            </div>
        </div>
    </div>
</section>

<section class="py-24">
    <div class="container mx-auto px-6">
        <h2 class="text-4xl font-bold mb-16 text-center">How Our AI Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="text-center">
                <div class="text-orange-400 text-3xl font-bold mb-4">1</div>
                <h3 class="text-2xl font-semibold mb-4">Monitor</h3>
                <p class="text-gray-300">AI tracks your screen activity to understand your work patterns and habits.</p>
            </div>
            <div class="text-center">
                <div class="text-orange-400 text-3xl font-bold mb-4">2</div>
                <h3 class="text-2xl font-semibold mb-4">Analyze</h3>
                <p class="text-gray-300">Our algorithms process your data to identify areas for improvement and optimization.</p>
            </div>
            <div class="text-center">
                <div class="text-orange-400 text-3xl font-bold mb-4">3</div>
                <h3 class="text-2xl font-semibold mb-4">Motivate</h3>
                <p class="text-gray-300">Receive personalized notifications and encouragement to keep you on track.</p>
            </div>
        </div>
    </div>
</section>

<section class="py-24">
    <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold mb-8">Ready to Supercharge Your Productivity?</h2>
        <p class="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">Join thousands of users leveraging AI-powered motivation to achieve their goals.</p>
        <a href="/auth/signup" class="bg-orange-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 transition-colors duration-300">Start Your Journey</a>
    </div>
</section>