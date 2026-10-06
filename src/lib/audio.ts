let audioContext: AudioContext | null = null;
let isAudioUnlocked = false;

export function unlockAudio(): boolean {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    // Play a silent sound to unlock
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.01);
    isAudioUnlocked = true;
    return true;
  } catch {
    return false;
  }
}

export function isAudioEnabled(): boolean {
  return isAudioUnlocked;
}

export function playBeep(frequency: number = 800, duration: number = 200, count: number = 1): void {
  if (!audioContext || !isAudioUnlocked) return;
  
  const playOne = (delay: number) => {
    try {
      const oscillator = audioContext!.createOscillator();
      const gainNode = audioContext!.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.3, audioContext!.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext!.currentTime + delay + duration / 1000);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext!.destination);
      
      oscillator.start(audioContext!.currentTime + delay);
      oscillator.stop(audioContext!.currentTime + delay + duration / 1000);
    } catch {
      // Silently fail
    }
  };

  for (let i = 0; i < count; i++) {
    playOne(i * (duration / 1000 + 0.1));
  }
}

export function playNewOrderSound(): void {
  // Rising two-tone beep for new orders
  playBeep(600, 150, 1);
  setTimeout(() => playBeep(900, 200, 1), 200);
}

export function playWaiterCallSound(): void {
  // Three quick beeps for waiter calls
  playBeep(1000, 100, 3);
}

export function playReadySound(): void {
  // Pleasant ding for order ready
  playBeep(1200, 300, 1);
}

export function playPaymentSuccessSound(): void {
  // Joyful three-tone ascending chord (C5 - E5 - G5)
  playBeep(523.25, 120, 1);
  setTimeout(() => playBeep(659.25, 120, 1), 120);
  setTimeout(() => playBeep(783.99, 250, 1), 240);
}
