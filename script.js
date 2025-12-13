document.addEventListener('DOMContentLoaded', async () => {

    // --- Global State ---
    let appData = {};

    // --- Elements ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    const heroHeadline = document.getElementById('hero-headline');
    const heroSub = document.getElementById('hero-subheadline');
    const heroDate = document.getElementById('hero-date');
    const countdownContainer = document.getElementById('countdown');
    const heroCtaContainer = document.getElementById('hero-cta-container');
    const cfpSection = document.getElementById('cfp-section');
    const sponsorsContainer = document.getElementById('sponsors-container');
    const organizersContainer = document.getElementById('organizers-container');
    const faqContainer = document.getElementById('faq-container');
    const socialContainer = document.getElementById('social-buttons-container');
    const themeToggle = document.getElementById('theme-toggle');

    // Modal Elements
    const regModal = document.getElementById('reg-modal');
    const regModalClose = document.getElementById('reg-modal-close');
    const regForm = document.getElementById('reg-form');
    const regFormContainer = document.getElementById('reg-form-container');
    const regSuccess = document.getElementById('reg-success');
    const btnGoogle = document.getElementById('cal-google');
    const btnIcs = document.getElementById('cal-ics');

    // --- Core Functions ---

    // 0. Theme Logic
    function initTheme() {
        const storedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.add('light-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // 1. Fetch Data
    async function fetchData() {
        try {
            const response = await fetch('data.json');
            appData = await response.json();
            initApp();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // 2. Initialize App
    function initApp() {
        initTheme();
        renderHeader();

        // Page Specific Init
        if (heroHeadline) initHomePage(); // We are on Home

        // Speakers Page
        if (document.getElementById('speakers-grid-container')) {
            renderSpeakers();
        }

        // Schedule Page
        if (document.getElementById('schedule-container')) {
            initSchedulePage();
        }

        // Render Socials (Global)
        renderSocials();
    }

    function renderSocials() {
        if (!socialContainer || !appData.config.socials) return;

        const icons = {
            linkedin: 'fab fa-linkedin',
            github: 'fab fa-github',
            twitch: 'fab fa-twitch',
            youtube: 'fab fa-youtube',
            twitter: 'fab fa-twitter',
            facebook: 'fab fa-facebook'
        };

        const html = Object.keys(appData.config.socials).map(key => {
            const url = appData.config.socials[key];
            const icon = icons[key] || 'fas fa-link';
            return `<a href="${url}" target="_blank" class="social-btn" title="${key}"><i class="${icon}"></i></a>`;
        }).join('');

        socialContainer.innerHTML = html;
    }


    // 3. Navigation
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('is-open');
            // Simple toggle logic
            if (navUl.classList.contains('is-open')) {
                navUl.style.transform = 'translateY(0%)';
            } else {
                navUl.style.transform = '';
            }
        });
    }

    // --- Render Functions ---

    function renderSpeakers() {
        const container = document.getElementById('speakers-grid-container');
        if (!container || !appData.speakers) return;

        container.innerHTML = appData.speakers.map(speaker => `
            <div class="speaker-card-full">
                <div class="speaker-img-wrapper">
                    <img src="${speaker.profilePicture}" alt="${speaker.fullName}" loading="lazy">
                </div>
                <div class="speaker-info">
                    <div class="speaker-name">${speaker.fullName}</div>
                    <div class="speaker-title">${speaker.tagLine}</div>
                    <div class="speaker-bio">${speaker.bio}</div>
                </div>
            </div>
        `).join('');
    }

    function initSchedulePage() {
        const timezoneSelect = document.getElementById('filter-timezone');
        const trackSelect = document.getElementById('filter-track');

        // Initial Render
        renderSchedule();

        // Listeners
        if (timezoneSelect) timezoneSelect.addEventListener('change', renderSchedule);
        if (trackSelect) trackSelect.addEventListener('change', renderSchedule);
    }

    function renderSchedule() {
        const container = document.getElementById('schedule-container');
        if (!container || !appData.schedule) return;

        const timezonePref = document.getElementById('filter-timezone')?.value || 'local';
        const trackPref = document.getElementById('filter-track')?.value || 'all';

        // Filter
        let sessions = appData.schedule;
        if (trackPref !== 'all') {
            sessions = sessions.filter(s => s.category.toLowerCase() === trackPref);
        }

        if (sessions.length === 0) {
            container.innerHTML = '<p style="text-align: center; font-size: 1.2rem; margin-top: 2rem;">No sessions found for this active filter.</p>';
            return;
        }

        container.innerHTML = sessions.map(session => {
            // Timezone Logic
            const startDate = new Date(session.startsAt);
            const endDate = new Date(session.endsAt);

            let timeStr;
            if (timezonePref === 'local') {
                // User's Local Time
                const opts = { hour: 'numeric', minute: '2-digit' };
                timeStr = `${startDate.toLocaleTimeString([], opts)} - ${endDate.toLocaleTimeString([], opts)}`;
            } else {
                // Event Time (Pacific/Auckland) - approximation for demo
                // Ideally use toLocaleString with timeZone option
                const opts = { hour: 'numeric', minute: '2-digit', timeZone: 'Pacific/Auckland' };
                try {
                    timeStr = `${startDate.toLocaleTimeString('en-NZ', opts)} - ${endDate.toLocaleTimeString('en-NZ', opts)} (NZT)`;
                } catch (e) {
                    timeStr = `${startDate.toLocaleTimeString([], opts)} (Local)`; // Fallback
                }
            }

            // Find Speaker
            const speakers = session.speakers.map(id => appData.speakers.find(s => s.id === id)).filter(Boolean);
            const speakerHtml = speakers.map(s => `
                <div class="session-speaker">
                    <img src="${s.profilePicture}" alt="${s.fullName}">
                    <span>${s.fullName}</span>
                </div>
            `).join('');

            return `
                <div class="session-card">
                    <div class="session-time">
                        ${timeStr}
                        <span style="font-size: 0.8rem; font-weight: normal; color: var(--color-text-light); margin-top:5px;">${timezonePref === 'local' ? 'Your Time' : 'Event Time'}</span>
                    </div>
                    <div class="session-details">
                        <div class="session-meta">
                            <span class="tag">${session.category}</span>
                            <span>${session.room}</span>
                        </div>
                        <div class="session-title">${session.title}</div>
                        <p style="margin-bottom: 1rem; color: var(--color-text-light);">${session.description}</p>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            ${speakerHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    // 4. Home Page Logic
    function initHomePage() {
        // Hero Content
        if (appData.config.hero_headline) heroHeadline.textContent = appData.config.hero_headline;
        if (appData.config.hero_subheadline) heroSub.textContent = appData.config.hero_subheadline;
        if (appData.config.hero_date_text) heroDate.textContent = appData.config.hero_date_text;

        // Smart Logic: Dates
        const today = new Date();
        const cfpStart = new Date(appData.config.cfp_start_date);
        const cfpEnd = new Date(appData.config.cfp_end_date);
        const eventDate = new Date(appData.config.event_date);

        // formatting event date string YYYY-MM-DD for comparison
        const eventDateStr = eventDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        // Smart CTA Logic (Priority: CFP > Watch Live > Register)
        if (heroCtaContainer) {
            heroCtaContainer.innerHTML = ''; // Clear existing

            if (today >= cfpStart && today <= cfpEnd) {
                // 1. CFP is Active
                const btn = document.createElement('a');
                btn.href = appData.config.cfp_link;
                btn.className = 'btn btn-primary';
                btn.textContent = 'Submit a Talk 🎤';
                btn.target = '_blank';
                heroCtaContainer.appendChild(btn);

                // User requested "only one submit a talk", so let's hide the separate section if we have the button in hero
                if (cfpSection) cfpSection.style.display = 'none';

                // Also hide countdown if CFP is active (to avoid "Event Started" confusion if dates overlap)
                if (countdownContainer) countdownContainer.style.display = 'none';

            } else {
                // Not CFP phase, ensure countdown is visible
                if (countdownContainer) countdownContainer.style.display = 'flex';

                if (todayStr === eventDateStr) {
                    // 2. Event Day (Watch Live)
                    const btn = document.createElement('a');
                    btn.href = appData.config.live_stream_link;
                    btn.className = 'btn btn-primary';
                    btn.textContent = 'Watch Live Now 🔴';
                    btn.target = '_blank';
                    heroCtaContainer.appendChild(btn);
                    if (cfpSection) cfpSection.style.display = 'none';

                } else if (appData.config.registration_enabled) {
                    // 3. Registration Open
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-primary';
                    btn.textContent = 'Register Now';
                    btn.addEventListener('click', openModal);
                    heroCtaContainer.appendChild(btn);
                    if (cfpSection) cfpSection.style.display = 'none';

                } else {
                    const msg = document.createElement('span');
                    msg.textContent = 'Registration coming soon / Event ended';
                    heroCtaContainer.appendChild(msg);
                    if (cfpSection) cfpSection.style.display = 'none';
                }

                // Only start countdown if NOT in CFP mode
                startCountdown(eventDate);
            }
        }

        // Render Sponsors
        const sponsorsSection = document.getElementById('sponsors');
        if (appData.config.show_sponsors === false) {
            if (sponsorsSection) sponsorsSection.style.display = 'none';
        } else if (sponsorsContainer && appData.sponsors) {
            if (sponsorsSection) sponsorsSection.style.display = 'block';
            sponsorsContainer.innerHTML = appData.sponsors.map(sponsor => `
                <a href="${sponsor.url}" target="_blank" class="sponsor-card" title="${sponsor.name} (${sponsor.tier})">
                    <img src="${sponsor.logo}" alt="${sponsor.name}">
                </a>
            `).join('');
        }

        // Render Organizers
        if (organizersContainer && appData.organizers) {
            organizersContainer.innerHTML = appData.organizers.map(org => `
                <div class="organizer-card">
                    <img src="${org.image}" alt="${org.name}" class="organizer-img">
                    <h4 style="margin-bottom:0.25rem;">${org.name}</h4>
                    <p style="color:var(--color-text-light); font-size:0.9rem; margin-bottom:0.5rem;">${org.role}</p>
                    <a href="${org.linkedin}" target="_blank" style="color:var(--color-smile-orange);"><i class="fab fa-linkedin"></i></a>
                </div>
            `).join('');
        }

        // Render FAQ
        if (faqContainer && appData.faq) {
            const faqHtml = appData.faq.map(item => `
                <div style="margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem;">${item.question}</h4>
                    <p style="color: var(--color-text-light);">${item.answer}</p>
                </div>
            `).join('');

            // Append Ask Button if link exists
            let askBtnHtml = '';
            if (appData.config.faq_ask_link) {
                const label = appData.config.faq_ask_link.startsWith('mailto') ? 'Email the Organizers' : 'Submit a Question';
                askBtnHtml = `
                    <div style="text-align: center; margin-top: 2rem;">
                        <p style="margin-bottom: 1rem; color: var(--color-text-light);">Have a question not listed here?</p>
                        <a href="${appData.config.faq_ask_link}" class="btn btn-outline" target="_blank">${label}</a>
                    </div>
                `;
            }

            faqContainer.innerHTML = faqHtml + askBtnHtml;
        }
    }

    // 5. Registration Modal
    function openModal() {
        if (regModal) regModal.classList.add('open');
    }

    function closeModal() {
        if (regModal) {
            regModal.classList.remove('open');
            // Reset form logic if needed, but keeping state showing success is fine
        }
    }

    if (regModalClose) regModalClose.addEventListener('click', closeModal);
    /* Close on outside click */
    window.addEventListener('click', (e) => {
        if (e.target === regModal) closeModal();
    });

    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = regForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;

            const registrationData = {
                name: name,
                email: email,
                role: role,
                timestamp: new Date().toISOString()
            };

            try {
                // If API URL is set, send data
                if (appData.config.registration_api_url && appData.config.registration_api_url !== "YOUR_AWS_LAMBDA_URL_HERE") {
                    const response = await fetch(appData.config.registration_api_url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(registrationData)
                    });

                    if (!response.ok) {
                        throw new Error('Registration failed');
                    }
                } else {
                    // Simulate delay if no API URL configured (for demo)
                    console.warn('No API URL configured. Simulating success.');
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                // Success UI
                regFormContainer.style.display = 'none';
                regSuccess.classList.add('visible');

                // Generate Calendar Links
                const event = {
                    title: appData.config.hero_headline,
                    description: appData.config.hero_subheadline,
                    start: appData.config.event_date,
                    duration: "8h"
                };
                generateCalendarLinks(event);

            } catch (error) {
                console.error('Registration Error:', error);
                alert('There was an issue registering. Please try again or contact support.');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // 6. Calendar Helpers
    function generateCalendarLinks(event) {
        // Google Url
        // https://calendar.google.com/calendar/render?action=TEMPLATE&text=Example+Event&dates=20251015T090000Z/20251015T170000Z&details=Details
        // Real implementation would need library or robust string building for dates
        const gLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}`;
        if (btnGoogle) btnGoogle.href = gLink;

        // ICS Blob
        if (btnIcs) {
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
DTSTART;VALUE=DATE:${event.start.replace(/-/g, '')}
DTEND;VALUE=DATE:${event.start.replace(/-/g, '')}
END:VEVENT
END:VCALENDAR`;
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            btnIcs.href = URL.createObjectURL(blob);
            btnIcs.download = 'aws-community-day.ics';
        }
    }

    // 7. Countdown Timer
    function startCountdown(targetDate) {
        if (!countdownContainer) return;

        function update() {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                countdownContainer.innerHTML = '<div style="font-size: 2rem; font-weight:bold;">Event Started!</div>';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            // const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownContainer.innerHTML = `
                <div class="countdown-item"><span class="countdown-number">${days}</span><span class="countdown-label">Days</span></div>
                <div class="countdown-item"><span class="countdown-number">${hours}</span><span class="countdown-label">Hours</span></div>
                <div class="countdown-item"><span class="countdown-number">${minutes}</span><span class="countdown-label">Minutes</span></div>
            `;
        }

        update();
        setInterval(update, 60000); // Minute update is sufficient
    }

    function renderHeader() {
        const navUl = document.getElementById('nav-links');
        if (!navUl) return;

        // Base Home Link
        let navHtml = '<li><a href="index.html">Home</a></li>';

        // Conditional Links based on config and active page
        if (appData.config.show_speakers) {
            navHtml += '<li><a href="speakers.html">Speakers</a></li>';
        }
        if (appData.config.show_schedule) {
            navHtml += '<li><a href="schedule.html">Schedule</a></li>';
        }
        if (appData.config.show_sponsors) {
            // For consistency across pages
            const href = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') ? '#sponsors' : 'index.html#sponsors';
            navHtml += `<li><a href="${href}">Sponsors</a></li>`;
        }

        navUl.innerHTML = navHtml;

        // Highlight active nav
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = navUl.querySelectorAll('a');
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            // Check based on filename preference
            if (linkHref === currentPath || (linkHref.startsWith('index.html') && currentPath === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Setup Header GitHub Button
        const headerGithubBtn = document.getElementById('header-github-btn');
        if (headerGithubBtn && appData.config.socials && appData.config.socials.github) {
            const ghUrl = appData.config.socials.github;
            headerGithubBtn.setAttribute('href', ghUrl);
            headerGithubBtn.style.display = 'inline-flex';
            console.log('GitHub Button Activated:', ghUrl);
        }
    }

    // --- Init ---
    fetchData();

});
