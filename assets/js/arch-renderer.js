(function () {
    'use strict';

    // ── Diagram specs ─────────────────────────────────────────────────────────
    var DIAGRAMS = {
        ambea: {
            title: 'Ambea — Platform Architecture',
            w: 960, h: 270,
            nodes: [
                { id: 'src',     lines: ['20+ Sources', 'API · SFTP · DB'],  x: 10,  y: 25, w: 115, h: 75 },
                { id: 'blob',    lines: ['Blob Storage', 'Landing Zone'],     x: 170, y: 25, w: 115, h: 75 },
                { id: 'raw',     lines: ['Databricks', 'Raw'],                x: 330, y: 25, w: 115, h: 75 },
                { id: 'clean',   lines: ['Databricks', 'Cleansed'],           x: 490, y: 25, w: 115, h: 75 },
                { id: 'curated', lines: ['Curated', 'Data Marts'],            x: 650, y: 25, w: 115, h: 75 },
                { id: 'pbi',     lines: ['Power BI'],                         x: 820, y: 25, w: 115, h: 75 },
                { id: 'uc',      lines: ['Unity Catalog'],                    x: 345, y: 180, w: 140, h: 55, infra: true },
                { id: 'devops',  lines: ['Azure DevOps', 'DABs · CI/CD'],    x: 620, y: 180, w: 140, h: 55, infra: true },
            ],
            edges: [
                { from: 'src',     to: 'blob',    label: 'ADF' },
                { from: 'blob',    to: 'raw',     label: 'Auto Loader' },
                { from: 'raw',     to: 'clean',   label: 'Delta Live Tables' },
                { from: 'clean',   to: 'curated', label: 'dbt Cloud' },
                { from: 'curated', to: 'pbi' },
                { from: 'uc',      to: 'raw',     dashed: true },
                { from: 'uc',      to: 'clean',   dashed: true },
                { from: 'uc',      to: 'curated', dashed: true },
                { from: 'devops',  to: 'clean',   dashed: true },
                { from: 'devops',  to: 'curated', dashed: true },
            ]
        },
        bostadsformedlingen: {
            title: 'Bostadsförmedlingen — BI Architecture',
            w: 620, h: 180,
            nodes: [
                { id: 'src', lines: ['Source DBs', 'On-premises'],        x: 20,  y: 52, w: 140, h: 75 },
                { id: 'dwh', lines: ['SQL Server DWH', 'Inmon · Kimball'], x: 235, y: 52, w: 150, h: 75 },
                { id: 'pbi', lines: ['Power BI', 'Report Server'],         x: 455, y: 52, w: 140, h: 75 },
            ],
            edges: [
                { from: 'src', to: 'dwh', label: 'SSIS' },
                { from: 'dwh', to: 'pbi', label: 'DAX' },
            ]
        },
        visiba: {
            title: 'Visiba Care — Data Platform',
            w: 780, h: 270,
            nodes: [
                { id: 'src',  lines: ['Sources'],                            x: 15,  y: 55, w: 120, h: 75 },
                { id: 'sql',  lines: ['SQL Server', 'Data Warehouse'],       x: 195, y: 55, w: 130, h: 75 },
                { id: 'ssas', lines: ['Analysis Services', 'Tabular Model'], x: 385, y: 55, w: 140, h: 75 },
                { id: 'pbi',  lines: ['Power BI'],                           x: 590, y: 55, w: 120, h: 75 },
                { id: 'cicd', lines: ['CI/CD', 'YAML Pipelines'],            x: 275, y: 185, w: 135, h: 55, infra: true },
            ],
            edges: [
                { from: 'src',  to: 'sql',  label: 'Azure Data Factory' },
                { from: 'sql',  to: 'ssas', label: 'T-SQL · Tabular Editor' },
                { from: 'ssas', to: 'pbi' },
                { from: 'cicd', to: 'sql',  dashed: true },
                { from: 'cicd', to: 'ssas', dashed: true },
            ]
        }
    };

    // ── Color themes ──────────────────────────────────────────────────────────
    function palette(isDark) {
        return isDark ? {
            fill:        '#252525',
            stroke:      '#ff9500',
            text:        '#f0f0f0',
            infraFill:   '#1c1c1c',
            infraStroke: '#555555',
            infraText:   '#888888',
            edge:        '#777777',
            edgeLbl:     '#999999',
        } : {
            fill:        '#fafafa',
            stroke:      '#ff9500',
            text:        '#1d1d1f',
            infraFill:   '#f0f0f0',
            infraStroke: '#bbbbbb',
            infraText:   '#86868b',
            edge:        '#aaaaaa',
            edgeLbl:     '#86868b',
        };
    }

    // ── Geometry ──────────────────────────────────────────────────────────────
    function center(n) {
        return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
    }

    // Returns the point on node n's border facing toward (tx, ty)
    function borderPt(n, tx, ty) {
        var cx = n.x + n.w / 2, cy = n.y + n.h / 2;
        var dx = tx - cx, dy = ty - cy;
        var hw = n.w / 2, hh = n.h / 2;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy };
        if (Math.abs(dx) * hh > Math.abs(dy) * hw) {
            var t = hw / Math.abs(dx);
            return { x: cx + dx * t, y: cy + dy * t };
        } else {
            var t = hh / Math.abs(dy);
            return { x: cx + dx * t, y: cy + dy * t };
        }
    }

    // ── SVG helpers ───────────────────────────────────────────────────────────
    function svgNS(tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    function arrowTip(parent, x, y, angle, color) {
        var sz = 9;
        [angle + 2.55, angle - 2.55].forEach(function (a) {
            var l = svgNS('line');
            l.setAttribute('x1', x);
            l.setAttribute('y1', y);
            l.setAttribute('x2', x + Math.cos(a) * sz);
            l.setAttribute('y2', y + Math.sin(a) * sz);
            l.setAttribute('stroke', color);
            l.setAttribute('stroke-width', '1.5');
            l.setAttribute('stroke-linecap', 'round');
            parent.appendChild(l);
        });
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function render(container, key, isDark) {
        var spec = DIAGRAMS[key];
        var c = palette(isDark);

        var svg = svgNS('svg');
        svg.setAttribute('viewBox', '0 0 ' + spec.w + ' ' + spec.h);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.fontFamily = "'Virgil', 'Caveat', cursive";

        var rc = rough.svg(svg);

        var nodeMap = {};
        spec.nodes.forEach(function (n) { nodeMap[n.id] = n; });

        // Draw edges first so nodes paint over the endpoints cleanly
        spec.edges.forEach(function (e) {
            var fn = nodeMap[e.from], tn = nodeMap[e.to];
            var fc = center(fn), tc = center(tn);
            var p1 = borderPt(fn, tc.x, tc.y);
            var p2 = borderPt(tn, fc.x, fc.y);

            var lineEl = rc.line(p1.x, p1.y, p2.x, p2.y, {
                stroke: c.edge,
                strokeWidth: 1.5,
                roughness: 1.2,
                bowing: 0.8,
                strokeLineDash: e.dashed ? [6, 5] : [],
            });
            svg.appendChild(lineEl);

            var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            arrowTip(svg, p2.x, p2.y, angle, c.edge);

            if (e.label) {
                var mx = (p1.x + p2.x) / 2;
                var labelLines = e.label.split('\n');
                var isHoriz = Math.abs(p1.y - p2.y) < 5;
                var ly;
                if (isHoriz) {
                    var nodeTop = Math.min(fn.y, tn.y);
                    ly = nodeTop - 6 - (labelLines.length - 1) * 13;
                } else {
                    ly = (p1.y + p2.y) / 2 - 10;
                }
                labelLines.forEach(function (line, i) {
                    var t = svgNS('text');
                    t.setAttribute('x', mx);
                    t.setAttribute('y', ly + i * 13);
                    t.setAttribute('text-anchor', 'middle');
                    t.setAttribute('font-size', '11');
                    t.setAttribute('fill', c.edgeLbl);
                    t.textContent = line;
                    svg.appendChild(t);
                });
            }
        });

        // Draw nodes on top
        spec.nodes.forEach(function (n) {
            var isInfra = !!n.infra;
            var fill   = isInfra ? c.infraFill   : c.fill;
            var stroke = isInfra ? c.infraStroke  : c.stroke;
            var tclr   = isInfra ? c.infraText    : c.text;

            var rectEl = rc.rectangle(n.x, n.y, n.w, n.h, {
                fill:        fill,
                fillStyle:   'solid',
                stroke:      stroke,
                strokeWidth: isInfra ? 1.2 : 1.8,
                roughness:   isInfra ? 0.9 : 1.6,
                bowing:      0.6,
            });
            svg.appendChild(rectEl);

            var lh = 17;
            var startY = n.y + n.h / 2 - ((n.lines.length - 1) / 2) * lh;
            n.lines.forEach(function (line, i) {
                var t = svgNS('text');
                t.setAttribute('x', n.x + n.w / 2);
                t.setAttribute('y', startY + i * lh);
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'middle');
                t.setAttribute('font-size', isInfra ? '12' : '14');
                t.setAttribute('font-weight', isInfra ? '400' : '500');
                t.setAttribute('fill', tclr);
                t.textContent = line;
                svg.appendChild(t);
            });
        });

        container.innerHTML = '';
        container.appendChild(svg);
    }

    // ── Lazy Rough.js loading ─────────────────────────────────────────────────
    var roughLoaded = false;

    function loadRough(cb) {
        if (roughLoaded) { cb(); return; }
        var s = document.createElement('script');
        s.src = 'https://unpkg.com/roughjs@4.6.6/bundled/rough.js';
        s.onload  = function () { roughLoaded = true; cb(); };
        s.onerror = function () { console.error('Rough.js failed to load'); };
        document.head.appendChild(s);
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.openArchModal = function (key) {
        var spec = DIAGRAMS[key];
        if (!spec) return;

        var modal     = document.getElementById('arch-modal');
        var titleEl   = document.getElementById('arch-modal-title');
        var container = document.getElementById('arch-diagram');

        titleEl.textContent = spec.title;
        container.innerHTML = '<p style="text-align:center;color:#888;font-size:13px;padding:32px 0">Drawing…</p>';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        loadRough(function () {
            var isDark = document.body.classList.contains('dark-mode');
            render(container, key, isDark);
        });
    };

    window.closeArchModal = function () {
        document.getElementById('arch-modal').classList.remove('active');
        document.body.style.overflow = '';
    };

}());
