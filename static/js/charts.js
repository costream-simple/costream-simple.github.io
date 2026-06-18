// Growable bar charts for CoStream results.
// Renders grouped bars from inline data and animates them growing in on scroll.
(function () {
  "use strict";

  var N = 15; // trials per task

  // Method display + style metadata.
  var METHODS = {
    voxposer: { label: "VoxPoser", cls: "method-voxposer" },
    pi: { label: "π₀.₅", cls: "method-pi" },
    costream: { label: "CoStream (Ours)", cls: "method-costream" },
    ablation_full: { label: "Full Framework", cls: "method-costream" },
    ablation_off: { label: "w/o Reactive", cls: "method-ablation-off" }
  };

  // Chart definitions. counts are successes out of N (or [num, den] explicitly).
  var CHARTS = {
    assembly: {
      methods: ["voxposer", "pi", "costream"],
      tasks: [
        { label: "Drill", counts: { voxposer: 0, pi: 0, costream: 15 } },
        { label: "RAM", counts: { voxposer: 0, pi: 0, costream: 14 } },
        { label: "CPU", counts: { voxposer: 0, pi: 0, costream: 14 } },
        { label: "GPU", counts: { voxposer: 0, pi: 0, costream: 15 } }
      ]
    },
    everyday: {
      methods: ["pi", "costream"],
      tasks: [
        { label: "Lamp", counts: { pi: 0, costream: 5 } },
        { label: "Whiteboard", counts: { pi: 0, costream: 8 } },
        { label: "Cup → Plate", counts: { pi: 4, costream: 13 } },
        { label: "Clothes → Box", counts: { pi: 3, costream: 14 } }
      ]
    },
    ablation: {
      ablation: true,
      methods: ["ablation_full", "ablation_off"],
      tasks: [
        {
          label: "",
          bars: [
            { method: "ablation_full", num: 15, den: 15 },
            { method: "ablation_off", num: 3, den: 15 }
          ]
        }
      ]
    }
  };

  function pct(num, den) {
    return (100 * num) / den;
  }

  function fmtPct(p) {
    // 1 decimal unless it's a whole number
    return (Math.round(p * 10) / 10) + "%";
  }

  function makeBar(method, num, den) {
    var m = METHODS[method];
    var p = pct(num, den);

    var bar = document.createElement("div");
    bar.className = "bar " + m.cls;
    // Reserve headroom for value labels: map 0-100% onto 0-92% of plot height.
    bar.style.setProperty("--target", (p * 0.92) + "%");

    var value = document.createElement("span");
    value.className = "bar-value";
    value.textContent = fmtPct(p);
    bar.appendChild(value);

    var tip = document.createElement("span");
    tip.className = "bar-tooltip";
    tip.textContent = m.label + ": " + num + "/" + den + " (" + fmtPct(p) + ")";
    bar.appendChild(tip);

    return bar;
  }

  function buildChart(el) {
    var key = el.getAttribute("data-chart");
    var spec = CHARTS[key];
    if (!spec) return;

    if (spec.ablation) el.classList.add("ablation");

    // Legend
    var legend = document.createElement("div");
    legend.className = "bar-chart-legend";
    spec.methods.forEach(function (method) {
      var m = METHODS[method];
      var item = document.createElement("span");
      item.className = "legend-item";
      var sw = document.createElement("span");
      sw.className = "legend-swatch " + m.cls;
      item.appendChild(sw);
      item.appendChild(document.createTextNode(m.label));
      legend.appendChild(item);
    });
    el.appendChild(legend);

    // Plot
    var plot = document.createElement("div");
    plot.className = "bar-chart-plot";

    spec.tasks.forEach(function (task) {
      var group = document.createElement("div");
      group.className = "bar-group";

      var bars = document.createElement("div");
      bars.className = "bar-group-bars";

      if (task.bars) {
        task.bars.forEach(function (b) {
          bars.appendChild(makeBar(b.method, b.num, b.den));
        });
      } else {
        spec.methods.forEach(function (method) {
          bars.appendChild(makeBar(method, task.counts[method], N));
        });
      }
      group.appendChild(bars);

      if (task.label) {
        var label = document.createElement("div");
        label.className = "bar-group-label";
        label.innerHTML = task.label;
        group.appendChild(label);
      }
      plot.appendChild(group);
    });

    el.appendChild(plot);
  }

  function init() {
    var charts = document.querySelectorAll(".bar-chart[data-chart]");
    if (!charts.length) return;

    charts.forEach(buildChart);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      charts.forEach(function (c) {
        io.observe(c);
      });
    } else {
      // No observer support: just show them.
      charts.forEach(function (c) {
        c.classList.add("in-view");
      });
    }
  }

  // ── Scroll reveal: fade/rise section blocks into view ──
  function initReveal() {
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Target the main content blocks (columns rows + standalone sections).
    var blocks = document.querySelectorAll(
      "section.section > .container > .columns, " +
      ".container.is-max-desktop > .columns"
    );

    if (reduce || !("IntersectionObserver" in window)) {
      blocks.forEach(function (b) { b.classList.add("is-visible"); });
      return;
    }

    blocks.forEach(function (b) { b.classList.add("reveal"); });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    blocks.forEach(function (b) { io.observe(b); });
  }

  function run() {
    init();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
