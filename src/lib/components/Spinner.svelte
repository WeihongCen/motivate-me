<script>
    export let size = '24px';
    export let color = '#ffffff';
</script>

<div class="spinner" style="width: {size}; height: {size};">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke={color} stroke-width="3" />
    </svg>
</div>

<style>
    .spinner {
        display: inline-block;
    }
    .spinner-circle {
        animation: spin 1s linear infinite;
        transform-origin: center;
        stroke-linecap: round;
    }
    @keyframes spin {
        0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
</style>