const REFERENCE_DATES = {
    raid40: '10/06/2026 02:00:00',
    onyxia: '22/06/2026 02:00:00',
    karazhan: '22/06/2026 02:00:00',
    raid20: 'inactive',
    timbermaw: 'inactive',
    eom: '24/10/2023 00:00:00',
    honor: '23/05/2023 23:00:00',
    weeklyQuests: '24/05/2023 23:00:00',
    bg: '13/10/2023 00:00:00',
    dmf: '15/10/2023 00:00:00'
};

const EVENTS = [
    { id: 'raid40', name: 'Raid 40', subtitle: 'MC/BWL/AQ40/Naxx/ES', cycle: 7, ref: REFERENCE_DATES.raid40, img: 'assets/mc.jpg' },
    { id: 'onyxia', name: 'Onyxia', subtitle: 'Lair of the Broodmother', cycle: 5, ref: REFERENCE_DATES.onyxia, img: 'assets/ony.jpg' },
    { id: 'karazhan', name: 'Karazhan', subtitle: 'The Ivory Tower', cycle: 5, ref: REFERENCE_DATES.karazhan, img: 'assets/kara.jpg' },
    { id: 'raid20', name: 'Raid 20', subtitle: 'ZG/AQ20', cycle: 3, ref: REFERENCE_DATES.raid20, img: 'assets/aq20.jpg' },
    { id: 'timbermaw', name: 'Timbermaw', subtitle: 'Timbermaw Hold', cycle: 7, ref: REFERENCE_DATES.timbermaw, img: 'assets/tmhold.jpg' },
    { id: 'honor', name: 'Honor Reset', subtitle: 'Rank Progression', cycle: 7, ref: REFERENCE_DATES.honor, img: 'assets/honorreset.jpeg' },
    { id: 'weeklyQuests', name: 'Weekly Quests', subtitle: 'Quest Reset', cycle: 7, ref: REFERENCE_DATES.weeklyQuests, img: 'assets/questsreset.jpg' },
    { id: 'eom', name: 'Edge of Madness', subtitle: 'Zul\'Gurub Boss', cycle: 14, ref: REFERENCE_DATES.eom, img: 'assets/eom.jpg' },
    { id: 'bg', name: 'Battleground', subtitle: 'BG of the day', cycle: 1, ref: REFERENCE_DATES.bg, img: 'assets/pvp.jpg', isSchedule: true, link: 'bg-schedule.html' },
    { id: 'dmf', name: 'Darkmoon Faire', subtitle: 'Faire Location', cycle: 7, ref: REFERENCE_DATES.dmf, img: 'assets/darkmoon.webp', isSchedule: true, link: 'dmf-schedule.html' }
];

const EOM_BOSSES = ['Gri\'lek', 'Hazza\'rah', 'Renataki', 'Wushoolay'];
const BG_ROTATION = ['Alterac Valley', 'Warsong Gulch', 'Arathi Basin', 'Blood Ring Arena', 'Thorn Gorge'];
const DMF_LOCATIONS = ['Thunder Bluff', 'Goldshire'];

function parseDate(str) {
    const [date, time] = str.split(' ');
    const [d, m, y] = date.split('/').map(Number);
    const [hh, mm, ss] = time.split(':').map(Number);
    return Date.UTC(y, m - 1, d, hh, mm, ss);
}

function getNextReset(refStr, cycleDays) {
    const now = Date.now();
    const ref = parseDate(refStr);
    const cycleMs = cycleDays * 24 * 60 * 60 * 1000;
    const passed = Math.floor((now - ref) / cycleMs);
    return ref + (passed + 1) * cycleMs;
}

function formatTime(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return { days, hours, mins, secs };
}

function updateCountdownDisplay(items, values, time) {
    if (items.length === 4) {
        values[0].textContent = time.days;
        values[1].textContent = time.hours;
        values[2].textContent = time.mins;
        values[3].textContent = time.secs;

        // Hide days if 0
        items[0].style.display = time.days > 0 ? 'flex' : 'none';
        // Hide hours if 0 AND days are also 0
        items[1].style.display = (time.hours > 0 || time.days > 0) ? 'flex' : 'none';
    } else if (items.length === 3) {
        const displayHours = time.hours + (time.days * 24);
        values[0].textContent = displayHours;
        values[1].textContent = time.mins;
        values[2].textContent = time.secs;

        // Hide hours if 0
        items[0].style.display = displayHours > 0 ? 'flex' : 'none';
    }
}

