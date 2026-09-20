const clock = document.querySelector('.clock');
const digits = ['hrs', 'min', 'sec'].map(id => document.getElementById(id));
const dateText = document.getElementById('date');
const timezone = document.getElementById('timezone');
const progress = document.getElementById('seconds-progress');
const toggle = document.getElementById('format-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});
const zoneFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' });
let use12Hour = false;
let timer;

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const values = [use12Hour ? hours % 12 || 12 : hours, now.getMinutes(), now.getSeconds()];
    digits.forEach((digit, index) => {
        const next = String(values[index]).padStart(2, '0');
        if (digit.textContent === next) return;
        digit.textContent = next;
        if (!reducedMotion.matches && digit.animate) {
            digit.animate([
                { transform: 'translateY(-6px)', opacity: 0.4 },
                { transform: 'translateY(0)', opacity: 1 }
            ], { duration: 320, easing: 'ease-out' });
        }
    });
    dateText.textContent = dateFormatter.format(now);
    const zone = zoneFormatter.formatToParts(now).find(part => part.type === 'timeZoneName').value;
    timezone.textContent = `${use12Hour ? (hours < 12 ? 'AM · ' : 'PM · ') : ''}${zone}`;
    clock.setAttribute('aria-label', now.toLocaleTimeString(undefined, { hour12: use12Hour }));
    progress.style.transform = `scaleX(${now.getSeconds() / 59})`;
    clearTimeout(timer);
    // Align each update to the real second, including after returning to this tab.
    if (!document.hidden) timer = setTimeout(updateClock, 1000 - Date.now() % 1000);
}

toggle.addEventListener('click', () => {
    use12Hour = !use12Hour;
    toggle.setAttribute('aria-pressed', String(use12Hour));
    updateClock();
});

clock.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = clock.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    clock.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
});
function resetTilt() { clock.style.transform = ''; }
clock.addEventListener('pointerleave', resetTilt);
reducedMotion.addEventListener('change', resetTilt);
document.addEventListener('visibilitychange', updateClock);
updateClock();
