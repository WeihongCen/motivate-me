import { writable } from 'svelte/store';

export const recording = writable(false);
export const recordingTimer = writable(0);
export const graphUpdateListener = writable(0);