function updateTimers() {
    const now = Date.now();

    EVENTS.forEach(event => {
        const container = document.getElementById(`${event.id}-timer`);
        const dateEl = document.getElementById(`${event.id}-date`);

        if (event.ref === 'inactive') {
            if (container) {
                container.innerHTML = `<span style="font-size: 1.25rem; font-weight: 600; color: #D22B2B;">Not yet in the Game</span>`;
            }
            if (dateEl) {
                dateEl.style.display = 'none';
            }
            if (event.id === 'eom') {
                const nameEl = document.getElementById('eom-name');
                const nextEl = document.getElementById('eom-next');
                if (nameEl) nameEl.textContent = 'Inactive';
                if (nextEl) nextEl.style.display = 'none';
            }
            if (event.id === 'bg') {
                const nameEl = document.getElementById('bg-name');
                const nextEl = document.getElementById('bg-next');
                if (nameEl) nameEl.textContent = 'Inactive';
                if (nextEl) nextEl.style.display = 'none';
            }
            if (event.id === 'dmf') {
                const nameEl = document.getElementById('dmf-name');
                if (nameEl) nameEl.textContent = 'Inactive';
            }
            return;
        }

        if (dateEl) {
            dateEl.style.display = '';
        }
        if (event.id === 'eom') {
            const nextEl = document.getElementById('eom-next');
            if (nextEl) nextEl.style.display = '';
        }
        if (event.id === 'bg') {
            const nextEl = document.getElementById('bg-next');
            if (nextEl) nextEl.style.display = '';
        }

        const nextReset = getNextReset(event.ref, event.cycle);
        const diff = nextReset - now;
        const time = formatTime(diff);

        if (container) {
            const items = container.querySelectorAll('.countdown-item');
            const values = container.querySelectorAll('.countdown-value');

            // Check if standard structure is present (e.g. if container was previously cleared with innerHTML)
            if (items.length === 0) {
                // Restore countdown layout if it was previously overwritten
                let itemsHtml = '';
                if (event.id === 'bg') {
                    itemsHtml = `
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Hours</span></div>
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Min</span></div>
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Sec</span></div>
                    `;
                } else {
                    itemsHtml = `
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Days</span></div>
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Hours</span></div>
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Min</span></div>
                        <div class="countdown-item"><span class="countdown-value">0</span><span class="countdown-label">Sec</span></div>
                    `;
                }
                container.innerHTML = itemsHtml;
                // Re-query elements
                const newItems = container.querySelectorAll('.countdown-item');
                const newValues = container.querySelectorAll('.countdown-value');

                updateCountdownDisplay(newItems, newValues, time);
            } else {
                updateCountdownDisplay(items, values, time);
            }
        }

        if (dateEl) {
            const dateObj = new Date(nextReset);
            dateEl.textContent = `Resets: ${dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
        }

        // Special logic for names/subtitles
        if (event.id === 'eom') {
            const passed = Math.floor((now - parseDate(event.ref)) / (14 * 24 * 60 * 60 * 1000));
            const currentIdx = passed % EOM_BOSSES.length;
            const nextIdx = (currentIdx + 1) % EOM_BOSSES.length;
            document.getElementById('eom-name').textContent = EOM_BOSSES[currentIdx];
            document.getElementById('eom-next').textContent = `Next boss: ${EOM_BOSSES[nextIdx]}`;
        }

        if (event.id === 'bg') {
            const dayMs = 24 * 60 * 60 * 1000;
            const passed = Math.floor((now - parseDate(event.ref)) / dayMs);
            const currentIdx = passed % BG_ROTATION.length;
            const nextIdx = (currentIdx + 1) % BG_ROTATION.length;
            document.getElementById('bg-name').textContent = BG_ROTATION[currentIdx];
            document.getElementById('bg-next').textContent = `Next: ${BG_ROTATION[nextIdx]}`;
        }

        if (event.id === 'dmf') {
            const weekMs = 7 * 24 * 60 * 60 * 1000;
            const passed = Math.floor((now - parseDate(event.ref)) / weekMs);
            const currentIdx = passed % DMF_LOCATIONS.length;
            document.getElementById('dmf-name').textContent = DMF_LOCATIONS[currentIdx];
        }
    });
}

// Initial call and interval
document.addEventListener('DOMContentLoaded', () => {
    updateTimers();
    setInterval(updateTimers, 1000);
});
