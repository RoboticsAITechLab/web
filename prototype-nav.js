/** Shared gallery nav — add new prototypes here only */
window.PROTO_NAV_ITEMS = [
    { n: 'Gallery', f: 'index.html' },
    { n: 'AURA', f: 'modern_gym_prototype.html' },
    { n: 'FORGE', f: 'forge_hyper_athletics_prototype.html' },
    { n: 'PRANA', f: 'prana_holistic_gym_prototype.html' },
    { n: 'ZENITH', f: 'zenith_wellness_prototype.html' },
    { n: 'IRON', f: 'ironcore_brutalist_prototype.html' },
    { n: 'PULSE', f: 'pulse_studio_prototype.html' },
    { n: 'TITAN', f: 'titan_elite_prototype.html' },
    { n: 'APEX', f: 'apex_crossfit_prototype.html' },
    { n: 'NOVA', f: 'nova_24x7_prototype.html' },
    { n: 'ELIXIR', f: 'elixir_womens_prototype.html' },
    { n: 'VELOCITY', f: 'velocity_run_club_prototype.html' },
];

window.initPrototypeNav = function (currentFile, activeClass, linkClass) {
    const el = document.getElementById('proto-nav');
    if (!el) return;
    const active = activeClass || 'opacity-100 font-bold';
    const link = linkClass || 'opacity-60 hover:opacity-100';
    el.innerHTML = '<div class="flex gap-2 min-w-max max-w-6xl mx-auto items-center">' +
        window.PROTO_NAV_ITEMS.map(function (item) {
            if (item.f === currentFile) {
                return '<span class="' + active + ' px-2 py-1 rounded-md whitespace-nowrap">' + item.n + '</span>';
            }
            return '<a href="' + item.f + '" class="' + link + ' px-2 py-1 whitespace-nowrap transition-opacity">' + item.n + '</a>';
        }).join('<span class="opacity-20 shrink-0">|</span>') + '</div>';
};
